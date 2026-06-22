'use client';

/**
 * On-launch Security Check.
 *
 * Shown once per session, right after the user has consented. It is honest by
 * design — it does NOT claim to block attacks or control the phone. It:
 *   1. Runs the REAL on-device browser/security checks (shared deviceChecks lib)
 *      and shows a genuine health score + the issues that matter.
 *   2. Offers a one-tap scan of a link the user just copied, screened instantly
 *      on-device with the same phishing heuristics the URL checker uses.
 *
 * Read-only. No data leaves the device. Fully dismissible.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, ShieldAlert, ShieldX, Info, X, Loader2,
  ClipboardCheck, ArrowRight, Lock,
} from 'lucide-react';
import { runRealChecks, type ScanResult } from '@/lib/security/deviceChecks';
import { analyzeUrl, findUrlInText, type UrlAnalysis } from '@/lib/security/urlHeuristics';

const SESSION_KEY = 'qs_seccheck_session';
const CONSENT_KEY = 'qs_consent_2026';

export default function SecurityCheck({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const L = lang;
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [health, setHealth] = useState<number | null>(null);

  // Clipboard link scan
  const [linkState, setLinkState] = useState<'idle' | 'checking' | 'none' | 'done' | 'blocked'>('idle');
  const [linkResult, setLinkResult] = useState<UrlAnalysis | null>(null);

  const T = {
    en: {
      title: 'Security Check', sub: 'A quick, on-device check the moment you open the app',
      running: 'Checking your device & connection…',
      hardened: 'Well protected', moderate: 'A few things to review', risk: 'Needs attention',
      passed: 'passed', warnings: 'to review', failed: 'issues',
      linkTitle: 'Scan a link you copied',
      linkDesc: 'Copied a suspicious link from SMS or WhatsApp? Check it instantly — it never leaves your phone.',
      checkClip: 'Check my copied link',
      checking: 'Checking copied link…',
      none: 'No link found in your clipboard. Copy a link, then tap again — or open the full Scanner.',
      blocked: "Couldn't read the clipboard (your browser blocked it). Open the full Scanner to paste it instead.",
      safe: 'No phishing signals found', risky: 'Looks dangerous — do not open',
      openScanner: 'Open full Scanner', dismiss: 'Done', note: 'Read-only · nothing is stored or sent',
      whatThis: 'This app warns and guides you — it cannot take over your phone or block attacks inside other apps. That is by design, and it keeps you safe.',
    },
    hi: {
      title: 'सुरक्षा जांच', sub: 'ऐप खोलते ही आपके डिवाइस पर एक त्वरित जांच',
      running: 'आपका डिवाइस और कनेक्शन जांचा जा रहा है…',
      hardened: 'अच्छी तरह सुरक्षित', moderate: 'कुछ चीज़ें देखें', risk: 'ध्यान देने की ज़रूरत',
      passed: 'पास', warnings: 'समीक्षा', failed: 'समस्याएं',
      linkTitle: 'कॉपी किया लिंक जांचें',
      linkDesc: 'SMS या WhatsApp से कोई संदिग्ध लिंक कॉपी किया? तुरंत जांचें — यह आपके फ़ोन से बाहर नहीं जाता।',
      checkClip: 'मेरा कॉपी किया लिंक जांचें',
      checking: 'कॉपी किया लिंक जांचा जा रहा है…',
      none: 'क्लिपबोर्ड में कोई लिंक नहीं मिला। लिंक कॉपी करें, फिर दोबारा टैप करें — या पूरा स्कैनर खोलें।',
      blocked: 'क्लिपबोर्ड नहीं पढ़ सका (ब्राउज़र ने रोका)। पूरा स्कैनर खोलकर पेस्ट करें।',
      safe: 'कोई फ़िशिंग संकेत नहीं मिला', risky: 'खतरनाक लगता है — न खोलें',
      openScanner: 'पूरा स्कैनर खोलें', dismiss: 'हो गया', note: 'केवल-पढ़ने · कुछ संग्रहीत या भेजा नहीं जाता',
      whatThis: 'यह ऐप आपको चेतावनी और मार्गदर्शन देता है — यह आपका फ़ोन नियंत्रित नहीं कर सकता या अन्य ऐप्स के अंदर हमले रोक नहीं सकता। यही इसका सुरक्षित डिज़ाइन है।',
    },
  }[L];

  // Decide whether to show: only after consent, once per session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let tries = 0;

    const maybeShow = () => {
      if (cancelled) return;
      const consented = localStorage.getItem(CONSENT_KEY);
      const seen = sessionStorage.getItem(SESSION_KEY);
      if (seen) return; // already shown this session
      if (consented) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setOpen(true);
        return;
      }
      // consent not given yet (first run) — retry briefly while the consent popup is up
      if (tries++ < 40) setTimeout(maybeShow, 800);
    };

    const initial = setTimeout(maybeShow, 700);
    return () => { cancelled = true; clearTimeout(initial); };
  }, []);

  // Allow re-opening on demand (e.g. a button on the homepage).
  useEffect(() => {
    const handler = () => {
      setLinkState('idle');
      setLinkResult(null);
      setResults([]);
      setHealth(null);
      setOpen(true);
    };
    window.addEventListener('qs:open-security-check', handler);
    return () => window.removeEventListener('qs:open-security-check', handler);
  }, []);

  // Run the real device checks when opened.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setScanning(true);
    runRealChecks(L).then(({ results, health }) => {
      if (cancelled) return;
      setResults(results);
      setHealth(health);
      setScanning(false);
    });
    return () => { cancelled = true; };
  }, [open, L]);

  const checkClipboard = useCallback(async () => {
    setLinkState('checking');
    setLinkResult(null);
    try {
      const text = await navigator.clipboard.readText();
      const url = findUrlInText(text || '');
      if (!url) { setLinkState('none'); return; }
      setLinkResult(analyzeUrl(url));
      setLinkState('done');
    } catch {
      setLinkState('blocked');
    }
  }, []);

  const close = () => setOpen(false);

  if (!open) return null;

  const passCount = results.filter(r => r.status === 'PASS').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  // Surface the issues first.
  const topIssues = results
    .filter(r => r.status === 'FAIL' || r.status === 'WARN')
    .slice(0, 3);

  const healthLabel = health === null ? '' : health >= 80 ? T.hardened : health >= 55 ? T.moderate : T.risk;
  const healthColor = health === null ? 'text-slate-400' : health >= 80 ? 'text-emerald-400' : health >= 55 ? 'text-amber-400' : 'text-red-400';
  const ringColor = health === null ? 'text-slate-700' : health >= 80 ? 'text-emerald-500' : health >= 55 ? 'text-amber-500' : 'text-red-500';

  const statusIcon = (s: ScanResult['status']) =>
    s === 'PASS' ? <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> :
    s === 'WARN' ? <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" /> :
    s === 'FAIL' ? <ShieldX className="w-4 h-4 text-red-400 shrink-0" /> :
    <Info className="w-4 h-4 text-blue-400 shrink-0" />;

  const C = 2 * Math.PI * 34; // circumference for r=34

  return (
    <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/30 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 rounded-2xl border border-blue-500/25">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">{T.title}</h2>
              <p className="text-[11px] text-slate-500 leading-tight">{T.sub}</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanning */}
        {scanning && (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-slate-400">{T.running}</p>
          </div>
        )}

        {/* Result */}
        {!scanning && health !== null && (
          <div className="space-y-5">
            {/* Score */}
            <div className="flex items-center gap-4 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
              <div className="relative shrink-0">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={C} strokeDashoffset={C - (C * health) / 100}
                    strokeLinecap="round" className={ringColor} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-black ${healthColor}`}>{health}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-black ${healthColor}`}>{healthLabel}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {passCount > 0 && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">{passCount} {T.passed}</span>}
                  {warnCount > 0 && <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">{warnCount} {T.warnings}</span>}
                  {failCount > 0 && <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">{failCount} {T.failed}</span>}
                </div>
              </div>
            </div>

            {/* Top issues (only if any) */}
            {topIssues.length > 0 && (
              <div className="space-y-2">
                {topIssues.map((r, i) => (
                  <div key={i} className="flex gap-2.5 items-start bg-black/30 border border-white/5 rounded-xl p-3">
                    {statusIcon(r.status)}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{L === 'en' ? r.check : r.checkHi}</div>
                      <p className="text-[11px] text-slate-400 leading-snug">{L === 'en' ? r.detail : r.detailHi}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clipboard link scan */}
            <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">{T.linkTitle}</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mb-3">{T.linkDesc}</p>

              {linkState !== 'done' && (
                <button
                  onClick={checkClipboard}
                  disabled={linkState === 'checking'}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-xl transition"
                >
                  {linkState === 'checking'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {T.checking}</>
                    : <>{T.checkClip}</>}
                </button>
              )}

              {linkState === 'none' && <p className="text-[11px] text-amber-400 mt-2 leading-snug">{T.none}</p>}
              {linkState === 'blocked' && <p className="text-[11px] text-amber-400 mt-2 leading-snug">{T.blocked}</p>}

              {linkState === 'done' && linkResult && (
                <div className={`mt-1 rounded-xl p-3 border ${linkResult.safe ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-red-500/40 bg-red-950/30'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {linkResult.safe
                      ? <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      : <ShieldX className="w-5 h-5 text-red-400" />}
                    <span className={`text-sm font-black ${linkResult.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                      {linkResult.safe ? T.safe : T.risky}
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-slate-500">{linkResult.score}/100</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono break-all mb-1.5">{linkResult.url}</p>
                  {linkResult.flags.length > 0 && (
                    <ul className="space-y-1">
                      {linkResult.flags.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-[11px] text-slate-300 leading-snug flex gap-1.5">
                          <span className="text-red-400">•</span>{f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href="/scanner" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 mt-2">
                    {T.openScanner} <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Honest boundary note */}
            <div className="flex gap-2 items-start text-[10px] text-slate-500 leading-snug">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-600" />
              <p>{T.whatThis}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <a href="/scanner" className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-200 py-3 rounded-xl transition">
                {T.openScanner}
              </a>
              <button onClick={close} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black py-3 rounded-xl transition">
                {T.dismiss}
              </button>
            </div>

            <p className="text-center text-[9px] text-slate-600 font-mono uppercase tracking-wider">{T.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
