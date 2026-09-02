// ============================================================================
// health.js — 배포 헬스체크 페이로드 조립 (공통 P0-5)
//   목적: 배포 직후 "무엇이 떠 있는지"를 1회 요청으로 확인한다.
//         빌드 버전/커밋/시각 + 상용 게이트 플래그의 ON/OFF 상태만 노출한다.
//
//   보안 원칙 (테스트로 고정):
//     - 시크릿·키·URL 값은 절대 넣지 않는다. 존재 여부(boolean)만 노출한다.
//     - 개인정보·사용자 데이터는 일절 포함하지 않는다.
//     - 알 수 없는 VITE_* 값을 통째로 덤프하지 않는다(화이트리스트 방식).
//
//   사용:
//     - 빌드 시: vite.config.js 의 emit-health-json 플러그인이 dist/health.json 생성
//       → 배포 후 https://<도메인>/health.json 으로 확인.
//     - 런타임: currentHealth() 로 동일 페이로드를 얻어 진단 화면에 쓸 수 있다.
// ============================================================================

/** 문자열이 'true' 일 때만 true. undefined/'false'/'1' 등은 모두 false. */
function flag(v) {
  return String(v) === 'true';
}

/** 값이 실제로 채워졌는지(공백·placeholder 아님) 여부만 반환. 값 자체는 절대 반환하지 않는다. */
function configured(v, placeholders = []) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return false;
  return !placeholders.includes(s);
}

/**
 * 헬스 페이로드 조립(순수 함수).
 * @param {object} env  import.meta.env 또는 동등한 평범한 객체
 * @param {object} meta { now?: string, legal?: {status, effectiveDate} }
 */
export function buildHealth(env = {}, meta = {}) {
  const e = env || {};
  const legal = meta.legal || {};
  const build = resolveBuildInfo(e);
  return {
    ok: true,
    service: 'eum',
    version: build.version,
    commit: build.commit,
    commitFull: build.commitFull,
    branch: build.branch,
    environment: build.environment,
    builtAt: meta.now || null,
    mode: e.MODE || 'unknown',
    // ─ 상용 게이트: 전부 기본 OFF. true 로 바뀌려면 사람이 env 를 주입해야 한다.
    flags: {
      auth: flag(e.VITE_EUM_AUTH_ENABLED),
      billing: flag(e.VITE_BILLING_ENABLED),
      telemetry: flag(e.VITE_TELEMETRY_ENABLED),
    },
    // ─ 설정 주입 여부만(값 미노출). 배포 환경 오설정을 빠르게 잡기 위한 정보.
    configured: {
      supabaseUrl: configured(e.VITE_SUPABASE_URL),
      supabaseAnonKey: configured(e.VITE_SUPABASE_ANON_KEY),
      telemetryEndpoint: configured(e.VITE_TELEMETRY_ENDPOINT),
      paymentKeys: configured(e.VITE_PORTONE_STORE_ID, ['test_imp_store'])
        || configured(e.VITE_TOSS_CLIENT_KEY, ['test_ck_toss_client_key']),
    },
    // ─ 결제사 이름은 시크릿이 아니므로 노출(오설정 진단용).
    paymentProvider: e.VITE_PAYMENT_PROVIDER || 'portone',
    legal: {
      status: legal.status || 'draft',
      effectiveDate: legal.effectiveDate || null,
    },
  };
}

// ============================================================================
// 의존성 상태 (공통 상용 필수: /health 확장)
//   목적: "떠 있다"가 아니라 "무엇에 기대고 있고 그게 살아있는가"를 한 번에 본다.
//   원칙(테스트로 고정):
//     - 엔드포인트 URL·키는 페이로드에 절대 넣지 않는다. 이름/종류/상태/지연시간만.
//     - 미설정 의존성은 실패가 아니라 'skipped'. 단, 해당 게이트가 ON 인데
//       설정이 없으면 'down'(오설정) 으로 본다 — 승인 후 켰는데 값이 빠진 사고 방지.
//     - 프로브는 항상 타임아웃으로 끊는다. 헬스체크가 앱을 붙잡으면 안 된다.
// ============================================================================

