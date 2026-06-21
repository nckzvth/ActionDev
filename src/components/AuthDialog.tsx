import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useAppStore } from "../state/appStore";

type Mode = "signin" | "signup" | "recovery";

export function AuthDialog() {
  const open = useAppStore((state) => state.authOpen);
  const setOpen = useAppStore((state) => state.setAuthOpen);
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : mode === "signup"
          ? await signUp(email, password)
          : await requestPasswordReset(email);
    setBusy(false);
    if (result.error) setError(result.error);
    if (result.message) {
      setMessage(result.message);
      if (mode === "signin") setOpen(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="auth-dialog"
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      aria-labelledby="auth-title"
    >
      <button className="icon-button dialog-close" onClick={() => setOpen(false)} aria-label="Close sign in">
        <X size={18} />
      </button>
      <p className="eyebrow">Your progress, on every device</p>
      <h2 id="auth-title">
        {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Recover your account"}
      </h2>
      <p className="muted">
        {mode === "recovery"
          ? "We’ll send a secure recovery link to your email."
          : "ActionDev stores authenticated learning progress in Supabase, protected by row-level security."}
      </p>
      <form onSubmit={submit} className="form-stack">
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode !== "recovery" && (
          <label>
            Password
            <input
              type="password"
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {message && <p className="form-message success" role="status">{message}</p>}
        <button className="button button-primary" disabled={busy}>
          {busy ? "Working…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send recovery link"}
        </button>
      </form>
      <div className="auth-switches">
        {mode !== "signin" && <button onClick={() => setMode("signin")}>Sign in instead</button>}
        {mode !== "signup" && <button onClick={() => setMode("signup")}>Create an account</button>}
        {mode !== "recovery" && <button onClick={() => setMode("recovery")}>Forgot password?</button>}
      </div>
    </dialog>
  );
}
