# FF MAX ARENA — Phase 1: Authentication Module

This is Phase 1 only: Login, Signup, Forgot Password, protected routing,
and Firebase Authentication. No wallet, tournaments, or admin panel yet —
those come in later phases.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Firebase project at https://console.firebase.google.com
   - Enable **Authentication → Sign-in method → Email/Password**

3. Copy `.env.example` to `.env` and fill in your Firebase web app config
   (Project Settings → General → Your apps → SDK setup and configuration):
   ```
   cp .env.example .env
   ```

4. Run the dev server:
   ```
   npm run dev
   ```

## What's included

- `src/context/AuthContext.tsx` — wraps Firebase Auth (login, signup, reset
  password, logout) and exposes the current user via `useAuth()`.
- `src/routes/ProtectedRoute.tsx` — blocks unauthenticated access, redirects
  to `/login` and returns the user to where they were headed after login.
- `src/routes/GuestRoute.tsx` — keeps logged-in users off the auth pages.
- `src/pages/auth/` — Login, Signup, Forgot Password screens.
- `src/pages/PlaceholderHome.tsx` — a temporary stub screen (shows the
  logged-in user + a logout button) so the protected route has somewhere
  to land. Replaced by the real Home Dashboard in a later phase.

## Design system (dark gaming theme)

- **Palette**: near-black void (`#0A0D12`) base, phosphor cyan (`#00E5C7`)
  primary accent, amber (`#FFB020`) secondary accent for links/highlights.
- **Type**: Orbitron (display/headings), Inter (body), JetBrains Mono
  (labels, tags, stat-style text).
- **Signature elements**: angled-corner "Deploy" buttons with a scanline
  hover sweep, and a laser-line focus state on inputs.

## Not included in this phase (by design)

Wallet, UPI payments, tournaments, admin panel, leaderboard, referrals,
notifications — all intentionally out of scope until you approve the next
phase.

---

## Phase 2 — Main App UI (frontend only)

Adds the full mobile-first app shell and all core screens, styled in a
dark black + orange glassmorphism theme, with mock data only — no
Firebase reads/writes, no wallet transactions, no tournament joining,
no admin panel.

**New pages** (`src/pages/app/`): Splash, Home, Tournament List,
Tournament Details, Wallet, Profile, Match History, Winner History,
Leaderboard, Referral, Daily Rewards, Notifications, Rules, FAQ, Support.

**Layout**: `AppShell` (top bar + page transition + bottom nav),
`BottomNav` (Home / Tournaments / Wallet / Leaderboard / Profile).
Secondary pages (Match History, Winner History, Referral, Daily
Rewards, Rules, FAQ, Support) are reachable from the Profile menu;
Notifications is reachable from the bell icon on Home.

**Reusable UI** (`src/components/ui/`): `GlassCard`, `Badge`,
`SectionHeader`, `StatPill`, `EmptyState`, `ProgressBar`, `Tabs`.

**Mock data** (`src/mock/`): tournaments, matches, winners,
leaderboard, notifications, referral, rewards, FAQ/wallet/profile
content — swap these for real Firestore reads in a later phase.

**Routing note**: `AppRoutes.tsx` was extended (not rewritten) to add
the new routes. The Login/Signup/ForgotPassword routes and every file
in `src/pages/auth/`, `src/context/AuthContext.tsx`,
`src/routes/ProtectedRoute.tsx`, and `src/routes/GuestRoute.tsx` are
untouched from Phase 1. The root path `/` now shows the Splash screen,
which auto-navigates to `/home` (protected) after ~2 seconds.

**New dependencies**: `framer-motion` (page/element animation),
`lucide-react` (icon set). Run `npm install` again after pulling this
phase.

---

## Phase 6A — Firebase Foundation

Wires the app to a real Firebase project: Auth (already live since
Phase 1) now gets a Firestore profile + role detection, tournaments
move from a static mock array to a live Firestore collection, and
Storage powers profile photos + tournament banners.

### Setup

