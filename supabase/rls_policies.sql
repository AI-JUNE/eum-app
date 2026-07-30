-- ============================================================================
-- 이음(EUM) Supabase RLS 정책 — 코드 정본 (활성화는 사람 승인 후 콘솔/CLI에서)
-- 작성: 2026-07-31 (자동화 배치) · 상태: [승인 필요] 아직 적용하지 말 것
--
-- 배경: 현재 프런트는 anon key 로 전 테이블 select=* (src/eum/storage.js).
--   participants 에 전화번호·주소·비상연락처(개인정보)가 포함되므로,
--   실데이터 수집 전 반드시 RLS 활성화 + anon 차단이 필요하다.
--
-- 적용 방법(사람이 실행):
--   Supabase Dashboard > SQL Editor 에 이 파일 전체를 붙여 실행.
--   또는 supabase CLI: supabase db execute --file supabase/rls_policies.sql
--
-- 설계 원칙:
--   1) 모든 테이블 RLS ENABLE (기본 전면 차단).
--   2) anon(비로그인): 어떤 테이블도 접근 불가. (현 데모는 시드 폴백으로 동작하므로
--      화면이 깨지지 않는다 — storage.js 가 Supabase 실패 시 localStorage/시드 폴백)
--   3) authenticated(로그인): 자기 자신 관련 행만 읽기.
--   4) 코디네이터/관리자(JWT app_metadata.eum_role in ('coordinator','admin')): 전체 읽기/쓰기.
--   5) 쓰기는 원칙적으로 서비스롤(서버)·코디네이터만. 프런트 직접 쓰기는 도입하지 않음.
-- ============================================================================

-- 역할 판정 헬퍼 (JWT app_metadata.eum_role)
create or replace function public.eum_role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb
      -> 'app_metadata' ->> 'eum_role',
    'none'
  );
$$;

create or replace function public.eum_is_staff() returns boolean
language sql stable as $$
  select public.eum_role() in ('coordinator', 'admin');
$$;

-- ── 1) RLS 활성화 (전 테이블) ───────────────────────────────────────────────
alter table if exists public.participants     enable row level security;
alter table if exists public.applications     enable row level security;
alter table if exists public.verifications    enable row level security;
alter table if exists public.matches          enable row level security;
alter table if exists public.activities       enable row level security;
alter table if exists public.activity_logs    enable row level security;
alter table if exists public.settlements      enable row level security;
alter table if exists public.safety_incidents enable row level security;
alter table if exists public.surveys          enable row level security;

-- ── 2) 기존 관대한 정책 제거(있다면) ────────────────────────────────────────
do $$
declare t text; p record;
begin
  foreach t in array array['participants','applications','verifications','matches',
    'activities','activity_logs','settlements','safety_incidents','surveys'] loop
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end $$;

-- ── 3) 스태프(코디네이터·관리자) 전체 접근 ─────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['participants','applications','verifications','matches',
    'activities','activity_logs','settlements','safety_incidents','surveys'] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.eum_is_staff()) with check (public.eum_is_staff())',
      'eum_staff_all_' || t, t);
  end loop;
end $$;

-- ── 4) 본인 데이터 읽기 (participants.auth_user_id = auth.uid()) ───────────
--  ⚠️ participants 에 auth_user_id uuid 컬럼이 필요하다(아래 5 참조).
create policy eum_self_read_participants on public.participants
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy eum_self_read_applications on public.applications
  for select to authenticated
  using (participant_id in (select id from public.participants where auth_user_id = auth.uid()));

create policy eum_self_read_activity_logs on public.activity_logs
  for select to authenticated
  using (participant_id in (select id from public.participants where auth_user_id = auth.uid()));

create policy eum_self_read_settlements on public.settlements
  for select to authenticated
  using (participant_id in (select id from public.participants where auth_user_id = auth.uid()));

-- ── 5) 스키마 보강 (멱등) ───────────────────────────────────────────────────
alter table if exists public.participants
  add column if not exists auth_user_id uuid;
create index if not exists participants_auth_user_id_idx
  on public.participants (auth_user_id);

-- ── 6) anon 권한 회수 (RLS 무정책 = 차단이지만 이중 안전장치) ───────────────
revoke all on all tables in schema public from anon;

-- ============================================================================
-- 적용 후 확인 쿼리:
--   select tablename, rowsecurity from pg_tables where schemaname='public';
--   select * from pg_policies where schemaname='public';
-- 롤백(비상): alter table public.<t> disable row level security; (권장하지 않음)
-- ============================================================================
