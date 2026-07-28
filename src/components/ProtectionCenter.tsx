'use client';

/**
 * Protection Center — AdamasVault's AI Security Command Center.
 *
 * A premium personal dashboard with an HONEST security posture:
 *   • the score ring is driven by real on-device checks (deviceChecks.runRealChecks)
 *   • the live status tiles reflect the actual result of each real check
 *   • the activity numbers come from real local counters (activity.getProtectionStats)
 *   • the AI briefing is generated from those real results — no invented text
 *
 * Nothing here is simulated. This adds NO new detector; every tile links to an
 * existing tool, and the copy is explicit that a web app protects ON DEMAND —
 * continuous background protection needs the native Android app.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Shield, ShieldCheck, ShieldAlert, Loader2, Search, SearchCheck, Mic,
  CreditCard, Database, Smartphone, Eye, Radar, Newspaper, Phone,
  Lock, FileText, GraduationCap, ChevronRight, Activity, RefreshCw,
  CheckCircle2, AlertTriangle, Info, Sparkles, Wifi, Camera, Globe,
  Cpu, HardDrive, CalendarDays, ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { runRealChecks, type ScanResult } from '@/lib/security/deviceChecks';
import { getProtectionStats, ensureFirstSeen, type ProtectionStats } from '@/lib/activity';

/* ── Quick actions — the four things a person reaches for most ── */
const QUICK_ACTIONS = [
  { id: 'trust',    name: 'Trust Search',  nameHi: 'ट्रस्ट सर्च',  desc: 'Verify a number, UPI or site is official', descHi: 'नंबर, UPI या साइट सत्यापित करें', href: '/trust-search', icon: SearchCheck, accent: '#34d399', flag: 'Verified' },
  { id: 'scanner',  name: 'Scanner',       nameHi: 'स्कैनर',      desc: 'Link · file · APK · message',              descHi: 'लिंक · फ़ाइल · APK · संदेश',      href: '/scanner',      icon: Search,      accent: '#2dd4bf' },
  { id: 'sentinel', name: 'Sentinel',      nameHi: 'सेंटिनल',     desc: 'Sweep a room for hidden cameras',          descHi: 'छिपे कैमरे के लिए कमरा स्कैन करें', href: '/sentinel',     icon: Radar,       accent: '#dfe7e3' },
  { id: 'phone',    name: 'QuantumLocate', nameHi: 'QuantumLocate', desc: "Check who's really calling",             descHi: 'जांचें असल में कौन कॉल कर रहा है',  href: '/phoneguard',   icon: Phone,       accent: '#f5a524' },
];

