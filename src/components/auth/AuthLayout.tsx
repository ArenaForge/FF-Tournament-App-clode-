import type { ReactNode } from "react";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Signature layout for Phase 1: a "deployment briefing" left panel
 * (mission framing, squad motif) divided by an angled HUD-style edge
 * from the actual auth form on the right. Stacks vertically on mobile.
 */
export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Briefing panel */}
      <div
        className="relative w-full lg:w-[42%] bg-panel px-8 py-12 lg:py-0 flex flex-col justify-center overflow-hidden"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none [background-image:linear-gradient(rgba(0,229,199,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,199,0.6)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-16">
          <p className="label-tag text-cyan mb-4">{eyebrow}</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight text-ink mb-4">
            FF MAX<br />
            <span className="text-cyan">ARENA</span>
          </h1>
          <p className="text-ink-muted text-base leading-relaxed">
            Squad up for Free Fire MAX Clash Squad and Battle Royale
            tournaments. Solo, Duo, or Squad — the lobby opens the moment
            you're cleared in.
          </p>

          <div className="mt-10 flex gap-6 font-mono text-xs text-ink-muted">
            <div>
              <p className="text-cyan text-lg font-semibold">CS</p>
              <p>4v4 Clash Squad</p>
            </div>
            <div>
              <p className="text-amber text-lg font-semibold">BR</p>
              <p>Battle Royale</p>
            </div>
            <div>
              <p className="text-ink text-lg font-semibold">S/D/SQ</p>
              <p>All modes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display font-bold text-2xl text-ink mb-1">{title}</h2>
          <p className="text-ink-muted text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
