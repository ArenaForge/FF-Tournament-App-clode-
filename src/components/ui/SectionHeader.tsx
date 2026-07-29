import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="font-display font-bold text-lg text-ink tracking-wide">{title}</h2>
      {action}
    </div>
  );
}
