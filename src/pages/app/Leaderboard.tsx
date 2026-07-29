import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthContext";
import { subscribeToLeaderboard } from "@/services/leaderboardService";
import { MOCK_LEADERBOARD, type LeaderboardEntry } from "@/mock/leaderboard";

type Period = "weekly" | "monthly";

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");
  const [live, setLive] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    // Note: without a scheduled rollup Cloud Function (out of scope
    // this phase), there's no real per-period aggregation pipeline —
    // both Weekly and Monthly read this same live collection. The tabs
    // exist as requested and will show distinct data once a scheduled
    // function populates period-specific rollups.
    return subscribeToLeaderboard((items) => {
      if (items.length === 0) {
        setLive(null);
        return;
      }
      const sorted = [...items].sort((a, b) => b.points - a.points);
      setLive(
        sorted.map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          points: entry.points,
          wins: entry.wins,
          kills: entry.kills,
          isCurrentUser: entry.id === user?.uid,
        }))
      );
    });
  }, [user]);

  const entries = useMemo(() => live ?? MOCK_LEADERBOARD, [live]);
  const [first, second, third] = entries;
  const rest = entries.slice(3);

  return (
    <AppShell title="Leaderboard">
      <div className="mb-5">
        <Tabs
          value={period}
          onChange={setPeriod}
          options={[
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ]}
        />
      </div>

      <div className="flex items-end justify-center gap-3 mb-6 pt-2">
        {/* 2nd */}
        {second && <PodiumSpot entry={second} height="h-20" ringClass="ring-white/20" />}
        {/* 1st */}
        {first && <PodiumSpot entry={first} height="h-28" ringClass="ring-orange" crown />}
        {/* 3rd */}
        {third && <PodiumSpot entry={third} height="h-16" ringClass="ring-amber/40" />}
      </div>

      <div className="flex flex-col gap-2.5">
        {rest.map((entry) => (
          <GlassCard
            key={entry.rank}
            className={`flex items-center gap-4 !py-3.5 ${
              entry.isCurrentUser ? "border-orange/40" : ""
            }`}
          >
            <span className="font-display font-bold text-ink-muted w-6 text-center">
              {entry.rank}
            </span>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-ink">
              {entry.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  entry.isCurrentUser ? "text-orange" : "text-ink"
                }`}
              >
                {entry.username}
                {entry.isCurrentUser && " (You)"}
              </p>
              <p className="text-[11px] text-ink-muted font-mono">
                {entry.wins} wins · {entry.kills} kills
              </p>
            </div>
            <p className="font-display font-bold text-ink">{entry.points.toLocaleString()}</p>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}

function PodiumSpot({
  entry,
  height,
  ringClass,
  crown,
}: {
  entry: LeaderboardEntry;
  height: string;
  ringClass: string;
  crown?: boolean;
}) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div
        className={`w-12 h-12 rounded-full bg-white/5 ring-2 ${ringClass} flex items-center justify-center font-display font-black text-ink mb-2`}
      >
        {entry.username.charAt(0).toUpperCase()}
      </div>
      <p className="text-xs font-semibold text-ink truncate max-w-[72px] text-center">
        {entry.username}
      </p>
      <p className="text-[10px] text-orange font-mono mb-2">{entry.points.toLocaleString()}</p>
      <div
        className={`w-full ${height} rounded-t-xl glass-card flex items-start justify-center pt-2 ${
          crown ? "shadow-glow-orange" : ""
        }`}
      >
        <span className="font-display font-black text-lg text-ink-muted">#{entry.rank}</span>
      </div>
    </div>
  );
}
