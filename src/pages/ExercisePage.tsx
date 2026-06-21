import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLesson } from "../content/course";
import { NotFoundPage } from "./NotFoundPage";

const exerciseTypes = ["ordering", "matching", "multi-select", "scenario"] as const;

export function ExercisePage() {
  const { lessonSlug = "" } = useParams();
  const lesson = getLesson(lessonSlug);
  const [submitted, setSubmitted] = useState(false);
  const [selections, setSelections] = useState<string[]>([]);
  const initialOrder = useMemo(() => ["Observe the result", "Apply the shared rule", "Validate preconditions", "Capture input or data"], []);
  const [order, setOrder] = useState(initialOrder);
  if (!lesson) return <NotFoundPage />;

  const type = exerciseTypes[lesson.id.split("").reduce((sum, item) => sum + item.charCodeAt(0), 0) % exerciseTypes.length];
  const correctOrder = ["Capture input or data", "Validate preconditions", "Apply the shared rule", "Observe the result"];
  const passed = type === "ordering"
    ? order.every((item, index) => item === correctOrder[index])
    : type === "matching"
      ? selections.includes("server") && selections.includes("client")
      : type === "multi-select"
        ? selections.length === 2 && selections.includes("explicit") && selections.includes("tested")
        : selections.includes("narrow");

  const toggle = (value: string) => setSelections((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="exercise-page"><header className="exercise-header"><div className="content"><Link to={`/lesson/${lesson.slug}`} className="back-link"><ArrowLeft size={15} />Back to lesson</Link><p className="eyebrow">Practice workspace · {type}</p><h1>{lesson.id}: {lesson.title}</h1><p>{lesson.assessment}</p></div></header><div className="content exercise-layout"><aside><small>Learning objective</small><p>{lesson.instruction}</p><small>Evaluation</small><p>Practice is local and retryable. The lesson’s qualifying check remains the completion gate.</p></aside><main className="exercise-surface"><div className="exercise-prompt"><span>01</span><div><p className="section-kicker">Reason about the contract</p><h2>{type === "ordering" ? "Put the implementation flow in a safe order." : type === "matching" ? "Assign responsibility to the correct authority." : type === "multi-select" ? "Select every property that keeps this system maintainable." : "Choose the decision that protects the project boundary."}</h2></div></div>
          {type === "ordering" && <div className="ordering-list">{order.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong><button aria-label={`Move ${item} up`} onClick={() => move(index, -1)}><ArrowUp size={15} /></button><button aria-label={`Move ${item} down`} onClick={() => move(index, 1)}><ArrowDown size={15} /></button></div>)}</div>}
          {type === "matching" && <div className="choice-list"><label><input type="checkbox" checked={selections.includes("server")} onChange={() => toggle("server")} /><span><strong>Server</strong> owns authoritative outcomes, economy, and persistence.</span></label><label><input type="checkbox" checked={selections.includes("client")} onChange={() => toggle("client")} /><span><strong>Client</strong> owns camera and may predict local presentation.</span></label><label><input type="checkbox" checked={selections.includes("wrong")} onChange={() => toggle("wrong")} /><span><strong>Client</strong> grants its own loot after a successful animation.</span></label></div>}
          {type === "multi-select" && <div className="choice-list"><label><input type="checkbox" checked={selections.includes("explicit")} onChange={() => toggle("explicit")} /><span>Inputs, state, failures, and ownership are explicit.</span></label><label><input type="checkbox" checked={selections.includes("tested")} onChange={() => toggle("tested")} /><span>Rules are observable and covered by tests.</span></label><label><input type="checkbox" checked={selections.includes("generic")} onChange={() => toggle("generic")} /><span>The subsystem is generalized before an ARPG requirement exists.</span></label></div>}
          {type === "scenario" && <div className="choice-list"><label><input type="radio" name="scenario" checked={selections.includes("narrow")} onChange={() => setSelections(["narrow"])} /><span>Implement the narrow contract required by the current playable slice.</span></label><label><input type="radio" name="scenario" checked={selections.includes("engine")} onChange={() => setSelections(["engine"])} /><span>Pause the slice and build a general-purpose editor framework.</span></label><label><input type="radio" name="scenario" checked={selections.includes("external")} onChange={() => setSelections(["external"])} /><span>Skip the model and require an external tutorial.</span></label></div>}
          {submitted && <div className={`check-feedback ${passed ? "correct" : "incorrect"}`} role="status">{passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}<div><strong>{passed ? "Correct reasoning." : "The contract still has a gap."}</strong><p>{passed ? "The system stays explicit, testable, and inside the correct authority boundary." : "Review authority, the own-versus-borrow boundary, and the order in which inputs become validated results."}</p></div></div>}
          <div className="check-actions"><button className="button button-primary" onClick={() => setSubmitted(true)}>Check work</button><button className="button button-secondary" onClick={() => { setSubmitted(false); setSelections([]); setOrder(initialOrder); }}><RotateCcw size={15} />Reset</button></div>
        </main></div></div>
  );
}

