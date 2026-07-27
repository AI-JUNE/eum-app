// ============================================================================
// telemetry.test.mjs — 클라이언트 에러 모니터링·로깅 회귀 가드 (의존성 없음: node --test)
//   실행: node --test tests/  (또는 npm test)
//   목적: 경량 텔레메트리(telemetry.js)의 순수 동작 고정 + "승인 전 원격전송 비활성"
//         가드레일 검증. 원격 전송이 승인 없이 켜지면 테스트가 실패하도록 설계.
//   주: window 미의존 API(record/capture/ring)만 검증. installGlobalHandlers 는
//       브라우저 전용(window)이라 노드 유닛 대상 아님(가드로 no-op 확인만).
// ============================================================================
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  TELEMETRY_ENABLED, TELEMETRY_ENDPOINT,
  captureError, logInfo, logWarn, getRecentLogs, clearLogs, installGlobalHandlers,
} from '../src/eum/telemetry.js';

// 각 테스트는 링버퍼를 비운 상태에서 시작(테스트 간 격리).
beforeEach(() => clearLogs());

// ── 가드레일: 승인 전 원격전송 비활성 ───────────────────────────────────────
test('[가드] 원격 전송은 기본 비활성(TELEMETRY_ENABLED=false) — 승인 전 외부 전송 금지', () => {
  assert.equal(TELEMETRY_ENABLED, false);
});

test('[가드] 수집 엔드포인트는 기본 미설정(빈 문자열) — 승인 후에만 주입', () => {
  assert.equal(TELEMETRY_ENDPOINT, '');
});

// ── captureError: Error 직렬화 ──────────────────────────────────────────────
test('captureError(Error): level=error·message 보존·name/stack 직렬화', () => {
  const entry = captureError(new Error('무언가 터짐'), { kind: 'test' });
  assert.equal(entry.level, 'error');
  assert.equal(entry.message, '무언가 터짐');
  assert.equal(entry.data.name, 'Error');
  assert.equal(entry.data.message, '무언가 터짐');
  assert.equal(typeof entry.data.stack, 'string');
  assert.equal(entry.data.kind, 'test'); // context 병합
  assert.ok(typeof entry.ts === 'string' && entry.ts.length > 0);
});

test('captureError(string): 문자열도 안전 직렬화(message=문자열·stack 빈값)', () => {
  const entry = captureError('문자열 오류');
  assert.equal(entry.level, 'error');
  assert.equal(entry.message, '문자열 오류');
  assert.equal(entry.data.message, '문자열 오류');
  assert.equal(entry.data.stack, '');
});

test('captureError(null/undefined): 폭발하지 않고 빈 메시지로 기록', () => {
  const e1 = captureError(null);
  const e2 = captureError(undefined);
  assert.equal(e1.level, 'error');
  assert.equal(e2.level, 'error');
  assert.equal(e1.message, '');
  assert.equal(e2.message, '');
});

test('captureError: stack 은 4000자로 절단(과대 스택 방어)', () => {
  const err = new Error('big');
  err.stack = 'x'.repeat(9000);
  const entry = captureError(err);
  assert.equal(entry.data.stack.length, 4000);
});

// ── logInfo / logWarn 레벨 ──────────────────────────────────────────────────
test('logInfo/logWarn: level 정확·data 병합', () => {
  const i = logInfo('정보', { a: 1 });
  const w = logWarn('경고', { b: 2 });
  assert.equal(i.level, 'info');
  assert.equal(w.level, 'warn');
  assert.equal(i.data.a, 1);
  assert.equal(w.data.b, 2);
});

test('record 공통 필드: level/message/route/version/data/ts 존재', () => {
  const e = logInfo('필드체크');
  for (const k of ['level', 'message', 'route', 'version', 'data', 'ts']) {
    assert.ok(k in e, `${k} 존재`);
  }
  assert.equal(e.message, '필드체크');
});

// ── 링버퍼: 최신순 스냅샷·격리 ──────────────────────────────────────────────
test('getRecentLogs: 최신순(reverse)·얕은 복사본(원본 불변)', () => {
  logInfo('첫번째');
  logInfo('두번째');
  const logs = getRecentLogs();
  assert.equal(logs.length, 2);
  assert.equal(logs[0].message, '두번째'); // 최신이 앞
  assert.equal(logs[1].message, '첫번째');
  logs.push({ fake: true }); // 반환본 변조가 내부 링에 영향 없어야
  assert.equal(getRecentLogs().length, 2);
});

test('clearLogs: 링버퍼 비움', () => {
  logInfo('a'); logInfo('b');
  assert.equal(getRecentLogs().length, 2);
  clearLogs();
  assert.equal(getRecentLogs().length, 0);
});

test('링버퍼 상한(RING_CAP=100): 초과분은 오래된 것부터 폐기', () => {
  for (let i = 0; i < 130; i++) logInfo(`m${i}`);
  const logs = getRecentLogs();
  assert.equal(logs.length, 100);
  assert.equal(logs[0].message, 'm129');   // 최신
  assert.equal(logs[99].message, 'm30');   // 가장 오래 남은 것(0~29 폐기)
});

// ── installGlobalHandlers: 노드(window 없음)에서 안전 no-op ──────────────────
test('installGlobalHandlers: window 없으면 조용히 no-op(예외 없음)', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.doesNotThrow(() => installGlobalHandlers());
});
