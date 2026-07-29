import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin } from "../lib/permissions";
import { sendNotificationToUser } from "../lib/notify";

interface RejectWithdrawalData {
  withdrawalId: string;
}

export const rejectWithdrawal = onCall<RejectWithdrawalData>(async (request) => {
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
    tx.update(withdrawalRef, { status: "rejected" });
    return { uid: withdrawal.uid as string };
  });

  await sendNotificationToUser(
    result.uid,
    "Withdrawal Rejected",
    "Your withdrawal request was rejected. Contact support if you believe this is a mistake.",
    "wallet"
  );

  return { success: true };
});
