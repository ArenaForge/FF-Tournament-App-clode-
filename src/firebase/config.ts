import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// All values are injected via environment variables (.env).
// Never commit real keys — see .env.example for the required keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail loudly (but not hard-crash the whole bundle) if required config is
// missing, rather than letting Firebase throw a cryptic internal error
// deep in some unrelated call site.
const REQUIRED_KEYS: (keyof typeof firebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "appId",
];
const missingKeys = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);
if (missingKeys.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[Firebase] Missing config values: ${missingKeys.join(", ")}. ` +
      "Copy .env.example to .env and fill in your Firebase project's web app config."
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Explicit session persistence (this is already the SDK default for web,
// but setting it explicitly keeps the behavior visible and intentional
// rather than relying on an implicit default).
setPersistence(auth, browserLocalPersistence).catch((error) => {
  // eslint-disable-next-line no-console
  console.warn("[Firebase] Failed to set auth persistence:", error);
});

// Optional local emulator support for development.
// Set VITE_USE_FIREBASE_EMULATORS=true in .env to route all Firebase
// traffic to local emulators instead of your live project.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  // eslint-disable-next-line no-console
  console.info("[Firebase] Connected to local emulators.");
}
