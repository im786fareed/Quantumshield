# QuantumShield — Google Play Store Submission Guide

## App Details
- **Package ID:** `in.quantumshield.app`
- **Version:** 1.1 (versionCode 2)
- **Min Android:** 7.0 (API 24)
- **Target Android:** 15 (API 36)
- **Live URL (APK loads from):** `https://quantumguard.vercel.app`

---

## HOW THE BUILD WORKS

You do **NOT** need Android Studio installed on your computer.

Every time you push code to GitHub, the **GitHub Actions** pipeline
automatically builds a signed `.aab` (Play Store bundle) and `.apk` (test file).
You just download the file from GitHub and upload it to Play Console.

---

## STEP 1 — Add 3 GitHub Secrets (do this once)

These secrets let GitHub Actions sign the APK with your keystore.

1. Go to: **https://github.com/im786fareed/Quantumshield/settings/secrets/actions**
2. Click **"New repository secret"** and add these 3 secrets:

| Secret name | Value |
|---|---|
| `KEYSTORE_BASE64` | *(copy the entire contents of `android/keystore-base64.txt`)* |
| `KEYSTORE_STORE_PASSWORD` | `Bnk135231$1` |
| `KEYSTORE_KEY_PASSWORD` | `Bnk135231$1` |

> ⚠️ **Save these passwords somewhere safe** (password manager, Google Drive note).
> If you lose them AND the `.jks` file, you can NEVER update the app on Play Store.

---

## STEP 2 — Get your AAB file

After pushing any code to GitHub:

1. Go to: **https://github.com/im786fareed/Quantumshield/actions**
2. Click the latest **"Android Release Build"** run
3. Scroll to the bottom → **Artifacts** section
4. Download **`QuantumShield-vXX.aab`**

That file is your signed Play Store bundle, ready to upload.

---

## STEP 3 — Create Play Console Account (one-time, $25)

1. Go to: **https://play.google.com/console**
2. Sign in with your Google account
3. Pay the **$25 USD one-time registration fee**
4. Fill in your developer name: `QuantumShield Security`
5. Complete the developer profile

---

## STEP 4 — Create the App in Play Console

1. Click **"Create app"**
2. Fill in:
   - **App name:** `QuantumShield — Cyber Safety`
   - **Default language:** `English (India)`
   - **App or Game:** App
   - **Free or Paid:** Free
3. Accept developer policies → **Create**

---

## STEP 5 — Store Listing (copy-paste ready)

### Short Description (80 chars max)
```
India's AI-powered scam detector. Stop fraud calls & UPI scams instantly.
```

### Full Description (4000 chars max)
```
QuantumShield is India's most comprehensive cybercrime defence app — built
for everyday users, seniors, and professionals who face digital fraud daily.

🛡️ WHAT QUANTUMSHIELD DOES:

📞 AI CALL ANALYZER
Real-time scam detection during calls. Speaks Hinglish. Catches digital
arrest frauds, fake police calls, OTP requests, and KYC scams as they happen.

📱 PHONE NUMBER GUARD
Instantly checks any phone number for scam patterns — TRAI 140xxx telemarketer
series, VoIP numbers, spoofed international numbers, repeated-digit traps.

🔍 URL & LINK CHECKER
Scan any link before you click. Detects phishing sites, fake banking portals,
and malware download pages using multi-layer AI analysis.

🦠 APK GUARDIAN
Scan Android APK files before installing. Detects malware permissions, spyware
patterns, and fake app signatures.

💳 UPI GUARD
Instantly checks UPI VPAs for red flags — fake Paytm support IDs,
lottery scams, fake government portals.

🎓 CYBER EDUCATION (48 Videos)
Learn to identify and avoid: Digital Arrest, Phone Scams, WhatsApp Fraud,
Investment Scams, KYC Fraud, Romance Scams — in Hindi & English.

📰 LIVE FRAUD NEWS
Real-time cybercrime news from I4C/MHA, CBI, and verified Indian sources.

🆘 EMERGENCY RESPONSE
One-tap: Cyber Crime Helpline 1930, cybercrime.gov.in, Digital Arrest guide.

🔒 EVIDENCE VAULT
Record and securely store video evidence on your device for FIR filing.
Zero cloud storage — everything stays on YOUR phone.

⚖️ CYBER LEGAL AID
Know your rights under IT Act, Article 20(3), Article 22.
Step-by-step digital arrest response guide.

📊 REAL STATS (I4C Annual Report 2025):
• 28.15 Lakh cybercrime complaints in India
• ₹22,495 Crore lost to cybercriminals
• ₹8,189 Crore recovered by law enforcement

QuantumShield is a free, privacy-first app. No ads. No data sold.
Built in India, for India.

Website: https://quantumguard.vercel.app
Support: quantumshield4india@gmail.com
```

