// ============================================================================
// rateLimit.js — 요청 빈도 제한 (공통 상용 필수 · "rate limit 공개 API 적용")
//
//   왜: 외부 연동(1365·알림톡·AI 프록시)은 호출량이 곧 비용이고, 실수든 악의든
//       연타 한 번에 한도가 소진된다. 화면 단 debounce 로는 막을 수 없으므로
//       API 경계에서 버킷을 두고 초과 요청은 표준 RATE_LIMITED 로 돌려준다.
//
//   한계(명시): 이 모듈은 브라우저 메모리 안에서만 동작한다. 서버측 rate limit 을
//       대체하지 않는다. 다만 규칙(키·한도·창)을 여기 한 곳에 모아 두었으므로,
//       서버 BFF 가 생기면 같은 정의를 그대로 옮겨 쓸 수 있다.
//
//   원칙
//   - 순수·무의존: Date.now 주입 가능(테스트 결정적). React/DOM 의존 없음.
//   - additive: 기존 호출부를 바꾸지 않는다. 새 경계 래퍼에서만 적용.
//   - PII 미기록: 키에 이름·연락처를 넣지 않는다(작업명·역할·ID만).
// ============================================================================

import { ApiError, ERROR_CODES, errorResponse } from './apiError.js';

// ─── 정책 ───────────────────────────────────────────────────────────────────
/**
 * 작업별 한도. limit 회 / windowMs 밀리초.
 * 값 근거: 사람이 정상적으로 누를 수 있는 속도의 여유 상한. 비용이 드는 연동일수록 낮게.
 */
export const RATE_LIMITS = Object.freeze({
  'api.claude':            { limit: 10, windowMs: 60_000 },  // AI 호출(비용)
  'eumApi.notify':         { limit: 20, windowMs: 60_000 },  // 알림톡 발송(비용·스팸)
  'eumApi.v1365':          { limit: 30, windowMs: 60_000 },  // 봉사시간·인증서 연동
  'eumApi.sangsang':       { limit: 20, windowMs: 60_000 },  // 상품권 발행
  'eumApi.welfare':        { limit: 60, windowMs: 60_000 },  // 조회성
  'eumApi.happyeum':       { limit: 60, windowMs: 60_000 },  // 조회성
  default:                 { limit: 60, windowMs: 60_000 },
});

/** 작업명에서 정책을 찾는다. 'eumApi.notify.alimtalk' → 'eumApi.notify' → default. */
export function policyFor(op) {
  const name = String(op || '');
  if (RATE_LIMITS[name]) return RATE_LIMITS[name];
  const parts = name.split('.');
  while (parts.length > 1) {
    parts.pop();
    const key = parts.join('.');
    if (RATE_LIMITS[key]) return RATE_LIMITS[key];
  }
  return RATE_LIMITS.default;
}

// ─── 슬라이딩 윈도우 카운터 ─────────────────────────────────────────────────
/** @type {Map<string, number[]>} key → 최근 허용된 요청 시각들 */
const _hits = new Map();

/**
 * 한 번 소비를 시도한다. 상태를 바꾸는 함수다(허용 시 카운트 증가).
 * @param {string} key 제한 단위(보통 작업명, 필요하면 `${op}:${actorId}`)
 * @param {{limit?:number, windowMs?:number, now?:number}} [opts]
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number, limit: number, windowMs: number }}
 */
export function consume(key, opts = {}) {
  const p = policyFor(key);
  const limit = Number.isFinite(opts.limit) ? opts.limit : p.limit;
  const windowMs = Number.isFinite(opts.windowMs) ? opts.windowMs : p.windowMs;
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  const k = String(key || 'default');

  const cutoff = now - windowMs;
  const prev = (_hits.get(k) || []).filter(t => t > cutoff);

  if (prev.length >= limit) {
    _hits.set(k, prev);
    const oldest = prev[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
      limit, windowMs,
    };
  }
  prev.push(now);
  _hits.set(k, prev);
  return { allowed: true, remaining: Math.max(0, limit - prev.length), retryAfterMs: 0, limit, windowMs };
}

/** 소비 없이 현재 상태만 본다(버튼 비활성화 표시 등). */
export function peek(key, opts = {}) {
  const p = policyFor(key);
  const limit = Number.isFinite(opts.limit) ? opts.limit : p.limit;
  const windowMs = Number.isFinite(opts.windowMs) ? opts.windowMs : p.windowMs;
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  const prev = (_hits.get(String(key || 'default')) || []).filter(t => t > now - windowMs);
  if (prev.length >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, prev[0] + windowMs - now), limit, windowMs };
  }
  return { allowed: true, remaining: limit - prev.length, retryAfterMs: 0, limit, windowMs };
}

/** 초과 안내 문구 — 남은 시간을 사람 말로. */
export function retryMessage(retryAfterMs) {
  const sec = Math.ceil(Math.max(0, Number(retryAfterMs) || 0) / 1000);
  if (sec <= 0) return '요청이 많습니다. 잠시 후 다시 시도해주세요.';
  if (sec < 60) return `요청이 많습니다. ${sec}초 후 다시 시도해주세요.`;
  return `요청이 많습니다. ${Math.ceil(sec / 60)}분 후 다시 시도해주세요.`;
}

/** 초과를 표준 에러로. status 429 · code RATE_LIMITED · details.retryAfterMs */
export function rateLimitError(state) {
  return new ApiError(ERROR_CODES.RATE_LIMITED, {
    message: retryMessage(state && state.retryAfterMs),
    details: { retryAfterMs: Math.max(0, Math.round((state && state.retryAfterMs) || 0)) },
  });
}

/** 초과를 표준 실패 응답으로. */
export function rateLimitResponse(state, ctx) {
  return errorResponse(rateLimitError(state), ctx || {});
}

/**
 * callApi 의 validate 훅에 그대로 물릴 수 있는 게이트.
 * 통과하면 undefined, 초과면 표준 실패 응답을 돌려준다.
 * @example callApi(op, fn, { validate: () => gate(op) })
 */
export function gate(key, opts = {}) {
  const state = consume(key, opts);
  if (state.allowed) return undefined;
  return rateLimitResponse(state, opts.ctx);
}

/** 테스트·로그아웃 시 초기화. key 를 주면 해당 키만. */
export function resetRateLimit(key) {
  if (key === undefined) _hits.clear();
  else _hits.delete(String(key));
}

export default { RATE_LIMITS, policyFor, consume, peek, gate, retryMessage, rateLimitError, rateLimitResponse, resetRateLimit };
