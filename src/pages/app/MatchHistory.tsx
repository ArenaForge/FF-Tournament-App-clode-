import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { subscribeToMatchHistory } from "@/services/matchHistoryService";
import { MOCK_MATCH_HISTORY, type MatchRecord } from "@/mock/matches";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function placementSuffix(n: number) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default function MatchHistory() {
  const { user } = useAuth();
  const [live, setLive] = useState<MatchRecord[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToMatchHistory(user.uid, (items) => {
      setLive(items.length > 0 ? items : null);
    });
  }, [user]);

  const matches = live ?? MOCK_MATCH_HISTORY;

  return (
    <AppShell title="Match History" showBack>
      {matches.length === 0 ? (
        <EmptyState
          icon={<History size={24} />}
          title="No matches yet"
          message="Join a tournament to start building your match history."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <GlassCard key={m.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-ink">{m.tournamentTitle}</p>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">{formatDate(m.date)}</p>
                </div>
                <Badge variant={m.placement === 1 ? "success" : "muted"}>
                  {placementSuffix(m.placement)} place
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-ink-muted">
                  Kills: <span className="text-ink font-semibold">{m.kills}</span>
                </span>
                <span className="text-ink-muted">
                  Entry: <span className="text-ink font-semibold">₹{m.entryFee}</span>
                </span>
                <span
                  className={`font-semibold ${m.prizeWon > 0 ? "text-orange" : "text-ink-muted"}`}
                >
                  {m.prizeWon > 0 ? `+₹${m.prizeWon}` : "No prize"}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
