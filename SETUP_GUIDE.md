# QuantumShield — Go-Live Setup Guide
## From Code to Play Store in 4 Steps

---

## Step 1 — Generate Your Signing Keystore (One-Time)

> **Required ONCE.** This is your identity on the Play Store. Never lose it.

1. Install **Android Studio**: https://developer.android.com/studio
2. Run the keystore script:
   ```
   scripts\generate-keystore.ps1   (double-click or run in PowerShell)
   ```
3. It creates:
   - `android/quantumshield-release.jks` — your signing key (KEEP SECRET, BACK UP)
   - `android/keystore.properties` — passwords (KEEP SECRET, never commit)
   - `android/keystore-base64.txt` — base64 string for GitHub Secret

---

## Step 2 — Set Up Firebase (Free — for Circuit Breaker FCM alerts)

1. Go to https://console.firebase.google.com → **Add project** → Name: `QuantumShield`
2. In the project: **Add Android app**
   - Package name: `com.quantumshield.app`
   - App nickname: `QuantumShield Android`
3. Download `google-services.json` → place it in `android/app/google-services.json`
4. Enable **Cloud Messaging** in Firebase Console → Project Settings → Cloud Messaging
5. Deploy the Cloud Function:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions   # select existing project: QuantumShield
   firebase deploy --only functions
   ```
6. Copy your Cloud Function URL and update `CircuitBreakerService.kt`:
   ```kotlin
   // Uncomment the okhttp block and replace YOUR_REGION-YOUR_PROJECT with:
   .url("https://asia-south1-YOUR_PROJECT_ID.cloudfunctions.net/relayDistressSignal")
   ```

---

## Step 3 — Add GitHub Secrets (Powers the Auto-Build)

Go to: **GitHub → im786fareed/Quantumshield → Settings → Secrets and variables → Actions**

Add these 7 secrets:

| Secret Name | Value | Where to get |
|---|---|---|
| `KEYSTORE_BASE64` | Content of `android/keystore-base64.txt` | Step 1 script |
| `KEYSTORE_PASSWORD` | Your keystore password | Step 1 |
| `KEY_ALIAS` | `quantumshield` | Fixed value |
| `KEY_PASSWORD` | Your key password | Step 1 |
| `GOOGLE_SERVICES_JSON` | Full content of `google-services.json` | Step 2 |
| `GEMINI_API_KEY` | Your Gemini API key | Google AI Studio |
| `NEWS_API_KEY` | Your News API key | newsapi.org |

---

## Step 4 — Trigger the Build & Submit to Play Store

### Auto-build (GitHub Actions):
Every push to `main` automatically builds a signed AAB + APK.

1. Push any change → GitHub Actions runs (~8 min)
2. Go to **Actions** tab → download `QuantumShield-release-N.aab`

### Submit to Play Store:
1. Go to https://play.google.com/console
2. Create app → Package: `com.quantumshield.app`
3. **Production → Create new release → Upload AAB**
4. Fill in store listing (see `PLAYSTORE_SUBMISSION.md` for all copy)
5. Submit for review (~3–7 days)

---

## App Details

| Field | Value |
|---|---|
| Package Name | `com.quantumshield.app` |
| Version | 1.2 (versionCode 3) |
| Min Android | 7.0 (API 24) |
| Target Android | Android 15 (API 36) |
| Category | Tools / Safety |
| Privacy Policy | https://quantumshield.in/privacy |

---

## Circuit Breaker — User Onboarding Flow (In-App)

When users first open the app, guide them to:
1. **Safety Circle** → Add 3 emergency contacts (WhatsApp numbers)
2. **Activate Guardian** → Toggle in Circuit Breaker
3. **Grant Notification Access** → Settings → Apps → Special App Access → Notification Access → QuantumShield ✓
4. **Test Alert** → Send a test WhatsApp message to confirm it works

---

## Live URLs

| Service | URL |
|---|---|
| Web App | https://quantumshield.in |
| Circuit Breaker | https://quantumshield.in/circuit-breaker |
| GitHub | https://github.com/im786fareed/Quantumshield |
| Privacy Policy | https://quantumshield.in/privacy |
| Cybercrime Helpline | 1930 |
