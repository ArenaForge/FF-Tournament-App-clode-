#!/usr/bin/env bash
# Run this LOCALLY (not in any sandboxed/CI environment without network
# and the Android SDK). It performs everything that couldn't be done
# in the environment this project was prepared in:
#   - npm install (needs npm registry access)
#   - npx cap add android (needs npm registry access, generates the
#     real, up-to-date native Gradle project from Capacitor's own
#     platform template — safer than a hand-authored one)
#   - icon/splash density generation (needs the Android SDK's asset
#     pipeline via @capacitor/assets)
#   - the actual Gradle build (needs a full Android SDK install)
#
# Prerequisites: Node.js 18+, Android Studio (or the Android SDK +
# Gradle on your PATH), and a Java 17+ JDK.

set -euo pipefail

echo "==> Installing dependencies (Capacitor core/cli/android included in package.json)"
npm install

echo "==> Building the web app (dist/) — Capacitor packages this into the APK"
npm run build

echo "==> Adding the native Android project (skips if android/ already exists)"
if [ ! -d "android" ]; then
  npx cap add android
else
  echo "    android/ already exists, skipping cap add android"
fi

echo "==> Generating Android icon/splash densities from resources/icon.png + resources/splash.png"
npx capacitor-assets generate --android

echo "==> Syncing the built web app + plugins into the native project"
npx cap sync android

echo ""
echo "Setup complete. Next steps:"
echo "  1. Open in Android Studio:  npx cap open android"
echo "     (or build from the CLI:  cd android && ./gradlew assembleDebug)"
echo "  2. In the Firebase Console, confirm 'localhost' is in"
echo "     Authentication > Settings > Authorized domains (it usually"
echo "     is by default) — the WebView serves the app from a local"
echo "     origin, so Firebase Auth needs to recognize it."
echo "  3. Debug APK output path after a Gradle build:"
echo "     android/app/build/outputs/apk/debug/app-debug.apk"
