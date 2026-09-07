// 2R §5 — 매칭 엔진 어댑터: 앱 상태 → 엔진 입력 변환과 화면용 출력이 명세와 맞는지.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeed } from '../packages/db/seed.js';
import {
  recommendForSenior, toEngineParticipant, toEngineSenior,
  offeredNeeds, dongOf, guOf, normalizeWeights, auditSnapshot,
  DEFAULT_WEIGHTS, FACTOR_LABEL,
} from '../src/eum/matchingEngine.js';

const state = () => buildSeed();

test('주소에서 행정동·구를 뽑는다', () => {
  assert.equal(dongOf('광주광역시 광산구 우산동 (42년 거주)'), '우산동');
  assert.equal(guOf('광주광역시 광산구 우산동'), '광산구');
  assert.equal(dongOf(''), '');
  assert.equal(dongOf(null), '');
});

test('참여자 역량 → 제공 가능한 도움 항목으로 환산된다', () => {
  assert.deepEqual(offeredNeeds({ skills: ['디지털코칭'], interests: [] }), ['스마트폰 도움']);
  assert.deepEqual(offeredNeeds({ skills: [], interests: [] }), []);
  const nurse = offeredNeeds({ skills: ['건강관리', '돌봄'], interests: ['운동'] });
  assert.ok(nurse.includes('산책'));
});

test('엔진 참여자 스키마로 변환 — 검증·신고·완료수가 조회 결과다', () => {
  const s = state();
  const p = s.participants.find((x) => x.id === 'p001');
  const ep = toEngineParticipant(s, p);
  assert.equal(ep.user_id, 'p001');
  assert.ok(ep.dongs.includes('우산동'));
  assert.ok(ep.dongs.includes('광산구'));
  assert.deepEqual(ep.time_slots, p.availability);
  // verifications 테이블의 passed 레코드에서 온다 (하드코딩 아님)
  const v = s.verifications.find((x) => x.participant_id === 'p001' && x.status === 'passed');
  assert.equal(ep.verified_at, v.verified_at);
  // activity_logs 의 승인 건수와 같다
  const done = s.activity_logs.filter((l) => l.participant_id === 'p001' && l.approved).length;
  assert.equal(ep.completed_activities, done);
});

test('검증 미완료 참여자는 하드 필터로 제외되고 사유가 남는다(§5)', () => {
  const s = state();
  const r = recommendForSenior(s, 'p101');
  assert.equal(r.ok, true);
  const excludedIds = r.excluded.map((x) => x.participant.id);
  // p005 정태윤(검증 in_progress) · p008 배수진(검증 레코드 없음)
  assert.ok(excludedIds.includes('p005'));
  assert.ok(excludedIds.includes('p008'));
  assert.ok(r.excluded.every((x) => x.reason.includes('하드 필터')));
  assert.equal(r.candidates.some((c) => excludedIds.includes(c.participant_id)), false);
  assert.equal(r.evaluated + r.excluded.length, r.poolSize);
});

test('상위 3명이 순위·요소별 점수·사유와 함께 나온다(§11 설명 가능성)', () => {
  const r = recommendForSenior(state(), 'p101');
  assert.equal(r.candidates.length, 3);
  r.candidates.forEach((c, i) => {
    assert.equal(c.rank, i + 1);
    assert.ok(c.participant, '원본 참여자가 붙어야 화면에 이름을 띄운다');
    assert.equal(Object.keys(c.score_json).length, 5);
    assert.equal(c.factors.length, 5);
    assert.ok(c.reason_text.length > 0);
    for (const f of c.factors) {
      assert.equal(f.label, FACTOR_LABEL[f.key]);
      assert.ok(f.score >= 0 && f.score <= 1);
      assert.ok(f.desc.length > 0);
      assert.equal(f.contribution, Math.round(f.score * f.weight * 1000) / 1000);
    }
    // score_total 은 요소별 기여도의 합
    const sum = c.factors.reduce((a, f) => a + f.score * f.weight, 0);
    assert.ok(Math.abs(sum - c.score_total) < 0.002, `${sum} vs ${c.score_total}`);
  });
  assert.ok(r.candidates[0].score_total >= r.candidates[1].score_total);
});

test('없는 어르신이면 실패를 반환하고 던지지 않는다(§7-5 흰 화면 0건)', () => {
  const r = recommendForSenior(state(), 'nope');
  assert.equal(r.ok, false);
  assert.deepEqual(r.candidates, []);
  assert.ok(r.error.length > 0);
});

test('가중치를 바꾸면 점수가 바뀐다 — 운영 데이터로 조정 가능(§8)', () => {
  const s = state();
  const base = recommendForSenior(s, 'p101');
  const tuned = recommendForSenior(s, 'p101', {
    weights: { proximity: 0.1, schedule: 0.5, interest: 0.2, safety: 0.1, complement: 0.1 },
  });
  assert.notEqual(base.candidates[0].score_total, tuned.candidates[0].score_total);
  assert.equal(tuned.weights.schedule, 0.5);
});

test('가중치 정규화는 합을 1로 맞춘다', () => {
  const w = normalizeWeights({ proximity: 2, schedule: 2, interest: 2, safety: 2, complement: 2 });
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 0.005);
  assert.deepEqual(Object.keys(w).sort(), Object.keys(DEFAULT_WEIGHTS).sort());
  // 전부 0이면 기본값으로 되돌린다
  assert.deepEqual(normalizeWeights({}), { ...DEFAULT_WEIGHTS });
});

test('감사 스냅샷에 가중치 버전·입력 규모·후보 점수가 남는다(§5 감사)', () => {
  const r = recommendForSenior(state(), 'p101');
  const snap = auditSnapshot(r);
  assert.equal(snap.senior_id, 'p101');
  assert.ok(snap.weights_version.length > 0);
  assert.equal(snap.candidates.length, 3);
  assert.ok(snap.candidates[0].score_json);
  assert.equal(snap.pool_size, r.poolSize);
  assert.equal(auditSnapshot(null), null);
});

test('어르신 needs 는 §4 seniors.needs[] 로 시드에 있다', () => {
  const s = state();
  const seniors = s.participants.filter((p) => p.type === 'senior');
  assert.ok(seniors.length > 0);
  for (const sr of seniors) {
    assert.ok(Array.isArray(sr.needs) && sr.needs.length > 0, `${sr.id} needs 누락`);
  }
  const es = toEngineSenior(s, seniors[0]);
  assert.deepEqual(es.needs, seniors[0].needs);
  assert.deepEqual(es.preferred_slots, seniors[0].availability);
});
