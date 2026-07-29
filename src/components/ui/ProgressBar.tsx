interface ProgressBarProps {
  value: number; // 0-100
  colorClass?: string;
  trackClass?: string;
}

export function ProgressBar({
  value,
  colorClass = "bg-gradient-to-r from-orange to-orange-soft",
  trackClass = "bg-white/10",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
