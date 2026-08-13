// ============================================================================
// securityHeaders.test.mjs — 보안 응답 헤더 불변식 (의존성 없음: node --test)
//   목적: (1) 모듈과 vercel.json 이 따로 놀지 않게 고정(한쪽만 수정되는 표류 방지)
//         (2) 되돌리기 어려운 설정(HSTS preload·CSP 리소스 지시어)이 몰래 들어오지 못하게
//         (3) 클릭재킹·MIME 스니핑 방어가 삭제되는 회귀를 잡기
// ============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  SECURITY_HEADERS,
  HEALTH_HEADERS,
  buildVercelHeaders,
  findHeaderIssues,
} from '../src/eum/securityHeaders.js';

const vercelJson = JSON.parse(
  readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'),
);

test('필수 방어 헤더가 모두 있다', () => {
  assert.equal(SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff');
  assert.equal(SECURITY_HEADERS['X-Frame-Options'], 'DENY');
  assert.equal(SECURITY_HEADERS['Content-Security-Policy'], "frame-ancestors 'none'");
  assert.equal(SECURITY_HEADERS['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.match(SECURITY_HEADERS['Strict-Transport-Security'], /^max-age=\d+$/);
});

test('vercel.json 의 headers 가 모듈 직렬화 결과와 정확히 일치', () => {
  assert.deepEqual(vercelJson.headers, buildVercelHeaders());
});

test('vercel.json 이 빌드 설정을 덮어쓰지 않는다(headers 전용)', () => {
  const keys = Object.keys(vercelJson).filter((k) => k !== '$schema');
  assert.deepEqual(keys, ['headers']);
});

test('되돌리기 어려운 설정(HSTS preload·CSP 리소스 지시어) 없음', () => {
  assert.deepEqual(findHeaderIssues(), []);
  assert.deepEqual(
    findHeaderIssues({ 'Strict-Transport-Security': 'max-age=63072000; preload' }).length,
    1,
  );
  assert.equal(
    findHeaderIssues({ 'Content-Security-Policy': "default-src 'self'" }).length,
    1,
  );
});

test('health.json 은 캐시 금지', () => {
  assert.equal(HEALTH_HEADERS['Cache-Control'], 'no-store');
  const h = buildVercelHeaders().find((r) => r.source === '/health.json');
  assert.ok(h && h.headers.some((x) => x.key === 'Cache-Control' && x.value === 'no-store'));
});
