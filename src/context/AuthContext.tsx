'use client';
/* =========================================================
   QuantumShield – Auth context (client-side)
   Wraps the app, tracks the signed-in user, and exposes the
   sign-in / sign-out actions used by the login screen, plus
   full multi-factor (2-step verification) support:

     • Sign-in: when Firebase answers "multi-factor required",
       the resolver is stored here and the login screen shows
       the second-step challenge (authenticator code or SMS).
     • Enrollment: signed-in users can add an authenticator
       app (TOTP) or an SMS number as a second factor from the
       Account & Security page, or remove one.

   MFA needs the Firebase project upgraded to Identity Platform
   (free tier) — until then enrollment calls fail with
   auth/operation-not-allowed, which the UI explains honestly.
   Safe no-op when Firebase is not configured.
   ========================================================= */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  multiFactor,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  type TotpSecret,
  type MultiFactorResolver,
  type MultiFactorInfo,
  type MultiFactorError,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth, isAuthConfigured } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPhoneCode: (phoneE164: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;

  /* ── Multi-factor: second step during sign-in ── */
  /** Non-null while a sign-in is waiting for its second factor. */
  mfaResolver: MultiFactorResolver | null;
  /** Abandon the pending second-factor challenge. */
  cancelMfa: () => void;
  /** Complete sign-in with a 6-digit authenticator-app code. */
  resolveTotpSignIn: (factorUid: string, code: string) => Promise<void>;
  /** Send the SMS for a phone second factor; returns a verificationId. */
  sendMfaSms: (hint: MultiFactorInfo, recaptchaContainerId: string) => Promise<string>;
  /** Complete sign-in with the SMS code. */
  resolveSmsSignIn: (verificationId: string, code: string) => Promise<void>;

  /* ── Multi-factor: enrollment (signed-in users) ── */
  /** Currently enrolled second factors of the signed-in user. */
  getEnrolledFactors: () => MultiFactorInfo[];
  /** Re-reads the user from Firebase (e.g. after e-mail verification). */
  reloadUser: () => Promise<void>;
  sendVerifyEmail: () => Promise<void>;
  /** Begin authenticator-app enrollment → shared secret + otpauth QR URI. */
  startTotpEnrollment: () => Promise<{ secret: TotpSecret; uri: string }>;
  /** Confirm the first code from the authenticator app. */
  finishTotpEnrollment: (secret: TotpSecret, code: string) => Promise<void>;
  /** Begin SMS enrollment; returns a verificationId. */
  startSmsEnrollment: (phoneE164: string, recaptchaContainerId: string) => Promise<string>;
  /** Confirm the SMS code to finish enrollment. */
  finishSmsEnrollment: (verificationId: string, code: string) => Promise<void>;
  /** Remove a second factor. */
  unenrollFactor: (factorUid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** True when a thrown sign-in error means "now do the second step". */
function isMfaRequired(e: unknown): e is MultiFactorError {
  return Boolean((e as { code?: string })?.code === 'auth/multi-factor-auth-required');
}

/* Firebase's RecaptchaVerifier renders into a DOM node and errors if
   reused; make one per operation and always clean it up. */
async function withRecaptcha<T>(
  containerId: string,
  fn: (verifier: RecaptchaVerifier) => Promise<T>
): Promise<T> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Auth not configured');
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  try {
    return await fn(verifier);
  } finally {
    try { verifier.clear(); } catch { /* already gone */ }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // When not configured we are not "loading" — we resolve immediately to
  // "no auth" so the gate lets everyone through.
  const [loading, setLoading] = useState(isAuthConfigured);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* Wraps a first-step sign-in: when Firebase demands the second factor,
     store the resolver (the login screen switches to the challenge)
     instead of surfacing it as an error. */
  const withMfaCatch = useCallback(async (fn: () => Promise<unknown>) => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    try {
      await fn();
    } catch (e) {
      if (isMfaRequired(e)) {
        setMfaResolver(getMultiFactorResolver(auth, e));
        return;
      }
      throw e;
    }
  }, []);

  const signInWithGoogle = useCallback(
    () => withMfaCatch(() => signInWithPopup(getFirebaseAuth()!, new GoogleAuthProvider())),
    [withMfaCatch]
  );

  const signInWithApple = useCallback(
    () => withMfaCatch(() => signInWithPopup(getFirebaseAuth()!, new OAuthProvider('apple.com'))),
    [withMfaCatch]
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string) =>
      withMfaCatch(() => createUserWithEmailAndPassword(getFirebaseAuth()!, email, password)),
    [withMfaCatch]
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      withMfaCatch(() => signInWithEmailAndPassword(getFirebaseAuth()!, email, password)),
    [withMfaCatch]
  );

  const sendPhoneCode = useCallback(async (phoneE164: string, recaptchaContainerId: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not configured');
    // Firebase requires a reCAPTCHA verifier for phone auth.
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
    return signInWithPhoneNumber(auth, phoneE164, verifier);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  /* ── second step during sign-in ── */

  const cancelMfa = useCallback(() => setMfaResolver(null), []);

  const resolveTotpSignIn = useCallback(async (factorUid: string, code: string) => {
    if (!mfaResolver) throw new Error('No pending second-factor challenge');
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(factorUid, code.trim());
    await mfaResolver.resolveSignIn(assertion);
    setMfaResolver(null);
  }, [mfaResolver]);

  const sendMfaSms = useCallback(async (hint: MultiFactorInfo, recaptchaContainerId: string) => {
    if (!mfaResolver) throw new Error('No pending second-factor challenge');
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not configured');
    return withRecaptcha(recaptchaContainerId, (verifier) =>
      new PhoneAuthProvider(auth).verifyPhoneNumber(
        { multiFactorHint: hint, session: mfaResolver.session },
        verifier
      )
    );
  }, [mfaResolver]);

  const resolveSmsSignIn = useCallback(async (verificationId: string, code: string) => {
    if (!mfaResolver) throw new Error('No pending second-factor challenge');
    const cred = PhoneAuthProvider.credential(verificationId, code.trim());
    const assertion = PhoneMultiFactorGenerator.assertion(cred);
    await mfaResolver.resolveSignIn(assertion);
    setMfaResolver(null);
  }, [mfaResolver]);

  /* ── enrollment (signed-in users) ── */

  const getEnrolledFactors = useCallback((): MultiFactorInfo[] => {
    if (!user) return [];
    try { return multiFactor(user).enrolledFactors; } catch { return []; }
  }, [user]);

  const reloadUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return;
    await auth.currentUser.reload();
    // onAuthStateChanged doesn't fire on reload — refresh our copy.
    setUser(auth.currentUser);
  }, []);

  const sendVerifyEmail = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) throw new Error('Not signed in');
    await sendEmailVerification(auth.currentUser);
  }, []);

  const startTotpEnrollment = useCallback(async () => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!current) throw new Error('Not signed in');
    const session = await multiFactor(current).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    const account = current.email || current.phoneNumber || 'QuantumShield user';
    const uri = secret.generateQrCodeUrl(account, 'QuantumShield');
    return { secret, uri };
  }, []);

  const finishTotpEnrollment = useCallback(async (secret: TotpSecret, code: string) => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!current) throw new Error('Not signed in');
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code.trim());
    await multiFactor(current).enroll(assertion, 'Authenticator app');
    await reloadUser();
  }, [reloadUser]);

  const startSmsEnrollment = useCallback(async (phoneE164: string, recaptchaContainerId: string) => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!auth || !current) throw new Error('Not signed in');
    const session = await multiFactor(current).getSession();
    return withRecaptcha(recaptchaContainerId, (verifier) =>
      new PhoneAuthProvider(auth).verifyPhoneNumber(
        { phoneNumber: phoneE164.trim(), session },
        verifier
      )
    );
  }, []);

  const finishSmsEnrollment = useCallback(async (verificationId: string, code: string) => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!current) throw new Error('Not signed in');
    const cred = PhoneAuthProvider.credential(verificationId, code.trim());
    await multiFactor(current).enroll(PhoneMultiFactorGenerator.assertion(cred), 'SMS code');
    await reloadUser();
  }, [reloadUser]);

  const unenrollFactor = useCallback(async (factorUid: string) => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!current) throw new Error('Not signed in');
    await multiFactor(current).unenroll(factorUid);
    await reloadUser();
  }, [reloadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isAuthConfigured,
        signInWithGoogle,
        signInWithApple,
        signUpWithEmail,
        signInWithEmail,
        sendPhoneCode,
        signOut,
        mfaResolver,
        cancelMfa,
        resolveTotpSignIn,
        sendMfaSms,
        resolveSmsSignIn,
        getEnrolledFactors,
        reloadUser,
        sendVerifyEmail,
        startTotpEnrollment,
        finishTotpEnrollment,
        startSmsEnrollment,
        finishSmsEnrollment,
        unenrollFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
