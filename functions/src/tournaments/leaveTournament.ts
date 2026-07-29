import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAuth, nowIso } from "../lib/permissions";

interface LeaveTournamentData {
  tournamentId: string;
}

export const leaveTournament = onCall<LeaveTournamentData>(async (request) => {
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

    if (tournament.status !== "upcoming") {
      throw new HttpsError(
        "failed-precondition",
        "You can only leave a tournament before it starts."
      );
    }

    const participantRef = db.doc(`tournaments/${tournamentId}/participants/${uid}`);
    const participantSnap = await tx.get(participantRef);
    if (!participantSnap.exists) {
      throw new HttpsError("not-found", "You haven't joined this tournament.");
    }

    const slotsFilled = tournament.slotsFilled ?? 0;
    tx.delete(participantRef);
    tx.update(tournamentRef, { slotsFilled: Math.max(0, slotsFilled - 1) });

    // Refund the entry fee.
    const entryFee = tournament.entryFee ?? 0;
    const walletRef = db.doc(`wallets/${uid}`);
    const walletSnap = await tx.get(walletRef);
    const balance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;
    tx.set(walletRef, { balance: balance + entryFee, updatedAt: nowIso() }, { merge: true });

    const ledgerRef = db.collection(`wallets/${uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "refund",
      label: `Refund — ${tournament.title}`,
      amount: entryFee,
      status: "success",
      createdAt: nowIso(),
    });
  });

  return { success: true };
});
