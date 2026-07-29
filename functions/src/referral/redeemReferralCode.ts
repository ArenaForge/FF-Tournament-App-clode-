import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAuth, nowIso } from "../lib/permissions";

interface RedeemReferralCodeData {
  code: string;
}

export const redeemReferralCode = onCall<RedeemReferralCodeData>(async (request) => {
  const uid = requireAuth(request);

  const rawCode = request.data.code;
  if (!rawCode || typeof rawCode !== "string") {
    throw new HttpsError("invalid-argument", "A referral code is required.");
  }
  const code = rawCode.trim().toUpperCase();

  await db.runTransaction(async (tx) => {
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) {
      throw new HttpsError("not-found", "Your profile could not be found.");
    }
    const userData = userSnap.data()!;

    // Prevent duplicate redemption — a player can only ever be
    // referred once.
    if (userData.referredBy) {
      throw new HttpsError("failed-precondition", "You've already redeemed a referral code.");
    }

    const codeRef = db.doc(`referralCodes/${code}`);
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists) {
      throw new HttpsError("not-found", "That referral code doesn't exist.");
    }
    const referrerUid = codeSnap.data()!.uid as string;

    // Prevent self-referral.
    if (referrerUid === uid) {
      throw new HttpsError("failed-precondition", "You can't redeem your own referral code.");
    }

    const referrerRef = db.doc(`users/${referrerUid}`);
    const referrerSnap = await tx.get(referrerRef);
    const totalReferredBefore = referrerSnap.exists ? referrerSnap.data()?.totalReferred ?? 0 : 0;

    tx.set(userRef, { referredBy: referrerUid }, { merge: true });

    tx.set(referrerRef, { totalReferred: totalReferredBefore + 1 }, { merge: true });

    const referredDocRef = db.doc(`referrals/${referrerUid}/referred/${uid}`);
    tx.set(referredDocRef, {
      uid,
      username: userData.displayName ?? userData.email ?? "Player",
      joinedDate: nowIso().slice(0, 10),
      bonusCredited: false,
    });
  });

  return { success: true };
});
