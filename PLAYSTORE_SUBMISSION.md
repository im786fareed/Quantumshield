# QuantumShield — Google Play Store Submission Guide

## App Details
- **Package ID:** `com.quantumshield.app`
- **Version:** 1.1 (versionCode 2)
- **Min Android:** 7.0 (API 24)
- **Target Android:** 15 (API 36)

---

## STEP 1 — Generate Release Keystore

> Do this ONCE. Store the `.jks` file safely (Google Drive / password manager). If you lose it, you can NEVER update the app.

```bash
# Run from android/ folder
keytool -genkey -v \
  -keystore quantumshield-release.jks \
  -alias quantumshield \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=QuantumShield, OU=Security, O=QuantumShield, L=New Delhi, S=Delhi, C=IN"
```

You'll be prompted for:
- **Store password** → choose a strong password, save it
- **Key password** → can be same as store password

---

## STEP 2 — Create keystore.properties

Copy `android/keystore.properties.example` → `android/keystore.properties`

```properties
storeFile=quantumshield-release.jks
storePassword=<your_store_password>
keyAlias=quantumshield
keyPassword=<your_key_password>
```

⚠️ `keystore.properties` is in `.gitignore` — never commit it.

---

## STEP 3 — Build Release AAB

```bash
# From project root
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

> Use **AAB** (not APK) for Play Store. Google requires AAB since August 2021.

---

## STEP 4 — Create Play Console Account

1. Go to https://play.google.com/console
2. Pay one-time $25 registration fee
3. Complete developer profile (India address, PAN/GST optional)

---

## STEP 5 — Create App in Play Console

1. Click **Create app**
2. Fill in:
   - **App name:** `QuantumShield — Cyber Safety`
   - **Default language:** `English (India)`
   - **App or Game:** App
   - **Free or Paid:** Free
3. Accept policies → Create

---

## STEP 6 — Store Listing (copy-paste ready)

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

🔍 SCAM SCANNER
Scan QR codes, links, and UPI IDs for fraud before you pay or click.

💳 UPI GUARD
Instantly checks UPI VPAs for red flags — fake Paytm support IDs,
lottery scams, fake government portals.

🎓 CYBER EDUCATION (48 Videos)
Learn to identify and avoid: Digital Arrest, Phone Scams, WhatsApp Fraud,
Investment Scams, KYC Fraud, Romance Scams, and more — in Hindi & English.

📰 LIVE FRAUD NEWS
Real-time cybercrime news from I4C/MHA, CBI, and verified Indian sources.
No fake stats — only verified data.

🆘 EMERGENCY RESPONSE
One-tap access to: Cyber Crime Helpline 1930, cybercrime.gov.in,
Digital Arrest emergency guide, FIR checklist.

🔒 ENCRYPTION TOOLKIT
Secure your files and communications. Evidence collection for FIR filing.

⚖️ CYBER LEGAL AID
Know your rights under IT Act, Article 20(3), Article 22.
Step-by-step digital arrest response guide.

📊 REAL STATS (I4C Annual Report 2025):
• 28.15 Lakh cybercrime complaints in India
• ₹22,495 Crore lost to cybercriminals
• ₹8,189 Crore recovered by law enforcement

QuantumShield is a free, privacy-first app. No ads. No data collection.
Built in India, for India.

For support: info@quantumshield.in
Website: https://quantumshield.in
```

---

## STEP 7 — App Category & Tags

- **Category:** Tools
- **Tags:** cybersecurity, scam detector, fraud protection, UPI safety, digital arrest

---

## STEP 8 — Content Rating

In Play Console → Content Rating:
- Answer questionnaire
- Select: **Utilities / Productivity** type app
- No violence, no user-generated content
- Expected rating: **Everyone**

---

## STEP 9 — Data Safety Form

| Data Type | Collected? | Shared? | Purpose |
|-----------|-----------|---------|---------|
| Microphone audio | No (processed on-device) | No | Call analysis is fully local |
| Device info | No | No | — |
| Location | No | No | — |
| Contacts | No | No | — |

✅ No personal data collected or shared.
✅ No data sold to third parties.

---

## STEP 10 — Privacy Policy URL

Use your existing: **https://quantumshield.in/privacy**

(Already live as a page in the app)

---

## STEP 11 — Required Graphics Assets

| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 512×512 PNG | No alpha/transparency |
| Feature Graphic | 1024×500 PNG | Banner shown at top of listing |
| Phone Screenshots | 2+ (min 1080×1920) | At least 2 required |
| 7-inch Tablet (optional) | 1200×1920 | Recommended |
| 10-inch Tablet (optional) | 1600×2560 | Optional |

### Quick screenshot guide:
1. Open Chrome on Android → go to https://quantumshield.in
2. Take screenshots of: Homepage, Call Analyzer, Education, UPI Guard, News
3. Or use Android Studio Emulator → Device Manager → take screenshots

---

## STEP 12 — Upload & Review

1. Play Console → Release → Production → Create new release
2. Upload `app-release.aab`
3. Fill release notes:
   ```
   Version 1.1 — March 2026
   • AI Call Analyzer with Hinglish / MTI support
   • 48 cybercrime education videos
   • Real-time fraud news (verified I4C/MHA sources)
   • UPI Guard — scan VPAs for fraud risk
   • Cyber Legal Aid — digital arrest emergency guide
   • System Tune-Up & Device Scanner
   ```
4. Submit for review
5. Review typically takes **3–7 business days** for new apps

---

## STEP 13 — Post-Launch

- Set up **Play App Signing** (Google manages your key after first upload)
- Enable **pre-registration** if you want early sign-ups
- Monitor **Android Vitals** for crash rates
- Reply to reviews within 24h

---

## Build Commands Reference

```bash
# Debug APK (for testing on your phone)
cd android && ./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Release AAB (for Play Store)
cd android && ./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab

# Release APK (for direct distribution / testing)
cd android && ./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

---

## Checklist Before Submitting

- [ ] Keystore `.jks` file created and **backed up securely**
- [ ] `keystore.properties` filled in (NOT committed to git)
- [ ] Release AAB builds successfully with `./gradlew bundleRelease`
- [ ] App tested on real Android device or emulator
- [ ] Privacy policy at https://quantumshield.in/privacy is live
- [ ] Play Console account created ($25 fee paid)
- [ ] App icon 512×512 PNG ready
- [ ] Feature graphic 1024×500 PNG ready
- [ ] At least 2 phone screenshots ready
- [ ] Short + full description written
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled (no data collected)
