// ============================================================================
// health.test.mjs — 배포 헬스체크 페이로드 가드 (의존성 없음: node --test)
//   실행: npm test
//   목적: (1) 시크릿·개인정보가 health.json 에 새지 않도록 고정
//         (2) 상용 게이트 플래그가 기본 OFF 임을 회귀 가드
//         (3) 배포 진단에 필요한 필드(version·commit·mode)가 유지되는지 확인
// ============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildHealth,
  findSecretLeaks,
  describeDependencies,
  dependencySummary,
  probeDependency,
  checkDependencies,
  rollupStatus,
  resolveBuildInfo,
  withDependencies,
} from '../src/eum/health.js';

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

// ── /health 확장: 빌드 식별 정보 ────────────────────────────────────────────
test('resolveBuildInfo: 커밋 해시는 7자로 줄이고 원본도 보관한다', () => {
  const b = resolveBuildInfo({ VITE_COMMIT_SHA: 'ABC1234DEF5678901234567890abcdef12345678' });
  assert.equal(b.commit, 'abc1234');
  assert.equal(b.commitFull, 'abc1234def5678901234567890abcdef12345678');
});

test('resolveBuildInfo: 호스팅 주입 값(Vercel/GitHub)도 폴백으로 받는다', () => {
  assert.equal(resolveBuildInfo({ VERCEL_GIT_COMMIT_SHA: 'deadbeef1234' }).commit, 'deadbee');
  assert.equal(resolveBuildInfo({ GITHUB_SHA: 'feedface9999' }).commit, 'feedfac');
  // VITE_ 값이 우선한다.
  assert.equal(resolveBuildInfo({ VITE_COMMIT_SHA: 'aaaaaaa', VERCEL_GIT_COMMIT_SHA: 'bbbbbbb' }).commit, 'aaaaaaa');
});

test('resolveBuildInfo: 해시가 아닌 값은 unknown 으로 떨어진다', () => {
  const b = resolveBuildInfo({ VITE_COMMIT_SHA: '$COMMIT_SHA' });
  assert.equal(b.commit, 'unknown');
  assert.equal(b.commitFull, null);
});

test('buildHealth 는 브랜치·배포환경을 함께 노출한다(민감정보 아님)', () => {
  const h = buildHealth({ VERCEL_GIT_COMMIT_REF: 'main', VERCEL_ENV: 'production' });
  assert.equal(h.branch, 'main');
  assert.equal(h.environment, 'production');
  assert.deepEqual(findSecretLeaks(h), []);
});

// ── /health 확장: 의존성 서술 ───────────────────────────────────────────────
test('describeDependencies: DB·외부API 두 축을 항상 보고한다', () => {
  const deps = describeDependencies({});
  assert.deepEqual(deps.map(d => d.name), ['database', 'ai-proxy']);
  assert.deepEqual(deps.map(d => d.kind), ['db', 'external-api']);
  for (const d of deps) assert.equal(d.configured, false);
});

test('describeDependencies: 인증 게이트가 켜져야 DB 가 필수가 된다', () => {
  assert.equal(describeDependencies({}).find(d => d.name === 'database').required, false);
  assert.equal(
    describeDependencies({ VITE_EUM_AUTH_ENABLED: 'true' }).find(d => d.name === 'database').required,
    true,
  );
});

test('dependencySummary: 페이로드에 URL 이 새지 않는다', () => {
  const env = { VITE_SUPABASE_URL: 'https://abcdefg.supabase.co', VITE_API_PROXY_URL: 'https://proxy.internal.example.com' };
  const summary = dependencySummary(env);
  const json = JSON.stringify(summary);
  assert.ok(!json.includes('supabase.co'));
  assert.ok(!json.includes('proxy.internal'));
  assert.ok(!json.includes('https://'));
  for (const d of summary) assert.equal(d.status, 'unchecked');
  assert.deepEqual(findSecretLeaks({ dependencies: summary }), []);
});

// ── /health 확장: 프로브 ────────────────────────────────────────────────────
const okRes = { status: 200 };
function fakeFetch(res) {
  return async () => (res instanceof Error ? Promise.reject(res) : res);
}

test('probeDependency: 미설정이고 비필수면 skipped', async () => {
  const dep = describeDependencies({}).find(d => d.name === 'database');
  const r = await probeDependency(dep, { fetchImpl: fakeFetch(okRes) });
  assert.equal(r.status, 'skipped');
  assert.equal(r.code, null);
});

