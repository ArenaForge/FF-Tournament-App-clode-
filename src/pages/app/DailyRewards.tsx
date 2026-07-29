import { useEffect, useState } from "react";
import { Gift, Check, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { subscribeToDailyRewardStatus } from "@/services/dailyRewardsService";
import { callClaimDailyReward } from "@/services/functionsService";
import { REWARD_SCHEDULE } from "@/mock/rewards";
import type { DailyRewardDoc } from "@/types/firestore";

function daysBetween(fromDateKey: string, toDateKey: string): number {
  const from = new Date(`${fromDateKey}T00:00:00Z`);
  const to = new Date(`${toDateKey}T00:00:00Z`);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export default function DailyRewards() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DailyRewardDoc | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToDailyRewardStatus(user.uid, setStatus);
  }, [user]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const lastClaimedKey = status?.lastClaimedAt?.slice(0, 10);
  const alreadyClaimedToday = lastClaimedKey === todayKey;

  // The day (1-7) an upcoming claim would land on — mirrors the exact
  // consecutive-streak logic the claimDailyReward Cloud Function
  // enforces server-side; this is purely for display, never trusted
  // as the source of truth for whether a claim is allowed.
  let upcomingStreak = 1;
  if (status?.lastClaimedAt) {
    if (alreadyClaimedToday) {
      upcomingStreak = status.streak;
    } else {
      upcomingStreak = daysBetween(lastClaimedKey!, todayKey) === 1 ? status.streak + 1 : 1;
    }
  }
  const upcomingDayIndex = ((upcomingStreak - 1) % REWARD_SCHEDULE.length) + 1;
  const confirmedStreak = status?.streak ?? 0;

  async function handleClaim() {
    setClaiming(true);
    try {
      await callClaimDailyReward();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      window.alert(message);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <AppShell title="Daily Rewards" showBack>
      <GlassCard className="mb-6 text-center py-6">
        <div className="w-14 h-14 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center mx-auto mb-3">
          <Flame size={24} className="text-orange" />
        </div>
        <p className="label-tag mb-1">Current Streak</p>
        <p className="font-display font-black text-3xl text-ink">{confirmedStreak} days</p>
      </GlassCard>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {REWARD_SCHEDULE.map((reward, index) => {
          const day = index + 1;
          const isToday = day === upcomingDayIndex;
          const isClaimed = alreadyClaimedToday ? day <= upcomingDayIndex : day < upcomingDayIndex;
          return (
            <div
              key={day}
              className={`glass-card flex flex-col items-center justify-center gap-1 py-3 ${
                isToday ? "border-orange shadow-glow-orange" : ""
              }`}
            >
              <p className="text-[10px] font-mono text-ink-muted uppercase">Day {day}</p>
              {isClaimed ? (
                <Check size={18} className="text-success" />
              ) : (
                <Gift size={18} className={isToday ? "text-orange" : "text-ink-muted"} />
              )}
              <p className="text-xs font-semibold text-ink">₹{reward}</p>
            </div>
          );
        })}
      </div>

      <button onClick={handleClaim} disabled={alreadyClaimedToday || claiming} className="btn-orange">
        {alreadyClaimedToday
          ? "Claimed for Today"
          : claiming
            ? "Claiming..."
            : `Claim ₹${REWARD_SCHEDULE[upcomingDayIndex - 1]} Reward`}
      </button>
      <p className="text-center text-xs text-ink-muted font-mono mt-3">
        Come back tomorrow to keep your streak alive.
      </p>
    </AppShell>
  );
}
