'use client';

/**
 * Premium Upgrade — AdamasVault's paywall.
 *
 * HONEST by design: no fake reviews, no invented user counts, no countdown
 * pressure. It sells on the app's real tools and India's real, sourced fraud
 * figures (I4C / MHA). Pricing reflects the actual plan — ₹99/month, one month
 * free, whole-app access, billed through Google Play.
 *
 * Billing is NOT faked. The CTA opens an honest confirmation summarising the
 * trial terms; the real purchase call is a single clearly-marked integration
 * point (startCheckout) to wire Google Play Billing when it's connected.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X, Check, ArrowRight, ShieldCheck, ServerOff, RotateCcw, BadgeCheck,
  Info, Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { useAuth } from '@/context/AuthContext';

const PRICE = '₹99';
const PRICE_DAILY = '₹3.30';

export default function PremiumUpgrade() {
  const { lang } = useLanguage();
  const en = lang === 'en';
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setUnlocked(true), reduce ? 0 : 380);
    return () => clearTimeout(t);
  }, [reduce]);

  /* ── The single integration point for Google Play Billing ──
     When the native billing flow is connected, launch it here (e.g. via a
     Capacitor plugin) and grant entitlement on success. Until then we do NOT
     fake a purchase — we honestly show the trial terms. */
  const startCheckout = () => setConfirm(true);

  const FEATURES = [
    { n: en ? 'Trust Search' : 'ट्रस्ट सर्च', d: en ? 'Verify any number, UPI or site is official' : 'कोई भी नंबर, UPI या साइट सत्यापित करें', pill: en ? 'Flagship' : 'प्रमुख' },
    { n: en ? 'AI Scanner' : 'AI स्कैनर', d: en ? 'Links, files, APKs & messages' : 'लिंक, फ़ाइल, APK और संदेश', pill: '' },
    { n: en ? 'AI Call & Deepfake Analyzer' : 'AI कॉल और डीपफेक विश्लेषक', d: en ? 'Live scam-call detection during the call' : 'कॉल के दौरान लाइव स्कैम पहचान', pill: '' },
    { n: en ? 'Sentinel Privacy Sweep' : 'सेंटिनल प्राइवेसी स्वीप', d: en ? 'Find hidden cameras, mics & trackers' : 'छिपे कैमरे, माइक और ट्रैकर खोजें', pill: '' },
    { n: 'QuantumLocate', d: en ? 'Caller intelligence & scam-risk' : 'कॉलर इंटेलिजेंस और स्कैम जोखिम', pill: '' },
    { n: en ? 'Circuit Breaker' : 'सर्किट ब्रेकर', d: en ? 'Alert your family the moment a scam hits' : 'स्कैम पकड़ते ही परिवार को अलर्ट', pill: '' },
    { n: en ? 'Evidence Vault' : 'एविडेंस वॉल्ट', d: en ? 'Tamper-proof proof, kept on your device' : 'छेड़छाड़-रहित सबूत, आपके डिवाइस पर', pill: '' },
    { n: en ? 'Legal Rights engine' : 'कानूनी अधिकार इंजन', d: en ? 'Know your rights & build a report' : 'अपने अधिकार जानें और रिपोर्ट बनाएं', pill: '' },
    { n: en ? 'Breach & UPI Guard' : 'ब्रीच और UPI गार्ड', d: en ? 'Leak checks and fake-payment defence' : 'लीक जांच और नकली-भुगतान बचाव', pill: '' },
    { n: en ? '48 safety lessons' : '48 सुरक्षा पाठ', d: en ? 'Learn to spot scams yourself' : 'खुद स्कैम पहचानना सीखें', pill: '' },
  ];

  const TRUST = [
    { icon: ShieldCheck, t: en ? 'On-device AI' : 'डिवाइस पर AI', s: en ? 'Runs on your phone' : 'आपके फ़ोन पर चलता है' },
    { icon: ServerOff, t: en ? 'Zero server storage' : 'सर्वर पर कुछ नहीं', s: en ? 'We keep nothing' : 'हम कुछ नहीं रखते' },
    { icon: RotateCcw, t: en ? 'Cancel anytime' : 'कभी भी रद्द करें', s: en ? 'In Google Play' : 'Google Play में' },
    { icon: BadgeCheck, t: en ? 'No ads, ever' : 'कोई विज्ञापन नहीं', s: en ? 'Never sold to anyone' : 'कभी किसी को नहीं बेचा' },
  ];

  const dur = reduce ? '0ms' : undefined;

  return (
    <div className="relative min-h-screen bg-[#05080a] text-[#eaf3ee] overflow-hidden">
      {/* ambient emerald glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-emerald-500/[0.09] blur-[130px]" />

      <div className="relative max-w-md mx-auto px-5 pt-4 pb-16">

        {/* top bar */}
        <div className="flex items-center justify-between py-2">
          <Link href="/" aria-label={en ? 'Close' : 'बंद करें'}
            className="grid place-items-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-[#93a79f] hover:text-white transition">
            <X className="w-4 h-4" />
          </Link>
          <button className="text-xs font-semibold text-[#93a79f] hover:text-emerald-400 transition">
            {en ? 'Restore purchase' : 'खरीद पुनर्स्थापित करें'}
          </button>
        </div>

        {/* hero */}
        <div className="text-center pt-4 pb-6">
          {/* unlock emblem */}
          <div className="relative w-28 h-28 mx-auto mb-5">
            <div className="absolute -inset-5 rounded-full transition-opacity duration-1000"
              style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.26), transparent 68%)', opacity: unlocked ? 1 : 0 }} />
            <svg viewBox="0 0 120 120" fill="none" className="absolute inset-0 w-28 h-28">
              <path d="M44 52 V40 a16 16 0 0 1 32 0 V52" stroke={unlocked ? '#34d399' : '#93a79f'} strokeWidth="4" strokeLinecap="round"
                style={{ transition: reduce ? 'none' : 'transform .7s cubic-bezier(.34,1.56,.64,1) .15s, stroke .8s', transform: unlocked ? 'translateY(-7px) rotate(-13deg)' : 'none', transformOrigin: '74px 44px' }} />
              <path d="M60 40 L86 62 L60 96 L34 62 Z" strokeWidth="2.4"
                style={{ transition: reduce ? 'none' : 'all 1s cubic-bezier(.22,1,.36,1)', fill: unlocked ? 'rgba(52,211,153,0.14)' : 'rgba(180,214,200,0.05)', stroke: unlocked ? '#34d399' : '#4b5b54', filter: unlocked ? 'drop-shadow(0 0 10px rgba(52,211,153,0.5))' : 'none' }} />
              <path d="M34 62 H86 M60 40 V96 M46 51 L74 51" stroke="#34d399" strokeWidth="1.4"
                style={{ transition: reduce ? 'none' : 'opacity 1s ease .4s', opacity: unlocked ? 0.6 : 0 }} />
            </svg>
          </div>

          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-400 font-bold">
            {en ? 'AdamasVault Premium' : 'AdamasVault प्रीमियम'}
          </p>
          <h1 className="text-[30px] leading-[1.08] font-extrabold tracking-tight text-[#dfe7e3] mt-2.5 text-balance">
            {en ? 'Unlock your full vault' : 'अपना पूरा वॉल्ट खोलें'}
          </h1>
          <p className="text-[14.5px] text-[#86968f] mt-3 leading-relaxed max-w-[300px] mx-auto">
            {en
              ? 'Every protection, always available. Nothing you rely on is ever locked away.'
              : 'हर सुरक्षा, हमेशा उपलब्ध। आप जिस पर भरोसा करते हैं वह कभी बंद नहीं होता।'}
          </p>
        </div>

        {/* price card */}
        <div className="relative overflow-hidden rounded-[30px] p-6 mb-5 border border-emerald-500/25"
          style={{ background: 'radial-gradient(130% 120% at 50% 0%, rgba(16,185,129,0.12), transparent 60%), linear-gradient(160deg,#0f1815,#0b1210)' }}>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-wide text-emerald-300"
              style={{ background: 'linear-gradient(120deg, rgba(52,211,153,0.2), rgba(16,185,129,0.08))', border: '1px solid rgba(52,211,153,0.35)' }}>
              <Sparkles className="w-3.5 h-3.5" /> {en ? '1 month free' : '1 महीना मुफ़्त'}
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1.5 mt-4">
            <span className="text-2xl font-bold text-[#dfe7e3] self-start mt-2">₹</span>
            <span className="text-[60px] leading-[0.9] font-extrabold tracking-tight tabular-nums">99</span>
            <span className="text-[15px] text-[#86968f] font-semibold">/{en ? 'month' : 'माह'}</span>
          </div>
          <p className="text-center text-[12.5px] text-[#93a79f] mt-2.5">
            {en ? <>after your free month · <b className="text-[#eaf3ee] font-semibold">cancel anytime</b></>
                : <>मुफ़्त महीने के बाद · <b className="text-[#eaf3ee] font-semibold">कभी भी रद्द करें</b></>}
          </p>
          <p className="text-center text-[11px] text-[#4b5b54] mt-1">
            {en ? `that's about ${PRICE_DAILY} a day — one full toolkit, one price` : `यानी लगभग ${PRICE_DAILY} रोज़ — एक पूरा टूलकिट, एक दाम`}
          </p>
        </div>

        {/* everything included */}
        <h2 className="text-xs uppercase tracking-[0.18em] text-[#86968f] font-bold mb-3 mt-6 px-0.5">
          {en ? 'Everything included' : 'सब कुछ शामिल'}
        </h2>
        <div className="flex flex-col">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 py-3"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
                transition: reduce ? 'none' : 'opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1)',
                transitionDelay: reduce ? '0ms' : `${0.15 + i * 0.05}s`,
              }}>
              <span className="grid place-items-center w-6 h-6 rounded-lg shrink-0 bg-emerald-500/[0.13] border border-emerald-500/30 text-emerald-300">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold tracking-tight">{f.n}</span>
                <span className="block text-[11.5px] text-[#86968f] mt-0.5">{f.d}</span>
              </span>
              {f.pill && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#93a79f] border border-white/10 px-1.5 py-1 rounded-md">{f.pill}</span>
              )}
            </div>
          ))}
        </div>

        {/* value anchor — real, sourced */}
        <div className="mt-6 rounded-[22px] p-5 text-center border border-white/10"
          style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
          <div className="text-3xl font-extrabold tracking-tight text-amber-400 tabular-nums">₹22,495 Cr</div>
          <p className="text-[12.5px] text-[#eaf3ee] mt-1.5 leading-relaxed">
            {en
              ? 'lost to cyber fraud in India in 2025. One prevented scam pays for years of protection.'
              : '2025 में भारत में साइबर धोखाधड़ी से गंवाए। एक रुका हुआ स्कैम सालों की सुरक्षा चुका देता है।'}
          </p>
          <p className="text-[10px] text-[#4b5b54] mt-2">{en ? 'Source' : 'स्रोत'}: I4C / MHA Annual Report, Feb 2026</p>
        </div>

        {/* trust row */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {TRUST.map((tr, i) => {
            const Icon = tr.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl border border-white/10"
                style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
                <Icon className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-tight">{tr.t}</span>
                  <span className="block text-[10px] text-[#86968f] mt-0.5">{tr.s}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-7">
          {!confirm ? (
            <>
              <button onClick={startCheckout}
                className="group w-full flex items-center justify-center gap-2.5 rounded-[22px] py-[17px] font-extrabold text-[16px] text-[#04140d] transition active:scale-[0.98]"
                style={{ background: 'linear-gradient(150deg,#34d399,#05966a)', boxShadow: '0 14px 34px -10px rgba(16,185,129,0.6), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
                {en ? 'Start my free month' : 'मेरा मुफ़्त महीना शुरू करें'}
                <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" strokeWidth={2.4} />
              </button>
              <p className="text-center text-[11px] text-[#93a79f] mt-2.5 leading-relaxed">
                {en
                  ? <>Free for 1 month, then <b className="text-[#86968f] font-semibold">{PRICE}/month</b> · billed via Google Play · cancel anytime</>
                  : <>1 महीना मुफ़्त, फिर <b className="text-[#86968f] font-semibold">{PRICE}/माह</b> · Google Play से बिलिंग · कभी भी रद्द करें</>}
              </p>
            </>
          ) : (
            /* Honest confirmation — no charge is made; billing is not yet connected */
            <div className="rounded-[22px] border border-emerald-500/25 p-5 animate-fade-in"
              style={{ background: 'radial-gradient(120% 120% at 50% 0%, rgba(16,185,129,0.08), transparent 60%), linear-gradient(160deg,#0f1815,#0b1210)' }}>
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 shrink-0">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#dfe7e3]">{en ? 'Almost there' : 'बस थोड़ा और'}</p>
                  <p className="text-[12.5px] text-[#86968f] mt-1.5 leading-relaxed">
                    {en
                      ? <>Your first month is free — you won&apos;t be charged until it ends, and you can cancel anytime in Google Play. Secure checkout runs through Google Play and is being connected to this build; we&apos;ll enable it the moment it&apos;s live.</>
                      : <>आपका पहला महीना मुफ़्त है — महीना खत्म होने तक कोई शुल्क नहीं, और आप Google Play में कभी भी रद्द कर सकते हैं। सुरक्षित चेकआउट Google Play से चलता है और इस बिल्ड से जोड़ा जा रहा है; लाइव होते ही हम इसे चालू कर देंगे।</>}
                  </p>
                  {user?.email && (
                    <p className="text-[11px] text-[#4b5b54] mt-2">{en ? 'Signed in as' : 'साइन इन'}: {user.email}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setConfirm(false)}
                className="w-full mt-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] py-3 text-sm font-semibold transition">
                {en ? 'Got it' : 'ठीक है'}
              </button>
            </div>
          )}
        </div>

        {/* fine print */}
        <div className="text-center mt-6 flex items-center justify-center gap-4">
          <Link href="/terms" className="text-[12px] text-[#93a79f] underline underline-offset-[3px] hover:text-[#eaf3ee] transition">{en ? 'Terms' : 'शर्तें'}</Link>
          <Link href="/privacy" className="text-[12px] text-[#93a79f] underline underline-offset-[3px] hover:text-[#eaf3ee] transition">{en ? 'Privacy' : 'गोपनीयता'}</Link>
        </div>

      </div>
    </div>
  );
}
