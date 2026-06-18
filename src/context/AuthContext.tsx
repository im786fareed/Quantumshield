'use client';
/* =========================================================
   QuantumShield – Auth context (client-side)
   Wraps the app, tracks the signed-in user, and exposes the
   sign-in / sign-out actions used by the login screen.
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // When not configured we are not "loading" — we resolve immediately to
  // "no auth" so the gate lets everyone through.
  const [loading, setLoading] = useState(isAuthConfigured);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const signInWithApple = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInWithPopup(auth, new OAuthProvider('apple.com'));
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

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
