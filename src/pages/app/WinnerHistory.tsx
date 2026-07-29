import { useEffect, useState } from "react";
import { Trophy, ImageOff, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { subscribeToWinnerHistory } from "@/services/winnerHistoryService";
import { MOCK_WINNER_HISTORY, type WinnerRecord } from "@/mock/winners";

const RANK_COLOR: Record<number, string> = {
  1: "text-orange",
  2: "text-ink",
  3: "text-amber",
};

export default function WinnerHistory() {
  const { user } = useAuth();
  const [live, setLive] = useState<WinnerRecord[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToWinnerHistory(user.uid, (items) => {
      setLive(items.length > 0 ? items : null);
    });
  }, [user]);

  const winners = live ?? MOCK_WINNER_HISTORY;

  return (
    <AppShell title="Winner History" showBack>
      {winners.length === 0 ? (
        <EmptyState
          icon={<Trophy size={24} />}
          title="No wins yet"
          message="Your podium finishes will show up here once you place in a tournament."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {winners.map((w) => (
            <GlassCard key={w.id} className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-black text-lg ${RANK_COLOR[w.rank] ?? "text-ink"}`}
              >
                #{w.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-ink truncate">
                  {w.tournamentTitle}
                </p>
                <p className="text-xs text-ink-muted font-mono mt-0.5">
                  {new Date(w.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-orange">₹{w.prizeWon}</p>
                {w.proofUploaded ? (
                  <Badge variant="success">
                    <CheckCircle2 size={11} /> Proof
                  </Badge>
                ) : (
                  <Badge variant="muted">
                    <ImageOff size={11} /> No proof
                  </Badge>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
