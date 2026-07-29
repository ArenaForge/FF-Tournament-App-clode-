import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAuth, nowIso } from "../lib/permissions";

interface JoinTournamentData {
  tournamentId: string;
}

export const joinTournamentWithWallet = onCall<JoinTournamentData>(async (request) => {
  const uid = requireAuth(request);

  const { tournamentId } = request.data;
  if (!tournamentId || typeof tournamentId !== "string") {
    throw new HttpsError("invalid-argument", "tournamentId is required.");
  }

  await db.runTransaction(async (tx) => {
    const tournamentRef = db.doc(`tournaments/${tournamentId}`);
    const tournamentSnap = await tx.get(tournamentRef);
    if (!tournamentSnap.exists) {
      throw new HttpsError("not-found", "Tournament not found.");
    }
    const tournament = tournamentSnap.data()!;

    if (tournament.status === "completed") {
      throw new HttpsError("failed-precondition", "This tournament has already ended.");
    }

    const participantRef = db.doc(`tournaments/${tournamentId}/participants/${uid}`);
    const participantSnap = await tx.get(participantRef);
    if (participantSnap.exists) {
      throw new HttpsError("already-exists", "You've already joined this tournament.");
    }

    const slotsTotal = tournament.slotsTotal ?? 0;
    const slotsFilled = tournament.slotsFilled ?? 0;
    if (slotsFilled >= slotsTotal) {
      throw new HttpsError("resource-exhausted", "No slots remaining in this tournament.");
    }

    const entryFee = tournament.entryFee ?? 0;
    const walletRef = db.doc(`wallets/${uid}`);
    const walletSnap = await tx.get(walletRef);
    const balance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;
    if (balance < entryFee) {
      throw new HttpsError("failed-precondition", "Insufficient wallet balance for this entry fee.");
    }

    tx.set(walletRef, { balance: balance - entryFee, updatedAt: nowIso() }, { merge: true });
    tx.update(tournamentRef, { slotsFilled: slotsFilled + 1 });
    tx.set(participantRef, { uid, joinedAt: nowIso() });

    const ledgerRef = db.collection(`wallets/${uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "entryFee",
      label: `Entry Fee — ${tournament.title}`,
      amount: -entryFee,
      status: "success",
      createdAt: nowIso(),
    });
  });

  return { success: true };
});
