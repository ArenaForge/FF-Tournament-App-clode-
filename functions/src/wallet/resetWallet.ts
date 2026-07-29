import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin, nowIso } from "../lib/permissions";

interface ResetWalletData {
  uid: string;
}

export const resetWallet = onCall<ResetWalletData>(async (request) => {
  await requireAdmin(request);

  const { uid } = request.data;
  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "uid is required.");
  }

  await db.runTransaction(async (tx) => {
    const walletRef = db.doc(`wallets/${uid}`);
    const walletSnap = await tx.get(walletRef);
    const currentBalance = walletSnap.exists ? walletSnap.data()?.balance ?? 0 : 0;

    if (currentBalance === 0) return;

    tx.set(walletRef, { balance: 0, updatedAt: nowIso() }, { merge: true });

    const ledgerRef = db.collection(`wallets/${uid}/transactions`).doc();
    tx.set(ledgerRef, {
      type: "adjustment",
      label: "Wallet reset by admin",
      amount: -currentBalance,
      status: "success",
      createdAt: nowIso(),
    });
  });

  return { success: true };
});
