// 상태 정규화·로컬 저장(storage.js) 회귀 테스트.
// normalizeState 는 시드/DB 스키마 차이를 화면용 모양으로 보정하는 순수 함수이므로,
// 보정 규칙이 바뀌면 여러 화면이 한꺼번에 깨진다 → 규칙을 테스트로 고정한다.
// loadState/saveState 는 localStorage 스텁으로 확인한다(네트워크 미사용).
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, loadState, saveState, STORAGE_KEY, HAS_SUPABASE } from '../src/eum/storage.js';

const REQUIRED = ['participants', 'applications', 'verifications', 'matches', 'activities', 'activity_logs', 'settlements', 'safety_incidents', 'surveys'];
const emptyState = () => Object.fromEntries(REQUIRED.map(k => [k, []]));

// --- localStorage 스텁(테스트 종료 시 원복) ---
function stubStorage(initial = {}) {
  const store = { ...initial };
  const prev = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  };
  return { store, restore: () => { globalThis.localStorage = prev; } };
}

test('테스트 환경에서는 Supabase 미연결(네트워크 호출 없음)', () => {
  assert.equal(HAS_SUPABASE, false);
});

test('normalizeState: null/undefined 는 그대로 통과(방어)', () => {
  assert.equal(normalizeState(null), null);
  assert.equal(normalizeState(undefined), undefined);
});

test('normalizeState: 빈 상태에서도 모든 컬렉션이 배열로 존재한다', () => {
  const r = normalizeState({});
  for (const k of ['activities', 'activity_logs', 'participants', 'settlements', 'applications', 'verifications', 'notices']) {
    assert.ok(Array.isArray(r[k]), k + ' 이 배열이 아님');
  }
});

test('normalizeState: 활동 date/time 을 scheduled_at 에서 파생하되 기존 값은 보존', () => {
  const r = normalizeState({ ...emptyState(), activities: [
    { id: 'a1', scheduled_at: '2027-05-03T14:30:00' },
    { id: 'a2', scheduled_at: '2027-05-04T09:00:00', date: '2027-05-09', time: '11:11' },
    { id: 'a3' },
  ] });
  assert.equal(r.activities[0].date, '2027-05-03');
  assert.equal(r.activities[0].time, '14:30');
  assert.equal(r.activities[1].date, '2027-05-09'); // 기존 값 우선
  assert.equal(r.activities[1].time, '11:11');
  assert.equal(r.activities[2].date, '');
  assert.equal(r.activities[2].time, '');
});

test('normalizeState: 활동 로그 date/created_at 을 승인일→활동일 순으로 채운다', () => {
  const r = normalizeState({ ...emptyState(),
    activities: [{ id: 'a1', scheduled_at: '2027-05-03T14:30:00' }],
    activity_logs: [
      { id: 'l1', activity_id: 'a1' },
      { id: 'l2', activity_id: 'a1', approved_at: '2027-05-05' },
      { id: 'l3', activity_id: 'nope' },
    ],
  });
  assert.equal(r.activity_logs[0].date, '2027-05-03');       // 활동 일정에서 파생
  assert.equal(r.activity_logs[1].date, '2027-05-05');       // 승인일 우선
  assert.equal(r.activity_logs[1].created_at, '2027-05-05');
  assert.equal(r.activity_logs[2].date, '');                 // 매칭 활동 없으면 빈 값
});

test('normalizeState: 아동의 guardian_id 를 parent_id 로 보완(다른 유형은 무변경)', () => {
  const r = normalizeState({ ...emptyState(), participants: [
    { id: 'c1', type: 'child', parent_id: 'p1' },
    { id: 'c2', type: 'child', parent_id: 'p1', guardian_id: 'p9' },
    { id: 'y1', type: 'youth', parent_id: 'p1' },
  ] });
  assert.equal(r.participants[0].guardian_id, 'p1');
  assert.equal(r.participants[1].guardian_id, 'p9'); // 기존 값 우선
  assert.equal(r.participants[2].guardian_id, undefined);
});

