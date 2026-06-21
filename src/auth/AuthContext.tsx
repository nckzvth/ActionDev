import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from "../lib/supabase";

interface AuthResult {
  error?: string;
  message?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<AuthResult>;
  updatePassword(password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : { message: "Signed in." };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    return error
      ? { error: error.message }
      : { message: "Check your email to confirm your ActionDev account." };
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    return error
      ? { error: error.message }
      : { message: "Password recovery instructions were sent." };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : { message: "Password updated." };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      signOut,
    }),
    [loading, requestPasswordReset, session, signIn, signOut, signUp, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