/* ── Module pillars — every tile links to a real existing tool ── */
interface Module { id: string; name: string; nameHi: string; desc: string; descHi: string; icon: typeof Shield; href: string; accent: string; }
const PILLARS: { key: string; title: string; titleHi: string; modules: Module[] }[] = [
  {
    key: 'protect', title: 'Protection', titleHi: 'सुरक्षा',
    modules: [
      { id: 'scanner', name: 'Scanner', nameHi: 'स्कैनर', desc: 'Check any link, file, APK or message', descHi: 'कोई भी लिंक, फ़ाइल, APK या संदेश जांचें', icon: Search, href: '/scanner', accent: 'text-teal-400' },
      { id: 'trust', name: 'Trust Search', nameHi: 'ट्रस्ट सर्च', desc: 'Verify a number, site or app before you trust it', descHi: 'भरोसा करने से पहले नंबर, साइट या ऐप सत्यापित करें', icon: SearchCheck, href: '/trust-search', accent: 'text-emerald-400' },
      { id: 'call', name: 'Call & Deepfake Analyzer', nameHi: 'कॉल और डीपफेक विश्लेषक', desc: 'Live scam-call and AI-voice detection', descHi: 'लाइव स्कैम-कॉल और AI-आवाज़ पहचान', icon: Mic, href: '/aianalyzer', accent: 'text-red-400' },
      { id: 'upi', name: 'UPI Guard', nameHi: 'UPI गार्ड', desc: 'Spot fake payment & collect-request tricks', descHi: 'नकली भुगतान और कलेक्ट-रिक्वेस्ट पहचानें', icon: CreditCard, href: '/upi-guard', accent: 'text-emerald-400' },
    ],
  },
  {
    key: 'privacy', title: 'Privacy & Device', titleHi: 'गोपनीयता और डिवाइस',
    modules: [
      { id: 'breach', name: 'Data Breach Check', nameHi: 'डेटा ब्रीच जांच', desc: 'See if your email was leaked in a breach', descHi: 'देखें कि आपका ईमेल किसी ब्रीच में लीक हुआ या नहीं', icon: Database, href: '/breach', accent: 'text-orange-400' },
      { id: 'device', name: 'Device Check', nameHi: 'डिवाइस जांच', desc: 'Audit this device & browser for risks', descHi: 'इस डिवाइस और ब्राउज़र के जोखिम जांचें', icon: Smartphone, href: '/devicescan', accent: 'text-teal-400' },
      { id: 'privacy', name: 'Privacy Shield', nameHi: 'प्राइवेसी शील्ड', desc: 'Review permissions & tracking exposure', descHi: 'अनुमतियां और ट्रैकिंग जोखिम देखें', icon: Eye, href: '/privacy', accent: 'text-emerald-400' },
      { id: 'sentinel', name: 'Sentinel Sweep', nameHi: 'सेंटिनल स्वीप', desc: 'Scan a room for hidden cameras & trackers', descHi: 'छिपे कैमरे और ट्रैकर के लिए कमरा स्कैन करें', icon: Radar, href: '/sentinel', accent: 'text-emerald-400' },
      { id: 'sim', name: 'SIM Protection', nameHi: 'सिम सुरक्षा', desc: 'Guard against SIM-swap hijacking', descHi: 'सिम-स्वैप हाईजैक से बचाव', icon: Smartphone, href: '/simprotection', accent: 'text-teal-400' },
    ],
  },
  {
    key: 'intel', title: 'Intelligence & Response', titleHi: 'इंटेलिजेंस और प्रतिक्रिया',
    modules: [
      { id: 'intel', name: 'Scam Intel', nameHi: 'स्कैम इंटेल', desc: 'Documented scams & known threat patterns', descHi: 'दस्तावेज़ित स्कैम और ज्ञात खतरा पैटर्न', icon: Newspaper, href: '/news', accent: 'text-emerald-400' },
      { id: 'scamdb', name: 'Scam Number Lookup', nameHi: 'स्कैम नंबर लुकअप', desc: 'Check a phone number against reports', descHi: 'रिपोर्ट के विरुद्ध फ़ोन नंबर जांचें', icon: Phone, href: '/scamdb', accent: 'text-amber-400' },
      { id: 'evidence', name: 'Evidence Vault', nameHi: 'एविडेंस वॉल्ट', desc: 'Fingerprint & keep proof on your device', descHi: 'सबूत का फ़िंगरप्रिंट लें और डिवाइस पर रखें', icon: Lock, href: '/evidence', accent: 'text-emerald-400' },
      { id: 'report', name: 'Report & Rights', nameHi: 'रिपोर्ट और अधिकार', desc: 'File a complaint & know your legal rights', descHi: 'शिकायत दर्ज करें और अपने कानूनी अधिकार जानें', icon: FileText, href: '/legal-rights', accent: 'text-rose-400' },
      { id: 'learn', name: 'Learn', nameHi: 'सीखें', desc: 'Short lessons to spot scams yourself', descHi: 'खुद स्कैम पहचानने के छोटे पाठ', icon: GraduationCap, href: '/education', accent: 'text-teal-400' },
    ],
  },
];

/* Map a real ScanResult to a compact live-status tile. */
const STATUS_TILES: { key: string; label: string; labelHi: string; icon: typeof Shield }[] = [
  { key: 'Connection Encryption',   label: 'Connection', labelHi: 'कनेक्शन',  icon: Lock },
  { key: 'Media Permission Audit',  label: 'Camera & Mic', labelHi: 'कैमरा/माइक', icon: Camera },
  { key: 'IP Leak Protection',      label: 'IP Leak',    labelHi: 'IP लीक',    icon: Globe },
  { key: 'Storage Integrity',       label: 'Storage',    labelHi: 'स्टोरेज',   icon: HardDrive },
  { key: 'Browser Security Level',  label: 'Browser',    labelHi: 'ब्राउज़र',  icon: Wifi },
  { key: 'JS Environment Integrity',label: 'Environment',labelHi: 'वातावरण',   icon: Cpu },
];

const CIRC = 2 * Math.PI * 52; // ring radius 52

