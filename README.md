# 🛡️ QuantumShield — AI-Powered Cyber Fraud Protection for India

**The app that protects you *during* the scam, not after.**

QuantumShield detects digital-arrest scams, UPI fraud, phishing, and OTP theft targeting Indian users — and when a scam is detected mid-call, it can instantly alert the victim's family.

---

## 🚨 The Problem

Indians lost **₹2,140+ crore** to digital-arrest scams in 2024. Victims are kept isolated on a video call for hours while scammers impersonate CBI/police officers. By the time anyone finds out, the money is gone.

**QuantumShield breaks that isolation.**

---

## ⭐ Hero Features

1. **AI Call Analyzer** — listens to a live call's speech in real time (on-device speech recognition) and warns the user the moment scam patterns appear.
2. **Circuit Breaker** — when a scam is detected, instantly alerts pre-registered family members' phones via push notification, with the victim's location.
3. **AI Scam Scanner** — paste any suspicious message (English, Hindi, Hinglish, or regional languages) and Gemini-powered AI explains whether it's a scam and why.

## 🔍 Supporting Features

- **URL Checker** — heuristic analysis + Google Safe Browsing (the same threat database Chrome uses)
- **Breach Checker** — real lookups against the XposedOrNot public breach database
- **Spam AI, File Scanner, APK Guardian** — multi-layer threat checks
- **Evidence Vault & Police Reporter** — collect proof and file complaints (1930 / cybercrime.gov.in)
- **Device Health Check** — honest, real browser measurements + guided cleanup (no fake "boosting")
- **Education Center** — curated cyber-safety videos
- **Bilingual throughout** — English + Hindi

---

## 🧠 How Detection Works (honestly)

QuantumShield uses a **two-layer engine**:

1. **Gemini AI (primary)** — a frontier language model analyzes the text with real language understanding. It reads Hindi/Hinglish, sees through deliberate misspellings ("0TP", "k.y.c"), and recognizes *new* scam scripts it has never seen verbatim. Requires a `GEMINI_API_KEY` (server-side).
2. **Rule engine (fallback)** — a deterministic, transparent pattern engine covering known India-specific fraud signals (digital arrest, KYC fraud, remote-access demands). Runs when the AI is unavailable, so the app always answers.

External data sources: Google Safe Browsing (URLs), XposedOrNot (breaches).

We do not publish accuracy percentages because we have not yet run an independent benchmark. When we do, the methodology will be published here.

---

## 🛡️ Privacy

- **No account required** — anonymous usage
- **Scans are ephemeral** — analyzed in memory, never stored on our servers
- **Breach checks** query the public XposedOrNot API; your email is not stored by QuantumShield
- **Analytics** — privacy-first, cookieless Vercel Analytics (aggregate page counts only, no personal tracking)

---

## 💻 Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI:** Google Gemini API (server-side), Web Speech API (on-device, for live call analysis)
- **Threat data:** Google Safe Browsing v4, XposedOrNot
- **Family alerts:** Firebase Cloud Messaging (Mumbai region)
- **Mobile:** Capacitor (Android)
- **Deployment:** Vercel

---

## 📦 Quick Start

```bash
git clone https://github.com/im786fareed/Quantumshield.git
cd quantumshield
npm install

# Optional but recommended — enables the real AI engine:
#   GEMINI_API_KEY=...                  (aistudio.google.com)
#   GOOGLE_SAFE_BROWSING_KEY=...        (Google Cloud Console, free)
# Put these in .env.local for local dev, or in Vercel → Settings → Environment Variables.

npm run dev      # http://localhost:3000
npm run build    # production build
```

Without the keys, the app still works fully — it uses the rule engine and heuristics.

---

## 📞 Report Cybercrime (India)

📞 **Call 1930** — National Cybercrime Helpline (24/7)
🌐 **[cybercrime.gov.in](https://cybercrime.gov.in)**

*QuantumShield is a protection and awareness tool. For financial or legal decisions, always verify independently.*

---

## 👨‍💻 Author

**Fareed Shaik** — [@im786fareed](https://github.com/im786fareed)

*Mission: protect 1.4 billion Indians from cyber fraud — one call at a time.*

## 📄 License

MIT
