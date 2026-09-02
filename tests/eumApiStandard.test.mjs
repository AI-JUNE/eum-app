// tests/eumApiStandard.test.mjs — 연동 API 표준 에러 응답 통일 (공통 상용 필수)
import test from 'node:test';
import assert from 'node:assert/strict';
import { EUM_API, EUM_API_SAFE, callEumApi } from '../src/eum/eumApi.js';
import { ERROR_CODES, isErrorResponse } from '../src/eum/apiError.js';

test('EUM_API 원본은 그대로 유지된다(동작 불변)', () => {
  assert.equal(EUM_API.useMock, true);
  assert.equal(typeof EUM_API.v1365.issueCertificate, 'function');
  assert.equal(typeof EUM_API.notify.alimtalk, 'function');
});

test('EUM_API_SAFE: 원본의 모든 메서드 그룹을 빠짐없이 감싼다', () => {
  for (const [group, g] of Object.entries(EUM_API)) {
    if (!g || typeof g !== 'object') continue;
    assert.ok(EUM_API_SAFE[group], `${group} 누락`);
    for (const [method, fn] of Object.entries(g)) {
      if (typeof fn !== 'function') continue;
      assert.equal(typeof EUM_API_SAFE[group][method], 'function', `${group}.${method} 누락`);
    }
  }
});

test('EUM_API_SAFE: 성공도 표준 응답으로 감싼다', async () => {
  const res = await EUM_API_SAFE.notify.alimtalk();
  assert.equal(res.ok, true);
  assert.equal(res.data.ok, true);
  assert.match(String(res.requestId), /^req_/);
});

test('callEumApi: 없는 메서드는 NOT_FOUND 표준 실패', async () => {
  const res = await callEumApi('v1365', '없는메서드');
  assert.equal(isErrorResponse(res), true);
  assert.equal(res.error.code, ERROR_CODES.NOT_FOUND);
  assert.equal(res.error.status, 404);
  assert.ok(res.error.message.length > 0);
});

test('callEumApi: 없는 그룹도 예외 대신 표준 실패', async () => {
  const res = await callEumApi('없는그룹', 'x');
  assert.equal(res.ok, false);
  assert.equal(res.error.code, ERROR_CODES.NOT_FOUND);
});

test('callEumApi: 연동 메서드가 던진 예외를 표준 실패로 환산', async () => {
  const orig = EUM_API.welfare.recommend;
  EUM_API.welfare.recommend = async () => { throw new Error('API 502'); };
  try {
    const res = await callEumApi('welfare', 'recommend', {});
    assert.equal(res.ok, false);
    assert.equal(res.error.code, ERROR_CODES.UPSTREAM);
    assert.equal(res.error.status, 502);
    assert.ok(res.error.requestId);
  } finally {
    EUM_API.welfare.recommend = orig;
  }
});
