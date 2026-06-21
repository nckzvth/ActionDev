import { useState, type FormEvent } from "react";
import { Check, Save } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import type { milestones } from "../content/milestones";
import { supabase } from "../lib/supabase";

type Milestone = (typeof milestones)[number];

export function MilestoneEvidenceForm({ gate }: { gate: Milestone }) {
  const { user } = useAuth();
  const key = `actiondev:evidence:${gate.id}`;
  const existing = (() => {
    try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
  })();
  const [repositoryUrl, setRepositoryUrl] = useState(String(existing.repositoryUrl ?? ""));
  const [commitHash, setCommitHash] = useState(String(existing.commitHash ?? ""));
  const [testSummary, setTestSummary] = useState(String(existing.testSummary ?? ""));
  const [reflection, setReflection] = useState(String(existing.reflection ?? ""));
  const [checked, setChecked] = useState<string[]>(Array.isArray(existing.checked) ? existing.checked : []);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const payload = { repositoryUrl, commitHash, testSummary, reflection, checked };
    localStorage.setItem(key, JSON.stringify(payload));
    if (!user || !supabase) {
      setBusy(false);
      setStatus("Saved as a local preview. Sign in to make evidence cross-device state.");
      return;
    }

    const { data: definition, error: definitionError } = await supabase.from("milestone_definitions").select("id").eq("slug", gate.id.toLowerCase()).single();
    if (definitionError || !definition) {
      setBusy(false);
      setStatus("Cloud evidence is unavailable until the Supabase migrations are deployed.");
      return;
    }

    const rows = [
      repositoryUrl && { user_id: user.id, milestone_id: definition.id, client_operation_id: crypto.randomUUID(), evidence_type: "repository_url", url_value: repositoryUrl },
      commitHash && { user_id: user.id, milestone_id: definition.id, client_operation_id: crypto.randomUUID(), evidence_type: "commit_hash", text_value: commitHash },
      testSummary && { user_id: user.id, milestone_id: definition.id, client_operation_id: crypto.randomUUID(), evidence_type: "test_summary", text_value: testSummary },
      reflection && { user_id: user.id, milestone_id: definition.id, client_operation_id: crypto.randomUUID(), evidence_type: "reflection", text_value: reflection },
      checked.length && { user_id: user.id, milestone_id: definition.id, client_operation_id: crypto.randomUUID(), evidence_type: "checklist", text_value: JSON.stringify(checked) },
    ].filter(Boolean);
    const { error } = await supabase.from("milestone_evidence").insert(rows);
    setBusy(false);
    setStatus(error ? "Evidence is saved locally; cloud sync is pending." : "Evidence synced. Status remains learner-verified until all criteria are present.");
  };

  return (
    <form className="evidence-form" onSubmit={submit}>
      <h3>Evidence workspace</h3>
      <div className="evidence-fields">
        <label>Repository URL<input type="url" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} placeholder="https://github.com/you/game" /></label>
        <label>Commit hash<input value={commitHash} onChange={(event) => setCommitHash(event.target.value)} placeholder="abc123…" /></label>
        <label className="full">Automated test summary<textarea value={testSummary} onChange={(event) => setTestSummary(event.target.value)} placeholder="Commands run, pass/fail count, and notable coverage…" /></label>
        <label className="full">Reflection<textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="What the evidence proves, what failed, and what remains risky…" /></label>
      </div>
      <fieldset><legend>Acceptance checklist</legend>{gate.requirements.map((requirement) => <label key={requirement}><input type="checkbox" checked={checked.includes(requirement)} onChange={() => setChecked((current) => current.includes(requirement) ? current.filter((item) => item !== requirement) : [...current, requirement])} /><span><Check size={14} />{requirement}</span></label>)}</fieldset>
      {status && <p className="evidence-status" role="status">{status}</p>}
      <button className="button button-primary" disabled={busy || !repositoryUrl || !commitHash || !testSummary || !reflection || checked.length !== gate.requirements.length}><Save size={15} />{busy ? "Saving…" : "Save evidence"}</button>
    </form>
  );
}

