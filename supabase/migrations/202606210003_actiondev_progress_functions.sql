create or replace function public.current_course_version_for_user(p_user_id uuid)
returns uuid language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(
    (select active_course_version_id from public.profiles where id = p_user_id),
    (select id from public.course_versions where status = 'published' order by published_at desc limit 1)
  )
$$;

revoke all on function public.current_course_version_for_user(uuid) from public, anon, authenticated;

create or replace function public.record_lesson_position_by_slug(
  p_lesson_slug text,
  p_percent integer,
  p_last_anchor text,
  p_client_operation_id uuid
) returns public.user_lesson_progress
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_course uuid;
  v_lesson uuid;
  v_version uuid;
  v_row public.user_lesson_progress;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_percent < 0 or p_percent > 99 then raise exception 'in-progress percent must be between 0 and 99'; end if;
  v_course := public.current_course_version_for_user(v_user);
  if v_course is null then raise exception 'no published course'; end if;

  select l.id, lv.id into strict v_lesson, v_version
    from public.lessons l join public.lesson_versions lv on lv.lesson_id = l.id
    where l.slug = lower(p_lesson_slug) and lv.course_version_id = v_course;

  if exists (
    select 1 from public.lesson_prerequisites lp
    where lp.lesson_version_id = v_version
      and not exists (
        select 1 from public.user_lesson_progress ulp
        where ulp.user_id = v_user and ulp.course_version_id = v_course
          and ulp.lesson_id = lp.prerequisite_lesson_id and ulp.status = 'completed'
      )
  ) then raise exception 'lesson prerequisites are not complete'; end if;

  insert into public.user_lesson_progress(
    user_id, lesson_id, course_version_id, current_lesson_version_id,
    status, percent, last_anchor, started_at, updated_at, revision)
  values (v_user, v_lesson, v_course, v_version, 'in_progress', p_percent,
    nullif(p_last_anchor, ''), now(), now(), 1)
  on conflict (user_id, lesson_id, course_version_id) do update set
    current_lesson_version_id = excluded.current_lesson_version_id,
    status = case when user_lesson_progress.status = 'completed' then 'completed'::public.progress_status else 'in_progress'::public.progress_status end,
    percent = greatest(user_lesson_progress.percent, excluded.percent),
    last_anchor = coalesce(excluded.last_anchor, user_lesson_progress.last_anchor),
    started_at = coalesce(user_lesson_progress.started_at, now()),
    updated_at = now(),
    revision = user_lesson_progress.revision + 1
  returning * into v_row;
  return v_row;
end $$;

create or replace function public.submit_lesson_check_by_slug(
  p_lesson_slug text,
  p_answer text,
  p_client_operation_id uuid
) returns public.exercise_attempts
language plpgsql security definer set search_path = public, content_private, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_course uuid;
  v_version uuid;
  v_exercise public.exercise_definitions;
  v_key jsonb;
  v_attempt integer;
  v_score integer;
  v_row public.exercise_attempts;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  v_course := public.current_course_version_for_user(v_user);
  select lv.id into strict v_version from public.lessons l
    join public.lesson_versions lv on lv.lesson_id = l.id
    where l.slug = lower(p_lesson_slug) and lv.course_version_id = v_course;
  select * into strict v_exercise from public.exercise_definitions
    where lesson_version_id = v_version and mode = 'gating' and is_required limit 1;
  select answer_key into strict v_key from content_private.exercise_keys where exercise_id = v_exercise.id;
  v_score := case when to_jsonb(p_answer) = v_key then v_exercise.max_score else 0 end;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text || v_exercise.id::text, 0));
  select coalesce(max(attempt_number), 0) + 1 into v_attempt from public.exercise_attempts
    where user_id = v_user and exercise_id = v_exercise.id;

  insert into public.exercise_attempts(
    client_operation_id, user_id, exercise_id, lesson_version_id, attempt_number,
    answer_summary, score, max_score, passed, feedback_codes, evaluator_version, payload_sha256)
  values (
    p_client_operation_id, v_user, v_exercise.id, v_version, v_attempt,
    jsonb_build_object('selected', p_answer), v_score, v_exercise.max_score,
    v_score >= v_exercise.pass_score,
    case when v_score >= v_exercise.pass_score then array['contract_preserved'] else array['review_contract'] end,
    v_exercise.evaluator_version,
    encode(digest(convert_to(p_answer, 'UTF8'), 'sha256'), 'hex'))
  returning * into v_row;
  return v_row;
