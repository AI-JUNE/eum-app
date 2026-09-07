/** 매칭 엔진 §5 명세 검증 — 2R 가이드 §7-15 (매칭 함수 단위테스트) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rankCandidates, scoreProximity, scoreSchedule, scoreInterest, scoreSafety, scoreComplement,
  buildReason, DEFAULT_WEIGHTS, WEIGHTS_VERSION,
} from '../packages/matching/index.js';

const senior = { user_id: 's1', dong: '광산구 우산동', needs: ['말벗', '스마트폰 도움'], preferred_slots: ['평일저녁', '주말오전'] };
const base = { verified_at: '2026-09-01', report_count: 0, completed_activities: 0 };
const P = (o) => ({ ...base, ...o });

test('가중치 기본값이 §5와 일치한다 (.30/.25/.20/.15/.10, 합 1.0)', () => {
  assert.deepEqual(DEFAULT_WEIGHTS, { proximity: 0.30, schedule: 0.25, interest: 0.20, safety: 0.15, complement: 0.10 });
  const sum = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test('근접도: 같은 동 1.0 / 인접동 0.6 / 같은 구 0.2 / 그 외 0', () => {
  const adj = { '광산구 우산동': ['광산구 월곡동'] };
  assert.equal(scoreProximity(P({ dongs: ['광산구 우산동'] }), senior, adj), 1.0);
  assert.equal(scoreProximity(P({ dongs: ['광산구 월곡동'] }), senior, adj), 0.6);
  assert.equal(scoreProximity(P({ dongs: ['광산구 수완동'] }), senior, adj), 0.2);
  assert.equal(scoreProximity(P({ dongs: ['북구 용봉동'] }), senior, adj), 0);
});

test('일정: 교집합 / 어르신 희망 슬롯 수', () => {
  assert.equal(scoreSchedule(P({ time_slots: ['평일저녁', '주말오전'] }), senior), 1);
  assert.equal(scoreSchedule(P({ time_slots: ['평일저녁'] }), senior), 0.5);
  assert.equal(scoreSchedule(P({ time_slots: ['평일오전'] }), senior), 0);
});

test('관심: 교집합 / 어르신 needs 수', () => {
  assert.equal(scoreInterest(P({ interests: ['말벗', '스마트폰 도움'] }), senior), 1);
  assert.equal(scoreInterest(P({ interests: ['말벗'] }), senior), 0.5);
});

test('안전: 미검증은 0이며 후보에서 제외된다(하드 필터)', () => {
  assert.equal(scoreSafety(P({ verified_at: null })), 0);
  assert.equal(scoreSafety(P({ report_count: 0 })), 1.0);
  assert.equal(scoreSafety(P({ report_count: 1 })), 0.5);
  assert.equal(scoreSafety(P({ has_severe_report: true })), 0);
  const out = rankCandidates(senior, [
    P({ user_id: 'unverified', verified_at: null, dongs: ['광산구 우산동'], time_slots: ['평일저녁', '주말오전'], interests: ['말벗', '스마트폰 도움'] }),
    P({ user_id: 'ok', dongs: ['북구 용봉동'], time_slots: ['평일오전'], interests: [] }),
  ]);
  assert.deepEqual(out.map((c) => c.participant_id), ['ok'], '미검증 참여자는 점수가 높아도 제외');
});

test('보완: 디지털코칭 ↔ 스마트폰 도움 규칙이 매칭된다', () => {
  assert.equal(scoreComplement(P({ skills: ['디지털코칭', '대화'] }), senior), 1.0);
  assert.equal(scoreComplement(P({ skills: ['디지털코칭'] }), senior), 0.5);
  assert.equal(scoreComplement(P({ skills: ['운전'] }), senior), 0);
});

test('상위 3명만 반환하고 rank 가 1부터 매겨진다', () => {
  const ps = Array.from({ length: 6 }, (_, i) => P({ user_id: `p${i}`, dongs: ['광산구 우산동'], time_slots: ['평일저녁'], interests: ['말벗'] }));
  const out = rankCandidates(senior, ps);
  assert.equal(out.length, 3);
  assert.deepEqual(out.map((c) => c.rank), [1, 2, 3]);
});

test('동점이면 이전 활동 완료 수가 많은 참여자가 우선한다', () => {
  const same = { dongs: ['광산구 우산동'], time_slots: ['평일저녁'], interests: ['말벗'] };
  const out = rankCandidates(senior, [P({ user_id: 'new', ...same, completed_activities: 0 }), P({ user_id: 'vet', ...same, completed_activities: 3 })]);
  assert.equal(out[0].participant_id, 'vet');
});

test('score_json 에 요소별 점수가 남고 감사 메타가 포함된다 (설명 가능성)', () => {
  const [c] = rankCandidates(senior, [P({ user_id: 'p', dongs: ['광산구 우산동'], time_slots: ['평일저녁', '주말오전'], interests: ['말벗'] })]);
  for (const k of ['proximity', 'schedule', 'interest', 'safety', 'complement']) assert.ok(k in c.score_json);
  assert.equal(c.weights_version, WEIGHTS_VERSION);
  assert.ok(c.generated_at);
  assert.equal(c.input_snapshot.senior_id, 's1');
  assert.equal(c.weights_used.proximity, 0.30);
});

test('추천 사유는 0.5 이상 상위 2개 요소만 문장화한다', () => {
  const p = P({ dongs: ['광산구 우산동'], time_slots: ['평일저녁', '주말오전'], interests: ['말벗'], completed_activities: 3 });
  const s = { proximity: 1, schedule: 1, interest: 0.5, safety: 1, complement: 0 };
  const r = buildReason(s, p, senior);
  assert.match(r, /우산동 같은 동네/);
  assert.match(r, /시간이 겹칩니다/);
  assert.doesNotMatch(r, /보완/, '0.5 미만 요소는 언급하지 않는다');
  assert.match(r, /이전 활동 3회/);
});

test('가중치를 운영 중 조정할 수 있다 (관리자 화면 요건)', () => {
  const p = [P({ user_id: 'near', dongs: ['광산구 우산동'], time_slots: [], interests: [] }),
             P({ user_id: 'sched', dongs: ['북구 용봉동'], time_slots: ['평일저녁', '주말오전'], interests: [] })];
  const byDefault = rankCandidates(senior, p)[0].participant_id;
  const bySchedule = rankCandidates(senior, p, { weights: { proximity: 0.05, schedule: 0.60 } })[0].participant_id;
  assert.equal(byDefault, 'near');
  assert.equal(bySchedule, 'sched');
});

test('빈 입력을 안전하게 처리한다', () => {
  assert.deepEqual(rankCandidates(senior, []), []);
  assert.equal(scoreSchedule(P({ time_slots: [] }), { preferred_slots: [] }), 0);
});
