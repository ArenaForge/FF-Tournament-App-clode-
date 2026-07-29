import type { ReactNode } from "react";

interface StatPillProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatPill({ icon, label, value, accent }: StatPillProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 flex-1 py-3">
      {icon && <div className={accent ? "text-orange" : "text-ink-muted"}>{icon}</div>}
      <p className={`font-display font-bold text-lg ${accent ? "text-orange" : "text-ink"}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{label}</p>
    </div>
  );
}
