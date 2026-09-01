// ============================================================================
// reqlog.test.mjs — 구조화 로깅 회귀 가드 (의존성 없음: node --test)
//   검증: 요청 ID 유일성·에러코드 정규화·소요시간 기록·PII 미기록·예외 재던지기
// ============================================================================
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  newRequestId, errorCode, statusCode, startRequest, withRequestLog,
} from '../src/eum/reqlog.js';
import { getRecentLogs, clearLogs } from '../src/eum/telemetry.js';

beforeEach(() => clearLogs());

// ── 요청 ID ─────────────────────────────────────────────────────────────────
test('newRequestId: req_ 접두사·형식 고정', () => {
  const id = newRequestId(1700000000000);
  assert.match(id, /^req_[0-9a-z]+_[0-9a-z]+$/);
});

test('newRequestId: 같은 시각이어도 100개가 모두 유일', () => {
  const ids = new Set();
  for (let i = 0; i < 100; i++) ids.add(newRequestId(1700000000000));
  assert.equal(ids.size, 100);
});

// ── 에러코드 정규화 ─────────────────────────────────────────────────────────
test('errorCode: 명시적 code 우선', () => {
  assert.equal(errorCode({ code: 'rate_limited' }), 'RATE_LIMITED');
});

test('errorCode: status 숫자 → HTTP_nnn', () => {
  assert.equal(errorCode({ status: 503 }), 'HTTP_503');
});

test('errorCode: 메시지 안의 "API 404" 도 HTTP_404 로 환산', () => {
  assert.equal(errorCode(new Error('API 404')), 'HTTP_404');
});

test('errorCode: 타임아웃·네트워크·중단 분류', () => {
  assert.equal(errorCode(new Error('request timed out')), 'TIMEOUT');
  assert.equal(errorCode(new Error('Failed to fetch')), 'NETWORK');
  assert.equal(errorCode(Object.assign(new Error('x'), { name: 'AbortError' })), 'ABORTED');
});

test('errorCode: 알 수 없는 값도 폭발하지 않고 UNKNOWN', () => {
  assert.equal(errorCode(null), 'UNKNOWN');
  assert.equal(errorCode(new Error('그냥 실패')), 'UNKNOWN');
});

test('statusCode: 숫자 아니면 UNKNOWN', () => {
  assert.equal(statusCode(200), 'HTTP_200');
  assert.equal(statusCode(undefined), 'UNKNOWN');
});

// ── 수명주기: 시작/성공/실패 ────────────────────────────────────────────────
test('startRequest → succeed: req.start·req.end 두 건, 소요시간·reqId 일치', () => {
  let t = 1000;
  const req = startRequest('test.op', { note: '기술메타' }, { now: () => t });
  t = 1250;
  const rec = req.succeed({ status: 200 });
  assert.equal(rec.outcome, 'ok');
  assert.equal(rec.durationMs, 250);
  assert.equal(rec.op, 'test.op');
  assert.equal(rec.reqId, req.reqId);

  const logs = getRecentLogs();
  assert.equal(logs.length, 2);
  assert.equal(logs[0].message, 'req.end');
  assert.equal(logs[1].message, 'req.start');
  assert.equal(logs[0].data.reqId, req.reqId);
  assert.equal(logs[0].data.durationMs, 250);
});

test('startRequest → fail: level=error·code 자동 산출', () => {
  let t = 0;
  const req = startRequest('test.fail', null, { now: () => t });
  t = 40;
  const rec = req.fail(new Error('API 500'));
  assert.equal(rec.outcome, 'error');
  assert.equal(rec.code, 'HTTP_500');
  assert.equal(rec.durationMs, 40);
  assert.equal(getRecentLogs()[0].level, 'error');
});

test('startRequest → warn: level=warn 으로 기록', () => {
  const req = startRequest('test.warn');
  req.warn({ retried: 1 });
  assert.equal(getRecentLogs()[0].level, 'warn');
});

test('음수 소요시간 방어: 시계 역행에도 0 이상', () => {
  let t = 500;
  const req = startRequest('test.clock', null, { now: () => t });
  t = 100;
  assert.equal(req.succeed().durationMs, 0);
});

// ── PII 미기록 가드 ─────────────────────────────────────────────────────────
test('[가드] 메타에 개인정보가 섞여도 로그에는 마스킹되어 남는다', () => {
  const req = startRequest('test.pii', { memo: '연락처 010-1234-5678' });
  req.succeed({ memo: 'a@b.com' });
  const dump = JSON.stringify(getRecentLogs());
  assert.ok(!dump.includes('010-1234-5678'));
  assert.ok(!dump.includes('a@b.com'));
});

// ── withRequestLog: 반환·예외 동작 불변 ─────────────────────────────────────
test('withRequestLog: 정상 반환값을 그대로 전달', async () => {
  const out = await withRequestLog('test.wrap', async (req) => {
    assert.match(req.reqId, /^req_/);
    return 42;
  });
  assert.equal(out, 42);
  assert.equal(getRecentLogs()[0].data.outcome, 'ok');
});

test('withRequestLog: 예외는 기록 후 그대로 다시 던진다(삼키지 않음)', async () => {
  await assert.rejects(
    () => withRequestLog('test.throw', async () => { throw new Error('API 429'); }),
    /API 429/,
  );
  const rec = getRecentLogs()[0];
  assert.equal(rec.level, 'error');
  assert.equal(rec.data.code, 'HTTP_429');
});
