import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const generated = await readFile(resolve(root, "src/generated/course-data.ts"), "utf8");
const json = generated.match(/export const course = ([\s\S]+) as const satisfies CourseManifest;/)?.[1];
if (!json) throw new Error("Could not read generated course manifest.");
const course = JSON.parse(json);

const uuid = (value) => {
  const chars = createHash("md5").update(value).digest("hex").split("");
  chars[12] = "5";
  chars[16] = ["8", "9", "a", "b"][parseInt(chars[16], 16) % 4];
  const hex = chars.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const courseId = uuid(`course:${course.id}:${course.version}`);
const manifestHash = createHash("sha256").update(JSON.stringify(course.lessons)).digest("hex");

const sql = [
  "-- Generated from the ActionDev curriculum manifest. Do not edit by hand.",
  "begin;",
  `insert into public.course_versions(id, version, status, title, manifest_sha256, release_notes, published_at) values (${quote(courseId)}, ${quote(course.version)}, 'published', 'ActionDev: Custom C++ Online Co-op ARPG', ${quote(manifestHash)}, 'Initial implementation curriculum generated from the approved blueprint.', now()) on conflict (id) do update set manifest_sha256 = excluded.manifest_sha256, release_notes = excluded.release_notes;`,
];

for (const [position, module] of course.modules.entries()) {
  const stage = course.stages.find((item) => item.id === module.stageId);
  sql.push(`insert into public.course_modules(id, course_version_id, slug, title, stage_slug, position, source_lesson_codes) values (${quote(uuid(`module:${module.id}`))}, ${quote(courseId)}, ${quote(module.id.toLowerCase())}, ${quote(module.title)}, ${quote(stage.id)}, ${position}, array[${quote(module.id)}]) on conflict (id) do update set title = excluded.title, position = excluded.position;`);
}

for (const [position, lesson] of course.lessons.entries()) {
  const lessonId = uuid(`lesson:${lesson.id}`);
  const versionId = uuid(`lesson-version:${course.version}:${lesson.id}`);
  const moduleId = uuid(`module:${lesson.moduleId}`);
  const exerciseId = uuid(`exercise:${course.version}:${lesson.id}:contract-check`);
  const modulePosition = course.lessons.filter((item) => item.moduleId === lesson.moduleId).findIndex((item) => item.id === lesson.id);
  const hours = Number(lesson.effort.match(/([\d.]+)/)?.[1] ?? 1);
  const projectHours = Number(lesson.effort.match(/\+\s*([\d.]+)\s*h/)?.[1] ?? 0);
  const contentHash = createHash("sha256").update(JSON.stringify(lesson)).digest("hex");
  const requiresEvidence = Boolean(lesson.projectTask && !/no code|completes in-app/i.test(lesson.projectTask));

  sql.push(`insert into public.lessons(id, slug, canonical_title) values (${quote(lessonId)}, ${quote(lesson.slug)}, ${quote(lesson.title)}) on conflict (id) do update set canonical_title = excluded.canonical_title;`);
  sql.push(`insert into public.lesson_versions(id, lesson_id, course_version_id, module_id, version, title, position, change_class, estimated_study_minutes, estimated_project_minutes, requires_project_evidence, content_sha256, published_at) values (${quote(versionId)}, ${quote(lessonId)}, ${quote(courseId)}, ${quote(moduleId)}, '1.0.0', ${quote(lesson.title)}, ${modulePosition}, 'major', ${Math.round(hours * 60)}, ${Math.round(projectHours * 60)}, ${requiresEvidence}, ${quote(contentHash)}, now()) on conflict (id) do update set title = excluded.title, content_sha256 = excluded.content_sha256;`);
  sql.push(`insert into public.exercise_definitions(id, lesson_version_id, slug, type, mode, max_score, pass_score, evaluator_version, is_required, public_metadata) values (${quote(exerciseId)}, ${quote(versionId)}, 'contract-check', 'multiple_choice', 'gating', 1, 1, 'exact-v1', true, jsonb_build_object('lesson_id', ${quote(lesson.id)})) on conflict (id) do update set evaluator_version = excluded.evaluator_version;`);
  sql.push(`insert into content_private.exercise_keys(exercise_id, evaluator_kind, answer_key) values (${quote(exerciseId)}, 'exact', to_jsonb('correct'::text)) on conflict (exercise_id) do update set answer_key = excluded.answer_key;`);
  if (position > 0) {
    const previous = course.lessons[position - 1];
    sql.push(`insert into public.lesson_prerequisites(lesson_version_id, prerequisite_lesson_id) values (${quote(versionId)}, ${quote(uuid(`lesson:${previous.id}`))}) on conflict do nothing;`);
  }
}

const gates = [
  ["AD-GATE-00", "Reproducible toolchain and repository"],
  ["AD-GATE-01", "Third-person combat feel probes"],
  ["AD-GATE-02", "Local authoritative vertical slice"],
  ["AD-GATE-03", "Two-player authoritative proof"],
  ["AD-GATE-04", "Eight-player stress slice"],
  ["AD-GATE-05", "Steam Early Access readiness"],
];
for (const [position, [slug, title]] of gates.entries()) {
  sql.push(`insert into public.milestone_definitions(id, course_version_id, slug, title, position, required_evidence_types) values (${quote(uuid(`milestone:${slug}`))}, ${quote(courseId)}, ${quote(slug.toLowerCase())}, ${quote(title)}, ${position}, array['commit_hash','checklist','reflection','test_summary']) on conflict (id) do update set title = excluded.title;`);
}

sql.push("commit;", "");
const output = sql.join("\n");
const targets = [
  resolve(root, "supabase/seed.sql"),
  resolve(root, "supabase/migrations/202606210004_actiondev_course_seed.sql"),
];
for (const target of targets) {
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output, "utf8");
}
console.log(`Generated Supabase seed for ${course.lessons.length} lessons.`);

