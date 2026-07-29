import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin, nowIso } from "../lib/permissions";

interface CreditPrizeData {
  uid: string;
  amount: number;
  label?: string;
}

export const creditPrize = onCall<CreditPrizeData>(async (request) => {
  await requireAdmin(request);

  const { uid, amount, label } = request.data;
  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "uid is required.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new HttpsError("invalid-argument", "amount must be a positive number.");
  }

  await db.runTransaction(async (tx) => {
    const walletRef = db.doc(`wallets/${uid}`);
    const walletSnap = await tx.get(walletRef);
    const currentBalance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;

    tx.set(
      walletRef,
      { balance: currentBalance + amount, updatedAt: nowIso() },
      { merge: true }
    );

    const ledgerRef = db.collection(`wallets/${uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "prize",
      label: label?.trim() || "Tournament Prize",
      amount,
      status: "success",
      createdAt: nowIso(),
    });
  });

  return { success: true };
});
