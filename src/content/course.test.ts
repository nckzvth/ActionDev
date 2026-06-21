import { describe, expect, it } from "vitest";
import { course, getAdjacentLessons, getLesson } from "./course";

describe("ActionDev course manifest", () => {
  it("contains the complete registered path", () => {
    expect(course.stages).toHaveLength(8);
    expect(course.modules).toHaveLength(14);
    expect(course.lessons).toHaveLength(89);
    expect(new Set(course.lessons.map(({ id }) => id)).size).toBe(89);
  });

  it("preserves required lesson contracts", () => {
    for (const lesson of course.lessons) {
      expect(lesson.instruction.length).toBeGreaterThan(20);
      expect(lesson.visual.length).toBeGreaterThan(10);
      expect(lesson.assessment.length).toBeGreaterThan(5);
      expect(lesson.completion.length).toBeGreaterThan(5);
      expect(lesson.milestone).toMatch(/^AD-GATE-/);
    }
  });

  it("resolves lesson and adjacency routes", () => {
    const first = getLesson("ad-or-01")!;
    expect(first.id).toBe("AD-OR-01");
    expect(getAdjacentLessons(first).previous).toBeUndefined();
    expect(getAdjacentLessons(first).next?.id).toBe("AD-OR-02");
  });
});

