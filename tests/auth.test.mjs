// 인증 스캐폴딩 순수 로직 테스트 — 플래그 OFF 안전성 · 세션 판정 · 헤더 조립
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUTH_ENABLED, isSessionValid, toSession, authHeaders, signIn } from '../src/eum/auth.js';

test('플래그 기본 OFF — 빌드 환경변수 없이는 비활성', () => {
  assert.equal(AUTH_ENABLED, false);
});

test('signIn 은 플래그 OFF 시 네트워크 없이 거부(no-op)', async () => {
  const r = await signIn('a@b.c', 'pw');
  assert.deepEqual(r, { ok: false, error: 'AUTH_DISABLED' });
});

test('isSessionValid — 만료·결손 판정', () => {
  const at = 1000000;
  assert.equal(isSessionValid(null, at), false);
  assert.equal(isSessionValid({}, at), false);
  assert.equal(isSessionValid({ access_token: 't', expires_at: at + 10 }, at), false); // 30초 여유 미달
  assert.equal(isSessionValid({ access_token: 't', expires_at: at + 31 }, at), true);
  assert.equal(isSessionValid({ access_token: '', expires_at: at + 999 }, at), false);
});

test('toSession — GoTrue 응답 정규화', () => {
  const at = 2000000;
  assert.equal(toSession(null, at), null);
  assert.equal(toSession({}, at), null);
  const s = toSession({ access_token: 'at', refresh_token: 'rt', expires_in: 100,
    user: { id: 'u1', email: 'e@x.y', app_metadata: { eum_role: 'coordinator' } } }, at);
  assert.equal(s.access_token, 'at');
  assert.equal(s.expires_at, at + 100);
  assert.equal(s.user.role, 'coordinator');
  const s2 = toSession({ access_token: 'at' }, at);
  assert.equal(s2.expires_at, at + 3600);
  assert.equal(s2.user, null);
});

test('authHeaders — 세션 없으면 anon, 유효 세션이면 사용자 토큰', () => {
  const anon = 'ANONKEY';
  assert.deepEqual(authHeaders(anon, null), { apikey: anon, Authorization: 'Bearer ' + anon });
  const live = { access_token: 'USER', expires_at: Math.floor(Date.now() / 1000) + 3600 };
  assert.deepEqual(authHeaders(anon, live), { apikey: anon, Authorization: 'Bearer USER' });
  const expired = { access_token: 'USER', expires_at: 1 };
  assert.deepEqual(authHeaders(anon, expired), { apikey: anon, Authorization: 'Bearer ' + anon });
});
