// ============================================================================
// validate.js — 입력 검증·정규화 표준 유틸 (공통 P0 · 입력검증)
//   목적: 폼마다 흩어진 trim() 검사 대신, 한 곳에서 길이 상한·제어문자 제거·
//         표준 결과 포맷을 강제한다. 순수 함수만 — React/DOM 의존 없음.
//
//   표준 결과 포맷(모든 검증 함수 공통):
//     { ok: true,  value: <정규화된 문자열> }
//     { ok: false, message: <사용자에게 보여줄 한국어 안내> }
//
//   원칙:
//     - additive: 기존 리듀서/SEED 로직 무변경. 폼 제출 직전에만 사용.
//     - 개인정보 최소화: 검증 실패 사유에 입력값을 되돌려 넣지 않는다.
//     - 제어문자(널·이스케이프 등)는 제거, 개행은 multiline 필드만 허용.
// ============================================================================

/** 필드별 길이 상한(자). 화면 안내와 CSV/감사 로그 안정성 기준. */
export const LIMITS = {
  disputeReason: 500,   // 정산 이의 사유 (참여자)
  resolutionMemo: 500,  // 이의 처리 메모 (코디네이터)
  noticeTitle: 80,      // 공지 제목
  noticeBody: 2000,     // 공지 본문
  generic: 1000,        // 기타 자유 텍스트 기본값
};

/**
 * 문자열 정규화: 제어문자 제거(개행·탭은 옵션), 연속 공백 유지, 양끝 trim.
 * @param {unknown} raw
 * @param {{ multiline?: boolean }} [opts]
 * @returns {string}
 */
export function sanitizeText(raw, opts = {}) {
  const s = String(raw == null ? '' : raw);
  // C0/C1 제어문자 제거. multiline이면 \n(\r은 \n으로 통일)과 \t 은 보존.
  const normalized = s.replace(/\r\n?/g, '\n');
  const kept = normalized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  const out = opts.multiline ? kept : kept.replace(/[\n\t]/g, ' ');
  return out.trim();
}

/**
 * 필수 텍스트 검증 — 표준 결과 포맷 반환.
 * @param {unknown} raw 입력 원문
 * @param {{ label?: string, max?: number, multiline?: boolean, requiredMessage?: string }} [opts]
 */
export function validateText(raw, opts = {}) {
  const label = opts.label || '내용';
  const max = Number.isFinite(opts.max) ? opts.max : LIMITS.generic;
  const value = sanitizeText(raw, { multiline: !!opts.multiline });
  if (!value) {
    return { ok: false, message: opts.requiredMessage || `${label}을(를) 입력해주세요.` };
  }
  if (value.length > max) {
    return { ok: false, message: `${label}은(는) ${max}자 이내로 입력해주세요. (현재 ${value.length}자)` };
  }
  return { ok: true, value };
}

/** 정산 이의 사유 (참여자·청년/어르신 공용) */
export function validateDisputeReason(raw) {
  return validateText(raw, {
    label: '이의 사유', max: LIMITS.disputeReason, multiline: true,
    requiredMessage: '어떤 점이 잘못되었는지 적어주세요.',
  });
}

/** 이의 처리 메모 (코디네이터) */
export function validateResolutionMemo(raw) {
  return validateText(raw, {
    label: '처리 메모', max: LIMITS.resolutionMemo, multiline: true,
    requiredMessage: '처리 메모를 입력해주세요.',
  });
}

/** 공지 제목·본문 (코디네이터) — 둘 다 유효할 때만 ok. */
export function validateNotice(rawTitle, rawBody) {
  const title = validateText(rawTitle, { label: '제목', max: LIMITS.noticeTitle });
  if (!title.ok) return title;
  const body = validateText(rawBody, { label: '내용', max: LIMITS.noticeBody, multiline: true });
  if (!body.ok) return body;
  return { ok: true, value: { title: title.value, body: body.value } };
}

/**
 * 공지 제목·본문 — 어느 필드가 잘못됐는지까지 알려주는 변형(additive).
 * validateNotice와 동일한 규칙을 쓰되, 실패 시 field('title'|'body')를 함께 반환해
 * 화면이 해당 입력란에 인라인 오류를 붙일 수 있게 한다. validateNotice는 그대로 유지.
 * @returns {{ok:true, value:{title:string,body:string}}|{ok:false, field:'title'|'body', message:string}}
 */
export function validateNoticeFields(rawTitle, rawBody) {
  const title = validateText(rawTitle, { label: '제목', max: LIMITS.noticeTitle });
  if (!title.ok) return { ok: false, field: 'title', message: title.message };
  const body = validateText(rawBody, { label: '내용', max: LIMITS.noticeBody, multiline: true });
  if (!body.ok) return { ok: false, field: 'body', message: body.message };
  return { ok: true, value: { title: title.value, body: body.value } };
}

/**
 * 간이 연타 방지(클라이언트 rate limit): 같은 key의 액션이 windowMs 안에
 * 다시 들어오면 차단. 모듈 메모리 한정 — 서버측 rate limit 대체가 아니다.
 * @param {string} key 액션 식별자 (예: 'dispute:se1')
 * @param {number} [windowMs=1500]
 * @returns {{ ok: boolean, message?: string }}
 */
const _lastAt = new Map();
export function throttleAction(key, windowMs = 1500) {
  const now = Date.now();
  const prev = _lastAt.get(key) || 0;
  if (now - prev < windowMs) {
    return { ok: false, message: '잠시 후 다시 시도해주세요.' };
  }
  _lastAt.set(key, now);
  return { ok: true };
}

/** 테스트 전용: 스로틀 기록 초기화 */
export function _resetThrottle() { _lastAt.clear(); }
