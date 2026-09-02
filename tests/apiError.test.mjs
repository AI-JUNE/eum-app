// tests/apiError.test.mjs — 표준 에러 응답 (공통 상용 필수)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ERROR_CODES, ApiError, validationError, normalizeError,
  successResponse, errorResponse, isErrorResponse, messageOf,
  codeFromStatus, httpStatusForCode, userMessageForCode,
  fromValidation, validateInput, callApi,
} from '../src/eum/apiError.js';
import { validateNoticeFields, validateDisputeReason } from '../src/eum/validate.js';

test('codeFromStatus: HTTP 상태 → 표준 코드', () => {
  assert.equal(codeFromStatus(400), ERROR_CODES.VALIDATION);
  assert.equal(codeFromStatus(422), ERROR_CODES.VALIDATION);
  assert.equal(codeFromStatus(401), ERROR_CODES.UNAUTHORIZED);
  assert.equal(codeFromStatus(403), ERROR_CODES.FORBIDDEN);
  assert.equal(codeFromStatus(404), ERROR_CODES.NOT_FOUND);
  assert.equal(codeFromStatus(409), ERROR_CODES.CONFLICT);
  assert.equal(codeFromStatus(429), ERROR_CODES.RATE_LIMITED);
  assert.equal(codeFromStatus(408), ERROR_CODES.TIMEOUT);
  assert.equal(codeFromStatus(503), ERROR_CODES.NETWORK);
  assert.equal(codeFromStatus(500), ERROR_CODES.UPSTREAM);
  assert.equal(codeFromStatus('nope'), ERROR_CODES.INTERNAL);
});

test('httpStatusForCode / userMessageForCode: 모르는 코드는 안전한 기본값', () => {
  assert.equal(httpStatusForCode(ERROR_CODES.NOT_FOUND), 404);
  assert.equal(httpStatusForCode('없는코드'), 500);
  assert.equal(userMessageForCode('없는코드'), userMessageForCode(ERROR_CODES.INTERNAL));
  // 모든 표준 코드는 한국어 안내 문구를 갖는다(빈 문구 금지)
  for (const code of Object.values(ERROR_CODES)) {
    assert.ok(userMessageForCode(code).length > 0, code);
    assert.ok(Number.isFinite(httpStatusForCode(code)), code);
  }
});

test('ApiError: 코드·상태·메시지 기본값', () => {
  const e = new ApiError(ERROR_CODES.FORBIDDEN);
  assert.equal(e.code, 'FORBIDDEN');
  assert.equal(e.status, 403);
  assert.equal(e.message, userMessageForCode('FORBIDDEN'));
  assert.ok(e instanceof Error);
  const r = e.toResponse();
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'FORBIDDEN');
});

test('normalizeError: 예외 종류가 달라도 같은 형태로 수렴', () => {
  const httpish = Object.assign(new Error('API 404'), {});
  assert.equal(normalizeError(httpish).code, ERROR_CODES.NOT_FOUND);
  assert.equal(normalizeError(httpish).status, 404);

  const timeout = new Error('request timed out');
  assert.equal(normalizeError(timeout).code, ERROR_CODES.TIMEOUT);

  const net = new Error('Failed to fetch');
  assert.equal(normalizeError(net).code, ERROR_CODES.NETWORK);

  const abort = Object.assign(new Error('x'), { name: 'AbortError' });
  assert.equal(normalizeError(abort).code, ERROR_CODES.ABORTED);

  assert.equal(normalizeError(null).code, ERROR_CODES.INTERNAL);
  assert.equal(normalizeError('그냥 문자열').code, ERROR_CODES.INTERNAL);
});

test('normalizeError: ApiError 는 그대로 유지하되 requestId 만 채운다', () => {
  const e = new ApiError(ERROR_CODES.CONFLICT, { message: '이미 승인된 활동입니다.' });
  const out = normalizeError(e, { requestId: 'req_x' });
  assert.equal(out, e);
  assert.equal(out.requestId, 'req_x');
  assert.equal(out.message, '이미 승인된 활동입니다.');
});

test('successResponse / errorResponse: 표준 필드 고정', () => {
  const ok = successResponse({ n: 1 }, { requestId: 'req_1' });
  assert.deepEqual(ok, { ok: true, data: { n: 1 }, requestId: 'req_1' });
  assert.deepEqual(successResponse(undefined), { ok: true, data: null, requestId: null });

  const bad = errorResponse(new ApiError(ERROR_CODES.RATE_LIMITED), { requestId: 'req_2' });
  assert.equal(bad.ok, false);
  assert.deepEqual(Object.keys(bad.error).sort(), ['code', 'message', 'requestId', 'status']);
  assert.equal(bad.error.status, 429);
  assert.equal(bad.error.requestId, 'req_2');
});

