import { limit, orderBy } from "firebase/firestore";
import { subscribeToCollection } from "@/services/firestoreService";
import type { LeaderboardEntryDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "leaderboard";
const TOP_N = 100;

export function subscribeToLeaderboard(
  callback: (items: (LeaderboardEntryDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<LeaderboardEntryDoc>(COLLECTION, callback, [
    orderBy("points", "desc"),
    limit(TOP_N),
  ]);
}
