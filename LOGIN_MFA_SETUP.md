# QuantumShield — Switching On Login + 2-Step Verification (MFA)

Everything in the app is already built and waiting. Login (and MFA on top of it)
turns on automatically once you complete these console steps. Until then the
site stays fully open, exactly as it is today — nothing breaks.

---

## Part 1 — Connect your Firebase project (turns login ON)

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. If you already created the `QuantumShield` project (for Circuit Breaker),
   open it. Otherwise **Add project** → name it `QuantumShield` → Analytics off is fine.
3. On the project home page, click the **`</>` (Web)** icon → nickname
   `QuantumShield Web` → **Register app**. Firebase shows a block of code with
   six values — keep that page open.
4. Copy each value into `.env.local` in the project folder (the names match):

   | Firebase shows | Goes into |
   |---|---|
   | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

5. Add the same six values in **Vercel** → project `quantumshield` →
   Settings → Environment Variables (Production + Preview), then redeploy.
6. In Firebase: **Authentication → Get started**, then under
   **Sign-in method** enable:
   - **Google** (one click)
   - **Email/Password** (one click)
   - **Phone** — only if you enable billing (see Part 3)
7. Still in Authentication → **Settings → Authorized domains** → add
   `quantumshield.in`.

**That's it — the login wall activates by itself** as soon as the keys are
present. Test locally first (restart `npm run dev`), then on the live site.

> ⚠️ The Privacy Policy has an "Accounts not yet enabled" clause. When you
> flip login on, tell Claude — the policy needs its promised update at the
> same time.

---

## Part 2 — Turn on 2-step verification (MFA)

MFA needs one free upgrade in the console:

1. In Firebase **Authentication → Sign-in method**, scroll to the bottom:
   **"Upgrade to Firebase Authentication with Identity Platform"** → Upgrade.
   (Free tier is generous; nothing to pay at your scale.)
2. Then **Authentication → Settings → Multi-factor authentication**:
   - Enable **Authenticator app (TOTP)** ← recommended, completely free
   - Enable **SMS** only if you enable billing (Part 3)

Once enabled, every signed-in user gets a **2-step verification** section on
the app's **Account & Security** page (header → account menu):
- **Authenticator app**: scan a QR with Google Authenticator, enter the
  6-digit code, done. Sign-in then always asks for the current code.
- Users must have a **verified email** first — the page walks them through it.

---

## Part 3 — SMS codes (optional, costs money)

Phone-number sign-in AND SMS 2-step codes both require the **Blaze
(pay-as-you-go)** billing plan, because Google charges per SMS (~₹0.6–2 each).
The authenticator app option avoids this entirely — that's why the app marks
it "recommended".

If you want SMS anyway: Firebase console → bottom-left **Upgrade** → Blaze →
add a card. Then enable **Phone** in sign-in methods and **SMS** under
multi-factor authentication.

---

## What's already handled in the app (no action needed)

- Login screen: Google, Apple, email/password, phone OTP
- Second-step challenge during sign-in (authenticator code or SMS)
- Account & Security page: enroll/remove authenticator app or SMS,
  email-verification helper
- Security headers (CSP) already allow Google reCAPTCHA, which Firebase
  uses for anything SMS-related
- If a method isn't enabled in the console yet, the app shows an honest
  "not enabled yet in Firebase" message — it never breaks
