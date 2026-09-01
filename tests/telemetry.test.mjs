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
  scrub, scrubString, subscribe, listenerCount, isRemoteSinkReady,
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

// ── PII 마스킹(scrub): 기록·전송 전에 개인정보가 남지 않아야 한다 ────────────
test('scrubString: 주민등록번호 마스킹', () => {
  assert.equal(scrubString('신청자 900101-1234567 확인'), '신청자 [주민번호] 확인');
});

test('scrubString: 휴대전화(하이픈 유무·점 구분) 마스킹', () => {
  assert.equal(scrubString('010-1234-5678'), '[전화번호]');
  assert.equal(scrubString('01012345678'), '[전화번호]');
  assert.equal(scrubString('연락처 010.1234.5678 임'), '연락처 [전화번호] 임');
});

test('scrubString: 이메일 마스킹', () => {
  assert.equal(scrubString('문의 hong.gil-dong@example.co.kr 로'), '문의 [이메일] 로');
});

test('scrubString: 카드번호·계좌번호 마스킹', () => {
  assert.equal(scrubString('4111 1111 1111 1111'), '[카드번호]');
  assert.equal(scrubString('110-234-567890'), '[계좌번호]');
});

test('scrubString: 인증 토큰 마스킹', () => {
  assert.ok(!scrubString('Authorization: Bearer abcdef1234567890').includes('abcdef1234567890'));
});

test('scrubString: 개인정보 없는 문장은 그대로 보존(과잉 마스킹 금지)', () => {
  const s = '매칭 요청 처리 중 오류가 발생했습니다';
  assert.equal(scrubString(s), s);
});

test('scrub: 위험한 키는 값 형태와 무관하게 [비공개]', () => {
  const out = scrub({ 이름: '홍길동', phone: 'x', userName: 'gildong', 비고: '정상값' });
  assert.equal(out['이름'], '[비공개]');
  assert.equal(out.phone, '[비공개]');
  assert.equal(out.userName, '[비공개]');
  assert.equal(out['비고'], '정상값');
});

test('scrub: 중첩 객체·배열도 재귀 마스킹', () => {
  const out = scrub({ items: [{ memo: '연락은 010-1234-5678' }] });
  assert.equal(out.items[0].memo, '연락은 [전화번호]');
});

test('scrub: 순환 참조에도 폭발하지 않음', () => {
  const a = { memo: 'ok' };
  a.self = a;
  const out = scrub(a);
  assert.equal(out.memo, 'ok');
  assert.equal(out.self, '[순환참조]');
});

test('scrub: 함수는 기록하지 않는다', () => {
  const out = scrub({ fn: () => {} });
  assert.equal(out.fn, undefined);
});

test('[가드] captureError 로 넘어온 PII 는 링버퍼에 남지 않는다', () => {
  captureError(new Error('주민번호 900101-1234567 조회 실패'), { memo: 'a@b.com' });
  const [entry] = getRecentLogs();
  assert.ok(!entry.message.includes('900101-1234567'));
  assert.equal(entry.message, '주민번호 [주민번호] 조회 실패');
  assert.equal(entry.data.memo, '[이메일]');
  assert.ok(!JSON.stringify(entry).includes('900101-1234567'));
});

// ── 알림 훅(subscribe) ──────────────────────────────────────────────────────
test('subscribe: 기록 시 구독자에게 마스킹된 엔트리가 전달된다', () => {
  const seen = [];
  const off = subscribe((e) => seen.push(e));
  captureError(new Error('연락처 010-1234-5678 오류'));
  off();
  assert.equal(seen.length, 1);
  assert.equal(seen[0].level, 'error');
  assert.ok(!seen[0].message.includes('010-1234-5678'));
});

test('subscribe: 해지하면 더 이상 전달되지 않는다', () => {
  let n = 0;
  const off = subscribe(() => { n += 1; });
  logInfo('1');
  off();
  logInfo('2');
  assert.equal(n, 1);
});

test('subscribe: 구독자 예외는 흡수되어 기록을 막지 않는다', () => {
  const off = subscribe(() => { throw new Error('구독자 폭발'); });
  assert.doesNotThrow(() => logInfo('정상 기록'));
  off();
  assert.equal(getRecentLogs()[0].message, '정상 기록');
});

test('subscribe: 함수가 아니면 무시하고 안전한 해지 함수를 반환', () => {
  const before = listenerCount();
  const off = subscribe(null);
  assert.equal(listenerCount(), before);
  assert.doesNotThrow(() => off());
});

test('[가드] Error 기술 필드(name/stack)는 마스킹 대상이 아니다 — 진단 가능성 유지', () => {
  const out = scrub({ name: 'TypeError', stack: 'at foo()' });
  assert.equal(out.name, 'TypeError');
  assert.equal(out.stack, 'at foo()');
});

test('[가드] isRemoteSinkReady: 승인 전(스위치 OFF·목적지 미설정)에는 false', () => {
  assert.equal(isRemoteSinkReady(), false);
});
