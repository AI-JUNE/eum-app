-- ============================================================================
-- 이음(EUM) · Supabase RLS/접근제어 정책 제안  (초안 · 2026-07-21)
--
-- ⚠️⚠️  사람 승인 필요 (HUMAN APPROVAL REQUIRED) — 자동 실행 금지  ⚠️⚠️
--   · 이 파일은 "제안"이며, 어떤 자동화도 이 SQL 을 운영 DB 에 실행하지 않았다.
--   · RLS 활성화·정책 변경은 되돌리기 어려운 보안 변경이므로, 운영자가
--     내용을 검토한 뒤 Supabase 콘솔(SQL Editor) 또는 마이그레이션으로 직접 적용한다.
--   · 반드시 스테이징 프로젝트에서 먼저 검증 후 운영에 적용할 것.
--
-- [배경]
--   src/eum/storage.js 의 dbList() 는 anon key 로 모든 테이블을 `select=*` 한다.
--   participants 에는 phone·address·emergency_contact(개인정보)가 있어,
--   RLS 가 꺼져 있으면 anon key 만으로 전 국민 열람이 가능하다(anon key 는 프런트에 노출됨).
--
-- [설계 요지]
--   1) 모든 공개 테이블 RLS 활성화 → 기본 전면 차단.
--   2) 코디네이터(로그인 사용자)만 실데이터 접근: Supabase Auth 로그인 + 정책으로 허용.
--   3) 익명(anon) 접근이 데모/랜딩에 필요하면, PII 를 뺀 "안전 뷰"에만 select 허용.
--   4) 쓰기(insert/update/delete)는 인증 사용자로 제한.
--   ※ 현재 프런트(storage.js)는 anon key 로 base 테이블을 직접 읽으므로,
--     아래 (A) 정책을 적용하면 익명 읽기가 막혀 앱이 시드/로컬 폴백으로 동작한다.
--     "익명 데모 열람"을 계속 허용하려면 (B) 안전 뷰 경로로 프런트를 함께 바꿔야 한다
--     (storage.js 변경은 별도 회차 · 빌드 검증 후).
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────
-- 0) 대상 테이블
--    participants, applications, verifications, matches, activities,
--    activity_logs, settlements, safety_incidents, surveys
-- ────────────────────────────────────────────────────────────────────────


-- ────────────────────────────────────────────────────────────────────────
-- (A) 권장안: 전면 RLS + 인증 사용자만 접근 (가장 안전 · 기본 채택 권장)
--     적용 시 anon 직접 읽기는 차단됨 → 프런트는 로그인 세션으로 읽어야 함.
-- ────────────────────────────────────────────────────────────────────────

-- 1. RLS 활성화 (기본 차단). FORCE 로 소유자 우회도 방지.
alter table public.participants       enable row level security;
alter table public.participants       force  row level security;
alter table public.applications       enable row level security;
alter table public.applications       force  row level security;
alter table public.verifications      enable row level security;
alter table public.verifications      force  row level security;
alter table public.matches            enable row level security;
alter table public.matches            force  row level security;
alter table public.activities         enable row level security;
alter table public.activities         force  row level security;
alter table public.activity_logs      enable row level security;
alter table public.activity_logs      force  row level security;
alter table public.settlements        enable row level security;
alter table public.settlements        force  row level security;
alter table public.safety_incidents   enable row level security;
alter table public.safety_incidents   force  row level security;
alter table public.surveys            enable row level security;
alter table public.surveys            force  row level security;

-- 2. anon(익명) 역할의 직접 접근 회수 — RLS 와 별개로 스키마 권한도 잠근다(이중 방어).
revoke all on all tables in schema public from anon;

-- 3. 인증 사용자(authenticated) 에게만 읽기·쓰기 허용 정책.
--    (초기 단계: 로그인한 코디네이터 = 운영 스태프만 로그인한다는 전제.
--     추후 참여자별 행 제한이 필요하면 using 절에 소유자 조건을 추가한다 — 아래 (C) 참고.)
do $$
declare t text;
begin
  foreach t in array array[
    'participants','applications','verifications','matches','activities',
    'activity_logs','settlements','safety_incidents','surveys'
  ] loop
    execute format($f$
      drop policy if exists %1$s_auth_select on public.%1$I;
      create policy %1$s_auth_select on public.%1$I
        for select to authenticated using (true);

      drop policy if exists %1$s_auth_write on public.%1$I;
      create policy %1$s_auth_write on public.%1$I
        for all to authenticated using (true) with check (true);
    $f$, t);
  end loop;
end $$;


-- ────────────────────────────────────────────────────────────────────────
-- (B) 선택안: 익명 데모 열람을 유지해야 할 때 — "PII 제외 안전 뷰"만 공개
--     base 테이블은 (A)로 잠근 상태에서, PII 를 뺀 뷰에만 anon select 허용.
--     ※ 이 뷰를 쓰려면 프런트(storage.js)가 /rest/v1/participants 대신
--       /rest/v1/participants_public 를 읽도록 함께 변경해야 한다(별도 회차).
-- ────────────────────────────────────────────────────────────────────────

create or replace view public.participants_public as
  select
    id, name, type, age, occupation, skills, interests, availability,
    status, avatar_color, joined_at, bio, child_id, parent_id
    -- 제외(PII): phone, address, emergency_contact
  from public.participants;

-- 뷰는 security_invoker 로 두어 호출자 권한/RLS 를 따르게 한다(Postgres 15+/Supabase 지원).
alter view public.participants_public set (security_invoker = on);

-- 익명에게는 안전 뷰의 select 만 부여.
grant select on public.participants_public to anon;

-- 안전 뷰가 base 테이블 RLS 를 우회하지 않도록, anon 이 읽을 수 있는
-- 최소 정책을 base 에 별도로 주는 대신, 뷰 전용 노출을 원하면
-- security_invoker=off + 뷰 소유자 권한으로 노출하는 방법도 있으나
-- PII 유출 위험이 커지므로 권장하지 않는다(반드시 컬럼 화이트리스트 뷰만 공개).


-- ────────────────────────────────────────────────────────────────────────
-- (C) 향후 강화: 참여자 본인/보호자 행 단위 접근 (Supabase Auth 도입 후)
--     participants.auth_uid(uuid) 컬럼을 두고 auth.uid() 와 매칭하는 예시.
--     (스키마 변경 포함 → 별도 설계·마이그레이션 회차)
-- ────────────────────────────────────────────────────────────────────────
-- alter table public.participants add column auth_uid uuid references auth.users(id);
-- create policy participants_self_select on public.participants
--   for select to authenticated using (auth_uid = auth.uid());
-- (코디네이터 전체 열람은 app_metadata.role='coordinator' 를 검사하는 별도 정책으로 부여)


-- ────────────────────────────────────────────────────────────────────────
-- [검증 쿼리] 적용 후 RLS 상태·정책 확인
-- ────────────────────────────────────────────────────────────────────────
-- select relname, relrowsecurity, relforcerowsecurity
--   from pg_class where relnamespace = 'public'::regnamespace and relkind='r';
-- select schemaname, tablename, policyname, roles, cmd
--   from pg_policies where schemaname='public' order by tablename, policyname;
--
-- [롤백 참고] 문제가 생기면 개별 테이블에 대해:
--   alter table public.<t> disable row level security;
--   drop policy if exists <t>_auth_select on public.<t>;
--   drop policy if exists <t>_auth_write  on public.<t>;
