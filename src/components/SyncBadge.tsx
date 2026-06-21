import { Check, Cloud, CloudOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useProgress } from "../progress/ProgressContext";

export function SyncBadge() {
  const { user } = useAuth();
  const { syncState } = useProgress();

  const states = {
    local: { label: user ? "Local cache" : "Local preview", icon: CloudOff },
    syncing: { label: "Syncing", icon: LoaderCircle },
    synced: { label: "Synced", icon: Check },
    pending: { label: "Sync pending", icon: Cloud },
    unavailable: { label: "Cloud unavailable", icon: CloudOff },
  } as const;
  const current = states[syncState];
  const Icon = current.icon;
  return (
    <span className={`sync-badge sync-${syncState}`} title={current.label}>
      <Icon size={14} className={syncState === "syncing" ? "spin" : undefined} />
      <span>{current.label}</span>
    </span>
  );
}