test('errorResponse: details 는 있을 때만 실린다', () => {
  const withDetails = errorResponse(validationError('제목을 입력해주세요.', { field: 'title' }));
  assert.deepEqual(withDetails.error.details, { field: 'title' });
  const without = errorResponse(new ApiError(ERROR_CODES.INTERNAL));
  assert.equal('details' in without.error, false);
});

test('isErrorResponse / messageOf', () => {
  assert.equal(isErrorResponse(errorResponse(new Error('API 500'))), true);
  assert.equal(isErrorResponse(successResponse(1)), false);
  assert.equal(isErrorResponse(null), false);
  assert.equal(isErrorResponse({ ok: false }), false);

  assert.equal(messageOf(errorResponse(validationError('사유를 적어주세요.'))), '사유를 적어주세요.');
  assert.equal(messageOf(successResponse(1)), '');
  assert.equal(messageOf(new Error('Failed to fetch')), userMessageForCode(ERROR_CODES.NETWORK));
});

test('fromValidation: validate.js 결과를 표준 응답으로 환산', () => {
  const good = fromValidation(validateDisputeReason('시간이 다르게 기록되었습니다'));
  assert.equal(good.ok, true);
  assert.equal(good.data, '시간이 다르게 기록되었습니다');

  const bad = fromValidation(validateNoticeFields('', '본문'));
  assert.equal(bad.ok, false);
  assert.equal(bad.error.code, ERROR_CODES.VALIDATION);
  assert.equal(bad.error.status, 400);
  assert.deepEqual(bad.error.details, { field: 'title' });
});

test('validateInput: 모두 통과하면 정규화값 묶음, 실패하면 첫 실패', () => {
  const ok = validateInput({
    reason: () => validateDisputeReason('  기록 시간이 다릅니다  '),
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.data.reason, '기록 시간이 다릅니다');

  const bad = validateInput({
    reason: () => validateDisputeReason('   '),
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.error.code, ERROR_CODES.VALIDATION);
  assert.equal(bad.error.details.field, 'reason');
  // 실패 사유에 입력 원문을 되돌려 넣지 않는다(PII 최소화)
  assert.equal(bad.error.message.includes('   '), false);
});

test('validateInput: 검증기가 던져도 표준 실패로 흡수', () => {
  const r = validateInput({ x: () => { throw new Error('boom'); } });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, ERROR_CODES.INTERNAL);
});

test('callApi: 성공을 표준 성공 응답으로 감싼다', async () => {
  const r = await callApi('test.ok', async () => 42);
  assert.equal(r.ok, true);
  assert.equal(r.data, 42);
  assert.match(String(r.requestId), /^req_/);
});

test('callApi: 예외를 던지지 않고 표준 실패로 돌려준다', async () => {
  const r = await callApi('test.fail', async () => { throw new Error('API 403'); });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, ERROR_CODES.FORBIDDEN);
  assert.match(String(r.error.requestId), /^req_/);
});

test('callApi: validate 실패 시 본 작업을 실행하지 않는다', async () => {
  let ran = false;
  const r = await callApi('test.validate', async () => { ran = true; return 1; }, {
    validate: () => validateInput({ reason: () => validateDisputeReason('') }),
  });
  assert.equal(ran, false);
  assert.equal(r.ok, false);
  assert.equal(r.error.code, ERROR_CODES.VALIDATION);
  assert.match(String(r.error.requestId), /^req_/);
});

test('callApi: 이미 표준 응답이면 이중 포장하지 않는다', async () => {
  const inner = successResponse('v', { requestId: 'req_inner' });
  const r = await callApi('test.passthrough', async () => inner);
  assert.equal(r, inner);

  const innerErr = errorResponse(new ApiError(ERROR_CODES.NOT_FOUND), { requestId: 'req_e' });
  const r2 = await callApi('test.passthrough2', async () => innerErr);
  assert.equal(r2, innerErr);
});

test('callApi: 서로 다른 실패 원인이 모두 같은 응답 형태로 통일된다', async () => {
  const cases = [
    async () => { throw new Error('API 429'); },
    async () => { throw Object.assign(new Error('x'), { name: 'AbortError' }); },
    async () => { throw 'plain string'; },
    async () => { throw validationError('제목을 입력해주세요.', { field: 'title' }); },
  ];
  for (const fn of cases) {
    const r = await callApi('test.shape', fn);
    assert.equal(r.ok, false);
    assert.equal(typeof r.error.code, 'string');
    assert.equal(typeof r.error.message, 'string');
    assert.equal(typeof r.error.status, 'number');
    assert.ok(r.error.requestId);
  }
});
