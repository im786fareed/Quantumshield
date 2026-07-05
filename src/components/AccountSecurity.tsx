'use client';
/* =========================================================
   QuantumShield – Account & Security page body
   Shows the signed-in identity and manages 2-step
   verification (MFA):
     • Authenticator app (TOTP) — free, works offline
     • SMS code — needs Firebase billing (Blaze)
   Both require the Firebase project to be upgraded to
   Identity Platform; errors are explained honestly.
   ========================================================= */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ShieldCheck, KeyRound, Smartphone, Loader2, AlertTriangle,
  CheckCircle2, Trash2, Mail, LogOut, Copy, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { friendlyError } from '@/components/LoginScreen';
import type { TotpSecret, MultiFactorInfo } from 'firebase/auth';

const btn = 'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-sm transition disabled:opacity-60';
const input = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600';

export default function AccountSecurity() {
  const auth = useAuth();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  // Authenticator (TOTP) enrollment flow
  const [totp, setTotp] = useState<{ secret: TotpSecret; uri: string; qr: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');

  // SMS enrollment flow
  const [smsPhone, setSmsPhone] = useState('');
  const [smsVerificationId, setSmsVerificationId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState('');
  const [smsOpen, setSmsOpen] = useState(false);

  const [factors, setFactors] = useState<MultiFactorInfo[]>([]);
  useEffect(() => { setFactors(auth.getEnrolledFactors()); }, [auth]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(''); setNotice(''); setBusy(key);
    try { await fn(); }
    catch (e) { setError(friendlyError(e)); }
    finally { setBusy(null); setFactors(auth.getEnrolledFactors()); }
  };

  if (!auth.configured) {
    return (
      <Shell>
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200/90 flex gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>Accounts aren’t switched on yet — the Firebase keys haven’t been added. Once login is live, you’ll manage your account and 2-step verification here.</p>
        </div>
      </Shell>
    );
  }

  if (!auth.user) {
    // AuthGate normally prevents this; belt-and-braces for direct visits.
    return (
      <Shell>
        <p className="text-sm text-gray-400">Please sign in to manage your account.</p>
      </Shell>
    );
  }

  const user = auth.user;
  const emailVerified = user.emailVerified;
  const usesPassword = user.providerData.some((p) => p.providerId === 'password');

  const startTotp = () =>
    run('totp-start', async () => {
      const { secret, uri } = await auth.startTotpEnrollment();
      const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
      setTotp({ secret, uri, qr });
      setTotpCode('');
    });

  const confirmTotp = () =>
    run('totp-finish', async () => {
      if (!totp) return;
      await auth.finishTotpEnrollment(totp.secret, totpCode);
      setTotp(null); setTotpCode('');
      setNotice('Authenticator app added. From now on, sign-in asks for a 6-digit code as the second step.');
    });

  const sendSms = () =>
    run('sms-send', async () => {
      setSmsVerificationId(await auth.startSmsEnrollment(smsPhone, 'enroll-recaptcha-container'));
    });

  const confirmSms = () =>
    run('sms-finish', async () => {
      if (!smsVerificationId) return;
      await auth.finishSmsEnrollment(smsVerificationId, smsCode);
      setSmsOpen(false); setSmsVerificationId(null); setSmsPhone(''); setSmsCode('');
      setNotice('SMS second step added. From now on, sign-in asks for a code sent to your phone.');
    });

  const remove = (f: MultiFactorInfo) =>
    run(`rm-${f.uid}`, async () => {
      await auth.unenrollFactor(f.uid);
      setNotice('Second step removed.');
    });

  return (
    <Shell>
      {/* Identity */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-5 flex items-center gap-4">
        {user.photoURL
          /* eslint-disable-next-line @next/next/no-img-element */
          ? <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border border-white/10" />
          : <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center"><UserIcon className="w-6 h-6 text-indigo-300" /></div>}
        <div className="min-w-0">
          <p className="font-bold truncate">{user.displayName || user.email || user.phoneNumber || 'Your account'}</p>
          {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
        </div>
        <button onClick={() => run('signout', auth.signOut)} className={`${btn} ml-auto bg-white/5 hover:bg-white/10 border border-white/10 text-red-300 !py-2`}>
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </section>

      {/* Email verification — required before 2-step can be enabled */}
      {usesPassword && !emailVerified && (
        <section className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-yellow-200"><Mail className="w-4 h-4" /> Verify your email first</h3>
          <p className="text-[13px] text-yellow-100/80 leading-relaxed">
            Before you can add 2-step verification, Firebase needs your email confirmed. We’ll send a link — open it, then come back and tap “I’ve verified”.
          </p>
          <div className="flex gap-2">
            <button onClick={() => run('verify-email', async () => { await auth.sendVerifyEmail(); setNotice('Verification email sent — check your inbox (and spam).'); })}
              disabled={!!busy} className={`${btn} flex-1 bg-yellow-600/80 hover:bg-yellow-500/80`}>
              {busy === 'verify-email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send verification link
            </button>
            <button onClick={() => run('reload', async () => { await auth.reloadUser(); })}
              disabled={!!busy} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10`}>
              I’ve verified
            </button>
          </div>
        </section>
      )}

      {/* 2-step verification */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="font-black">2-step verification</h2>
        </div>
        <p className="text-[13px] text-gray-400 leading-relaxed">
          Even if someone steals your password, they can’t open your account without the second step. We recommend the authenticator app — it’s free and works without mobile signal.
        </p>

        {/* enrolled factors */}
        {factors.length > 0 && (
          <div className="space-y-2">
            {factors.map((f) => (
              <div key={f.uid} className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                {f.factorId === 'totp' ? <KeyRound className="w-4 h-4 text-green-400 shrink-0" /> : <Smartphone className="w-4 h-4 text-green-400 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{f.displayName || (f.factorId === 'totp' ? 'Authenticator app' : 'SMS code')}</p>
                  <p className="text-[11px] text-gray-500">Active since {f.enrollmentTime ? new Date(f.enrollmentTime).toLocaleDateString() : '—'}</p>
                </div>
                <button onClick={() => remove(f)} disabled={!!busy} aria-label="Remove this second step"
                  className="text-red-300 hover:text-red-200 p-2 rounded-lg hover:bg-red-500/10 transition">
                  {busy === `rm-${f.uid}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
        {factors.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-gray-400">
            No second step yet — your account is protected by the password alone.
          </div>
        )}

        {/* Add authenticator app */}
        {!totp ? (
          <button onClick={startTotp} disabled={!!busy} className={`${btn} w-full bg-indigo-600 hover:bg-indigo-500`}>
            {busy === 'totp-start' ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Add authenticator app (recommended)
          </button>
        ) : (
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/5 p-4 space-y-3">
            <h4 className="font-bold text-sm">Scan with your authenticator app</h4>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Open Google Authenticator (or any authenticator app), tap “+”, and scan this code. Then type the 6-digit code it shows.
            </p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={totp.qr} alt="Authenticator setup QR code" className="rounded-lg bg-white p-1" />
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(totp.secret.secretKey).then(() => setNotice('Setup key copied — paste it in your authenticator app if you can’t scan.')); }}
              className="w-full text-[12px] text-indigo-300 hover:text-indigo-200 flex items-center justify-center gap-1.5 py-1 transition">
              <Copy className="w-3.5 h-3.5" /> Can’t scan? Copy the setup key instead
            </button>
            <input className={input} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code from the app"
              value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={confirmTotp} disabled={!!busy || totpCode.trim().length < 6} className={`${btn} flex-1 bg-indigo-600 hover:bg-indigo-500`}>
                {busy === 'totp-finish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Turn on
              </button>
              <button onClick={() => { setTotp(null); setTotpCode(''); }} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add SMS */}
        {!smsOpen ? (
          <button onClick={() => { setSmsOpen(true); setError(''); setNotice(''); }} disabled={!!busy}
            className={`${btn} w-full bg-slate-800 border border-slate-700 hover:bg-slate-700`}>
            <Smartphone className="w-4 h-4" /> Add SMS code instead
          </button>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 space-y-3">
            <h4 className="font-bold text-sm">SMS second step</h4>
            {!smsVerificationId ? (
              <>
                <input className={input} type="tel" placeholder="+91 98765 43210"
                  value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={sendSms} disabled={!!busy || !smsPhone.trim()} className={`${btn} flex-1 bg-indigo-600 hover:bg-indigo-500`}>
                    {busy === 'sms-send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />} Send code
                  </button>
                  <button onClick={() => { setSmsOpen(false); setSmsPhone(''); }} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10`}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] text-gray-400">Enter the 6-digit code sent to {smsPhone}.</p>
                <input className={input} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code"
                  value={smsCode} onChange={(e) => setSmsCode(e.target.value)} />
                <button onClick={confirmSms} disabled={!!busy || smsCode.trim().length < 6} className={`${btn} w-full bg-indigo-600 hover:bg-indigo-500`}>
                  {busy === 'sms-finish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Verify &amp; turn on
                </button>
              </>
            )}
            <div id="enroll-recaptcha-container" />
          </div>
        )}
      </section>

      {notice && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/40 rounded-xl px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs text-green-200">{notice}</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-4 text-white">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-black">Account &amp; Security</h1>
        <p className="text-sm text-gray-500 mt-1">Your sign-in and 2-step verification settings.</p>
      </div>
      {children}
      <p className="text-center text-[11px] text-slate-600 leading-relaxed">
        Questions about your data? See the <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