/** 프로브 기본 제한시간(ms). 헬스체크는 빠르게 실패해야 한다. */
export const PROBE_TIMEOUT_MS = 3000;

/**
 * env 로부터 의존성 목록을 만든다(순수 함수, 네트워크 없음).
 * url 은 프로브 호출에만 쓰이고 페이로드에는 담기지 않는다.
 * @returns {Array<{name:string,kind:string,required:boolean,configured:boolean,url:string|null}>}
 */
export function describeDependencies(env = {}) {
  const e = env || {};
  const supabaseUrl = String(e.VITE_SUPABASE_URL == null ? '' : e.VITE_SUPABASE_URL).trim();
  const proxyUrl = String(e.VITE_API_PROXY_URL == null ? '' : e.VITE_API_PROXY_URL).trim();
  const authOn = flag(e.VITE_EUM_AUTH_ENABLED);
  return [
    {
      name: 'database',                 // Supabase(Postgres) — 인증·영속화의 기반
      kind: 'db',
      required: authOn,                 // 인증 게이트가 켜진 뒤에만 필수
      configured: configured(supabaseUrl),
      url: supabaseUrl ? supabaseUrl.replace(/\/+$/, '') + '/auth/v1/health' : null,
    },
    {
      name: 'ai-proxy',                 // AI 매칭·리포트 요약을 중계하는 서버 프록시
      kind: 'external-api',
      required: false,                  // 없으면 AI 보조 기능만 비활성 — 서비스는 동작
      configured: configured(proxyUrl),
      url: proxyUrl ? proxyUrl.replace(/\/+$/, '') + '/health' : null,
    },
  ];
}

/** 프로브 결과를 페이로드용으로 정리(민감정보 제거: url 은 버린다). */
function depResult(dep, status, extra = {}) {
  return {
    name: dep.name,
    kind: dep.kind,
    required: !!dep.required,
    configured: !!dep.configured,
    status,
    latencyMs: extra.latencyMs == null ? null : extra.latencyMs,
    code: extra.code || null,
  };
}

/**
 * 의존성 1건을 실제로 찔러본다.
 * @param {object} dep describeDependencies() 의 항목
 * @param {object} opts { fetchImpl, timeoutMs, now }  (테스트에서 주입)
 */
