import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function GlassCard({ children, padded = true, className, ...rest }: GlassCardProps) {
  return (
    <div className={`glass-card ${padded ? "p-5" : ""} ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
}
