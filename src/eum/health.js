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
  return {
    ok: true,
    service: 'eum',
    version: e.VITE_APP_VERSION || 'dev',
    commit: e.VITE_COMMIT_SHA || 'unknown',
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
