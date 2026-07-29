import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin } from "../lib/permissions";
import { sendNotificationToUser } from "../lib/notify";

interface RejectPaymentData {
  paymentId: string;
}

export const rejectPayment = onCall<RejectPaymentData>(async (request) => {
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
    if (payment.status !== "pending") {
      throw new HttpsError("failed-precondition", "This payment has already been processed.");
    }
    tx.update(paymentRef, { status: "rejected" });
    return { uid: payment.uid as string, type: payment.type as string };
  });

  const message =
    result.type === "deposit"
      ? "Your deposit request was rejected. Contact support if you believe this is a mistake."
      : "Your tournament entry payment was rejected. Contact support if you believe this is a mistake.";
  await sendNotificationToUser(result.uid, "Payment Rejected", message, "wallet");

  return { success: true };
});
