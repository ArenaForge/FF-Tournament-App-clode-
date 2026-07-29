import { limit, orderBy } from "firebase/firestore";
import {
  getCollection,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
} from "@/services/firestoreService";
import type { TournamentDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "tournaments";
// Generous on purpose — Admin's tournament management (edit/delete)
// reads from this same collection, so the cap must never hide a real
// tournament from the admin. Still protects against truly unbounded
// growth over years of operation.
const MAX_TOURNAMENTS = 500;

export function tournamentPath(id: string) {
  return `${COLLECTION}/${id}`;
}

export async function getTournaments(): Promise<(TournamentDoc & { id: string })[]> {
  return getCollection<TournamentDoc>(COLLECTION, [
    orderBy("startTime", "desc"),
    limit(MAX_TOURNAMENTS),
  ]);
}

export function subscribeToTournaments(
  callback: (items: (TournamentDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<TournamentDoc>(COLLECTION, callback, [
    orderBy("startTime", "desc"),
    limit(MAX_TOURNAMENTS),
  ]);
}

export async function createTournamentDoc(id: string, data: TournamentDoc): Promise<void> {
  await setDocument(tournamentPath(id), data);
}

export async function updateTournamentDoc(id: string, updates: Partial<TournamentDoc>): Promise<void> {
  await updateDocument(tournamentPath(id), updates);
}

export async function deleteTournamentDoc(id: string): Promise<void> {
  await deleteDocument(tournamentPath(id));
}
