import { Download, LogOut, Monitor, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { course } from "../content/course";
import { useProgress } from "../progress/ProgressContext";
import { useAppStore } from "../state/appStore";
import { supabase } from "../lib/supabase";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { progress, resetLocalProgress } = useProgress();
  const setAuthOpen = useAppStore((state) => state.setAuthOpen);
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("actiondev:reduced-motion") === "true");
  const [compact, setCompact] = useState(() => localStorage.getItem("actiondev:compact") === "true");

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    localStorage.setItem("actiondev:reduced-motion", String(reducedMotion));
  }, [reducedMotion]);
  useEffect(() => {
    document.documentElement.dataset.compact = String(compact);
    localStorage.setItem("actiondev:compact", String(compact));
  }, [compact]);

  const exportProgress = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), courseVersion: course.version, progress }, null, 2);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    link.download = "actiondev-progress.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const deleteAccount = async () => {
    if (!user || !supabase) return;
    const confirmation = window.prompt('Type DELETE to permanently remove your ActionDev account and progress.');
    if (confirmation !== "DELETE") return;
    const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
    if (error) {
      window.alert("Account deletion could not be completed. Export your data and try again after the backend function is deployed.");
      return;
    }
    await signOut();
  };

  return (
    <div className="route-page settings-page"><section className="route-hero compact-route-hero"><div className="content"><p className="eyebrow">Account and preferences</p><h1>Your learning state stays under your control.</h1><p>Authenticated progress belongs to your Supabase user. Device-only display preferences improve the local experience without becoming course truth.</p></div></section><section className="page-band"><div className="content settings-layout">
      <section className="settings-section"><header><UserRound size={20} /><div><h2>Account</h2><p>Authentication and cross-device continuity.</p></div></header>{user ? <div className="settings-row"><div><strong>{user.email}</strong><span>Authenticated learner</span></div><button className="button button-secondary" onClick={() => void signOut()}><LogOut size={15} />Sign out</button></div> : <div className="settings-row"><div><strong>Local preview</strong><span>Progress on this browser is not cross-device safe.</span></div><button className="button button-primary" onClick={() => setAuthOpen(true)}>Sign in</button></div>}</section>
      <section className="settings-section"><header><Monitor size={20} /><div><h2>Display and motion</h2><p>Stored on this device until authenticated preference sync is enabled.</p></div></header><label className="toggle-row"><span><strong>Reduced motion</strong><small>Remove nonessential transitions and animated effects.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label><label className="toggle-row"><span><strong>Compact curriculum lists</strong><small>Reduce vertical space without hiding detail controls.</small></span><input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} /></label></section>
      <section className="settings-section"><header><ShieldCheck size={20} /><div><h2>Data and privacy</h2><p>Export, reset, or permanently delete your learning state.</p></div></header><div className="settings-actions"><button className="button button-secondary" onClick={exportProgress}><Download size={15} />Export progress</button><button className="button button-danger" onClick={() => { if (window.confirm("Reset local ActionDev progress on this device?")) void resetLocalProgress(); }}><Trash2 size={15} />Reset local progress</button>{user && <button className="button button-danger" onClick={() => void deleteAccount()}><Trash2 size={15} />Delete account</button>}</div><p className="privacy-copy">ActionDev does not need your game repository contents, real name, advertising profile, or source code. Account deletion is irreversible and removes the authenticated user plus cascading learner records.</p></section>
    </div></section></div>
  );
}