---

## STEP 6 — App Category & Tags

- **Category:** Tools
- **Tags:** cybersecurity, scam detector, fraud protection, UPI safety, digital arrest

---

## STEP 7 — Content Rating Questionnaire

In Play Console → **Policy → App content → Content ratings**:
- Select app type: **Utilities / Productivity**
- No violence, no user-generated content, no gambling
- Expected rating: **Everyone**

---

## STEP 8 — Data Safety Form

| Data Type | Collected? | Shared? | Purpose |
|-----------|-----------|---------|---------|
| Microphone audio | No | No | Processed 100% on-device |
| Camera | No | No | Only used for local recording |
| Device storage | No | No | Evidence saved locally only |
| Location | No | No | Not used |
| Contacts | No | No | Not used |

✅ **No personal data collected or shared.**  
✅ **No data sold to third parties.**  
✅ **No tracking or analytics on user behaviour.**

---

## STEP 9 — Privacy Policy URL

Use: **https://quantumguard.vercel.app/privacy**

(Already live as a page in the app)

---

## STEP 10 — Required Graphics Assets

| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 512×512 PNG | No transparency (solid background) |
| Feature Graphic | 1024×500 PNG | Banner at top of store listing |
| Phone Screenshots | At least 2 | Min 1080×1920 |

### Quick screenshot guide:
1. Open Chrome on Android → go to `https://quantumguard.vercel.app`
2. Take screenshots of: Homepage, Call Analyzer, Phone Guard, Education page
3. Or use any Android emulator → take screenshots there

---

## STEP 11 — Upload AAB and Submit

1. Play Console → **Release → Production → Create new release**
2. Upload the `.aab` file you downloaded from GitHub Actions
3. Fill in release notes:
   ```
   Version 1.1 — 2026
   • AI Call Analyzer with Hinglish support
   • Phone Number Guard — India-specific scam detection
   • 48 cybercrime education videos
   • UPI Guard, URL Checker, APK Guardian
   • Evidence Vault — record & store video locally
   • Real-time fraud news (verified I4C/MHA sources)
   • Cyber Legal Aid — digital arrest emergency guide
   ```
4. Click **"Save and review"** → **"Start rollout to Production"**
5. Review typically takes **3–7 business days** for new apps

---

## STEP 12 — After Approval

- Enable **Play App Signing** (Google manages your key going forward)
- Monitor **Android Vitals** for any crash reports
- Reply to reviews within 24h (affects ranking)
- To publish an update: push code → GitHub Actions builds new AAB → upload to Play Console → submit new release

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `android/quantumshield-release.jks` | Signing keystore (**back this up!**) |
| `android/keystore-base64.txt` | Base64 version for GitHub Secrets |
| `android/keystore.properties` | Local signing config (gitignored) |
| `capacitor.config.ts` | Capacitor settings (app ID, live URL) |
| `.github/workflows/android-release.yml` | Auto-build pipeline |

## Build Commands (if you install Android Studio locally later)

```bash
# Release AAB (for Play Store)
cd android && ./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab

# Release APK (for direct testing)
cd android && ./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Debug APK (for development testing)
cd android && ./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```
