// ============================================================================
// reqlog.js — 구조화 로깅 (요청 ID · 소요시간 · 에러코드)
//   상용 필수 항목: 장애가 났을 때 "어느 요청이, 얼마나 걸려, 어떤 코드로" 실패했는지
//   한 줄로 추적할 수 있어야 한다. 사람이 읽는 문장 대신 필드가 고정된 레코드를 남긴다.
//
//   원칙
//   - PII 미기록: 여기서 만드는 필드에 사용자 입력·이름·연락처를 넣지 않는다.
//     추가 메타(meta)는 telemetry.scrub() 을 거쳐 저장되므로 실수로 섞여도 마스킹된다.
//   - 무해: 로깅 실패가 본 로직을 절대 깨뜨리지 않는다(모든 예외 흡수).
//   - 외부 의존 0. 원격 전송은 telemetry 의 승인 스위치를 그대로 따른다.
// ============================================================================

import { logInfo, logWarn, captureError } from './telemetry.js';

// ─── 요청 ID ────────────────────────────────────────────────────────────────
let seq = 0;

/**
 * 요청 식별자 생성. 형식: req_<시각36진수>_<시퀀스36진수><난수>
 * 개인 식별 정보를 포함하지 않는다(시각·카운터·난수만).
 */
export function newRequestId(now = Date.now()) {
  seq = (seq + 1) % 1e6;
  const rand = Math.random().toString(36).slice(2, 6);
  return `req_${Number(now).toString(36)}_${seq.toString(36)}${rand}`;
}

// ─── 에러코드 정규화 ────────────────────────────────────────────────────────
/**
 * 임의의 예외를 안정적인 짧은 코드로 환산한다.
 * 코드는 대시보드 집계 키로 쓰이므로 사람이 쓴 메시지에 의존하지 않는다.
 */
export function errorCode(err) {
  if (err == null) return 'UNKNOWN';
  if (typeof err === 'object') {
    if (typeof err.code === 'string' && err.code) return err.code.toUpperCase();
    if (Number.isFinite(err.status)) return `HTTP_${err.status}`;
  }
  const msg = String((err && err.message) || err || '');
  const http = msg.match(/\b(?:API|HTTP|status)\s*(\d{3})\b/i);
  if (http) return `HTTP_${http[1]}`;
  if (/abort/i.test(msg)) return 'ABORTED';
  if (/timeout|timed out/i.test(msg)) return 'TIMEOUT';
  if (/network|failed to fetch|networkerror/i.test(msg)) return 'NETWORK';
  const name = (err && err.name) || '';
  if (name === 'AbortError') return 'ABORTED';
  if (name === 'TypeError') return 'NETWORK';
  return 'UNKNOWN';
}

/** HTTP 상태코드 → 코드 문자열(응답 객체를 직접 다룰 때). */
export function statusCode(status) {
  return Number.isFinite(status) ? `HTTP_${status}` : 'UNKNOWN';
}

// ─── 요청 수명주기 ──────────────────────────────────────────────────────────
/**
 * 요청 시작. 반환된 핸들의 succeed/fail 을 호출하면 구조화 레코드가 남는다.
 * @param {string} op   작업 이름(예: 'api.claude', 'match.recommend')
 * @param {object} [meta] 부가 메타(PII 금지 · scrub 적용됨)
 * @param {object} [opts] { now } 테스트용 시각 주입
 */
export function startRequest(op, meta, opts) {
  const now = (opts && typeof opts.now === 'function') ? opts.now : Date.now;
  const reqId = newRequestId(now());
  const startedAt = now();
  const base = { reqId, op: String(op || 'unknown') };

  try { logInfo('req.start', { ...base, ...(meta || null) }); } catch { /* noop */ }

  const finish = (outcome, extra, err) => {
    let durationMs = 0;
    try { durationMs = Math.max(0, now() - startedAt); } catch { /* noop */ }
    const record = { ...base, outcome, durationMs, ...(extra || null) };
    try {
      if (outcome === 'error') {
        record.code = record.code || errorCode(err);
        captureError(err, record);
      } else if (outcome === 'warn') {
        logWarn('req.end', record);
      } else {
        logInfo('req.end', record);
      }
    } catch { /* 로깅 실패는 흡수 */ }
    return record;
  };

  return {
    reqId,
    /** 정상 종료. extra 로 status·건수 등 기술 메타만 넘긴다. */
    succeed: (extra) => finish('ok', extra),
    /** 부분 성공·재시도 등 경고 종료. */
    warn: (extra) => finish('warn', extra),
    /** 실패 종료. err 는 Error|string. */
    fail: (err, extra) => finish('error', extra, err),
  };
}

/**
 * 비동기 함수를 구조화 로깅으로 감싼다. 반환·예외 동작은 원본과 동일하다
 * (예외는 기록 후 그대로 다시 던진다 — 오류를 삼키지 않는다).
 * fn 은 요청 핸들을 인자로 받아 reqId 를 헤더 등에 실을 수 있다.
 */
export async function withRequestLog(op, fn, meta, opts) {
  const req = startRequest(op, meta, opts);
  try {
    const result = await fn(req);
    req.succeed({ status: 'fulfilled' });
    return result;
  } catch (err) {
    req.fail(err);
    throw err;
  }
}

export default { newRequestId, errorCode, statusCode, startRequest, withRequestLog };
