/* =========================================================
   QuantumShield – Firebase initialisation (client-side)

   Reads config from NEXT_PUBLIC_FIREBASE_* environment variables.
   These are PUBLIC by design (Firebase web config is not a secret —
   security is enforced by Firebase Auth rules, not by hiding the keys).

   When the env vars are absent, `isAuthConfigured` is false and the app
   stays fully open (no login wall) so the live site is never broken
   before you connect your Firebase project. Once the keys are present,
   the AuthGate enforces login.
   ========================================================= */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// True only when the minimum required config is present.
export const isAuthConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/** Returns the Firebase Auth instance, or null when not configured. */
export function getFirebaseAuth(): Auth | null {
  if (!isAuthConfigured) return null;
  if (!authInstance) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return authInstance;
}
