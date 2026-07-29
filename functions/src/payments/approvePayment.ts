import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { DocumentReference, DocumentData } from "firebase-admin/firestore";
import { db } from "../lib/admin";
import { requireAdmin, nowIso } from "../lib/permissions";
import { sendNotificationToUser } from "../lib/notify";

interface ApprovePaymentData {
  paymentId: string;
}

// Credited to the referrer once their referred player's first
// tournament entry fee is approved. Kept here (not shared with the
// frontend) since only this function ever awards it.
const REFERRAL_BONUS = 50;

export const approvePayment = onCall<ApprovePaymentData>(async (request) => {
  await requireAdmin(request);

  const { paymentId } = request.data;
  if (!paymentId || typeof paymentId !== "string") {
    throw new HttpsError("invalid-argument", "paymentId is required.");
  }

  const result = await db.runTransaction(async (tx) => {
    const paymentRef = db.doc(`payments/${paymentId}`);
    const paymentSnap = await tx.get(paymentRef);
    if (!paymentSnap.exists) {
      throw new HttpsError("not-found", "Payment request not found.");
    }
    const payment = paymentSnap.data()!;

    // Prevents double-processing (e.g. two admins clicking Approve at
    // once, or a retried request) — this check + the whole read/write
    // happening inside one transaction is what makes it safe.
    if (payment.status !== "pending") {
      throw new HttpsError("failed-precondition", "This payment has already been processed.");
    }

    let referrerUidToNotify: string | null = null;
    let tournamentTitleForNotify: string | undefined;

    if (payment.type === "deposit") {
      const walletRef = db.doc(`wallets/${payment.uid}`);
      const walletSnap = await tx.get(walletRef);
      const currentBalance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;

      tx.set(
        walletRef,
        { balance: currentBalance + payment.amount, updatedAt: nowIso() },
        { merge: true }
      );

      const ledgerRef = db.collection(`wallets/${payment.uid}/transactions`).doc();
      tx.set(ledgerRef, {
        type: "deposit",
        label: "UPI Deposit",
        amount: payment.amount,
        status: "success",
        reference: payment.reference,
        utr: payment.utr,
        createdAt: nowIso(),
      });
    } else if (payment.type === "entryFee") {
      if (!payment.tournamentId) {
        throw new HttpsError("failed-precondition", "This payment has no linked tournament.");
      }

      const tournamentRef = db.doc(`tournaments/${payment.tournamentId}`);
      const tournamentSnap = await tx.get(tournamentRef);
      if (!tournamentSnap.exists) {
        throw new HttpsError("not-found", "The linked tournament no longer exists.");
      }
      const tournament = tournamentSnap.data()!;

      const participantRef = db.doc(`tournaments/${payment.tournamentId}/participants/${payment.uid}`);
      const participantSnap = await tx.get(participantRef);
      if (participantSnap.exists) {
        // Prevent duplicate joins even if two entry-fee payments for
        // the same tournament somehow both reached "pending".
        throw new HttpsError("already-exists", "This player has already joined this tournament.");
      }

      const slotsTotal = tournament.slotsTotal ?? 0;
      const slotsFilled = tournament.slotsFilled ?? 0;
      if (slotsFilled >= slotsTotal) {
        throw new HttpsError("resource-exhausted", "No slots remaining in this tournament.");
      }

      // --- Reads for the first-tournament referral bonus (must happen
      // before any writes — Firestore transactions require every get()
      // to come before every set()/update()) ---
      const playerRef = db.doc(`users/${payment.uid}`);
      const playerSnap = await tx.get(playerRef);
      const player = playerSnap.exists ? playerSnap.data()! : {};
      const tournamentsJoinedBefore = player.tournamentsJoined ?? 0;
      const isFirstTournament = tournamentsJoinedBefore === 0;
      const referralEligible =
        isFirstTournament && !!player.referredBy && !player.referralRewardClaimed;

      let referrerRef: DocumentReference<DocumentData> | null = null;
      let referrerWalletRef: DocumentReference<DocumentData> | null = null;
      let referrerBalance = 0;
      let referrerTotalEarnings = 0;
      let referredDocRef: DocumentReference<DocumentData> | null = null;

      if (referralEligible) {
        const referrerUid = player.referredBy as string;
        referrerRef = db.doc(`users/${referrerUid}`);
        const referrerSnap = await tx.get(referrerRef);
        referrerTotalEarnings = referrerSnap.exists
          ? referrerSnap.data()?.totalReferralEarnings ?? 0
          : 0;

        referrerWalletRef = db.doc(`wallets/${referrerUid}`);
        const referrerWalletSnap = await tx.get(referrerWalletRef);
        referrerBalance = referrerWalletSnap.exists ? referrerWalletSnap.data()?.balance ?? 0 : 0;

        referredDocRef = db.doc(`referrals/${referrerUid}/referred/${payment.uid}`);
      }

      // --- Writes ---
      tx.update(tournamentRef, { slotsFilled: slotsFilled + 1 });
      tx.set(participantRef, {
        uid: payment.uid,
        username: payment.username,
        joinedAt: nowIso(),
        paymentId,
      });

      const ledgerRef = db.collection(`wallets/${payment.uid}/transactions`).doc();
      tx.set(ledgerRef, {
        type: "entryFee",
        label: `Entry Fee — ${payment.tournamentTitle ?? tournament.title}`,
        amount: -payment.amount,
        status: "success",
        reference: payment.reference,
        utr: payment.utr,
        createdAt: nowIso(),
      });

      tx.set(
        playerRef,
        {
          tournamentsJoined: tournamentsJoinedBefore + 1,
          ...(referralEligible ? { referralRewardClaimed: true } : {}),
        },
        { merge: true }
      );

      tournamentTitleForNotify = payment.tournamentTitle ?? tournament.title;

      if (referralEligible && referrerRef && referrerWalletRef && referredDocRef) {
        tx.set(
          referrerWalletRef,
          { balance: referrerBalance + REFERRAL_BONUS, updatedAt: nowIso() },
          { merge: true }
        );
        tx.set(
          referrerRef,
          { totalReferralEarnings: referrerTotalEarnings + REFERRAL_BONUS },
          { merge: true }
        );
        tx.set(referredDocRef, { bonusCredited: true }, { merge: true });

        const referrerLedgerRef = db.collection(`wallets/${player.referredBy}/transactions`).doc();
        tx.set(referrerLedgerRef, {
          type: "referral",
          label: `Referral Bonus — ${payment.username}'s first tournament`,
          amount: REFERRAL_BONUS,
          status: "success",
          createdAt: nowIso(),
        });

        referrerUidToNotify = player.referredBy as string;
      }
    } else {
      throw new HttpsError("invalid-argument", `Unknown payment type: ${payment.type}`);
    }

    tx.update(paymentRef, { status: "approved" });

    return {
      uid: payment.uid as string,
      type: payment.type as string,
      amount: payment.amount as number,
      tournamentTitleForNotify,
      referrerUidToNotify,
    };
  });

  const message =
    result.type === "deposit"
      ? `Your deposit of ₹${result.amount} has been approved and credited to your wallet.`
      : `Your entry for ${result.tournamentTitleForNotify ?? "the tournament"} is confirmed!`;
  await sendNotificationToUser(result.uid, "Payment Approved", message, "wallet");

  if (result.referrerUidToNotify) {
    await sendNotificationToUser(
      result.referrerUidToNotify,
      "Referral Bonus Credited",
      `You earned ₹${REFERRAL_BONUS} — your referral joined their first tournament!`,
      "wallet"
    );
  }

  return { success: true };
});
