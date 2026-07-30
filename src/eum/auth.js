// ============================================================================
// 인증 스캐폴딩 — Supabase GoTrue REST (외부 패키지 불필요)
//  상태: 코드 완성 · 활성화 플래그 OFF (VITE_EUM_AUTH_ENABLED=true 로 켬)
//  ⚠️ [승인 필요] 실인증 ON(플래그 켜기 + Supabase Auth 사용자 발급)은 사람 승인 후.
//     RLS 정책 정본: supabase/rls_policies.sql (아직 미적용 · 승인 필요)
//
//  설계:
//   - AUTH_ENABLED=false(기본)면 모든 함수가 안전한 no-op → 기존 데모 동작 100% 불변.
//   - 로그인 성공 시 access_token 을 메모리+localStorage 에 보관, storage.js 의
//     REST 호출 헤더를 authHeaders() 로 구성하면 RLS 적용 후에도 본인/스태프
//     데이터 접근이 그대로 동작한다(anon 은 차단).
// ============================================================================

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const SUPA_URL = env.VITE_SUPABASE_URL || '';
const SUPA_KEY = env.VITE_SUPABASE_ANON_KEY || '';

/** 활성화 플래그 — 기본 OFF. 켜는 것은 [승인 필요] */
export const AUTH_ENABLED = env.VITE_EUM_AUTH_ENABLED === 'true';

export const AUTH_STORAGE_KEY = 'eum:auth:session:v1';

let _session = null; // { access_token, refresh_token, expires_at(sec), user }

function now() { return Math.floor(Date.now() / 1000); }

/** 세션 유효성(만료 30초 여유) — 순수 판정, 테스트 대상 */
export function isSessionValid(s, at = now()) {
  return !!(s && s.access_token && s.expires_at && s.expires_at - 30 > at);
}

function persist(s) {
  _session = s;
  try {
    if (typeof localStorage === 'undefined') return;
    if (s) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch { /* storage 불가 환경 무시 */ }
}

/** 저장된 세션 복원(만료 시 null) */
export function getSession() {
  if (!AUTH_ENABLED) return null;
  if (isSessionValid(_session)) return _session;
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (isSessionValid(s)) { _session = s; return s; }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch { /* 파싱 실패 → 미로그인 취급 */ }
  return null;
}

/** GoTrue 응답 → 내부 세션 형태 (순수 변환, 테스트 대상) */
export function toSession(d, at = now()) {
  if (!d || !d.access_token) return null;
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token || null,
    expires_at: d.expires_at || (at + (d.expires_in || 3600)),
    user: d.user ? { id: d.user.id, email: d.user.email, role: (d.user.app_metadata || {}).eum_role || 'none' } : null,
  };
}

/** 이메일+비밀번호 로그인. 플래그 OFF면 항상 거부(no-op). */
export async function signIn(email, password) {
  if (!AUTH_ENABLED) return { ok: false, error: 'AUTH_DISABLED' };
  if (!SUPA_URL || !SUPA_KEY) return { ok: false, error: 'NO_SUPABASE' };
  const res = await fetch(SUPA_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPA_KEY },
    body: JSON.stringify({ email, password }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: d.error_description || d.msg || ('HTTP ' + res.status) };
  const s = toSession(d);
  persist(s);
  return { ok: true, session: s };
}

export async function signOut() {
  const s = getSession();
  persist(null);
  if (!AUTH_ENABLED || !s || !SUPA_URL) return { ok: true };
  try {
    await fetch(SUPA_URL + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + s.access_token },
    });
  } catch { /* 원격 로그아웃 실패해도 로컬 세션은 이미 제거됨 */ }
  return { ok: true };
}

/** refresh_token 으로 세션 갱신 */
export async function refreshSession() {
  if (!AUTH_ENABLED) return null;
  const s = _session || getSession();
  if (!s || !s.refresh_token || !SUPA_URL) return null;
  try {
    const res = await fetch(SUPA_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPA_KEY },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!res.ok) { persist(null); return null; }
    const next = toSession(await res.json());
    persist(next);
    return next;
  } catch { return null; }
}

/**
 * Supabase REST 호출용 헤더 (순수 조립, 테스트 대상)
 *  - 로그인 세션 있으면 사용자 토큰(Bearer) → RLS의 본인/스태프 정책 적용
 *  - 없으면 기존과 동일하게 anon key (플래그 OFF 데모 동작 불변)
 */
export function authHeaders(anonKey = SUPA_KEY, session = undefined) {
  const s = session === undefined ? (AUTH_ENABLED ? getSession() : null) : session;
  const token = isSessionValid(s) ? s.access_token : anonKey;
  return { apikey: anonKey, Authorization: 'Bearer ' + token };
}

/** 현재 사용자 역할('none'|'coordinator'|'admin'|...) — UI 게이트용 */
export function currentRole() {
  const s = getSession();
  return (s && s.user && s.user.role) || 'none';
}
