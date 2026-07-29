import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ffmaxarena.app",
  appName: "FF MAX ARENA",
  webDir: "dist",

  // "https" (rather than the default "http") is required for many
  // Firebase Auth flows and Web APIs (e.g. FCM's service worker
  // registration) that expect a secure context — the WebView still
  // serves the bundled app locally, no real network round-trip.
  server: {
    androidScheme: "https",
  },

  android: {
    // Release builds should not allow cleartext (unencrypted) traffic;
    // all Firebase/Firestore/Storage/Functions calls are already HTTPS.
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      // Matches the existing in-app Splash.tsx timing/feel — the native
      // splash is what shows before the WebView + React app finish
      // booting, then Splash.tsx's own animated screen takes over.
      launchShowDuration: 1500,
      backgroundColor: "#0A0D12",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
