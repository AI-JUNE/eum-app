// ============================================================================
// telemetry.js — 클라이언트 에러 모니터링·로깅 (경량, 무의존)
//   상태: [승인 필요] — 원격 전송은 기본 비활성(TELEMETRY_ENABLED=false).
//   목적: "build now, activate on approval". 런타임 오류/경고를 로컬 링버퍼에
//         모으고, 승인 후 플래그를 켜면 지정 엔드포인트로 전송한다.
//         승인 전에는 절대 외부로 전송하지 않으며 콘솔 기록만 수행한다.
//
//   활성화 절차(승인 후):
//     1) .env 에 VITE_TELEMETRY_ENABLED=true
//     2) VITE_TELEMETRY_ENDPOINT=https://<수집서버>/ingest   (자사 프록시 권장)
//     3) 서버측 수집 엔드포인트·보관정책·개인정보 최소수집 검토(법무)
//
//   개인정보 보호 원칙:
//     - 이 모듈은 사용자 입력값·이름·연락처 등 PII 를 전송하지 않는다.
//     - 전송 대상은 오류 메시지/스택/경로/타임스탬프/앱버전 등 기술 메타로 한정.
// ============================================================================

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// 원격 전송 마스터 스위치. 기본 OFF — 승인 전에는 절대 true 금지.
export const TELEMETRY_ENABLED = String(env.VITE_TELEMETRY_ENABLED) === 'true';

// 수집 엔드포인트(승인 후 설정). 비어 있으면 전송하지 않는다.
// MONITORING_GUIDE 규약에 따라 VITE_SENTRY_DSN 도 별칭으로 받는다(둘 다 없으면 no-op).
// DSN·엔드포인트는 코드에 하드코딩하지 않는다 — 환경변수로만 주입.
export const TELEMETRY_ENDPOINT = env.VITE_TELEMETRY_ENDPOINT || env.VITE_SENTRY_DSN || '';

/** 원격 전송이 실제로 가능한 상태인지(활성 스위치 ON + 목적지 설정). */
export function isRemoteSinkReady() {
  return TELEMETRY_ENABLED && !!TELEMETRY_ENDPOINT;
}

// 앱 버전(빌드 주입 없으면 dev). 배포 시 VITE_APP_VERSION 주입 권장.
export const APP_VERSION = env.VITE_APP_VERSION || 'dev';

const isDev = String(env.MODE || env.DEV || '') !== 'production';

// ─── 로컬 링버퍼(최근 이벤트 보관, 최대 100건) ──────────────────────────────
const RING_CAP = 100;
const ring = [];

function pushRing(entry) {
  ring.push(entry);
  if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
}

/** 최근 로그 스냅샷(디버그·CS 지원용). 최신순 얕은 복사본을 반환. */
export function getRecentLogs() {
  return ring.slice().reverse();
}

/** 링버퍼 비우기(수동 초기화용). */
export function clearLogs() {
  ring.length = 0;
}

function currentRoute() {
  try {
    if (typeof window === 'undefined') return '';
    const { pathname, hash } = window.location;
    return (pathname || '') + (hash || '');
  } catch { return ''; }
}

function serializeError(err) {
  if (!err) return { message: '', stack: '' };
  if (typeof err === 'string') return { message: err, stack: '' };
  return {
    name: err.name || 'Error',
    message: String(err.message || err),
    stack: typeof err.stack === 'string' ? err.stack.slice(0, 4000) : '',
  };
}