export default function ProtectionCenter() {
  const { lang } = useLanguage();
  const en = lang === 'en';

  const [checking, setChecking] = useState(true);
  const [health, setHealth] = useState(0);
  const [display, setDisplay] = useState(0); // animated score
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<ProtectionStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  const reduce = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const runPosture = async () => {
    setChecking(true);
    setDisplay(0);
    const { results, health } = await runRealChecks(lang);
    setResults(results);
    setHealth(health);
    setChecking(false);
  };

  useEffect(() => {
    ensureFirstSeen();
    setStats(getProtectionStats());
    runPosture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Count the score up to the real value once checks complete. */
  useEffect(() => {
    if (checking) return;
    if (reduce) { setDisplay(health); return; }
    const start = performance.now(), from = 0, dur = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (health - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [checking, health, reduce]);

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const warnCount = results.filter((r) => r.status === 'WARN' || r.status === 'FAIL').length;

  const tone = health >= 80 ? 'strong' : health >= 55 ? 'fair' : 'weak';
  const toneHex = tone === 'strong' ? '#34d399' : tone === 'fair' ? '#f5a524' : '#f0455b';
  const gradId = `avGrad_${tone}`;

  const label = checking
    ? (en ? 'Running a live check…' : 'लाइव जांच चल रही है…')
    : tone === 'strong' ? (en ? 'Strong — Vault holding' : 'मज़बूत — वॉल्ट सुरक्षित')
    : tone === 'fair'   ? (en ? 'Good — a few things to review' : 'ठीक — कुछ चीज़ें जांचें')
    :                      (en ? 'Needs attention' : 'ध्यान देने की ज़रूरत');

  /* ── Honest AI briefing, generated from the real results ── */
  const issue = results.find((r) => r.status === 'FAIL') || results.find((r) => r.status === 'WARN');
  const issueName = issue ? (en ? issue.check : issue.checkHi) : '';
  const briefing = checking
    ? (en ? 'Checking this device and browser against real security signals…'
          : 'इस डिवाइस और ब्राउज़र की असली सुरक्षा संकेतों से जांच हो रही है…')
    : (() => {
        if (en) {
          const lead = tone === 'strong'
            ? `Your vault is holding strong — ${passCount} checks passed`
            : tone === 'fair'
              ? `Mostly solid — ${passCount} checks passed`
              : `Your posture needs attention — only ${passCount} checks passed`;
          const tail = warnCount === 0
            ? ', and nothing needs your attention right now.'
            : issueName
              ? `. The main thing to review is <b>${issueName}</b>${warnCount > 1 ? ` (and ${warnCount - 1} more below)` : ''}.`
              : `. ${warnCount} item${warnCount > 1 ? 's' : ''} to review below.`;
          return lead + tail;
        }
        const lead = tone === 'strong'
          ? `आपका वॉल्ट मज़बूत है — ${passCount} जांच पास`
          : tone === 'fair'
            ? `ज़्यादातर ठीक — ${passCount} जांच पास`
            : `ध्यान चाहिए — केवल ${passCount} जांच पास`;
        const tail = warnCount === 0
          ? ', और अभी कुछ भी ध्यान देने की ज़रूरत नहीं।'
          : issueName
            ? `। सबसे पहले देखें <b>${issueName}</b>${warnCount > 1 ? ` (और ${warnCount - 1} नीचे)` : ''}।`
            : `। नीचे ${warnCount} चीज़ें समीक्षा हेतु।`;
        return lead + tail;
      })();

  const findResult = (key: string) => results.find((r) => r.check === key);
  const tileTone = (s?: ScanResult['status']) =>
    s === 'PASS' ? { dot: '#2fd39a', text: 'text-emerald-300', word: en ? 'Secure' : 'सुरक्षित' }
    : s === 'WARN' ? { dot: '#f5a524', text: 'text-amber-300', word: en ? 'Review' : 'जांचें' }
    : s === 'FAIL' ? { dot: '#f0455b', text: 'text-rose-300', word: en ? 'Risk' : 'जोखिम' }
    : { dot: '#2dd4bf', text: 'text-teal-300', word: en ? 'Info' : 'सूचना' };

  return (
    <div className="relative min-h-screen bg-[#05080a] text-[#eaf3ee] overflow-hidden">
      {/* ambient emerald glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-emerald-500/[0.08] blur-[130px]" />
      <div className="pointer-events-none absolute top-24 right-0 w-[26rem] h-[26rem] rounded-full bg-emerald-400/[0.05] blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-400 font-bold mb-1.5">
              AdamasVault
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#dfe7e3]">
              {en ? 'Command Center' : 'कमांड सेंटर'}
            </h1>
          </div>
          <button
            onClick={runPosture} disabled={checking}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:border-emerald-500/40 disabled:opacity-50 px-4 py-2.5 text-xs font-bold transition"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${checking ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
            {en ? 'Re-scan' : 'फिर स्कैन'}
          </button>
        </div>

        {/* ── Hero score ring ── */}
        <div className="flex flex-col items-center text-center pt-2">
          <button
            onClick={runPosture} disabled={checking}
            className="relative w-[248px] h-[248px] outline-none group"
            aria-label={en ? `Vault integrity ${health} of 100. Tap to re-scan.` : `वॉल्ट अखंडता ${health}/100। फिर स्कैन के लिए टैप करें।`}
          >
            {/* radar sweep while checking */}
            {checking && !reduce && (
              <span
                className="av-sweep absolute inset-[14px] rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(52,211,153,0.34) 40deg, transparent 72deg)',
                  WebkitMask: 'radial-gradient(circle, transparent 38%, #000 40%)',
                  mask: 'radial-gradient(circle, transparent 38%, #000 40%)',
                }}
              />
            )}
            <svg viewBox="0 0 120 120" className="w-[248px] h-[248px] -rotate-90">
              <defs>
                <linearGradient id="avGrad_strong" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#34d399" /><stop offset="0.6" stopColor="#10b981" /><stop offset="1" stopColor="#05966a" />
                </linearGradient>
                <linearGradient id="avGrad_fair" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="avGrad_weak" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fb7185" /><stop offset="1" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(180,214,200,0.08)" strokeWidth="9" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke={`url(#${gradId})`} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (CIRC * (checking ? 0 : display)) / 100}
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 7px ${toneHex}88)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {checking ? (
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              ) : (
                <>
                  <div className="flex items-end gap-0.5">
                    <span className="text-[68px] leading-[0.85] font-black tabular-nums tracking-tight">{display}</span>
                    <span className="text-2xl font-bold text-[#4b5b54] mb-1.5">/100</span>
                  </div>
                  <span className="mt-2 text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: toneHex }}>
                    {en ? 'Vault Integrity' : 'वॉल्ट अखंडता'}
                  </span>
                </>
              )}
            </div>
          </button>

          {/* grade pill */}
          <div
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-xs font-semibold border"
            style={{ color: toneHex, borderColor: `${toneHex}44`, background: `${toneHex}18` }}
          >
            {!checking && <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: toneHex }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: toneHex }} />
            </span>}
            {label}
          </div>
          {!checking && (
            <p className="text-[11px] text-[#4b5b54] mt-3">
              {en
                ? `${passCount} passed · ${warnCount} to review — from a real check of this device · tap ring to re-scan`
                : `${passCount} पास · ${warnCount} समीक्षा — इस डिवाइस की असली जांच · फिर स्कैन हेतु रिंग टैप करें`}
            </p>
          )}
        </div>

        {/* ── AI briefing ── */}
        <div className="relative rounded-3xl border border-white/10 p-5 sm:p-6 flex gap-4 items-start overflow-hidden"
          style={{ background: 'radial-gradient(120% 120% at 0% 0%, rgba(16,185,129,0.08), transparent 55%), linear-gradient(160deg,#0f1815,#0b1210)' }}>
          <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400">
              {en ? 'Adamas Intelligence' : 'Adamas इंटेलिजेंस'}
            </p>
            <p className="text-[15px] leading-relaxed mt-1.5 text-[#eaf3ee] [&_b]:text-[#dfe7e3] [&_b]:font-semibold"
               dangerouslySetInnerHTML={{ __html: briefing }} />
          </div>
        </div>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#86968f] font-bold mb-3">{en ? 'Quick Actions' : 'त्वरित कार्रवाई'}</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.id} href={a.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 p-4 flex flex-col gap-3 transition hover:border-emerald-500/40 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
                  {a.flag && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300">
                      {en ? a.flag : 'सत्यापित'}
                    </span>
                  )}
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5" style={{ color: a.accent }}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{en ? a.name : a.nameHi}</div>
                    <div className="text-[11.5px] text-[#86968f] leading-snug mt-0.5">{en ? a.desc : a.descHi}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Live device status (from the real checks) ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#86968f] font-bold mb-3">{en ? 'Live Device Status' : 'लाइव डिवाइस स्थिति'}</h2>
          <div className="grid grid-cols-3 gap-3">
            {STATUS_TILES.map((tile) => {
              const r = findResult(tile.key);
              const tt = tileTone(r?.status);
              const Icon = tile.icon;
              return (
                <div key={tile.key} className="rounded-2xl border border-white/10 p-4 flex flex-col items-center text-center gap-2"
                  style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
                  <Icon className="w-5 h-5 text-[#93a79f]" />
                  <span className="text-[10.5px] text-[#86968f] font-semibold">{en ? tile.label : tile.labelHi}</span>
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${checking ? 'text-[#4b5b54]' : tt.text}`}>
                    {checking
                      ? <><span className="w-1.5 h-1.5 rounded-full bg-[#4b5b54] animate-pulse" />{en ? '…' : '…'}</>
                      : <><span className="w-1.5 h-1.5 rounded-full" style={{ background: tt.dot, boxShadow: `0 0 6px ${tt.dot}` }} />{tt.word}</>}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Real activity ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#86968f] font-bold mb-3">{en ? 'Your Protection Record' : 'आपका सुरक्षा रिकॉर्ड'}</h2>
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <Stat icon={Activity}    value={stats.checks}        label={en ? 'Scans run' : 'स्कैन किए'}      hex="#2dd4bf" />
              <Stat icon={ShieldAlert} value={stats.threats}       label={en ? 'Risks flagged' : 'खतरे पकड़े'} hex="#f0455b" />
              <Stat icon={CalendarDays} value={stats.daysProtected} label={en ? 'Days protected' : 'दिन सुरक्षित'} hex="#34d399" />
            </div>
          )}
          {stats?.isNew && (
            <p className="text-center text-[11px] text-[#4b5b54] mt-3">
              {en
                ? 'Your numbers start at zero and grow only from what you actually do — nothing is invented.'
                : 'आपके आंकड़े शून्य से शुरू होते हैं और केवल आपके वास्तविक उपयोग से बढ़ते हैं — कुछ भी नकली नहीं।'}
            </p>
          )}
        </section>

        {/* ── Module pillars ── */}
        {PILLARS.map((pillar) => (
          <section key={pillar.key}>
            <h2 className="text-xs uppercase tracking-[0.18em] text-[#86968f] font-bold mb-3">
              {en ? pillar.title : pillar.titleHi}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {pillar.modules.map((m) => {
                const Icon = m.icon;
                return (
                  <Link key={m.id} href={m.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 hover:border-emerald-500/30 p-4 transition hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
                    <div className={`shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-black/30 ${m.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{en ? m.name : m.nameHi}</p>
                      <p className="text-xs text-[#86968f] truncate">{en ? m.desc : m.descHi}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#4b5b54] group-hover:text-emerald-400 transition shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* ── This-device check details (progressive disclosure) ── */}
        {!checking && results.length > 0 && (
          <section>
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] px-5 py-4 transition"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Info className="w-4 h-4 text-[#93a79f]" />
                {en ? 'This device — full check details' : 'यह डिवाइस — पूरी जांच विवरण'}
              </span>
              <ChevronRight className={`w-4 h-4 text-[#86968f] transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
            {showDetails && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 animate-fade-in">
                {results.map((r, i) => {
                  const ok = r.status === 'PASS';
                  const warn = r.status === 'WARN' || r.status === 'FAIL';
                  const RIcon = ok ? CheckCircle2 : warn ? AlertTriangle : Info;
                  const tColor = ok ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-teal-400';
                  return (
                    <div key={i} className="flex items-start gap-3 p-4">
                      <RIcon className={`w-4 h-4 shrink-0 mt-0.5 ${tColor}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{en ? r.check : r.checkHi}</p>
                        <p className="text-xs text-[#86968f] leading-relaxed mt-0.5">{en ? r.detail : r.detailHi}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Honest scope note ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-start gap-3 text-xs text-[#86968f] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#4b5b54]" />
          <p>
            {en
              ? 'AdamasVault protects on demand — scan any link, file, app or message, anytime. Continuous real-time background protection (like a desktop antivirus) requires the installed Android app; a website cannot run in the background.'
              : 'AdamasVault ऑन-डिमांड सुरक्षा देता है — किसी भी लिंक, फ़ाइल, ऐप या संदेश को कभी भी स्कैन करें। लगातार रियल-टाइम बैकग्राउंड सुरक्षा के लिए इंस्टॉल किया गया Android ऐप चाहिए; वेबसाइट बैकग्राउंड में नहीं चल सकती।'}
          </p>
        </div>

      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label, hex }: { icon: typeof Shield; value: number; label: string; hex: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 text-center" style={{ background: 'linear-gradient(160deg,#0f1815,#0b1210)' }}>
      <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: hex }} />
      <div className="text-2xl font-black tabular-nums">{value.toLocaleString('en-IN')}</div>
      <div className="text-[11px] text-[#86968f] mt-0.5">{label}</div>
    </div>
  );
}
