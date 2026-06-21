export interface CourseStage {
  id: string;
  number: number;
  title: string;
}

export interface CourseModule {
  id: string;
  title: string;
  stageId: string;
}

export interface CourseLesson {
  id: string;
  slug: string;
  title: string;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  moduleId: string;
  moduleTitle: string;
  prerequisites: string;
  instruction: string;
  visual: string;
  assessment: string;
  projectTask: string;
  tests: string;
  completion: string;
  effort: string;
  milestone: string;
  optionalResource: string;
}

export interface CourseManifest {
  id: string;
  version: string;
  generatedAt: string;
  stages: readonly CourseStage[];
  modules: readonly CourseModule[];
  lessons: readonly CourseLesson[];
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  percent: number;
  lastAnchor?: string;
  updatedAt: string;
  completedAt?: string;
}
