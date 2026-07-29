import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin, nowIso } from "../lib/permissions";
import { sendNotificationToUser } from "../lib/notify";

interface ApproveWithdrawalData {
  withdrawalId: string;
}

export const approveWithdrawal = onCall<ApproveWithdrawalData>(async (request) => {
  await requireAdmin(request);

  const { withdrawalId } = request.data;
  if (!withdrawalId || typeof withdrawalId !== "string") {
    throw new HttpsError("invalid-argument", "withdrawalId is required.");
  }

  const result = await db.runTransaction(async (tx) => {
    const withdrawalRef = db.doc(`withdrawals/${withdrawalId}`);
    const withdrawalSnap = await tx.get(withdrawalRef);
    if (!withdrawalSnap.exists) {
      throw new HttpsError("not-found", "Withdrawal request not found.");
    }
    const withdrawal = withdrawalSnap.data()!;

    if (withdrawal.status !== "pending") {
      throw new HttpsError("failed-precondition", "This withdrawal has already been processed.");
    }

    const walletRef = db.doc(`wallets/${withdrawal.uid}`);
    const walletSnap = await tx.get(walletRef);
    const currentBalance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;

    if (currentBalance < withdrawal.amount) {
      throw new HttpsError(
        "failed-precondition",
        "The player's wallet balance is insufficient for this withdrawal."
      );
    }

    tx.set(
      walletRef,
      { balance: currentBalance - withdrawal.amount, updatedAt: nowIso() },
      { merge: true }
    );

    const ledgerRef = db.collection(`wallets/${withdrawal.uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "withdraw",
      label: `Withdrawal to ${withdrawal.upiId}`,
      amount: -withdrawal.amount,
      status: "success",
      reference: withdrawal.reference,
      createdAt: nowIso(),
    });

    tx.update(withdrawalRef, { status: "approved" });

    return { uid: withdrawal.uid as string, amount: withdrawal.amount as number };
  });

  await sendNotificationToUser(
    result.uid,
    "Withdrawal Approved",
    `Your withdrawal of ₹${result.amount} has been approved and sent to your UPI ID.`,
    "wallet"
  );

  return { success: true };
});