test('normalizeState: 정산 별칭 필드(period/amount/hours) 보정, 0 도 유효값으로 유지', () => {
  const r = normalizeState({ ...emptyState(), settlements: [
    { id: 's1', month: '2027-05', amount_krw: 120000, total_hours: 8 },
    { id: 's2', period: '2027-06', amount: 0, hours: 0, amount_krw: 999, total_hours: 99 },
  ] });
  assert.equal(r.settlements[0].period, '2027-05');
  assert.equal(r.settlements[0].amount, 120000);
  assert.equal(r.settlements[0].hours, 8);
  assert.equal(r.settlements[1].amount, 0); // 0 이 999 로 덮이지 않아야 한다
  assert.equal(r.settlements[1].hours, 0);
});

test('normalizeState: 아동은 신청서를 만들지 않고, 성인/청소년만 1건씩 합성한다', () => {
  const r = normalizeState({ ...emptyState(), participants: [
    { id: 'c1', type: 'child', parent_id: 'p1' },
    { id: 'y1', type: 'youth', status: 'active', joined_at: '2027-04-02' },
    { id: 'p1', type: 'parent', status: 'pending' },
  ] });
  assert.equal(r.applications.length, 2);
  assert.ok(!r.applications.some(a => a.participant_id === 'c1'));
  const y = r.applications.find(a => a.participant_id === 'y1');
  assert.equal(y.id, 'app_y1');
  assert.equal(y.status, 'completed');       // active → completed
  assert.equal(y.applied_at, '2027-04-02');
  assert.equal(y.consent_criminal_check, true);  // 성인 봉사자는 범죄경력 동의 항목
  assert.equal(y.consent_guardian, false);
  const p = r.applications.find(a => a.participant_id === 'p1');
  assert.equal(p.status, 'screening');       // pending → screening
  assert.equal(p.consent_guardian, true);    // 보호자/청소년은 보호자 동의 항목
  assert.equal(p.consent_criminal_check, false);
});

test('normalizeState: 기존 신청서가 있으면 그 값을 우선하고 덮어쓰지 않는다', () => {
  const r = normalizeState({ ...emptyState(),
    participants: [{ id: 'y1', type: 'youth', status: 'active' }],
    applications: [{ id: 'app_custom', participant_id: 'y1', status: 'rejected', applied_at: '2027-01-01', consent_data: false, memo: '보존' }],
  });
  assert.equal(r.applications.length, 1);
  const a = r.applications[0];
  assert.equal(a.id, 'app_custom');
  assert.equal(a.status, 'rejected');
  assert.equal(a.applied_at, '2027-01-01');
  assert.equal(a.consent_data, false); // false 가 true 로 덮이지 않아야 한다
  assert.equal(a.memo, '보존');
});

test('normalizeState: 검증 단계 — 유형별 단계 구성과 진행 상태', () => {
  const r = normalizeState({ ...emptyState(), participants: [
    { id: 'y1', type: 'youth', status: 'active' },
    { id: 'p1', type: 'parent', status: 'pending' },
    { id: 's1', type: 'senior', status: 'verifying' },
  ] });
  const stepsOf = pid => r.verifications.filter(v => v.application_id === 'app_' + pid).map(v => v.step);
  assert.deepEqual(stepsOf('y1'), ['interview', 'criminal_record', 'abuse_record', 'reference']);
  assert.deepEqual(stepsOf('p1'), ['interview', 'guardian_consent', 'document']);

  const yv = r.verifications.filter(v => v.application_id === 'app_y1');
  assert.ok(yv.every(v => v.status === 'passed'));           // 활동중 → 전부 통과
  const pv = r.verifications.filter(v => v.application_id === 'app_p1');
  assert.ok(pv.every(v => v.status === 'pending'));          // 심사중 → 전부 대기
  const sv = stepsOf('s1').map(step => r.verifications.find(v => v.id === 'vf_app_s1_' + step).status);
  assert.deepEqual(sv, ['passed', 'in_progress', 'pending', 'pending']); // 검증중 → 순차 진행
});

