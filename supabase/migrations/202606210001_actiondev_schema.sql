create extension if not exists pgcrypto;

create type public.course_status as enum ('draft', 'published', 'retired');
create type public.progress_status as enum ('not_started', 'in_progress', 'awaiting_project_evidence', 'completed', 'review_required');
create type public.milestone_status as enum ('locked', 'available', 'in_progress', 'ready_for_review', 'completed_self_verified');

create schema if not exists content_private;
revoke all on schema content_private from public, anon, authenticated;

create table public.course_versions (
  id uuid primary key,
  version text not null unique,
  status public.course_status not null default 'draft',
  title text not null,
  manifest_sha256 text not null,
  release_notes text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.course_modules (
  id uuid primary key,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  slug text not null,
  title text not null,
  stage_slug text not null,
  position integer not null check (position >= 0),
  is_required boolean not null default true,
  source_lesson_codes text[] not null default '{}',
  unique (course_version_id, slug),
  unique (course_version_id, position)
);

create table public.lessons (
  id uuid primary key,
  slug text not null unique,
  canonical_title text not null,
  created_at timestamptz not null default now()
);

create table public.lesson_versions (
  id uuid primary key,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete restrict,
  version text not null,
  title text not null,
  position integer not null check (position >= 0),
  is_required boolean not null default true,
  change_class text not null check (change_class in ('patch', 'minor', 'major')),
  estimated_study_minutes integer not null default 60 check (estimated_study_minutes > 0),
  estimated_project_minutes integer not null default 0 check (estimated_project_minutes >= 0),
  requires_project_evidence boolean not null default false,
  content_sha256 text not null,
  published_at timestamptz not null,
  unique (lesson_id, course_version_id),
  unique (module_id, position)
);

create table public.lesson_prerequisites (
  lesson_version_id uuid not null references public.lesson_versions(id) on delete cascade,
  prerequisite_lesson_id uuid not null references public.lessons(id) on delete restrict,
  primary key (lesson_version_id, prerequisite_lesson_id)
);

create table public.exercise_definitions (
  id uuid primary key,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete cascade,
  slug text not null,
  version integer not null default 1 check (version > 0),
  type text not null,
  mode text not null check (mode in ('practice', 'gating')),
  max_score integer not null check (max_score > 0),
  pass_score integer not null check (pass_score between 0 and max_score),
  evaluator_version text not null,
  is_required boolean not null default false,
  public_metadata jsonb not null default '{}'::jsonb,
  unique (lesson_version_id, slug, version)
);

create table content_private.exercise_keys (
  exercise_id uuid primary key references public.exercise_definitions(id) on delete cascade,
  evaluator_kind text not null,
  answer_key jsonb not null,
  critical_item_ids text[] not null default '{}'
);

create table public.milestone_definitions (
  id uuid primary key,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  slug text not null,
  title text not null,
  position integer not null check (position >= 0),
  required_evidence_types text[] not null default '{}',
  unique (course_version_id, slug),
  unique (course_version_id, position)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone text,
  weekly_pace_hours numeric(4,1) check (weekly_pace_hours between 0 and 80),
  active_course_version_id uuid references public.course_versions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  course_version_id uuid not null references public.course_versions(id) on delete restrict,
  current_lesson_version_id uuid references public.lesson_versions(id) on delete restrict,
  completed_lesson_version_id uuid references public.lesson_versions(id) on delete restrict,
  status public.progress_status not null default 'not_started',
  last_anchor text,
  percent integer not null default 0 check (percent between 0 and 100),
  best_score integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, lesson_id, course_version_id)
);

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  client_operation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise_definitions(id) on delete restrict,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  answer_summary jsonb,
  score integer not null check (score >= 0),
  max_score integer not null check (max_score > 0 and score <= max_score),
  passed boolean not null,
  solution_viewed boolean not null default false,
  feedback_codes text[] not null default '{}',
  evaluator_version text not null,
  payload_sha256 text,
  created_at timestamptz not null default now(),
  unique (user_id, client_operation_id),
  unique (user_id, exercise_id, attempt_number)
);

create table public.user_module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete restrict,
  required_completed integer not null default 0 check (required_completed >= 0),
  required_total integer not null default 0 check (required_total >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table public.project_milestones (
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.milestone_definitions(id) on delete restrict,
  status public.milestone_status not null default 'locked',
  reflection text check (char_length(reflection) <= 10000),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, milestone_id)
);

create table public.milestone_evidence (
  id uuid primary key default gen_random_uuid(),
  client_operation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.milestone_definitions(id) on delete restrict,
  evidence_type text not null check (evidence_type in ('repository_url', 'commit_hash', 'checklist', 'reflection', 'screenshot', 'test_summary', 'note')),
  text_value text check (char_length(text_value) <= 20000),
  url_value text check (char_length(url_value) <= 2048),
  storage_object_path text,
  payload_sha256 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_operation_id),
  check (num_nonnulls(text_value, url_value, storage_object_path) >= 1)
);

create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  anchor text,
  body text not null check (char_length(body) <= 50000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 0
);

create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('lesson', 'reference', 'exercise', 'milestone')),
  content_id uuid not null,
  anchor text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id, anchor)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  text_scale numeric(3,2) not null default 1 check (text_scale between 0.8 and 2),
  compact_mode boolean not null default false,
  reduced_motion boolean,
  increased_contrast boolean not null default false,
  theme text not null default 'dark' check (theme in ('dark', 'system')),
  code_font_size integer not null default 14 check (code_font_size between 12 and 28),
  device_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0
);

create table public.exercise_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise_definitions(id) on delete cascade,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete restrict,
  draft jsonb not null,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, exercise_id),
  check (pg_column_size(draft) <= 262144)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  course_version_id uuid references public.course_versions(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  server_created_at timestamptz not null default now()
);

create index course_modules_version_position_idx on public.course_modules(course_version_id, stage_slug, position);
create index lesson_versions_path_idx on public.lesson_versions(course_version_id, module_id, position);
create index lesson_prerequisites_lesson_idx on public.lesson_prerequisites(prerequisite_lesson_id);
create index exercise_definitions_lesson_idx on public.exercise_definitions(lesson_version_id, is_required);
create index user_lesson_progress_status_idx on public.user_lesson_progress(user_id, status, updated_at desc);
create index exercise_attempts_user_idx on public.exercise_attempts(user_id, exercise_id, created_at desc);
create index project_milestones_status_idx on public.project_milestones(user_id, status, updated_at desc);
create index milestone_evidence_lookup_idx on public.milestone_evidence(user_id, milestone_id, evidence_type);
create index user_notes_recent_idx on public.user_notes(user_id, updated_at desc);
create index audit_events_recent_idx on public.audit_events(user_id, server_created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  insert into public.user_preferences(user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
