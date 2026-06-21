import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const planPath = resolve(root, "ActionDev-Implementation-Plan.md");
const outputPath = resolve(root, "src/generated/course-data.ts");
const plan = await readFile(planPath, "utf8");
const lines = plan.split(/\r?\n/);

const stages = [];
const lessons = [];
let stage = null;
let module = null;

const clean = (value = "") =>
  value
    .trim()
    .replace(/\s{2,}/g, " ")
    .replace(/\.$/, "")
    .replace(/`/g, "");

const extract = (text, label, nextLabels) => {
  const start = text.indexOf(`${label}:`);
  if (start === -1) return "";
  const contentStart = start + label.length + 1;
  const ends = nextLabels
    .map((next) => text.indexOf(`${next}:`, contentStart))
    .filter((index) => index >= 0);
  return clean(text.slice(contentStart, ends.length ? Math.min(...ends) : undefined));
};

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  const stageMatch = line.match(/^### 6\.\d+ Stage (\d+) - (.+?)(?: \(source.*)?$/);
  if (stageMatch) {
    stage = {
      id: `stage-${stageMatch[1]}`,
      number: Number(stageMatch[1]),
      title: clean(stageMatch[2]),
    };
    stages.push(stage);
    module = null;
    continue;
  }

  const moduleMatch = line.match(/^#### Module (AD-[A-Z]{2}) - (.+)$/);
  if (moduleMatch) {
    module = { id: moduleMatch[1], title: clean(moduleMatch[2]) };
    continue;
  }

  const lessonMatch = line.match(/^\*\*(AD-[A-Z]{2}-\d{2}) - (.+?)\*\*/);
  if (!lessonMatch || !stage || !module) continue;

  let body = "";
  let cursor = index + 1;
  while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
  while (cursor < lines.length && lines[cursor].trim() && !lines[cursor].startsWith("**AD-")) {
    body += ` ${lines[cursor].trim()}`;
    cursor += 1;
  }
  body = clean(body);

  const buildText = extract(body, "Build/Test/Artifact", ["Tests", "Test", "Done"]);
  const tests = extract(body, "Tests", ["Done"]) || extract(body, "Test", ["Done"]);
  const id = lessonMatch[1];
  lessons.push({
    id,
    slug: id.toLowerCase(),
    title: clean(lessonMatch[2]),
    stageId: stage.id,
    stageNumber: stage.number,
    stageTitle: stage.title,
    moduleId: module.id,
    moduleTitle: module.title,
    prerequisites: extract(body, "Prereq", ["Teach"]),
    instruction: extract(body, "Teach", ["Visual"]),
    visual: extract(body, "Visual", ["Check"]),
    assessment: extract(body, "Check", ["Build/Test/Artifact"]),
    projectTask: buildText,
    tests,
    completion: extract(body, "Done", ["Effort"]),
    effort: extract(body, "Effort", ["Milestone"]),
    milestone: extract(body, "Milestone", ["Optional"]),
    optionalResource: extract(body, "Optional", []),
  });
}

const uniqueIds = new Set(lessons.map(({ id }) => id));
if (lessons.length !== 89 || uniqueIds.size !== lessons.length) {
  throw new Error(`Expected 89 unique lessons, found ${lessons.length}/${uniqueIds.size}.`);
}

const modules = [...new Map(lessons.map((lesson) => [lesson.moduleId, {
  id: lesson.moduleId,
  title: lesson.moduleTitle,
  stageId: lesson.stageId,
}])).values()];

const payload = {
  id: "actiondev-curriculum-v1",
  version: "1.0.0-draft",
  generatedAt: new Date().toISOString(),
  stages,
  modules,
  lessons,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `// Generated from ActionDev-Implementation-Plan.md. Do not edit by hand.\n` +
    `import type { CourseManifest } from "../content/types";\n\n` +
    `export const course = ${JSON.stringify(payload, null, 2)} as const satisfies CourseManifest;\n`,
  "utf8",
);

console.log(`Generated ${lessons.length} lessons across ${stages.length} stages.`);

