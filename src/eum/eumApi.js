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