exception when unique_violation then
  select * into v_row from public.exercise_attempts
    where user_id = v_user and client_operation_id = p_client_operation_id;
  return v_row;
end $$;

create or replace function public.complete_lesson_by_slug(
  p_lesson_slug text,
  p_client_operation_id uuid
) returns public.user_lesson_progress
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_course uuid;
  v_lesson uuid;
  v_version uuid;
  v_module uuid;
  v_row public.user_lesson_progress;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  v_course := public.current_course_version_for_user(v_user);
  select l.id, lv.id, lv.module_id into strict v_lesson, v_version, v_module
    from public.lessons l join public.lesson_versions lv on lv.lesson_id = l.id
    where l.slug = lower(p_lesson_slug) and lv.course_version_id = v_course;

  if exists (
    select 1 from public.lesson_prerequisites lp where lp.lesson_version_id = v_version
      and not exists (
        select 1 from public.user_lesson_progress ulp
        where ulp.user_id = v_user and ulp.course_version_id = v_course
          and ulp.lesson_id = lp.prerequisite_lesson_id and ulp.status = 'completed'
      )
  ) then raise exception 'lesson prerequisites are not complete'; end if;

  if exists (
    select 1 from public.exercise_definitions ed
    where ed.lesson_version_id = v_version and ed.is_required
      and not exists (
        select 1 from public.exercise_attempts ea
        where ea.user_id = v_user and ea.exercise_id = ed.id and ea.passed
      )
  ) then raise exception 'required assessment is not complete'; end if;

  insert into public.user_lesson_progress(
    user_id, lesson_id, course_version_id, current_lesson_version_id,
    completed_lesson_version_id, status, percent, started_at, completed_at, updated_at, revision)
  values (v_user, v_lesson, v_course, v_version, v_version, 'completed', 100, now(), now(), now(), 1)
  on conflict (user_id, lesson_id, course_version_id) do update set
    current_lesson_version_id = v_version,
    completed_lesson_version_id = v_version,
    status = 'completed', percent = 100,
    started_at = coalesce(user_lesson_progress.started_at, now()),
    completed_at = coalesce(user_lesson_progress.completed_at, now()),
    updated_at = now(), revision = user_lesson_progress.revision + 1
  returning * into v_row;

  insert into public.user_module_progress(user_id, module_id, required_completed, required_total, completed_at, updated_at)
  select v_user, v_module,
    count(*) filter (where ulp.status = 'completed'), count(*),
    case when count(*) = count(*) filter (where ulp.status = 'completed') then now() else null end,
    now()
  from public.lesson_versions lv
  left join public.user_lesson_progress ulp on ulp.user_id = v_user
    and ulp.lesson_id = lv.lesson_id and ulp.course_version_id = v_course
  where lv.module_id = v_module and lv.is_required
  on conflict (user_id, module_id) do update set
    required_completed = excluded.required_completed,
    required_total = excluded.required_total,
    completed_at = excluded.completed_at,
    updated_at = now();

  insert into public.audit_events(user_id, event_type, entity_type, entity_id, course_version_id, payload)
  values (v_user, 'lesson_completed', 'lesson', v_lesson, v_course,
    jsonb_build_object('lesson_slug', lower(p_lesson_slug), 'operation_id', p_client_operation_id));
  return v_row;
end $$;

revoke all on function public.record_lesson_position_by_slug(text, integer, text, uuid) from public, anon;
revoke all on function public.submit_lesson_check_by_slug(text, text, uuid) from public, anon;
revoke all on function public.complete_lesson_by_slug(text, uuid) from public, anon;
grant execute on function public.record_lesson_position_by_slug(text, integer, text, uuid) to authenticated;
grant execute on function public.submit_lesson_check_by_slug(text, text, uuid) to authenticated;
grant execute on function public.complete_lesson_by_slug(text, uuid) to authenticated;
