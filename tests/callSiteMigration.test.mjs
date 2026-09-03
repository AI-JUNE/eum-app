// tests/callSiteMigration.test.mjs
// 표준 판 호출부 이관 회귀 방지 (COMMERCIAL_READINESS · 공통 상용 필수)
//   목적: 화면(코디네이터·청년)이 다시 예외 던지는 원본 호출부로 되돌아가지 않도록
//         소스 수준에서 고정하고, 이관된 코드가 의존하는 표준 응답 모양을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { EUM_API_SAFE } from '../src/eum/eumApi.js';
import { callClaudeSafe } from '../src/eum/api.js';
import { ERROR_CODES, isErrorResponse } from '../src/eum/apiError.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf-8');

const COORD = read('src/eum/apps/CoordinatorApp.jsx');
const YOUTH = read('src/eum/apps/YouthApp.jsx');

// ─── 소스 수준 고정 ─────────────────────────────────────────────────────────

test('코디네이터 화면: 원본(예외 던지는) 호출부가 남아 있지 않다', () => {
  assert.equal(/await\s+EUM_API\./.test(COORD), false, 'EUM_API 직접 호출 잔존');
  assert.equal(/await\s+callClaude\s*\(/.test(COORD), false, 'callClaude 직접 호출 잔존');
});

test('코디네이터 화면: 표준 판을 import 하고 실패 분기를 갖는다', () => {
  assert.match(COORD, /import\s*\{[^}]*callClaudeSafe[^}]*\}\s*from\s*'\.\.\/api\.js'/);
  assert.match(COORD, /import\s*\{[^}]*EUM_API_SAFE[^}]*\}\s*from\s*'\.\.\/eumApi\.js'/);
  // AI 트리오 추천 · 월간 리포트 두 곳 모두 표준 응답 분기를 갖는다
  assert.equal((COORD.match(/await\s+callClaudeSafe\s*\(/g) || []).length, 2);
  assert.ok((COORD.match(/if\s*\(!res\.ok\)/g) || []).length >= 3);
});

test('청년 화면: 실적확인서 발급이 표준 판으로 이관되었다', () => {
  assert.equal(/await\s+EUM_API\./.test(YOUTH), false, 'EUM_API 직접 호출 잔존');
  assert.match(YOUTH, /import\s*\{[^}]*EUM_API_SAFE[^}]*\}\s*from\s*'\.\.\/eumApi\.js'/);
  assert.match(YOUTH, /EUM_API_SAFE\.v1365\.issueCertificate/);
  assert.match(YOUTH, /if\s*\(!res\.ok\)/);
});

test('이관 후에도 실패 문구를 사용자에게 보여준다(빈 catch 금지)', () => {
  // 실패 사유를 화면 문구로 잇는 변수가 두 곳 모두 존재
  assert.equal((COORD.match(/failReason\s*=\s*res\.error\.message/g) || []).length, 2);
  assert.match(COORD, /\$\{failReason\} - 룰 기반 추천으로 대체/);
  assert.match(COORD, /\$\{failReason\} - 기본 템플릿으로 대체/);
});

// ─── 이관된 코드가 의존하는 표준 응답 모양 ──────────────────────────────────

test('EUM_API_SAFE.v1365.issueCertificate: res.data.certNo 로 접근 가능', async () => {
  const res = await EUM_API_SAFE.v1365.issueCertificate('u_test');
  assert.equal(res.ok, true);
  assert.match(res.data.certNo, /^1365-/);
});

test('EUM_API_SAFE.notify.alimtalk: 실패해도 예외 대신 표준 응답', async () => {
  const res = await EUM_API_SAFE.notify.alimtalk();
  assert.equal(res.ok, true);
  assert.ok(res.requestId);
});

test('callClaudeSafe: 네트워크 실패에도 던지지 않고 표준 실패를 돌려준다', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  const origError = console.error;
  console.error = () => {};
  try {
    const res = await callClaudeSafe({ system: 's', user: 'u', maxTokens: 8 });
    assert.equal(isErrorResponse(res), true);
    assert.ok(res.error.message.length > 0, '사용자용 문구가 비어 있으면 화면이 침묵한다');
    assert.ok(res.error.requestId, '요청 ID 가 있어야 추적 가능');
    assert.ok(Object.values(ERROR_CODES).includes(res.error.code));
  } finally {
    globalThis.fetch = origFetch;
    console.error = origError;
  }
});
