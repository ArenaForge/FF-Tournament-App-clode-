import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { app } from "@/firebase/config";
import { updateUserProfile } from "@/services/usersService";

/**
 * Requests browser notification permission, registers for an FCM
 * token, and saves it to the user's own profile doc (allowed directly
 * by firestore.rules — fcmToken is one of the owner-writable fields).
 * Returns null if the browser doesn't support push messaging (e.g.
 * Safari on some versions, or no VAPID key configured) rather than
 * throwing, since push is an enhancement, not a hard requirement.
 */
export async function enablePushNotifications(uid: string): Promise<string | null> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    // eslint-disable-next-line no-console
    console.warn("[FCM] VITE_FIREBASE_VAPID_KEY is not set — push notifications are disabled.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .catch(() => null);

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration ?? undefined,
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.warn("[FCM] Failed to get token:", error);
    return null;
  });

  if (!token) return null;

  await updateUserProfile(uid, { fcmToken: token });
  return token;
}

/**
 * Listens for messages that arrive while the app is in the
 * foreground. Background/closed-app delivery is handled entirely by
 * the service worker, independent of this listener.
 */
export async function listenForForegroundMessages(
  onMessageReceived: (title: string, body: string) => void
): Promise<() => void> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return () => {};

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "Notification";
    const body = payload.notification?.body ?? "";
    onMessageReceived(title, body);
  });
}
