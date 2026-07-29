import { limit, orderBy } from "firebase/firestore";
import { subscribeToCollection } from "@/services/firestoreService";
import type { WinnerHistoryDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const RECENT_LIMIT = 50;

export function subscribeToWinnerHistory(
  uid: string,
  callback: (items: (WinnerHistoryDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<WinnerHistoryDoc>(`users/${uid}/winnerHistory`, callback, [
    orderBy("date", "desc"),
    limit(RECENT_LIMIT),
  ]);
}
