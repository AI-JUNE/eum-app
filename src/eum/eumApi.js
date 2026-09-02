// ============================================================================
// EUM_API — 외부 연동 목업(useMock) — EumApp.jsx 단일파일 분해 3단계 (2026-08-03)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { aiWelfare } from './matching.js';

// ============================================================================
// 상용화 배치 (2026-06) — API 실연동 구조(인라인·목업) + 신뢰배지 + 접근성
//  실제 연동 스택은 src/api/* (zip 제공). 단일파일 배포를 위해 핵심만 인라인.
// ============================================================================
export const EUM_API = {
  useMock: true, // .env VITE_USE_MOCK=false 시 실연동(서버 BFF 경유)
  v1365:   { issueCertificate: async (id) => ({ certNo: '1365-' + String(Date.now()).slice(-8), url: 'https://www.1365.go.kr' }),
             accrue: async (id, h) => ({ ok: true, added: h }) },
  welfare: { recommend: async (pf) => (typeof aiWelfare === 'function' ? aiWelfare(pf) : []) },
  notify:  { alimtalk: async () => ({ ok: true, messageId: 'AT-' + Date.now() }) },
  happyeum:{ getTarget: async () => ({ found: true }) },
  sangsang:{ issueVoucher: async (id, amount) => ({ code: 'GSC-' + amount }) },
};

// ============================================================================
// 표준 에러 응답 래퍼(additive · 2026-09-02)
//   EUM_API 각 메서드는 연동처마다 다른 모양의 값을 돌려주고, 실패 시에는 예외를
//   던진다. 화면이 연동처별 예외 처리를 따로 갖는 것을 막기 위해, 같은 메서드를
//   표준 응답({ok:true,data} | {ok:false,error:{code,message,status,requestId}})
//   으로만 돌려주는 판을 추가한다. EUM_API 원본은 손대지 않는다(동작 불변).
//
//   사용 예:  const res = await callEumApi('welfare', 'recommend', profile);
//            if (!res.ok) return showToast(res.error.message);
// ============================================================================
import { callApi, ApiError, ERROR_CODES } from './apiError.js';
import { gate } from './rateLimit.js';

/**
 * EUM_API 메서드를 표준 응답으로 호출한다. 예외를 던지지 않는다.
 * @param {string} group  EUM_API 그룹명 (예: 'v1365', 'welfare')
 * @param {string} method 메서드명 (예: 'issueCertificate')
 * @param {...any} args   원본 메서드 인자 그대로
 */
export function callEumApi(group, method, ...args) {
  const op = `eumApi.${group}.${method}`;
  // rate limit: 연동 그룹별 한도(rateLimit.RATE_LIMITS)를 경계에서 강제한다.
  // 초과분은 연동처에 나가지 않고 표준 RATE_LIMITED(429) 로 되돌아온다.
  return callApi(op, async () => {
    const g = EUM_API[group];
    const fn = g && g[method];
    if (typeof fn !== 'function') {
      throw new ApiError(ERROR_CODES.NOT_FOUND, {
        message: '연동 기능을 찾을 수 없습니다. 관리자에게 문의해주세요.',
        details: { op },
      });
    }
    return await fn(...args);
  }, { validate: () => gate(op) });
}

/** EUM_API 와 같은 모양이되 모든 메서드가 표준 응답을 돌려주는 판. */
export const EUM_API_SAFE = Object.freeze(
  Object.fromEntries(
    Object.entries(EUM_API)
      .filter(([, g]) => g && typeof g === 'object')
      .map(([group, g]) => [
        group,
        Object.freeze(Object.fromEntries(
          Object.entries(g)
            .filter(([, fn]) => typeof fn === 'function')
            .map(([method]) => [method, (...args) => callEumApi(group, method, ...args)]),
        )),
      ]),
  ),
);
