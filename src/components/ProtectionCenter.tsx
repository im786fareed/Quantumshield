'use client';

/**
 * Protection Center — QuantumShield's command center.
 *
 * A single dashboard that surfaces the protection the app already provides,
 * with an HONEST security posture: the posture score comes from real
 * on-device checks (deviceChecks.runRealChecks) and the activity numbers come
 * from real local counters (activity.getProtectionStats). Nothing here is
 * invented, and the copy is explicit that a web app protects ON DEMAND —
 * real-time background protection needs the native Android app.
 *
 * This adds NO new detector; every tile links to an existing tool.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield, ShieldCheck, ShieldAlert, Loader2, Search, SearchCheck, Mic,
  CreditCard, Database, Smartphone, Eye, Radar, Newspaper, Phone,
  Lock, FileText, GraduationCap, ChevronRight, Activity, RefreshCw,
  CheckCircle2, AlertTriangle, Info,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { runRealChecks, type ScanResult } from '@/lib/security/deviceChecks';
import { getProtectionStats, ensureFirstSeen, type ProtectionStats } from '@/lib/activity';

interface Module {
  id: string;
  name: string; nameHi: string;
  desc: string; descHi: string;
  icon: typeof Shield;
  href: string;
  accent: string; // tailwind text color
}

const PILLARS: { key: string; title: string; titleHi: string; modules: Module[] }[] = [
  {
    key: 'protect', title: 'Protection', titleHi: 'सुरक्षा',
    modules: [
      { id: 'scanner', name: 'Scanner', nameHi: 'स्कैनर', desc: 'Check any link, file, APK or message', descHi: 'कोई भी लिंक, फ़ाइल, APK या संदेश जांचें', icon: Search, href: '/scanner', accent: 'text-cyan-400' },
      { id: 'trust', name: 'Trust Search', nameHi: 'ट्रस्ट सर्च', desc: 'Verify a number, site or app before you trust it', descHi: 'भरोसा करने से पहले नंबर, साइट या ऐप सत्यापित करें', icon: SearchCheck, href: '/trust-search', accent: 'text-emerald-400' },
      { id: 'call', name: 'Call & Deepfake Analyzer', nameHi: 'कॉल और डीपफेक विश्लेषक', desc: 'Live scam-call and AI-voice detection', descHi: 'लाइव स्कैम-कॉल और AI-आवाज़ पहचान', icon: Mic, href: '/aianalyzer', accent: 'text-red-400' },
      { id: 'upi', name: 'UPI Guard', nameHi: 'UPI गार्ड', desc: 'Spot fake payment & collect-request tricks', descHi: 'नकली भुगतान और कलेक्ट-रिक्वेस्ट पहचानें', icon: CreditCard, href: '/upi-guard', accent: 'text-indigo-400' },
    ],
  },
  {
    key: 'privacy', title: 'Privacy & Device', titleHi: 'गोपनीयता और डिवाइस',
    modules: [
      { id: 'breach', name: 'Data Breach Check', nameHi: 'डेटा ब्रीच जांच', desc: 'See if your email was leaked in a breach', descHi: 'देखें कि आपका ईमेल किसी ब्रीच में लीक हुआ या नहीं', icon: Database, href: '/breach', accent: 'text-orange-400' },
      { id: 'device', name: 'Device Check', nameHi: 'डिवाइस जांच', desc: 'Audit this device & browser for risks', descHi: 'इस डिवाइस और ब्राउज़र के जोखिम जांचें', icon: Smartphone, href: '/devicescan', accent: 'text-cyan-400' },
      { id: 'privacy', name: 'Privacy Shield', nameHi: 'प्राइवेसी शील्ड', desc: 'Review permissions & tracking exposure', descHi: 'अनुमतियां और ट्रैकिंग जोखिम देखें', icon: Eye, href: '/privacy', accent: 'text-violet-400' },
      { id: 'sentinel', name: 'Sentinel Sweep', nameHi: 'सेंटिनल स्वीप', desc: 'Scan a room for hidden cameras & trackers', descHi: 'छिपे कैमरे और ट्रैकर के लिए कमरा स्कैन करें', icon: Radar, href: '/sentinel', accent: 'text-fuchsia-400' },
      { id: 'sim', name: 'SIM Protection', nameHi: 'सिम सुरक्षा', desc: 'Guard against SIM-swap hijacking', descHi: 'सिम-स्वैप हाईजैक से बचाव', icon: Smartphone, href: '/simprotection', accent: 'text-teal-400' },
    ],
  },
  {
    key: 'intel', title: 'Intelligence & Response', titleHi: 'इंटेलिजेंस और प्रतिक्रिया',
    modules: [
      { id: 'intel', name: 'Scam Intel', nameHi: 'स्कैम इंटेल', desc: 'Documented scams & known threat patterns', descHi: 'दस्तावेज़ित स्कैम और ज्ञात खतरा पैटर्न', icon: Newspaper, href: '/news', accent: 'text-blue-400' },
      { id: 'scamdb', name: 'Scam Number Lookup', nameHi: 'स्कैम नंबर लुकअप', desc: 'Check a phone number against reports', descHi: 'रिपोर्ट के विरुद्ध फ़ोन नंबर जांचें', icon: Phone, href: '/scamdb', accent: 'text-amber-400' },
      { id: 'evidence', name: 'Evidence Vault', nameHi: 'एविडेंस वॉल्ट', desc: 'Fingerprint & keep proof on your device', descHi: 'सबूत का फ़िंगरप्रिंट लें और डिवाइस पर रखें', icon: Lock, href: '/evidence', accent: 'text-emerald-400' },
      { id: 'report', name: 'Report & Rights', nameHi: 'रिपोर्ट और अधिकार', desc: 'File a complaint & know your legal rights', descHi: 'शिकायत दर्ज करें और अपने कानूनी अधिकार जानें', icon: FileText, href: '/legal-rights', accent: 'text-rose-400' },
      { id: 'learn', name: 'Learn', nameHi: 'सीखें', desc: 'Short lessons to spot scams yourself', descHi: 'खुद स्कैम पहचानने के छोटे पाठ', icon: GraduationCap, href: '/education', accent: 'text-sky-400' },
    ],
  },
];

export default function ProtectionCenter() {
  const { lang } = useLanguage();
  const en = lang === 'en';

  const [checking, setChecking] = useState(true);
  const [health, setHealth] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<ProtectionStats | null>(null);

  const runPosture = async () => {
    setChecking(true);
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

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const warnCount = results.filter((r) => r.status === 'WARN' || r.status === 'FAIL').length;

  const postureTone =
    health >= 80 ? 'strong' : health >= 55 ? 'fair' : 'weak';
  const postureLabel = checking
    ? (en ? 'Checking your posture…' : 'आपकी सुरक्षा जांच रहे हैं…')
    : postureTone === 'strong'
      ? (en ? 'Strong security posture' : 'मज़बूत सुरक्षा स्थिति')
      : postureTone === 'fair'
        ? (en ? 'Good — a few things to review' : 'ठीक — कुछ चीज़ें जांचें')
        : (en ? 'Needs attention' : 'ध्यान देने की ज़रूरत');

  const ring =
    postureTone === 'strong' ? 'text-emerald-400' :
    postureTone === 'fair' ? 'text-yellow-400' : 'text-red-400';
  const StatusIcon = checking ? Loader2 : postureTone === 'strong' ? ShieldCheck : postureTone === 'weak' ? ShieldAlert : Shield;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">
            {en ? 'QuantumShield' : 'क्वांटमशील्ड'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {en ? 'Protection Center' : 'सुरक्षा केंद्र'}
          </h1>
        </div>

        {/* ── Posture hero ── */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score ring */}
            <div className="relative shrink-0">
              <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                  className={`${ring} transition-all duration-700`}
                  strokeDasharray={`${(checking ? 0 : health) / 100 * 326.7} 326.7`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <StatusIcon className={`w-6 h-6 ${ring} ${checking ? 'animate-spin' : ''}`} />
                {!checking && <span className="text-2xl font-black mt-1">{health}</span>}
              </div>
            </div>

            {/* Status text */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className={`text-xl font-bold ${checking ? 'text-slate-300' : ring}`}>{postureLabel}</h2>
              {!checking && (
                <p className="text-sm text-slate-400 mt-1">
                  {en
                    ? `${passCount} checks passed · ${warnCount} to review — based on real checks of this device & browser.`
                    : `${passCount} जांच पास · ${warnCount} समीक्षा हेतु — इस डिवाइस और ब्राउज़र की वास्तविक जांच पर आधारित।`}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Link href="/scanner" className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl text-sm font-bold transition">
                  <Search className="w-4 h-4" /> {en ? 'Scan something' : 'कुछ स्कैन करें'}
                </Link>
                <button onClick={runPosture} disabled={checking}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-bold transition">
                  <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> {en ? 'Re-check' : 'फिर जांचें'}
                </button>
              </div>
            </div>
          </div>

          {/* Honest scope note */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
            <p>
              {en
                ? 'QuantumShield protects on demand — scan any link, file, app or message, anytime. Continuous real-time background protection (like a desktop antivirus) requires the installed Android app; a website cannot run in the background.'
                : 'QuantumShield ऑन-डिमांड सुरक्षा देता है — किसी भी लिंक, फ़ाइल, ऐप या संदेश को कभी भी स्कैन करें। लगातार रियल-टाइम बैकग्राउंड सुरक्षा के लिए इंस्टॉल किया गया Android ऐप चाहिए; वेबसाइट बैकग्राउंड में नहीं चल सकती।'}
            </p>
          </div>
        </div>

        {/* ── Real activity ── */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={Activity} value={stats.checks} label={en ? 'Scans run' : 'स्कैन किए'} tone="text-cyan-400" />
            <Stat icon={ShieldAlert} value={stats.threats} label={en ? 'Threats caught' : 'खतरे पकड़े'} tone="text-red-400" />
            <Stat icon={ShieldCheck} value={stats.daysProtected} label={en ? 'Days protected' : 'दिन सुरक्षित'} tone="text-emerald-400" />
          </div>
        )}
        {stats?.isNew && (
          <p className="text-center text-xs text-slate-500 -mt-4">
            {en ? 'Your numbers start at zero and grow only from what you actually do — nothing is invented.' : 'आपके आंकड़े शून्य से शुरू होते हैं और केवल आपके वास्तविक उपयोग से बढ़ते हैं — कुछ भी नकली नहीं।'}
          </p>
        )}

        {/* ── Module pillars ── */}
        {PILLARS.map((pillar) => (
          <section key={pillar.key}>
            <h3 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-bold mb-3">
              {en ? pillar.title : pillar.titleHi}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {pillar.modules.map((m) => {
                const Icon = m.icon;
                return (
                  <Link key={m.id} href={m.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20 p-4 transition">
                    <div className={`shrink-0 p-2.5 rounded-xl bg-black/30 ${m.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{en ? m.name : m.nameHi}</p>
                      <p className="text-xs text-slate-400 truncate">{en ? m.desc : m.descHi}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* ── Posture detail ── */}
        {!checking && results.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-bold mb-3">
              {en ? 'This device — check details' : 'यह डिवाइस — जांच विवरण'}
            </h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
              {results.map((r, i) => {
                const ok = r.status === 'PASS';
                const warn = r.status === 'WARN' || r.status === 'FAIL';
                const RIcon = ok ? CheckCircle2 : warn ? AlertTriangle : Info;
                const tone = ok ? 'text-emerald-400' : warn ? 'text-yellow-400' : 'text-slate-400';
                return (
                  <div key={i} className="flex items-start gap-3 p-3.5">
                    <RIcon className={`w-4 h-4 shrink-0 mt-0.5 ${tone}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{en ? r.check : r.checkHi}</p>
                      <p className="text-xs text-slate-400">{en ? r.detail : r.detailHi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: typeof Shield; value: number; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${tone}`} />
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
