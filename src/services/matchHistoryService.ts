import { limit, orderBy } from "firebase/firestore";
import { subscribeToCollection } from "@/services/firestoreService";
import type { MatchHistoryDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const RECENT_LIMIT = 50;

export function subscribeToMatchHistory(
  uid: string,
  callback: (items: (MatchHistoryDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<MatchHistoryDoc>(`users/${uid}/matchHistory`, callback, [
    orderBy("date", "desc"),
    limit(RECENT_LIMIT),
  ]);
}