export async function probeDependency(dep, opts = {}) {
  if (!dep.configured || !dep.url) {
    // 미설정: 필수인데 비어 있으면 오설정(down), 아니면 점검 생략(skipped)
    return depResult(dep, dep.required ? 'down' : 'skipped', {
      code: dep.required ? 'not_configured' : null,
    });
  }
  const doFetch = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!doFetch) return depResult(dep, 'skipped', { code: 'no_fetch' });

  const timeoutMs = opts.timeoutMs || PROBE_TIMEOUT_MS;
  const clock = opts.now || (() => Date.now());
  const started = clock();
  let timer = null;
  try {
    let signal;
    if (typeof AbortController === 'function') {
      const ac = new AbortController();
      signal = ac.signal;
      timer = setTimeout(() => ac.abort(), timeoutMs);
    }
    const res = await doFetch(dep.url, { method: 'GET', signal, cache: 'no-store' });
    const latencyMs = Math.max(0, clock() - started);
    const st = Number(res && res.status) || 0;
    if (st >= 200 && st < 300) return depResult(dep, 'ok', { latencyMs });
    if (st >= 500) return depResult(dep, 'down', { latencyMs, code: 'http_' + st });
    // 4xx: 서버는 살아있으나 요청을 거부 — 부분 장애로 본다.
    return depResult(dep, 'degraded', { latencyMs, code: 'http_' + st });
  } catch (err) {
    const latencyMs = Math.max(0, clock() - started);
    const name = (err && err.name) || '';
    return depResult(dep, 'down', {
      latencyMs,
      code: name === 'AbortError' || name === 'TimeoutError' ? 'timeout' : 'unreachable',
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * 네트워크 없이 만드는 의존성 요약(빌드 타임 health.json 용).
 * 상태는 'unchecked' — "이 배포는 무엇에 기대는가"만 알려주고 살아있는지는 단정하지 않는다.
 */
export function dependencySummary(env = {}) {
  return describeDependencies(env).map(d => depResult(d, 'unchecked'));
}

/** 모든 의존성을 병렬로 점검한다(느린 하나가 전체를 막지 않도록). */
export async function checkDependencies(env = {}, opts = {}) {
  const deps = describeDependencies(env);
  return Promise.all(deps.map(d => probeDependency(d, opts)));
}

/**
 * 의존성 상태를 서비스 전체 상태 한 단어로 접는다.
 *   down     : 필수 의존성이 죽음 → 서비스 사용 불가
 *   degraded : 비필수 장애 또는 부분 실패 → 일부 기능만 제한
 *   ok       : 나머지 (미설정은 정상으로 본다 — 데모 배포가 빨간불이 되면 안 된다)
 */
export function rollupStatus(deps = []) {
  let degraded = false;
  for (const d of deps) {
    if (d.status === 'down') {
      if (d.required) return 'down';
      degraded = true;
    } else if (d.status === 'degraded') {
      degraded = true;
    }
  }
  return degraded ? 'degraded' : 'ok';
}

/**
 * 빌드 식별 정보(버전·커밋). Vercel 이 주입하는 값도 폴백으로 받는다.
 * 커밋 해시는 7자로 줄여 노출한다(식별에는 충분, 로그 소음은 감소).
 */
export function resolveBuildInfo(env = {}) {
  const e = env || {};
  const raw = String(
    e.VITE_COMMIT_SHA || e.VERCEL_GIT_COMMIT_SHA || e.GITHUB_SHA || '',
  ).trim();
  const sha = /^[0-9a-f]{7,40}$/i.test(raw) ? raw.toLowerCase() : '';
  return {
    version: e.VITE_APP_VERSION || 'dev',
    commit: sha ? sha.slice(0, 7) : 'unknown',
    commitFull: sha || null,
    branch: String(e.VITE_GIT_BRANCH || e.VERCEL_GIT_COMMIT_REF || '').trim() || null,
    // 배포 환경 이름은 시크릿이 아니다(preview/production 구분에 필요).
    environment: String(e.VITE_DEPLOY_ENV || e.VERCEL_ENV || '').trim() || null,
  };
}

/**
 * buildHealth() 결과에 의존성 점검 결과를 덧붙인 확장 페이로드.
 * 기존 필드는 그대로 두고 status/dependencies/checkedAt 만 추가한다(additive).
 */
export function withDependencies(base, deps = [], meta = {}) {
  const status = rollupStatus(deps);
  return {
    ...base,
    ok: status !== 'down',
    status,
    dependencies: deps,
    checkedAt: meta.checkedAt || null,
  };
}

/** 런타임 확장 헬스: 의존성까지 실제로 찔러본 스냅샷을 만든다. */
export async function currentHealthDetailed(meta = {}, opts = {}) {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const deps = await checkDependencies(env, opts);
  return withDependencies(buildHealth(env, meta), deps, {
    checkedAt: meta.checkedAt || new Date().toISOString(),
  });
}

/** 페이로드에 시크릿처럼 보이는 문자열이 섞였는지 검사(테스트·빌드 가드용). */
export function findSecretLeaks(payload) {
  const bad = [];
  const SUSPECT = /(key|secret|token|password|anon)/i;
  const walk = (node, path) => {
    if (node == null) return;
    if (typeof node === 'string') {
      // 시크릿 후보 키 경로에 문자열 값이 있으면 위반(불리언이어야 한다).
      if (SUSPECT.test(path)) bad.push(path);
      // JWT·긴 랜덤 문자열 형태도 위반.
      if (/^ey[A-Za-z0-9_-]{10,}\./.test(node) || /^(sk|pk)_[A-Za-z0-9]{10,}$/.test(node)) bad.push(path);
      // 엔드포인트 URL(내부 호스트·접속 문자열)도 헬스 페이로드에 담지 않는다.
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(node)) bad.push(path);
      return;
    }
    if (typeof node === 'object') {
      for (const k of Object.keys(node)) walk(node[k], path ? path + '.' + k : k);
    }
  };
  walk(payload, '');
  return bad;
}

/** 런타임(브라우저) 헬스 스냅샷. import.meta.env 를 사용한다. */
export function currentHealth(meta = {}) {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return buildHealth(env, meta);
}
