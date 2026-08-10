// ============================================================================
// health.test.mjs — 배포 헬스체크 페이로드 가드 (의존성 없음: node --test)
//   실행: npm test
//   목적: (1) 시크릿·개인정보가 health.json 에 새지 않도록 고정
//         (2) 상용 게이트 플래그가 기본 OFF 임을 회귀 가드
//         (3) 배포 진단에 필요한 필드(version·commit·mode)가 유지되는지 확인
// ============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildHealth, findSecretLeaks } from '../src/eum/health.js';

// ── 기본값: 아무 env 없이도 안전한 페이로드 ─────────────────────────────────
test('빈 env → ok:true, 모든 게이트 OFF', () => {
  const h = buildHealth({});
  assert.equal(h.ok, true);
  assert.equal(h.service, 'eum');
  assert.equal(h.flags.auth, false);
  assert.equal(h.flags.billing, false);
  assert.equal(h.flags.telemetry, false);
  assert.equal(h.version, 'dev');
  assert.equal(h.commit, 'unknown');
});

test("문자열 'true' 만 플래그를 켠다", () => {
  const on = buildHealth({ VITE_EUM_AUTH_ENABLED: 'true', VITE_BILLING_ENABLED: 'true', VITE_TELEMETRY_ENABLED: 'true' });
  assert.deepEqual(on.flags, { auth: true, billing: true, telemetry: true });
  // 흔한 오설정값들은 전부 OFF 로 남아야 한다(승인 없이 켜지는 사고 방지).
  for (const v of ['1', 'yes', 'TRUE', 'on', '']) {
    const h = buildHealth({ VITE_EUM_AUTH_ENABLED: v, VITE_BILLING_ENABLED: v, VITE_TELEMETRY_ENABLED: v });
    assert.deepEqual(h.flags, { auth: false, billing: false, telemetry: false }, `값 ${JSON.stringify(v)} 는 OFF 여야 함`);
  }
});

// ── 보안: 값이 아니라 존재 여부만 ───────────────────────────────────────────
test('시크릿 값은 페이로드에 등장하지 않고 boolean 으로만 표현된다', () => {
  const env = {
    VITE_SUPABASE_URL: 'https://abcdefg.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.super-secret-anon',
    VITE_TELEMETRY_ENDPOINT: 'https://collector.example.com/ingest',
    VITE_PORTONE_STORE_ID: 'imp12345678',
    VITE_TOSS_CLIENT_KEY: 'test_ck_real_looking_key',
  };
  const h = buildHealth(env);
  const json = JSON.stringify(h);
  for (const v of Object.values(env)) {
    assert.ok(!json.includes(v), `시크릿 값이 노출됨: ${v}`);
  }
  assert.equal(h.configured.supabaseUrl, true);
  assert.equal(h.configured.supabaseAnonKey, true);
  assert.equal(h.configured.telemetryEndpoint, true);
  assert.equal(h.configured.paymentKeys, true);
  for (const v of Object.values(h.configured)) assert.equal(typeof v, 'boolean');
});

test('테스트 placeholder 결제키는 "설정됨"으로 오인하지 않는다', () => {
  const h = buildHealth({ VITE_PORTONE_STORE_ID: 'test_imp_store', VITE_TOSS_CLIENT_KEY: 'test_ck_toss_client_key' });
  assert.equal(h.configured.paymentKeys, false);
});

test('빈 문자열·공백은 미설정으로 본다', () => {
  const h = buildHealth({ VITE_SUPABASE_URL: '   ', VITE_TELEMETRY_ENDPOINT: '' });
  assert.equal(h.configured.supabaseUrl, false);
  assert.equal(h.configured.telemetryEndpoint, false);
});

test('알 수 없는 env 는 통째로 덤프되지 않는다(화이트리스트)', () => {
  const h = buildHealth({ VITE_SOME_PRIVATE_TOKEN: 'zzz-do-not-leak', DATABASE_URL: 'postgres://u:p@h/db' });
  const json = JSON.stringify(h);
  assert.ok(!json.includes('zzz-do-not-leak'));
  assert.ok(!json.includes('postgres://'));
});

// ── 유출 감지기 자체 검증 ───────────────────────────────────────────────────
test('findSecretLeaks: 정상 페이로드는 위반 0건', () => {
  assert.deepEqual(findSecretLeaks(buildHealth({})), []);
  assert.deepEqual(findSecretLeaks(buildHealth({ VITE_SUPABASE_ANON_KEY: 'eyJabc.def' })), []);
});

test('findSecretLeaks: 시크릿 키 경로에 문자열이 들어오면 탐지', () => {
  const leaks = findSecretLeaks({ ok: true, configured: { anonKey: 'eyJhbGciOi.leak' } });
  assert.ok(leaks.length >= 1);
});

// ── 진단 필드 유지 ──────────────────────────────────────────────────────────
test('버전·커밋·모드·법적고지 상태가 전달된다', () => {
  const h = buildHealth(
    { VITE_APP_VERSION: '1.2.3', VITE_COMMIT_SHA: 'abc1234', MODE: 'production', VITE_PAYMENT_PROVIDER: 'toss' },
    { now: '2026-08-10T00:00:00.000Z', legal: { status: 'draft', effectiveDate: '2027-07-15' } },
  );
  assert.equal(h.version, '1.2.3');
  assert.equal(h.commit, 'abc1234');
  assert.equal(h.mode, 'production');
  assert.equal(h.builtAt, '2026-08-10T00:00:00.000Z');
  assert.equal(h.paymentProvider, 'toss');
  assert.deepEqual(h.legal, { status: 'draft', effectiveDate: '2027-07-15' });
});
