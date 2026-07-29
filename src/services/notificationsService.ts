import { limit, orderBy } from "firebase/firestore";
import { getCollection, setDocument, subscribeToCollection, updateDocument } from "@/services/firestoreService";
import type { NotificationDoc } from "@/types/firestore";
import type { Unsubscribe } from "firebase/firestore";

const RECENT_LIMIT = 50;

function notificationsCollection(uid: string) {
  return `users/${uid}/notifications`;
}

export async function getUserNotifications(uid: string): Promise<(NotificationDoc & { id: string })[]> {
  return getCollection<NotificationDoc>(notificationsCollection(uid), [
    orderBy("createdAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export function subscribeToUserNotifications(
  uid: string,
  callback: (items: (NotificationDoc & { id: string })[]) => void
): Unsubscribe {
  return subscribeToCollection<NotificationDoc>(notificationsCollection(uid), callback, [
    orderBy("createdAt", "desc"),
    limit(RECENT_LIMIT),
  ]);
}

export async function createNotificationDoc(
  uid: string,
  id: string,
  data: NotificationDoc
): Promise<void> {
  await setDocument(`${notificationsCollection(uid)}/${id}`, data);
}

export async function markNotificationRead(uid: string, id: string): Promise<void> {
  await updateDocument(`${notificationsCollection(uid)}/${id}`, { read: true });
}
