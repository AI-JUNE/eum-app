// tests/rateLimit.test.mjs — 요청 빈도 제한 (공통 상용 필수)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RATE_LIMITS, policyFor, consume, peek, gate,
  retryMessage, rateLimitError, rateLimitResponse, resetRateLimit,
} from '../src/eum/rateLimit.js';
import { ERROR_CODES, isErrorResponse } from '../src/eum/apiError.js';
import { callEumApi } from '../src/eum/eumApi.js';

test('policyFor: 정확 일치 → 상위 접두 → default 순으로 찾는다', () => {
  assert.equal(policyFor('api.claude'), RATE_LIMITS['api.claude']);
  assert.equal(policyFor('eumApi.notify.alimtalk'), RATE_LIMITS['eumApi.notify']);
  assert.equal(policyFor('전혀.모르는.작업'), RATE_LIMITS.default);
  assert.equal(policyFor(undefined), RATE_LIMITS.default);
});

test('모든 정책은 양수 한도·창을 갖는다', () => {
  for (const [k, p] of Object.entries(RATE_LIMITS)) {
    assert.ok(p.limit > 0, k);
    assert.ok(p.windowMs > 0, k);
  }
});

test('consume: 한도까지 허용하고 그 다음부터 차단', () => {
  resetRateLimit('t.a');
  const opts = { limit: 3, windowMs: 1000, now: 1000 };
  assert.equal(consume('t.a', opts).allowed, true);
  assert.equal(consume('t.a', opts).allowed, true);
  const third = consume('t.a', opts);
  assert.equal(third.allowed, true);
  assert.equal(third.remaining, 0);
  const fourth = consume('t.a', opts);
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.retryAfterMs, 1000);
  resetRateLimit('t.a');
});

test('consume: 창이 지나면 다시 허용(슬라이딩)', () => {
  resetRateLimit('t.b');
  const base = { limit: 2, windowMs: 1000 };
  consume('t.b', { ...base, now: 0 });
  consume('t.b', { ...base, now: 100 });
  assert.equal(consume('t.b', { ...base, now: 200 }).allowed, false);
  assert.equal(consume('t.b', { ...base, now: 1101 }).allowed, true); // 첫 건 만료
  resetRateLimit('t.b');
});

test('consume: 키가 다르면 서로 영향 없다', () => {
  resetRateLimit();
  const o = { limit: 1, windowMs: 1000, now: 5 };
  assert.equal(consume('t.c1', o).allowed, true);
  assert.equal(consume('t.c2', o).allowed, true);
  assert.equal(consume('t.c1', o).allowed, false);
  resetRateLimit();
});

test('peek: 상태를 바꾸지 않는다', () => {
  resetRateLimit('t.d');
  const o = { limit: 2, windowMs: 1000, now: 10 };
  assert.equal(peek('t.d', o).remaining, 2);
  assert.equal(peek('t.d', o).remaining, 2);
  consume('t.d', o);
  assert.equal(peek('t.d', o).remaining, 1);
  resetRateLimit('t.d');
});

test('retryMessage: 초·분 안내', () => {
  assert.match(retryMessage(0), /잠시 후/);
  assert.match(retryMessage(3000), /3초 후/);
  assert.match(retryMessage(90_000), /2분 후/);
});

test('rateLimitError / rateLimitResponse: 표준 429', () => {
  const e = rateLimitError({ retryAfterMs: 2000 });
  assert.equal(e.code, ERROR_CODES.RATE_LIMITED);
  assert.equal(e.status, 429);
  const r = rateLimitResponse({ retryAfterMs: 2000 }, { requestId: 'req_z' });
  assert.equal(isErrorResponse(r), true);
  assert.equal(r.error.status, 429);
  assert.equal(r.error.requestId, 'req_z');
  assert.equal(r.error.details.retryAfterMs, 2000);
});

test('gate: 통과하면 undefined, 초과하면 표준 실패', () => {
  resetRateLimit('t.e');
  const o = { limit: 1, windowMs: 1000, now: 1 };
  assert.equal(gate('t.e', o), undefined);
  const blocked = gate('t.e', o);
  assert.equal(isErrorResponse(blocked), true);
  assert.equal(blocked.error.code, ERROR_CODES.RATE_LIMITED);
  resetRateLimit('t.e');
});

test('callEumApi: 한도를 넘으면 연동처를 호출하지 않고 429 를 돌려준다', async () => {
  resetRateLimit();
  let calls = 0;
  const { EUM_API } = await import('../src/eum/eumApi.js');
  const before = EUM_API.notify.alimtalk;
  EUM_API.notify.alimtalk = async () => { calls += 1; return { ok: true }; };
  try {
    const limit = RATE_LIMITS['eumApi.notify'].limit;
    for (let i = 0; i < limit; i += 1) {
      const r = await callEumApi('notify', 'alimtalk');
      assert.equal(r.ok, true, `${i}번째 호출은 허용되어야 한다`);
    }
    const over = await callEumApi('notify', 'alimtalk');
    assert.equal(over.ok, false);
    assert.equal(over.error.code, ERROR_CODES.RATE_LIMITED);
    assert.equal(over.error.status, 429);
    assert.equal(calls, limit); // 초과분은 연동처에 나가지 않았다
  } finally {
    EUM_API.notify.alimtalk = before;
    resetRateLimit();
  }
});
