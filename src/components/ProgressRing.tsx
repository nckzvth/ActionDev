interface ProgressRingProps {
  value: number;
  label: string;
  size?: "small" | "large";
}

export function ProgressRing({ value, label, size = "small" }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress-ring ${size}`} style={{ "--progress": `${clamped * 3.6}deg` } as React.CSSProperties}>
      <div>
        <strong>{Math.round(clamped)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

