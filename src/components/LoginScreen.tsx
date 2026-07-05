'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Phone, Loader2, AlertTriangle, ArrowRight, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { ConfirmationResult, MultiFactorInfo } from 'firebase/auth';

/** Turns Firebase's cryptic error codes into plain, friendly messages. */
export function friendlyError(e: any): string {
  const code = e?.code || '';
  if (code.includes('popup-closed')) return 'Sign-in window was closed before finishing.';
  if (code.includes('invalid-email')) return 'That email address doesn’t look right.';
  if (code.includes('email-already-in-use')) return 'An account already exists with this email — try signing in instead.';
  if (code.includes('weak-password')) return 'Please choose a stronger password (at least 6 characters).';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Wrong email or password.';
  if (code.includes('user-not-found')) return 'No account found with this email — try creating one.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a moment and try again.';
  if (code.includes('unverified-email')) return 'Please verify your email first — check your inbox for the verification link, then try again.';
  if (code.includes('second-factor-already-in-use')) return 'That second step is already set up on this account.';
  if (code.includes('maximum-second-factor-count-exceeded')) return 'You’ve reached the maximum number of second steps for this account.';
  if (code.includes('multi-factor-info-not-found')) return 'That second step was removed. Sign in again to continue.';
  if (code.includes('invalid-multi-factor-session')) return 'This session expired. Please sign in again.';
  if (code.includes('operation-not-allowed')) return 'This method isn’t enabled yet in Firebase (see the setup guide).';
  if (code.includes('invalid-phone-number')) return 'Please enter a valid phone number with country code (e.g. +91…).';
  if (code.includes('invalid-verification-code')) return 'That code is incorrect. Please re-check and try again.';
  return e?.message || 'Something went wrong. Please try again.';
}

/* ── Second step (2-step verification) challenge shown when the
      first sign-in step succeeded but the account has MFA on. ── */
