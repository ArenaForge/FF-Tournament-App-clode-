import { getDocument, subscribeToDocument } from "@/services/firestoreService";
import type { DailyRewardDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

function dailyRewardPath(uid: string) {
  return `dailyRewards/${uid}`;
}

export async function getDailyRewardStatus(uid: string): Promise<DailyRewardDoc | null> {
  return getDocument<DailyRewardDoc>(dailyRewardPath(uid));
}

export function subscribeToDailyRewardStatus(
  uid: string,
  callback: (doc: DailyRewardDoc | null) => void
): Unsubscribe {
  return subscribeToDocument<DailyRewardDoc>(dailyRewardPath(uid), callback);
}
