import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { CourseLesson } from "../content/types";

interface KnowledgeCheckProps {
  lesson: CourseLesson;
  onPassed(): void;
}

export function KnowledgeCheck({ lesson, onPassed }: KnowledgeCheckProps) {
  const [choice, setChoice] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const options = useMemo(() => {
    const base = [
      { id: "correct", text: lesson.instruction },
      { id: "external", text: "Skip the in-app model and rely on an external tutorial before continuing." },
      { id: "client", text: "Move the rule into client presentation so it can bypass the shared contract." },
      { id: "generic", text: "Generalize the subsystem first, even when the ARPG has no requirement for it." },
    ];
    const offset = lesson.id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) % base.length;
    return [...base.slice(offset), ...base.slice(0, offset)];
  }, [lesson]);

  const passed = submitted && choice === "correct";
  const submit = () => {
    setSubmitted(true);
    if (choice === "correct") onPassed();
  };

  return (
    <section className="knowledge-check" aria-labelledby="knowledge-check-title">
      <div className="section-kicker">Required knowledge check</div>
      <h2 id="knowledge-check-title">Which statement best preserves this lesson’s implementation contract?</h2>
      <fieldset disabled={submitted && passed}>
        <legend className="sr-only">Choose one answer</legend>
        {options.map((option) => (
          <label key={option.id} className={choice === option.id ? "selected" : undefined}>
            <input type="radio" name={`check-${lesson.id}`} value={option.id} checked={choice === option.id} onChange={() => setChoice(option.id)} />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {submitted && (
        <div className={`check-feedback ${passed ? "correct" : "incorrect"}`} role="status">
          {passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <strong>{passed ? "Correct — contract preserved." : "Not yet."}</strong>
            <p>{passed ? `This keeps ${lesson.id} tied to the shipped ARPG and its shared rules.` : "Review the concept instruction. Required education stays in ActionDev, authority stays in the proper layer, and systems remain game-specific."}</p>
          </div>
        </div>
      )}
      <div className="check-actions">
        {!passed && <button className="button button-primary" onClick={submit} disabled={!choice}>Check answer</button>}
        {submitted && !passed && <button className="button button-secondary" onClick={() => { setSubmitted(false); setChoice(undefined); }}><RotateCcw size={15} />Try again</button>}
      </div>
    </section>
  );
}

