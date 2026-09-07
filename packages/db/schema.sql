-- 이음 2R MVP 데이터 모델 — 가이드 §4 (12개 테이블) + RLS
-- Supabase(Postgres) 기준. 멱등 실행 가능.

create extension if not exists pgcrypto;

-- ── 조직·계정 ─────────────────────────────────────────────
create table if not exists orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('복지관','자원봉사센터','행정복지센터')),
  region_code text,
  created_at  timestamptz not null default now()
);

create table if not exists users (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid references orgs(id),
  role       text not null check (role in ('admin','staff','participant','senior','guardian')),
  name       text not null,
  phone_enc  text,                         -- 암호화 저장(§7-2). 평문 저장 금지
  email      text,
  is_demo    boolean not null default false,  -- §6-4 시드 구분. 통계 제외 가능
  created_at timestamptz not null default now()
);

create table if not exists consents (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references users(id) on delete cascade,
  kind      text not null check (kind in ('privacy','activity_pledge','location','photo')),
  agreed_at timestamptz not null default now(),
  version   text not null
);

-- ── 프로필 ────────────────────────────────────────────────
create table if not exists participants (
  user_id      uuid primary key references users(id) on delete cascade,
  days         text[] not null default '{}',
  time_slots   text[] not null default '{}',
  interests    text[] not null default '{}',
  dongs        text[] not null default '{}',
  transport    text,
  bio          text,
  verified_at  timestamptz,               -- null 이면 매칭 하드 필터로 제외(§5)
  report_count int  not null default 0
);

create table if not exists seniors (
  user_id         uuid primary key references users(id) on delete cascade,
  dong            text not null,
  needs           text[] not null default '{}',
  preferred_days  text[] not null default '{}',
  preferred_slots text[] not null default '{}',
  risk_flags      text[] not null default '{}',
  registered_by   uuid references users(id)    -- 대리 접수자(§ 어르신-001)
);

-- ── 매칭 ──────────────────────────────────────────────────
create table if not exists match_requests (
  id         uuid primary key default gen_random_uuid(),
  senior_id  uuid not null references seniors(user_id),
  org_id     uuid not null references orgs(id),
  status     text not null default 'open' check (status in ('open','matched','closed')),
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists match_candidates (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references match_requests(id) on delete cascade,
  participant_id  uuid not null references participants(user_id),
  score_total     numeric(5,3) not null,
  score_json      jsonb not null,            -- {proximity,schedule,interest,safety,complement} 설명 가능성의 실체
  reason_text     text not null,
  rank            int  not null,
  weights_version text not null,
  input_snapshot  jsonb,
  generated_at    timestamptz not null default now()
);

create table if not exists matches (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references match_requests(id),
  participant_id uuid not null references participants(user_id),
  decided_by     uuid references users(id),
  decision       text not null check (decision in ('ai_accept','manual_assign')),
  manual_reason  text,                       -- manual_assign 이면 필수(앱 레벨 검증)
  decided_at     timestamptz not null default now(),
  notified_at    timestamptz
);

-- ── 활동·인증 ─────────────────────────────────────────────
create table if not exists activities (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches(id),
  planned_at  timestamptz not null,
  started_at  timestamptz,
  ended_at    timestamptz,
  lat         double precision,
  lng         double precision,
  distance_m  int,
  status      text not null default 'planned' check (status in ('planned','done','missed','flagged'))
);

create table if not exists activity_photos (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references activities(id) on delete cascade,
  storage_path text not null,
  taken_at     timestamptz,
  retain_until date not null                 -- 보관기간 컬럼(§7-2 규제 대응)
);

-- ── 안부·확인 ─────────────────────────────────────────────
create table if not exists wellbeing_calls (
  id                 uuid primary key default gen_random_uuid(),
  senior_id          uuid not null references seniors(user_id),
  channel            text not null check (channel in ('callbot','manual')),
  called_at          timestamptz not null default now(),
  answered           boolean,
  mood_score         int check (mood_score between 1 and 5),
  risk_level         text check (risk_level in ('low','mid','high')),
  transcript_summary text,
  raw_ref            text
);

create table if not exists follow_ups (
  id          uuid primary key default gen_random_uuid(),
  senior_id   uuid not null references seniors(user_id),
  trigger     text not null check (trigger in ('missed_activity','no_checkin','call_unanswered_2x','risk_high')),
  assigned_to uuid references users(id),
  action      text,
  result      text,
  created_at  timestamptz not null default now(),
  closed_at   timestamptz
);

-- ── 감사 ──────────────────────────────────────────────────
create table if not exists audit_logs (
  id           bigserial primary key,
  actor_id     uuid,
  action       text not null,
  target_table text not null,
  target_id    text,
  before_json  jsonb,
  after_json   jsonb,
  at           timestamptz not null default now()
);

-- ── 인덱스 ────────────────────────────────────────────────
create index if not exists idx_users_org on users(org_id);
create index if not exists idx_mreq_org on match_requests(org_id, status);
create index if not exists idx_mcand_req on match_candidates(request_id, rank);
create index if not exists idx_act_match on activities(match_id, status);
create index if not exists idx_wb_senior on wellbeing_calls(senior_id, called_at desc);
create index if not exists idx_fu_open on follow_ups(senior_id) where closed_at is null;
create index if not exists idx_audit_at on audit_logs(at desc);

-- ── RLS (§4 "이 세 줄이 개인정보 격리 답변") ───────────────
-- 헬퍼: 현재 사용자의 org_id / role
create or replace function current_org_id() returns uuid language sql stable as
  $$ select org_id from users where id = auth.uid() $$;
create or replace function current_role_name() returns text language sql stable as
  $$ select role from users where id = auth.uid() $$;

alter table users            enable row level security;
alter table participants     enable row level security;
alter table seniors          enable row level security;
alter table match_requests   enable row level security;
alter table match_candidates enable row level security;
alter table matches          enable row level security;
alter table activities       enable row level security;
alter table activity_photos  enable row level security;
alter table wellbeing_calls  enable row level security;
alter table follow_ups       enable row level security;
alter table audit_logs       enable row level security;

-- 1) 같은 org 만 읽기 (담당자·관리자)
drop policy if exists org_read_users on users;
create policy org_read_users on users for select
  using (org_id = current_org_id() or id = auth.uid());

drop policy if exists org_read_requests on match_requests;
create policy org_read_requests on match_requests for all
  using (org_id = current_org_id());

-- 2) 참여자는 자기 행만
drop policy if exists self_participant on participants;
create policy self_participant on participants for all
  using (user_id = auth.uid() or current_role_name() in ('admin','staff'));

-- 3) 어르신 데이터는 담당자·관리자만 (참여자는 매칭된 건의 최소 정보만 앱 레벨에서 제공)
drop policy if exists staff_seniors on seniors;
create policy staff_seniors on seniors for all
  using (current_role_name() in ('admin','staff'));

drop policy if exists staff_wellbeing on wellbeing_calls;
create policy staff_wellbeing on wellbeing_calls for all
  using (current_role_name() in ('admin','staff'));

drop policy if exists staff_followups on follow_ups;
create policy staff_followups on follow_ups for all
  using (current_role_name() in ('admin','staff'));

-- 감사로그: 관리자 조회만, 삽입은 서비스 롤
drop policy if exists admin_audit_read on audit_logs;
create policy admin_audit_read on audit_logs for select
  using (current_role_name() = 'admin');
