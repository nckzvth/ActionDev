import { CheckCircle2, ClipboardCheck, Flag, GitCommit, TestTube2 } from "lucide-react";
import { useState } from "react";
import { milestones } from "../content/milestones";
import { MilestoneEvidenceForm } from "../components/MilestoneEvidenceForm";

export function MilestonesPage() {
  const [expanded, setExpanded] = useState<string>(milestones[0].id);
  return (
    <div className="route-page milestones-page">
      <section className="route-hero compact-route-hero"><div className="content"><p className="eyebrow">Project evidence</p><h1>Milestones that mean something.</h1><p>ActionDev prepares the work. You implement it in your repository, run the tests, and return with evidence. Completion is explicitly learner-verified.</p></div></section>
      <section className="page-band"><div className="content milestone-layout">
        <div className="milestone-rail" aria-hidden="true">{milestones.map((gate, index) => <span className={expanded === gate.id ? "active" : undefined} key={gate.id}>{index + 1}</span>)}</div>
        <div className="milestone-list">
          {milestones.map((gate) => {
            const open = expanded === gate.id;
            return (
              <article className={`milestone-card ${open ? "open" : ""}`} key={gate.id}>
                <button className="milestone-heading" onClick={() => setExpanded(open ? "" : gate.id)} aria-expanded={open}>
                  <span className={`gate-icon ${gate.accent}`}><Flag size={18} /></span><span><small>{gate.id} · {gate.label}</small><strong>{gate.title}</strong></span><em>{open ? "Close" : "Review"}</em>
                </button>
                {open && <div className="milestone-body"><p className="milestone-summary">{gate.summary}</p><div className="criteria-grid"><div><h3><ClipboardCheck size={17} />Exit criteria</h3><ul>{gate.requirements.map((requirement) => <li key={requirement}><CheckCircle2 size={15} />{requirement}</li>)}</ul></div><div><h3><GitCommit size={17} />Evidence to record</h3><ul><li>Repository URL and commit hash</li><li>Acceptance checklist and reflection</li><li>Automated test summary</li><li>Profiling or readability evidence where required</li></ul></div></div><div className="verification-note"><TestTube2 size={19} /><p><strong>Learner-verified.</strong> ActionDev records your evidence but does not claim to inspect, compile, or certify your repository.</p></div><MilestoneEvidenceForm gate={gate} /></div>}
              </article>
            );
          })}
        </div>
      </div></section>
    </div>
  );
}