test('probeDependency: 필수인데 미설정이면 down(not_configured)', async () => {
  const dep = describeDependencies({ VITE_EUM_AUTH_ENABLED: 'true' }).find(d => d.name === 'database');
  const r = await probeDependency(dep, { fetchImpl: fakeFetch(okRes) });
  assert.equal(r.status, 'down');
  assert.equal(r.code, 'not_configured');
});

test('probeDependency: 2xx=ok, 4xx=degraded, 5xx=down', async () => {
  const dep = describeDependencies({ VITE_SUPABASE_URL: 'https://x.supabase.co' })[0];
  assert.equal((await probeDependency(dep, { fetchImpl: fakeFetch({ status: 204 }) })).status, 'ok');
  const d4 = await probeDependency(dep, { fetchImpl: fakeFetch({ status: 401 }) });
  assert.equal(d4.status, 'degraded');
  assert.equal(d4.code, 'http_401');
  const d5 = await probeDependency(dep, { fetchImpl: fakeFetch({ status: 503 }) });
  assert.equal(d5.status, 'down');
  assert.equal(d5.code, 'http_503');
});

test('probeDependency: 네트워크 실패는 unreachable, 중단은 timeout', async () => {
  const dep = describeDependencies({ VITE_SUPABASE_URL: 'https://x.supabase.co' })[0];
  const net = await probeDependency(dep, { fetchImpl: fakeFetch(new TypeError('failed to fetch')) });
  assert.equal(net.status, 'down');
  assert.equal(net.code, 'unreachable');
  const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
  const to = await probeDependency(dep, { fetchImpl: fakeFetch(abort) });
  assert.equal(to.code, 'timeout');
});

test('probeDependency: 프로브는 /auth/v1/health 를 치고 결과에 URL 을 남기지 않는다', async () => {
  const dep = describeDependencies({ VITE_SUPABASE_URL: 'https://x.supabase.co/' })[0];
  let called = null;
  const r = await probeDependency(dep, { fetchImpl: async (u) => { called = u; return okRes; } });
  assert.equal(called, 'https://x.supabase.co/auth/v1/health');
  assert.ok(!JSON.stringify(r).includes('supabase.co'));
});

test('probeDependency: 지연시간을 ms 로 기록한다', async () => {
  const dep = describeDependencies({ VITE_SUPABASE_URL: 'https://x.supabase.co' })[0];
  let t = 1000;
  const r = await probeDependency(dep, { fetchImpl: async () => { t += 42; return okRes; }, now: () => t });
  assert.equal(r.latencyMs, 42);
});

// ── /health 확장: 집계 ──────────────────────────────────────────────────────
test('rollupStatus: 필수 장애만 전체 down, 비필수 장애는 degraded', () => {
  assert.equal(rollupStatus([]), 'ok');
  assert.equal(rollupStatus([{ status: 'ok' }, { status: 'skipped' }]), 'ok');
  assert.equal(rollupStatus([{ status: 'down', required: false }]), 'degraded');
  assert.equal(rollupStatus([{ status: 'degraded', required: true }]), 'degraded');
  assert.equal(rollupStatus([{ status: 'down', required: true }, { status: 'ok' }]), 'down');
});

test('checkDependencies + withDependencies: 확장 페이로드 형태', async () => {
  const env = { VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_EUM_AUTH_ENABLED: 'true' };
  const deps = await checkDependencies(env, { fetchImpl: fakeFetch({ status: 500 }) });
  const h = withDependencies(buildHealth(env), deps, { checkedAt: '2026-09-02T00:00:00.000Z' });
  assert.equal(h.status, 'down');
  assert.equal(h.ok, false);           // 필수 의존성이 죽으면 ok 도 false
  assert.equal(h.checkedAt, '2026-09-02T00:00:00.000Z');
  assert.equal(h.dependencies.length, 2);
  assert.equal(h.version, 'dev');      // 기존 필드 보존
  assert.deepEqual(findSecretLeaks(h), []);
});

test('정상 배포는 ok:true 를 유지한다(미설정 의존성이 빨간불이 되지 않는다)', async () => {
  const deps = await checkDependencies({}, { fetchImpl: fakeFetch(okRes) });
  const h = withDependencies(buildHealth({}), deps, {});
  assert.equal(h.status, 'ok');
  assert.equal(h.ok, true);
});

// ── 유출 감지기 강화: URL 도 위반 ───────────────────────────────────────────
test('findSecretLeaks: 절대 URL 문자열은 위반으로 잡는다', () => {
  assert.ok(findSecretLeaks({ deps: { endpoint: 'https://collector.example.com' } }).length >= 1);
  assert.ok(findSecretLeaks({ db: 'postgres://u:p@h/db' }).length >= 1);
});
