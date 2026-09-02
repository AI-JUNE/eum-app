// ============================================================================
// apiError.js — 표준 에러 응답 (공통 상용 필수 · "표준 에러 응답 전 API 통일")
//
//   문제: 지금까지 API·연동 호출마다 실패 형태가 제각각이었다. 어떤 곳은 예외를
//         던지고, 어떤 곳은 { ok:false }, 어떤 곳은 문자열을 돌려준다. 그래서
//         화면은 "무슨 일이 났는지" 를 매번 다르게 해석해야 했다.
//   해결: 모든 API 경계에서 아래 한 가지 형태만 쓴다.
//
//     성공: { ok: true,  data: <값>, requestId: 'req_...' }
//     실패: { ok: false, error: { code, message, status, requestId, details? } }
//
//   원칙
//   - code 는 집계 키(영문 대문자 상수). message 는 사용자에게 보여줄 한국어 문장.
//   - PII 미기록: message·details 에 입력 원문·이름·연락처를 넣지 않는다.
//   - additive: 기존 함수 시그니처·리듀서·SEED 를 바꾸지 않는다. 새 경계에서만 쓴다.
//   - 무해: 이 모듈 자체가 예외를 던져 본 로직을 깨뜨리지 않는다(내부 예외 흡수).
// ============================================================================

import { errorCode as normalizeCode, newRequestId } from './reqlog.js';

// ─── 표준 에러 코드 ─────────────────────────────────────────────────────────
/** 서비스 전역에서 쓰는 에러 코드. 새 코드는 여기에만 추가한다. */
export const ERROR_CODES = Object.freeze({
  VALIDATION: 'VALIDATION',       // 입력값이 규칙에 맞지 않음
  UNAUTHORIZED: 'UNAUTHORIZED',   // 로그인 필요
  FORBIDDEN: 'FORBIDDEN',         // 권한 없음
  NOT_FOUND: 'NOT_FOUND',         // 대상 없음
  CONFLICT: 'CONFLICT',           // 상태 충돌(중복 처리 등)
  RATE_LIMITED: 'RATE_LIMITED',   // 너무 잦은 요청
  TIMEOUT: 'TIMEOUT',             // 시간 초과
  NETWORK: 'NETWORK',             // 네트워크 단절
  ABORTED: 'ABORTED',             // 사용자가 취소
  UPSTREAM: 'UPSTREAM',           // 외부 시스템 오류
  INTERNAL: 'INTERNAL',           // 그 밖의 서버·내부 오류
});

const STATUS_BY_CODE = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  NETWORK: 503,
  ABORTED: 499,
  UPSTREAM: 502,
  INTERNAL: 500,
};

