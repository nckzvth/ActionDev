import { course } from "../generated/course-data";
import type { CourseLesson, LessonProgress } from "./types";

export { course };

export function getLesson(slugOrId: string) {
  const value = slugOrId.toLowerCase();
  return course.lessons.find((lesson) => lesson.slug === value || lesson.id.toLowerCase() === value);
}

export function getLessonsForStage(stageId: string) {
  return course.lessons.filter((lesson) => lesson.stageId === stageId);
}

export function getLessonsForModule(moduleId: string) {
  return course.lessons.filter((lesson) => lesson.moduleId === moduleId);
}

export function getAdjacentLessons(lesson: CourseLesson) {
  const index = course.lessons.findIndex(({ id }) => id === lesson.id);
  return {
    previous: index > 0 ? course.lessons[index - 1] : undefined,
    next: index < course.lessons.length - 1 ? course.lessons[index + 1] : undefined,
  };
}

export function getResumeLesson(progress: Record<string, LessonProgress>) {
  return (
    course.lessons.find((lesson) => progress[lesson.id]?.status === "in_progress") ??
    course.lessons.find((lesson) => progress[lesson.id]?.status !== "completed") ??
    course.lessons[0]
  );
}

export function splitInstruction(value: string) {
  return value
    .split(/;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

