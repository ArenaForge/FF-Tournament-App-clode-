import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAuth, nowIso } from "../lib/permissions";

// Must stay in sync with src/mock/rewards.ts REWARD_SCHEDULE on the
// frontend (a separate deployable project, so duplicated here).
const REWARD_SCHEDULE = [5, 10, 10, 15, 20, 25, 100];

function dateKey(iso: string): string {
  // UTC calendar day, e.g. "2026-07-25" — the boundary used for "one
  // claim per day" and "consecutive day" checks.
  return iso.slice(0, 10);
}

function isConsecutiveDay(previousDateKey: string, currentDateKey: string): boolean {
  const prev = new Date(`${previousDateKey}T00:00:00Z`);
  const curr = new Date(`${currentDateKey}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays === 1;
}

export const claimDailyReward = onCall(async (request) => {
  const uid = requireAuth(request);

  const result = await db.runTransaction(async (tx) => {
    const rewardRef = db.doc(`dailyRewards/${uid}`);
    const rewardSnap = await tx.get(rewardRef);
    const existing = rewardSnap.exists ? rewardSnap.data()! : null;

    const now = nowIso();
    const today = dateKey(now);

    if (existing?.lastClaimedAt) {
      const lastDay = dateKey(existing.lastClaimedAt);
      // Server-side enforcement of "one claim per day" — the client's
      // idea of "today" is never trusted for this check.
      if (lastDay === today) {
        throw new HttpsError(
          "failed-precondition",
          "You've already claimed today's reward. Come back tomorrow."
        );
      }
    }

    let streak = 1;
    if (existing?.lastClaimedAt && isConsecutiveDay(dateKey(existing.lastClaimedAt), today)) {
      streak = (existing.streak ?? 0) + 1;
    }

    const dayIndex = ((streak - 1) % REWARD_SCHEDULE.length) + 1;
    const amount = REWARD_SCHEDULE[dayIndex - 1];

    tx.set(rewardRef, { streak, lastClaimedAt: now }, { merge: true });

    const walletRef = db.doc(`wallets/${uid}`);
    const walletSnap = await tx.get(walletRef);
    const currentBalance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;
    tx.set(walletRef, { balance: currentBalance + amount, updatedAt: now }, { merge: true });

    const ledgerRef = db.collection(`wallets/${uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "reward",
      label: `Daily Reward — Day ${dayIndex}`,
      amount,
      status: "success",
      createdAt: now,
    });

    return { streak, dayIndex, amount };
  });

  return { success: true, ...result };
});
