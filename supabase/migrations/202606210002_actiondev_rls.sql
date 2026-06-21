grant usage on schema public to anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'course_versions','course_modules','lessons','lesson_versions','lesson_prerequisites',
    'exercise_definitions','milestone_definitions','profiles','user_lesson_progress',
    'exercise_attempts','user_module_progress','project_milestones','milestone_evidence',
    'user_notes','bookmarks','user_preferences','exercise_drafts','audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select on public.course_versions, public.course_modules, public.lessons,
  public.lesson_versions, public.lesson_prerequisites, public.exercise_definitions,
  public.milestone_definitions to anon, authenticated;

create policy course_versions_published_read on public.course_versions for select to anon, authenticated
  using (status = 'published');
create policy modules_published_read on public.course_modules for select to anon, authenticated
  using (exists (select 1 from public.course_versions cv where cv.id = course_version_id and cv.status = 'published'));
create policy lessons_published_read on public.lessons for select to anon, authenticated
  using (exists (select 1 from public.lesson_versions lv join public.course_versions cv on cv.id = lv.course_version_id where lv.lesson_id = lessons.id and cv.status = 'published'));
create policy lesson_versions_published_read on public.lesson_versions for select to anon, authenticated
  using (exists (select 1 from public.course_versions cv where cv.id = course_version_id and cv.status = 'published'));
create policy prerequisites_published_read on public.lesson_prerequisites for select to anon, authenticated
  using (exists (select 1 from public.lesson_versions lv join public.course_versions cv on cv.id = lv.course_version_id where lv.id = lesson_version_id and cv.status = 'published'));
create policy exercises_published_read on public.exercise_definitions for select to anon, authenticated
  using (exists (select 1 from public.lesson_versions lv join public.course_versions cv on cv.id = lv.course_version_id where lv.id = lesson_version_id and cv.status = 'published'));
create policy milestones_published_read on public.milestone_definitions for select to anon, authenticated
  using (exists (select 1 from public.course_versions cv where cv.id = course_version_id and cv.status = 'published'));

grant select, update on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select on public.user_lesson_progress, public.exercise_attempts, public.user_module_progress,
  public.project_milestones, public.audit_events to authenticated;
create policy progress_select_own on public.user_lesson_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy attempts_select_own on public.exercise_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy module_progress_select_own on public.user_module_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy milestones_select_own on public.project_milestones for select to authenticated using ((select auth.uid()) = user_id);
create policy audit_select_own on public.audit_events for select to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.milestone_evidence, public.user_notes, public.exercise_drafts to authenticated;
grant select, insert, delete on public.bookmarks to authenticated;
grant select, insert, update on public.user_preferences to authenticated;

create policy evidence_select_own on public.milestone_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy evidence_insert_own on public.milestone_evidence for insert to authenticated with check ((select auth.uid()) = user_id);
create policy evidence_update_own on public.milestone_evidence for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy evidence_delete_own on public.milestone_evidence for delete to authenticated using ((select auth.uid()) = user_id);

create policy notes_select_own on public.user_notes for select to authenticated using ((select auth.uid()) = user_id);
create policy notes_insert_own on public.user_notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy notes_update_own on public.user_notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy notes_delete_own on public.user_notes for delete to authenticated using ((select auth.uid()) = user_id);

create policy bookmarks_select_own on public.bookmarks for select to authenticated using ((select auth.uid()) = user_id);
create policy bookmarks_insert_own on public.bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy bookmarks_delete_own on public.bookmarks for delete to authenticated using ((select auth.uid()) = user_id);

create policy preferences_select_own on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy preferences_insert_own on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy preferences_update_own on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy drafts_select_own on public.exercise_drafts for select to authenticated using ((select auth.uid()) = user_id);
create policy drafts_insert_own on public.exercise_drafts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy drafts_update_own on public.exercise_drafts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy drafts_delete_own on public.exercise_drafts for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on schema content_private from public, anon, authenticated;
revoke all on all tables in schema content_private from public, anon, authenticated;

alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated;
