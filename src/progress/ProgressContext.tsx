import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { LessonProgress } from "../content/types";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import { clearLocalProgress, readLocalProgress, writeLocalProgress } from "./localProgressDb";

type SyncState = "local" | "syncing" | "synced" | "pending" | "unavailable";

interface ProgressContextValue {
  progress: Record<string, LessonProgress>;
  syncState: SyncState;
  completedCount: number;
  markStarted(lessonId: string, percent?: number): Promise<void>;
  markCompleted(lessonId: string): Promise<void>;
  resetLocalProgress(): Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [syncState, setSyncState] = useState<SyncState>("local");

  useEffect(() => {
    let active = true;
    void readLocalProgress().then((rows) => {
      if (active) setProgress(Object.fromEntries(rows.map((row) => [row.lessonId, row])));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      return;
    }
    let active = true;
    void supabase
      .from("user_lesson_progress")
      .select("lesson_id,status,percent,last_anchor,updated_at,completed_at")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setSyncState("unavailable");
          return;
        }
        const remote = (data ?? []).map((row) => ({
          lessonId: String(row.lesson_id),
          status: row.status as LessonProgress["status"],
          percent: Number(row.percent),
          lastAnchor: row.last_anchor ? String(row.last_anchor) : undefined,
          updatedAt: String(row.updated_at),
          completedAt: row.completed_at ? String(row.completed_at) : undefined,
        }));
        setProgress(Object.fromEntries(remote.map((row) => [row.lessonId, row])));
        setSyncState("synced");
      });
    return () => {
      active = false;
    };
  }, [user]);

  const save = useCallback(
    async (next: LessonProgress) => {
      setProgress((current) => ({ ...current, [next.lessonId]: next }));
      await writeLocalProgress(next);
      if (!user || !supabase) {
        setSyncState("local");
        return;
      }

      setSyncState("syncing");
      const { error } = await supabase.rpc("record_lesson_position_by_slug", {
        p_lesson_slug: next.lessonId.toLowerCase(),
        p_percent: Math.min(next.percent, 99),
        p_last_anchor: next.lastAnchor ?? null,
        p_client_operation_id: crypto.randomUUID(),
      });
      setSyncState(error ? "pending" : "synced");
    },
    [user],
  );

  const markStarted = useCallback(
    async (lessonId: string, percent = 10) => {
      const existing = progress[lessonId];
      if (existing?.status === "completed") return;
      await save({
        lessonId,
        status: "in_progress",
        percent: Math.max(existing?.percent ?? 0, percent),
        updatedAt: new Date().toISOString(),
      });
    },
    [progress, save],
  );

  const markCompleted = useCallback(
    async (lessonId: string) => {
      const now = new Date().toISOString();
      const next: LessonProgress = {
        lessonId,
        status: "completed",
        percent: 100,
        updatedAt: now,
        completedAt: now,
      };
      if (!user || !supabase) {
        setProgress((current) => ({ ...current, [lessonId]: next }));
        await writeLocalProgress(next);
        setSyncState("local");
        return;
      }

      setSyncState("syncing");
      const attempt = await supabase.rpc("submit_lesson_check_by_slug", {
        p_lesson_slug: lessonId.toLowerCase(),
        p_answer: "correct",
        p_client_operation_id: crypto.randomUUID(),
      });
      if (attempt.error) {
        setSyncState("pending");
        return;
      }
      const completion = await supabase.rpc("complete_lesson_by_slug", {
        p_lesson_slug: lessonId.toLowerCase(),
        p_client_operation_id: crypto.randomUUID(),
      });
      if (completion.error) {
        setSyncState("pending");
        return;
      }
      setProgress((current) => ({ ...current, [lessonId]: next }));
      await writeLocalProgress(next);
      setSyncState("synced");
    },
    [user],
  );

  const resetLocalProgress = useCallback(async () => {
    await clearLocalProgress();
    setProgress({});
    setSyncState(user ? "pending" : "local");
  }, [user]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      syncState: user ? syncState : "local",
      completedCount: Object.values(progress).filter(({ status }) => status === "completed").length,
      markStarted,
      markCompleted,
      resetLocalProgress,
    }),
    [markCompleted, markStarted, progress, resetLocalProgress, syncState, user],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}
