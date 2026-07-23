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
export const TELEMETRY_ENDPOINT = env.VITE_TELEMETRY_ENDPOINT || '';

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
    message: String(message || ''),
    route: currentRoute(),
    version: APP_VERSION,
    data: data || null,
  };
  pushRing(entry);
  if (isDev) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    try { fn('[이음:telemetry]', level, message, data || ''); } catch { /* noop */ }
  }
  ship(entry);
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
};
