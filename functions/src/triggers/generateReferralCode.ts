import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../lib/admin";

function generateCode(uid: string): string {
  const base = uid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "PLYR";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${random}`;
}

export const generateReferralCode = onDocumentCreated("users/{uid}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const uid = event.params.uid;
  const data = snap.data();
  if (data.referralCode) return; // idempotent — already has one somehow

  let code = generateCode(uid);
  // Collision is extremely unlikely (uid prefix + random suffix), but
  // guard against it rather than assume.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.doc(`referralCodes/${code}`).get();
    if (!existing.exists) break;
    code = generateCode(uid);
  }

  await db.doc(`referralCodes/${code}`).set({ uid, createdAt: new Date().toISOString() });
  await db.doc(`users/${uid}`).set({ referralCode: code }, { merge: true });
});
