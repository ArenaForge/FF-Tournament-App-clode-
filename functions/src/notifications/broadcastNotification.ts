import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/admin";
import { requireAdmin } from "../lib/permissions";
import { sendNotificationToUser } from "../lib/notify";

interface BroadcastNotificationData {
  title: string;
  body: string;
  audience: "all" | "selected";
  uids?: string[];
}

export const broadcastNotification = onCall<BroadcastNotificationData>(async (request) => {
  await requireAdmin(request);

  const { title, body, audience, uids } = request.data;
  if (!title?.trim() || !body?.trim()) {
    throw new HttpsError("invalid-argument", "title and body are required.");
  }

  let targetUids: string[];
  if (audience === "all") {
    const usersSnap = await db.collection("users").get();
    targetUids = usersSnap.docs.map((d) => d.id);
  } else {
    if (!uids || uids.length === 0) {
      throw new HttpsError("invalid-argument", "At least one uid is required for a selected broadcast.");
    }
    targetUids = uids;
  }

  await Promise.all(
    targetUids.map((uid) => sendNotificationToUser(uid, title.trim(), body.trim(), "system"))
  );

  return { success: true, recipientCount: targetUids.length };
});
