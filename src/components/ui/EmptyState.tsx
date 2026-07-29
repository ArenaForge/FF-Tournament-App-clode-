import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-orange mb-4">
        {icon}
      </div>
      <p className="font-display font-semibold text-ink mb-1">{title}</p>
      <p className="text-sm text-ink-muted max-w-xs">{message}</p>
    </div>
  );
}
