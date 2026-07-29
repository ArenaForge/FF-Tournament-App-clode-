import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { authAdmin } from "../lib/admin";

export const syncAdminClaim = onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const after = event.data?.after?.data();

  // Document deleted — nothing to sync.
  if (!after) return;

  const role = after.role === "admin" ? "admin" : "player";

  try {
    const userRecord = await authAdmin.getUser(uid);
    if (userRecord.customClaims?.role !== role) {
      await authAdmin.setCustomUserClaims(uid, { role });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[syncAdminClaim] Failed to sync claim for ${uid}:`, error);
  }
});