const MESSAGE_BY_CODE = {
  VALIDATION: '입력하신 내용을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해주세요.',
  FORBIDDEN: '이 작업을 할 수 있는 권한이 없습니다.',
  NOT_FOUND: '요청하신 내용을 찾을 수 없습니다.',
  CONFLICT: '이미 처리된 내용입니다. 화면을 새로고침해주세요.',
  RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT: '응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  ABORTED: '요청이 취소되었습니다.',
  UPSTREAM: '연동 시스템에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  INTERNAL: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

/** HTTP 상태코드 → 표준 코드. */
export function codeFromStatus(status) {
  const n = Number(status);
  if (!Number.isFinite(n)) return ERROR_CODES.INTERNAL;
  if (n === 400 || n === 422) return ERROR_CODES.VALIDATION;
  if (n === 401) return ERROR_CODES.UNAUTHORIZED;
  if (n === 403) return ERROR_CODES.FORBIDDEN;
  if (n === 404 || n === 410) return ERROR_CODES.NOT_FOUND;
  if (n === 409) return ERROR_CODES.CONFLICT;
  if (n === 429) return ERROR_CODES.RATE_LIMITED;
  if (n === 499) return ERROR_CODES.ABORTED;
  if (n === 504 || n === 408) return ERROR_CODES.TIMEOUT;
  if (n === 503) return ERROR_CODES.NETWORK;
  if (n >= 500) return ERROR_CODES.UPSTREAM;
  if (n >= 400) return ERROR_CODES.VALIDATION;
  return ERROR_CODES.INTERNAL;
}

/** 표준 코드 → HTTP 상태코드. 모르는 코드는 500. */
export function httpStatusForCode(code) {
  return STATUS_BY_CODE[String(code || '').toUpperCase()] || 500;
}

/** 표준 코드 → 사용자 안내 문구(한국어). 모르는 코드는 INTERNAL 문구. */
export function userMessageForCode(code) {
  return MESSAGE_BY_CODE[String(code || '').toUpperCase()] || MESSAGE_BY_CODE.INTERNAL;
}

// ─── ApiError ───────────────────────────────────────────────────────────────
/**
 * 표준 에러 객체. 어디서 던져도 같은 필드를 갖는다.
 * message 는 그대로 사용자에게 보여줄 수 있는 문장이어야 한다.
 */
export class ApiError extends Error {
  constructor(code, opts = {}) {
    const safeCode = String(code || ERROR_CODES.INTERNAL).toUpperCase();
    super(opts.message || userMessageForCode(safeCode));
    this.name = 'ApiError';
    this.code = safeCode;
    this.status = Number.isFinite(opts.status) ? opts.status : httpStatusForCode(safeCode);
    this.requestId = opts.requestId || null;
    this.details = opts.details == null ? null : opts.details;
    if (opts.cause !== undefined) this.cause = opts.cause;
  }
  /** 표준 실패 응답으로 환산. */
  toResponse() { return errorResponse(this); }
}

/** 입력검증 실패를 만드는 지름길. field 를 주면 화면이 해당 입력란에 붙일 수 있다. */
export function validationError(message, details) {
  return new ApiError(ERROR_CODES.VALIDATION, {
    message: message || userMessageForCode(ERROR_CODES.VALIDATION),
    details: details == null ? null : details,
  });
}

/**
 * 임의의 예외·거절값을 ApiError 로 정규화한다.
 * reqlog.errorCode 의 분류(HTTP_xxx·TIMEOUT·NETWORK·ABORTED)를 그대로 물려받아
 * 로그 집계 키와 화면 표시가 어긋나지 않게 한다.
 */
export function normalizeError(err, ctx = {}) {
  if (err instanceof ApiError) {
    if (!err.requestId && ctx.requestId) err.requestId = ctx.requestId;
    return err;
  }
  let raw = 'UNKNOWN';
  try { raw = normalizeCode(err); } catch { /* noop */ }
  let code;
  const http = /^HTTP_(\d{3})$/.exec(raw);
  if (http) code = codeFromStatus(Number(http[1]));
  else if (Object.prototype.hasOwnProperty.call(ERROR_CODES, raw)) code = raw;
  else code = ERROR_CODES.INTERNAL;

  const status = http ? Number(http[1]) : httpStatusForCode(code);
  return new ApiError(code, {
    message: ctx.message || userMessageForCode(code),
    status,
    requestId: ctx.requestId || (err && err.requestId) || null,
    details: ctx.details == null ? null : ctx.details,
    cause: err,
  });
}

// ─── 표준 응답 ──────────────────────────────────────────────────────────────
/** 성공 응답. requestId 는 없으면 생성하지 않고 null 로 둔다(호출부 자유). */
export function successResponse(data, ctx = {}) {
  return { ok: true, data: data === undefined ? null : data, requestId: ctx.requestId || null };
}

/** 실패 응답. 어떤 입력을 넣어도 같은 형태를 돌려준다. */
export function errorResponse(err, ctx = {}) {
  const e = normalizeError(err, ctx);
  const error = {
    code: e.code,
    message: e.message,
    status: e.status,
    requestId: e.requestId || ctx.requestId || null,
  };
  if (e.details != null) error.details = e.details;
  return { ok: false, error };
}

/** 표준 실패 응답인지 판별(화면 분기용). */
export function isErrorResponse(x) {
  return !!(x && typeof x === 'object' && x.ok === false && x.error && typeof x.error.code === 'string');
}

/** 실패 응답·예외 무엇이 와도 사용자에게 보여줄 문장 한 줄을 뽑는다. */
export function messageOf(x) {
  if (isErrorResponse(x)) return x.error.message || userMessageForCode(x.error.code);
  if (x && typeof x === 'object' && x.ok === true) return '';
  try { return normalizeError(x).message; } catch { return userMessageForCode(ERROR_CODES.INTERNAL); }
}

// ─── 입력검증 → 표준 실패 ───────────────────────────────────────────────────
/**
 * validate.js 계열의 { ok, value } | { ok:false, message, field? } 결과를
 * 표준 응답으로 환산한다. 검증 규칙 자체는 validate.js 에 그대로 둔다(중복 정의 금지).
 */
export function fromValidation(result, ctx = {}) {
  if (result && result.ok === true) return successResponse(result.value, ctx);
  const details = result && result.field ? { field: result.field } : null;
  return errorResponse(
    new ApiError(ERROR_CODES.VALIDATION, {
      message: (result && result.message) || userMessageForCode(ERROR_CODES.VALIDATION),
      details,
    }),
    ctx,
  );
}

/**
 * 여러 검증기를 한 번에 돌린다. 모두 통과하면 { ok:true, data:{필드명:정규화값} },
 * 하나라도 실패하면 첫 실패를 VALIDATION 표준 실패로 돌려준다.
 * @param {Record<string, () => {ok:boolean,value?:any,message?:string}>} checks
 */
export function validateInput(checks, ctx = {}) {
  const data = {};
  const entries = Object.entries(checks || {});
  for (const [field, check] of entries) {
    let r;
    try { r = typeof check === 'function' ? check() : check; }
    catch (e) { return errorResponse(normalizeError(e, ctx), ctx); }
    if (!r || r.ok !== true) {
      return errorResponse(
        new ApiError(ERROR_CODES.VALIDATION, {
          message: (r && r.message) || userMessageForCode(ERROR_CODES.VALIDATION),
          details: { field: (r && r.field) || field },
        }),
        ctx,
      );
    }
    data[field] = r.value;
  }
  return successResponse(data, ctx);
}

// ─── 경계 래퍼 ──────────────────────────────────────────────────────────────
/**
 * API 경계 래퍼: 어떤 비동기 함수를 감싸도 표준 응답만 나온다(예외를 던지지 않는다).
 * 호출부는 `if (!res.ok) show(res.error.message)` 한 가지 분기만 쓰면 된다.
 *
 * @param {string} op 작업 이름(로그 집계 키)
 * @param {(ctx:{requestId:string}) => Promise<any>} fn 실제 작업
 * @param {{ requestId?: string, validate?: () => object }} [opts]
 *        validate 는 validateInput 결과(표준 응답)를 돌려주는 함수. 실패 시 즉시 반환.
 */
export async function callApi(op, fn, opts = {}) {
  let requestId = opts.requestId;
  if (!requestId) { try { requestId = newRequestId(); } catch { requestId = null; } }
  const ctx = { requestId, op: String(op || 'unknown') };
  if (typeof opts.validate === 'function') {
    let v;
    try { v = opts.validate(); } catch (e) { return errorResponse(e, ctx); }
    if (isErrorResponse(v)) return { ok: false, error: { ...v.error, requestId: v.error.requestId || requestId } };
  }
  try {
    const data = await fn(ctx);
    if (isErrorResponse(data)) return data;
    if (data && typeof data === 'object' && data.ok === true && 'data' in data) return data;
    return successResponse(data, ctx);
  } catch (e) {
    return errorResponse(e, ctx);
  }
}

export default {
  ERROR_CODES, ApiError, validationError, normalizeError,
  successResponse, errorResponse, isErrorResponse, messageOf,
  codeFromStatus, httpStatusForCode, userMessageForCode,
  fromValidation, validateInput, callApi,
};