test('normalizeState: 실데이터 검증 이력은 보존하고, 합성분(vf_)은 재생성한다', () => {
  const real = { id: 'real_1', application_id: 'app_y1', step: 'interview', status: 'passed' };
  const stale = { id: 'vf_stale', application_id: 'app_zzz', step: 'interview', status: 'pending' };
  const r = normalizeState({ ...emptyState(),
    participants: [{ id: 'y1', type: 'youth', status: 'active' }, { id: 's1', type: 'senior', status: 'active' }],
    verifications: [real, stale],
  });
  assert.ok(r.verifications.some(v => v.id === 'real_1'));      // 원본 보존
  assert.ok(!r.verifications.some(v => v.id === 'vf_stale'));   // 과거 합성분 제거
  // 실이력이 있는 신청서는 단계를 합성하지 않는다
  assert.equal(r.verifications.filter(v => v.application_id === 'app_y1').length, 1);
  assert.equal(r.verifications.filter(v => v.application_id === 'app_s1').length, 4);
});

test('normalizeState: 멱등 — 두 번 돌려도 결과가 같다', () => {
  const input = { ...emptyState(),
    participants: [{ id: 'y1', type: 'youth', status: 'verifying' }, { id: 'c1', type: 'child', parent_id: 'p1' }],
    activities: [{ id: 'a1', scheduled_at: '2027-05-03T14:30:00' }],
    activity_logs: [{ id: 'l1', activity_id: 'a1' }],
    settlements: [{ id: 'st1', month: '2027-05', amount_krw: 1000, total_hours: 4 }],
  };
  const once = normalizeState(input);
  const twice = normalizeState(once);
  assert.deepEqual(twice, once);
});

test('normalizeState: 입력 객체를 변형하지 않는다(불변)', () => {
  const input = { ...emptyState(), activities: [{ id: 'a1', scheduled_at: '2027-05-03T14:30:00' }] };
  const snapshot = JSON.parse(JSON.stringify(input));
  normalizeState(input);
  assert.deepEqual(input, snapshot);
});

test('normalizeState: 미지정 키(notices 등 부가 컬렉션)는 그대로 통과시킨다', () => {
  const r = normalizeState({ ...emptyState(), notices: [{ id: 'n1' }], custom: [1, 2] });
  assert.deepEqual(r.notices, [{ id: 'n1' }]);
  assert.deepEqual(r.custom, [1, 2]);
});

test('saveState/loadState: 저장 후 그대로 복원된다', async () => {
  const s = stubStorage();
  try {
    const state = { ...emptyState(), participants: [{ id: 'y1', type: 'youth' }] };
    assert.equal(await saveState(state), true);
    assert.ok(s.store[STORAGE_KEY]);
    assert.deepEqual(await loadState(), state);
  } finally { s.restore(); }
});

test('loadState: 저장분 없음·깨진 JSON·필수 컬렉션 누락이면 null(시드 폴백)', async () => {
  let s = stubStorage();
  try { assert.equal(await loadState(), null); } finally { s.restore(); }

  s = stubStorage({ [STORAGE_KEY]: '{not json' });
  try { assert.equal(await loadState(), null); } finally { s.restore(); }

  const partial = { ...emptyState() }; delete partial.surveys;
  s = stubStorage({ [STORAGE_KEY]: JSON.stringify(partial) });
  try { assert.equal(await loadState(), null); } finally { s.restore(); }

  const wrongType = { ...emptyState(), matches: 'nope' };
  s = stubStorage({ [STORAGE_KEY]: JSON.stringify(wrongType) });
  try { assert.equal(await loadState(), null); } finally { s.restore(); }
});

test('saveState: 저장 실패(용량 초과 등)에도 예외를 던지지 않고 false 를 낸다', async () => {
  const prev = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
  try {
    assert.equal(await saveState(emptyState()), false);
  } finally { globalThis.localStorage = prev; }
});