function MfaChallenge() {
  const auth = useAuth();
  const hints = auth.mfaResolver?.hints ?? [];
  const [selected, setSelected] = useState<MultiFactorInfo | null>(hints.length === 1 ? hints[0] : null);
  const [code, setCode] = useState('');
  const [smsVerificationId, setSmsVerificationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isTotp = selected?.factorId === 'totp';
  const isPhone = selected?.factorId === 'phone';

  const run = async (fn: () => Promise<void>) => {
    setError(''); setBusy(true);
    try { await fn(); }
    catch (e) { setError(friendlyError(e)); }
    finally { setBusy(false); }
  };

  const sendSms = () =>
    run(async () => {
      if (!selected) return;
      setSmsVerificationId(await auth.sendMfaSms(selected, 'mfa-recaptcha-container'));
    });

  const verify = () =>
    run(async () => {
      if (!selected) return;
      if (isTotp) await auth.resolveTotpSignIn(selected.uid, code);
      else if (smsVerificationId) await auth.resolveSmsSignIn(smsVerificationId, code);
    });

  const btn = 'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-sm transition disabled:opacity-60';
  const input = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-indigo-300">
        <KeyRound className="w-5 h-5" />
        <h2 className="font-bold text-sm">Two-step verification</h2>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        Your password was correct. This account is protected with a second step — confirm it’s really you.
      </p>

      {!selected && (
        <div className="space-y-2">
          {hints.map((h) => (
            <button key={h.uid} onClick={() => { setSelected(h); setError(''); }}
              className={`${btn} bg-slate-800 border border-slate-700 hover:bg-slate-700 justify-start`}>
              {h.factorId === 'totp' ? <KeyRound className="w-4 h-4 text-indigo-300" /> : <Smartphone className="w-4 h-4 text-indigo-300" />}
              {h.displayName || (h.factorId === 'totp' ? 'Authenticator app' : 'SMS code')}
            </button>
          ))}
        </div>
      )}

      {isTotp && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Enter the 6-digit code from your authenticator app.</p>
          <input className={input} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code"
            value={code} onChange={e => setCode(e.target.value)} />
          <button onClick={verify} disabled={busy || code.trim().length < 6} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Verify &amp; sign in
          </button>
        </div>
      )}

      {isPhone && (
        <div className="space-y-3">
          {!smsVerificationId ? (
            <button onClick={sendSms} disabled={busy} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              Send code to {selected?.displayName || 'your phone'}
            </button>
          ) : (
            <>
              <p className="text-xs text-slate-400">Enter the 6-digit code we sent by SMS.</p>
              <input className={input} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code"
                value={code} onChange={e => setCode(e.target.value)} />
              <button onClick={verify} disabled={busy || code.trim().length < 6} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Verify &amp; sign in
              </button>
            </>
          )}
          <div id="mfa-recaptcha-container" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      <button onClick={auth.cancelMfa} className="w-full text-xs text-slate-500 hover:text-slate-300 py-1 transition">
        ← Back to sign-in
      </button>
    </div>
  );
}

export default function LoginScreen() {
  const auth = useAuth();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Email/password
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError('');
    setBusy(key);
    try { await fn(); }
    catch (e) { setError(friendlyError(e)); }
    finally { setBusy(null); }
  };

  const submitEmail = () =>
    run('email', async () => {
      if (mode === 'signup') await auth.signUpWithEmail(email.trim(), password);
      else await auth.signInWithEmail(email.trim(), password);
    });

  const sendCode = () =>
    run('phone-send', async () => {
      const conf = await auth.sendPhoneCode(phone.trim(), 'recaptcha-container');
      setConfirmation(conf);
    });

  const confirmCode = () =>
    run('phone-confirm', async () => {
      if (!confirmation) return;
      await confirmation.confirm(code.trim());
    });

  const btn = 'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-sm transition disabled:opacity-60';
  const input = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600';

  return (
    <div className="min-h-[80vh] bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 mb-4">
            <Shield className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            QuantumShield
          </h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to continue</p>
        </div>

        {auth.mfaResolver ? (
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
            <MfaChallenge />
          </div>
        ) : (
        <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          {/* Social sign-in */}
          <button
            onClick={() => run('google', auth.signInWithGoogle)}
            disabled={!!busy}
            className={`${btn} bg-white text-slate-900 hover:bg-gray-100`}>
            {busy === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            onClick={() => run('apple', auth.signInWithApple)}
            disabled={!!busy}
            className={`${btn} bg-slate-800 border border-slate-700 hover:bg-slate-700`}>
            {busy === 'apple' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AppleIcon />}
            Continue with Apple
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-slate-700" />
            <span className="text-[11px] text-slate-500 uppercase tracking-widest">or</span>
            <span className="h-px flex-1 bg-slate-700" />
          </div>

          {/* Tab switch */}
          <div className="flex rounded-xl border border-slate-700 overflow-hidden text-sm font-bold">
            <button onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition ${tab === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
              <Mail className="w-4 h-4" /> Email
            </button>
            <button onClick={() => { setTab('phone'); setError(''); }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition ${tab === 'phone' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
              <Phone className="w-4 h-4" /> Phone
            </button>
          </div>

          {tab === 'email' ? (
            <div className="space-y-3">
              <input className={input} type="email" placeholder="you@example.com" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} />
              <input className={input} type="password" placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={submitEmail} disabled={!!busy || !email || !password}
                className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
                {busy === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              <p className="text-center text-xs text-slate-500">
                {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
                <button className="text-indigo-400 font-bold hover:underline"
                  onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}>
                  {mode === 'signup' ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {!confirmation ? (
                <>
                  <input className={input} type="tel" placeholder="+91 98765 43210"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                  <button onClick={sendCode} disabled={!!busy || !phone}
                    className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
                    {busy === 'phone-send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                    Send code
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-400">Enter the 6-digit code sent to {phone}.</p>
                  <input className={input} inputMode="numeric" placeholder="6-digit code"
                    value={code} onChange={e => setCode(e.target.value)} />
                  <button onClick={confirmCode} disabled={!!busy || !code}
                    className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
                    {busy === 'phone-confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Verify &amp; sign in
                  </button>
                </>
              )}
              {/* Invisible reCAPTCHA mount point required by Firebase phone auth */}
              <div id="recaptcha-container" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}
        </div>
        )}

        <p className="text-center text-[11px] text-slate-600 mt-5 leading-relaxed">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.06-.99 1.02-2.18 1.61-3.47 1.5-.02-.13-.04-.27-.04-.42 0-1.09.48-2.25 1.27-3.06.46-.48 1.06-.88 1.78-1.18.71-.3 1.39-.45 2.02-.46.01.18.02.36.02.56zM20.79 17.5c-.4.93-.59 1.34-1.11 2.16-.72 1.15-1.74 2.58-3 2.59-1.12.01-1.41-.73-2.93-.72-1.52.01-1.84.73-2.96.72-1.26-.01-2.22-1.3-2.94-2.45-2.02-3.2-2.23-6.95-.98-8.95.88-1.42 2.28-2.25 3.59-2.25 1.34 0 2.18.74 3.29.74 1.07 0 1.72-.74 3.27-.74 1.17 0 2.41.64 3.29 1.74-2.89 1.58-2.42 5.71.39 6.91z"/>
    </svg>
  );
}
