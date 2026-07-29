import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { subscribeToRuleItems } from "@/services/contentService";
import type { RuleDoc } from "@/types/firestore";

const MOCK_RULE_SECTIONS = [
  {
    title: "Fair Play",
    points: [
      "Emulators, hacks, macros, or any third-party tools are strictly banned.",
      "Teaming with opponents in solo/duo matches results in disqualification.",
      "Multiple accounts per player are not allowed in the same tournament.",
    ],
  },
  {
    title: "Match Conduct",
    points: [
      "Join the custom room within 5 minutes of the room ID being shared.",
      "Late entries after the match starts will not be re-added.",
      "Abusive language or harassment in-game leads to an immediate ban.",
    ],
  },
  {
    title: "Results & Payouts",
    points: [
      "Submit a clear screenshot of your final result screen for verification.",
      "Prize payouts are credited to your wallet within 24 hours of results being confirmed.",
      "Disputed results are reviewed by the admin team — decisions are final.",
    ],
  },
];

function groupBySection(items: (RuleDoc & { id: string })[]) {
  const bySection = new Map<string, string[]>();
  for (const item of items) {
    const existing = bySection.get(item.section) ?? [];
    existing.push(item.text);
    bySection.set(item.section, existing);
  }
  return Array.from(bySection.entries()).map(([title, points]) => ({ title, points }));
}

export default function Rules() {
  const [live, setLive] = useState<(RuleDoc & { id: string })[] | null>(null);

  useEffect(() => {
    return subscribeToRuleItems((items) => {
      setLive(items.length > 0 ? items : null);
    });
  }, []);

  const sections = useMemo(
    () => (live ? groupBySection(live) : MOCK_RULE_SECTIONS),
    [live]
  );

  return (
    <AppShell title="Rules" showBack>
      <GlassCard className="mb-6 flex items-center gap-3">
        <ShieldAlert size={20} className="text-orange shrink-0" />
        <p className="text-sm text-ink-muted">
          Read these carefully — breaking any rule can lead to disqualification or a ban.
        </p>
      </GlassCard>

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <SectionHeader title={section.title} />
          <GlassCard>
            <ul className="text-sm text-ink-muted space-y-2.5 list-disc list-inside">
              {section.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      ))}
    </AppShell>
  );
}
