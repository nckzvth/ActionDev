import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { course } from "../content/course";
import { KnowledgeCheck } from "./KnowledgeCheck";

describe("KnowledgeCheck", () => {
  it("requires the contract-preserving answer", async () => {
    const user = userEvent.setup();
    const onPassed = vi.fn();
    const lesson = course.lessons[0];
    render(<KnowledgeCheck lesson={lesson} onPassed={onPassed} />);

    await user.click(screen.getByLabelText(lesson.instruction));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Correct — contract preserved.")).toBeInTheDocument();
    expect(onPassed).toHaveBeenCalledOnce();
  });
});

