/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// Duplicate your Firebase web config from .env here — this file is
// served as a static asset, outside Vite's module graph, so it can't
// read import.meta.env at runtime. These values are public client
// config (not secrets), so hardcoding them is safe.
firebase.initializeApp({
  apiKey: "REPLACE_WITH_VITE_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_VITE_FIREBASE_PROJECT_ID",
  storageBucket: "REPLACE_WITH_VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_VITE_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

// Background/closed-app push handling. Foreground messages (app open
// and focused) are handled instead by src/services/fcmService.ts's
// onMessage listener.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "FF MAX ARENA";
  const body = payload.notification?.body ?? "";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
  });
});