// ─── PII 마스킹(scrub) ──────────────────────────────────────────────────────
//   원칙(MONITORING_GUIDE): 기록·전송 전에 개인정보를 제거한다. 화면(최근 로그),
//   콘솔, 원격 전송 모두 동일한 마스킹을 거친다. 순서가 중요하다 —
//   주민번호 → 전화 → 계좌 → 카드 → 이메일 순으로 좁은 패턴부터 적용한다.
const PII_RULES = [
  [/\b\d{6}\s*-\s*[1-8]\d{6}\b/g, '[주민번호]'],
  [/\b01[016789][-. ]?\d{3,4}[-. ]?\d{4}\b/g, '[전화번호]'],
  [/\b\d{2,4}-\d{2,6}-\d{2,7}(?:-\d{1,6})?\b/g, '[계좌번호]'],
  [/\b(?:\d[ -]?){13,19}\b/g, '[카드번호]'],
  [/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[이메일]'],
  [/\b(?:Bearer|token|apikey|api_key|authorization)\s*[:=]?\s*[\w.\-]{8,}/gi, '[비밀토큰]'],
];

// 키 이름만으로 즉시 가려야 하는 필드(값 형태와 무관하게 위험).
//   주의: 'name'·'stack' 같은 기술 필드(Error 직렬화 결과)는 가리지 않는다.
//   대신 userName·성명 등 사람 이름을 뜻하는 키만 대상으로 한다.
const PII_KEYS = /(이름|성명|연락처|전화|휴대폰|주소|생년월일|주민|계좌|카드|비밀번호|(?:user|full|first|last|nick|real|display|owner)[_-]?name|phone|mobile|email|address|birth|ssn|rrn|password|passwd|secret|token|authorization|card|account)/i;

/** 문자열 내 개인정보 패턴을 마스킹한다. 문자열이 아니면 그대로 반환. */
export function scrubString(text) {
  if (typeof text !== 'string' || !text) return text;
  let out = text;
  for (const [re, mask] of PII_RULES) {
    try { out = out.replace(re, mask); } catch { /* 정규식 실패는 무시 */ }
  }
  return out;
}

/**
 * 값(문자열·배열·객체)을 깊이 우선으로 마스킹한다.
 * - 위험한 키 이름은 값 형태와 무관하게 '[비공개]' 로 치환
 * - 순환 참조·과대 깊이(6)·과대 배열(50)에 안전
 */
export function scrub(value, depth = 0, seen) {
  if (value == null) return value;
  if (typeof value === 'string') return scrubString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth >= 6) return '[깊이초과]';
  const marks = seen || new WeakSet();
  if (typeof value === 'object') {
    if (marks.has(value)) return '[순환참조]';
    marks.add(value);
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => scrub(v, depth + 1, marks));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = PII_KEYS.test(k) ? '[비공개]' : scrub(value[k], depth + 1, marks);
    }
    return out;
  }
  return undefined; // 함수·심볼 등은 기록하지 않는다
}

// ─── 알림 훅(구독) ──────────────────────────────────────────────────────────
//   운영 알림(토스트·배지·외부 알림 연동)을 텔레메트리에 붙이기 위한 지점.
//   구독자 예외는 흡수한다(알림 실패가 앱을 멈추지 않는다).
const listeners = new Set();

/** 이벤트 구독. 반환값을 호출하면 구독 해지. */
export function subscribe(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** 구독자 수(테스트·디버그용). */
export function listenerCount() { return listeners.size; }

function notify(entry) {
  for (const fn of Array.from(listeners)) {
    try { fn(entry); } catch { /* 구독자 예외 흡수 */ }
  }
}

// ─── 원격 전송(가드) ────────────────────────────────────────────────────────
// TELEMETRY_ENABLED && 엔드포인트가 있을 때만 전송. 실패는 조용히 무시(무한루프 방지).
function ship(entry) {
  if (!TELEMETRY_ENABLED || !TELEMETRY_ENDPOINT) return; // [승인 필요] 전까지 no-op
  try {
    const body = JSON.stringify(entry);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(TELEMETRY_ENDPOINT, body);
      return;
    }
    if (typeof fetch === 'function') {
      // keepalive 로 언로드 중에도 전송 시도. 응답은 무시.
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* 전송 실패는 삼킨다 */ }
}

function record(level, message, data) {
  const entry = {
    ts: new Date().toISOString(),
    level,                       // 'info' | 'warn' | 'error'
    // 기록 시점에 마스킹 — 링버퍼·콘솔·원격 전송 모두 동일하게 PII 제거된 값만 본다.
    message: scrubString(String(message || '')),
    route: currentRoute(),
    version: APP_VERSION,
    data: data ? scrub(data) : null,
  };
  pushRing(entry);
  if (isDev) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    try { fn('[이음:telemetry]', level, message, data || ''); } catch { /* noop */ }
  }
  ship(entry);
  notify(entry);
  return entry;
}

export function logInfo(message, data) { return record('info', message, data); }
export function logWarn(message, data) { return record('warn', message, data); }

/** 오류 기록. error 는 Error|string, context 는 추가 메타(PII 금지). */
export function captureError(error, context) {
  const e = serializeError(error);
  return record('error', e.message, { ...e, ...(context || {}) });
}

// ─── 전역 핸들러(중복 설치 방지) ────────────────────────────────────────────
let installed = false;

/** window 전역 오류·미처리 프라미스 거부를 텔레메트리로 연결. 앱 부팅 시 1회 호출. */
export function installGlobalHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (ev) => {
    captureError(ev.error || ev.message, { kind: 'window.onerror', source: ev.filename, line: ev.lineno, col: ev.colno });
  });
  window.addEventListener('unhandledrejection', (ev) => {
    captureError(ev.reason || 'unhandledrejection', { kind: 'unhandledrejection' });
  });
  logInfo('telemetry:init', { enabled: TELEMETRY_ENABLED, hasEndpoint: !!TELEMETRY_ENDPOINT, version: APP_VERSION });
}

export default {
  TELEMETRY_ENABLED,
  installGlobalHandlers,
  captureError,
  logInfo,
  logWarn,
  getRecentLogs,
  clearLogs,
  subscribe,
  scrub,
  scrubString,
};
