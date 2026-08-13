// ============================================================================
// securityHeaders.js — 정적 배포 보안 응답 헤더 (공통 P0-6 상용 하드닝)
// ----------------------------------------------------------------------------
// 이음은 Vite 정적 번들이라 서버 미들웨어가 없다 → 호스팅(Vercel) 응답 헤더로
// 적용한다. 이 모듈이 **단일 기준**이고 vercel.json 은 그 직렬화 결과다
// (tests/securityHeaders.test.mjs 가 둘의 일치를 고정 — 한쪽만 고쳐지는 표류 방지).
//
// 원칙: "켜도 화면이 깨지지 않고, 되돌리기 쉬운" 헤더만 넣는다.
//  - CSP 는 frame-ancestors 단독(클릭재킹 차단). script-src/style-src 는 Vite 번들·
//    인라인 스타일과 충돌해 흰 화면 위험 → Report-Only 부터 도입, [승인 필요].
//  - HSTS 는 includeSubDomains/preload 없이 max-age 180일(오설정 회복 가능한 값).
//    정적 호스팅은 환경 구분 헤더가 없어 전 배포에 동일 적용된다 — 커스텀 도메인
//    연결 전이면 *.vercel.app 은 어차피 HTTPS 전용이라 부작용 없음.
//  - Permissions-Policy 는 앱이 쓰지 않는 센서만 차단(카메라·마이크·위치).
//    ⚠ 향후 음성 상담·현장 체크인 GPS 를 실제로 붙이면 해당 지시어를 풀어야 한다.
//  - health.json 은 진단용이라 캐시 금지(no-store) — 옛 배포 정보 오독 방지.
// ============================================================================

/** 전 경로 공통 보안 헤더(키 → 값). */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=15552000',
};

/** /health.json 전용 추가 헤더(캐시 금지). */
export const HEALTH_HEADERS = { 'Cache-Control': 'no-store' };

/** Vercel `headers` 배열 형태로 직렬화. vercel.json 의 값과 정확히 같아야 한다. */
export function buildVercelHeaders() {
  const toList = (obj) => Object.entries(obj).map(([key, value]) => ({ key, value }));
  return [
    { source: '/(.*)', headers: toList(SECURITY_HEADERS) },
    { source: '/health.json', headers: toList(HEALTH_HEADERS) },
  ];
}

/** 값에 시크릿·오설정이 섞였는지 점검(빈 값·와일드카드 CSP·과격한 HSTS 금지). */
export function findHeaderIssues(headers = SECURITY_HEADERS) {
  const bad = [];
  for (const [k, v] of Object.entries(headers)) {
    if (!k || typeof v !== 'string' || v.trim() === '') bad.push(`${k}: 빈 값`);
    if (k === 'Content-Security-Policy' && /script-src|style-src|default-src/.test(v)) {
      bad.push('CSP: 리소스 지시어는 승인 전 도입 금지');
    }
    if (k === 'Strict-Transport-Security' && /preload|includeSubDomains/i.test(v)) {
      bad.push('HSTS: preload/includeSubDomains 는 되돌리기 어려움 — 승인 필요');
    }
  }
  return bad;
}