1. In the [Firebase Console](https://console.firebase.google.com), enable:
   - **Firestore Database** (production mode)
   - **Storage**
2. Deploy the security rules and indexes (requires the [Firebase CLI](https://firebase.google.com/docs/cli)):
   ```
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
3. **Bootstrap your first admin manually** — there is no UI for this
   yet, by design (see "What's NOT wired" below). After signing up
   once through the app, open Firestore in the console and change that
   user's `users/{uid}.role` field from `"player"` to `"admin"`.
4. Optional: run against local emulators instead of your live project
   by setting `VITE_USE_FIREBASE_EMULATORS=true` in `.env` and running
   `firebase emulators:start`.

### What's connected

- **users** — created on signup (`role: "player"`, `blocked: false`);
  read in real time by `AuthContext` for role/blocked detection
- **tournaments** — `TournamentList`, `TournamentDetails`, `Home`, and
  the entire Admin tournament CRUD now read/write this collection in
  real time via `TournamentContext`. If the collection is empty (a
  fresh project), the app falls back to the existing mock tournaments
  so it still works out of the box.
- **wallets** — a zero-balance doc is created on signup. That's it —
  no deposit/withdraw/credit logic touches this collection yet (see
  below).
- **Storage** — profile photo upload (Profile page) and tournament
  banner image upload (Admin → Tournament Form, alongside the
  existing gradient presets) are both live.

### What's deliberately NOT wired (by this phase's own rules)

- **Wallet, Payments, Withdrawals**: schemas and full CRUD service
  layers exist (`services/walletsService.ts`, `paymentsService.ts`,
  `withdrawalsService.ts`) and Firestore collections + security rules
  are defined for them, but `WalletContext`, Add Money, Withdraw, and
  the Admin payment/withdrawal approval screens still run on their
  Phase 4/5 mock data. Wiring them together is a future phase.
- **Referral, Daily Rewards**: untouched, still mock.
- **Cloud Functions / custom claims**: role checks use a
  self-referential Firestore rule (`get()` on the requester's own
  `users/{uid}` doc) instead of custom claims, since Cloud Functions
  are out of scope this phase. This is why Storage rules for
  tournament banners can't yet restrict writes to admins only —
  Storage rules can't read Firestore role data — and currently allow
  any authenticated user to upload a banner. Locking this down
  properly needs a Cloud Function that sets a custom claim on
  promotion to admin.
- **First admin bootstrap**: there's intentionally no "make this user
  an admin" button anywhere in the app (that would let any user grant
  themselves admin). The only way to create the first admin is
  editing Firestore directly, as described above.

### Known limitations of this environment

This was built and statically verified without live network access
to a real Firebase project — no `npm install`, no live
`firebase deploy`, no emulator run. Recommended before shipping:
`npm install`, connect a real (or emulated) Firebase project, run
`npm run build`, and manually test signup → role bootstrap → admin
tournament create → player tournament list, to confirm the live
Firestore round-trip end to end.

---

## Phase 6B — Secure Backend Logic (Cloud Functions)

Adds a real `functions/` package (Node 20, TypeScript, Firebase
Functions v2 + Admin SDK) and wires the previously-mock admin
approve/reject actions and wallet state to it. **No UI/JSX changed —
same buttons, same screens** — only what happens underneath them.

### Setup

1. Install function dependencies and build:
   ```
   cd functions && npm install && npm run build
   ```
2. Deploy functions + updated rules:
   ```
   firebase deploy --only functions,firestore:rules,storage
   ```
3. Local development: `firebase emulators:start` (with
   `VITE_USE_FIREBASE_EMULATORS=true` in the app's `.env`) runs
   everything — Auth, Firestore, Storage, and Functions — locally.

### What's implemented

- **`approvePayment`** / **`rejectPayment`** — admin-only, atomic
  (Firestore transaction). Approving a `deposit` credits the wallet;
  approving an `entryFee` reserves a tournament slot and creates the
  participant record (the "auto-confirm join after payment approval"
  requirement) — both check the request is still `pending` first, so
  it can't be processed twice. Entry-fee approval also checks the
  tournament isn't full and the player hasn't already joined.
- **`approveWithdrawal`** / **`rejectWithdrawal`** — admin-only,
  atomic. Approval re-checks the wallet balance is sufficient before
  debiting (never trusts the balance shown on screen).
- **`joinTournamentWithWallet`** / **`leaveTournament`** — atomic slot
  reservation, duplicate-join prevention, entry-fee deduction/refund.
  These exist as backend capability but **no button calls them yet** —
  the existing manual-UPI-then-admin-approval flow (Phase 4/5) is
  still the only join path in the UI, per "keep manual UPI payment."
- **`creditPrize`** / **`resetWallet`** — admin-only. `resetWallet`
  is what Phase 5's "Reset Wallet (Admin Only)" button now actually
  calls (it couldn't do anything real before — clients can't write to
  `wallets/{uid}` at all). There's still no "declare winner" UI to
  drive `creditPrize` automatically.
- **`syncAdminClaim`** (Firestore trigger) — mirrors `users/{uid}.role`
  into an Auth custom claim, closing the Phase 6A gap where Storage
  rules couldn't verify admin status. A newly-promoted admin needs a
  fresh ID token (re-login, or `getIdToken(true)`) before this takes
  effect — Firestore rules still also check the profile directly as
  a fallback for that window.
- **Immutable ledger** — every function above writes to
  `wallets/{uid}/transactions`, which `firestore.rules` locks to
  read-only for every client, including admins. Only the Admin SDK
  (i.e., these functions) can ever write there.
- **`AdminContext`** now reads `payments`/`withdrawals`/`users` from
  live Firestore instead of mock arrays, and Approve/Reject/Reset
  Wallet call the functions above instead of mutating local state.
  **`WalletContext`** now reads the real wallet balance + immutable
  ledger, merged with the player's own pending/rejected requests, and
  `submitDeposit`/`submitWithdrawal`/`submitTournamentPayment` write
  real Firestore docs instead of local state.

### What's deliberately still mock / unwired

- **Referral, Daily Rewards** — untouched.
- **Notifications** — `AdminNotifications.tsx` (sending) and
  `Notifications.tsx` (player inbox) are still local mock; the
  Firestore/notification service layer from Phase 6A exists but isn't
  driven by these functions.
- **Admin user list enrichment** — `inGameUid` and `matchesPlayed`
  aren't tracked anywhere real yet, so they show placeholder/zero
  values for real (non-mock) users. Everything else on that screen
  (username, email, wallet balance, blocked status, join date) is
  real.
- No mock fallback was added for payments/withdrawals/users (unlike
  tournaments in 6A) — an empty Firestore project shows an honestly
  empty list rather than fake requests an admin could click "Approve"
  on and have it fail confusingly.

### Error handling note

Approve/Reject/Reset actions call these functions fire-and-forget
from the existing buttons (no loading states were added, to avoid
touching any component's JSX). If a call fails — e.g., "already
processed" from a double-click, or "insufficient balance" on a
withdrawal — it's surfaced via a plain `window.alert()` rather than
a styled in-app banner, so the admin isn't left wondering why nothing
happened, without redesigning any screen.

---

## Android APK Build Preparation

This project is configured for Capacitor, but **the native `android/`
project itself was not generated here** — the sandbox this was
prepared in has no network access (can't `npm install` Capacitor's
packages or run `npx cap add android`, which downloads its platform
template from npm) and no Android SDK/Gradle installed (can't build or
verify a Gradle project even if one existed by hand). Rather than
hand-author a Gradle project that can't be tested and risks being
subtly wrong, everything that *can* be reliably prepared without those
things has been — the rest is one script away.

### What's ready now

- **`capacitor.config.ts`** — `appId: "com.ffmaxarena.app"`,
  `appName: "FF MAX ARENA"`, `webDir: "dist"`, `androidScheme: "https"`
  (needed for some Web APIs that expect a secure context, e.g. FCM's
  service worker registration), splash screen config matching the
  existing in-app `Splash.tsx` background color.
- **`package.json`** — `@capacitor/core`, `@capacitor/android`,
  `@capacitor/cli`, `@capacitor/splash-screen`, and `@capacitor/assets`
  (icon/splash density generation) added, plus `android:*` npm script
  shortcuts.
- **`resources/icon.png` + `resources/splash.png`** — generated to
  exactly match the existing app mark already defined in `Splash.tsx`
  and `tailwind.config.js` (same void background `#0A0D12`, same
  orange→orange-deep gradient, same clipped-parallelogram shape, same
  "F" mark) — not a new design, just that same design rendered as the
  raster asset Android requires. `@capacitor/assets` generates every
  density/adaptive-icon variant from these two files.
- **`scripts/setup-android.sh`** — runs everything that needs network
  + Android tooling: `npm install`, `npm run build`, `cap add android`,
  icon/splash generation, `cap sync android`.
- **`.gitignore`** — updated for Android build artifacts.

### What you need to run locally

```
bash scripts/setup-android.sh
```

Prerequisites: Node.js 18+, a Java 17+ JDK, and Android Studio (or the
Android SDK + Gradle on your `PATH`). Then either open the project in
Android Studio (`npx cap open android`) or build from the CLI
(`cd android && ./gradlew assembleDebug`).

### Routing and Firebase inside the WebView

- **Routing**: no code changes were needed. `react-router-dom`'s
  `BrowserRouter` uses `history.pushState`, not full page reloads, so
  Capacitor's local WebView server never has to resolve a nested path
  like `/wallet` as a fresh document request — the app always boots
  from `index.html` and client-side routing takes over from there, the
  same as in a browser.
- **Firebase**: this project uses the Firebase **Web SDK**
  (`firebase/app`, `firebase/auth`, etc.), not the native Android
  Firebase SDK — so there's no `google-services.json` or Google
  Services Gradle plugin to configure. It's plain HTTPS calls from
  inside the WebView, identical to running in a mobile browser. The
  one thing worth checking in the Firebase Console: **Authentication
  → Settings → Authorized domains** should include `localhost` (it
  does by default in new projects) since that's the WebView's origin.

### Known limitation

Because no Gradle/Android SDK is available in this environment, task
9 from the brief ("verify the Android project builds successfully")
could not be performed here — there is nothing to verify yet, since
`android/` doesn't exist until `cap add android` runs with real
network access. Once you run the setup script and share any real
build errors that come up, I can help fix those directly.

---

## Release APK — Cloud Build (GitHub Actions)

This sandbox has no Android SDK, no network access to fetch Gradle or
dependencies, and no real `gradle-wrapper.jar` (a compiled binary —
see the note in `android/gradlew`'s directory). None of that exists
here, so the actual release build has to happen somewhere that has
all three. `.github/workflows/android-release.yml` does exactly that
using GitHub's own runners, which have all of it.

### What's already set up (no app code touched)

- **`android/app/build.gradle`** — a `signingConfigs.release` block
  that reads keystore details from a local `keystore.properties` file
  *or* CI environment variables — never a hardcoded secret. If neither
  is present, the release build type falls back to unsigned rather
  than failing, so early CI runs still surface real compile errors
  instead of a signing error masking everything else.
- **`android/keystore.properties.example`** — template for local
  builds; copy it to `keystore.properties` (already gitignored) and
  fill in real values.
- **`.github/workflows/android-release.yml`** — installs Node + JDK
  17, builds the web app, runs `cap sync android`, regenerates the
  real Gradle wrapper jar (the runner has the network access this
  sandbox doesn't), builds a signed `assembleRelease`, and uploads the
  APK as a downloadable build artifact.

### What you need to do

1. **Generate an upload keystore** (skip if you already have one):
   ```
   keytool -genkeypair -v -keystore ff-max-arena-upload.keystore \
     -alias ff-max-arena -keyalg RSA -keysize 2048 -validity 10000
   ```
   Keep this file and its passwords safe — losing it means you can
   never publish an update to the same app listing again.

2. **Push this project to a GitHub repository** (if it isn't already).

3. **Add these as repository secrets** (Settings → Secrets and
   variables → Actions → New repository secret):
   - `ANDROID_KEYSTORE_BASE64` — run `base64 -i ff-max-arena-upload.keystore`
     and paste the output
   - `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
   - Your six Firebase web config values (`VITE_FIREBASE_API_KEY`, etc.
     — same names as `.env.example`) plus `VITE_FIREBASE_VAPID_KEY`

4. **Run the workflow**: push a tag (`git tag v1.0.0 && git push --tags`)
   or trigger it manually from the Actions tab → "Android Release
   Build" → "Run workflow".

5. **Download the APK** from the finished run's "Artifacts" section
   (`ff-max-arena-release-apk`).

That workflow run is the actual next required step — it's the first
point in this whole process where a real Android SDK, real Gradle,
and real network access are all present together to produce and
verify an actual build.





