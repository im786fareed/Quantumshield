'use client';

import { useState } from 'react';
import {
  Phone, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Info,
  Globe, Radio, MapPin, Sparkles, Ban, ExternalLink, Loader2, Users,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiUrl } from '@/lib/apiBase';
import { analyseCaller, type CallerIntel, type Recommendation, type RiskBand } from '@/lib/security/callerIntel';
import BackToHome from './BackToHome';

/* ── Presentation config ── */

const BAND_CFG: Record<RiskBand, { label: string; labelHi: string; ring: string; text: string; bg: string; border: string }> = {
  SAFE:       { label: 'SAFE',       labelHi: 'सुरक्षित',   ring: 'text-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40' },
  LOW:        { label: 'LOW RISK',   labelHi: 'कम जोखिम',   ring: 'text-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/40' },
  SUSPICIOUS: { label: 'SUSPICIOUS', labelHi: 'संदिग्ध',    ring: 'text-orange-400',  text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/40' },
  DANGEROUS:  { label: 'DANGEROUS',  labelHi: 'खतरनाक',     ring: 'text-red-400',     text: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/50' },
};

const REC_CFG: Record<Recommendation, { icon: any; en: string; hi: string; cls: string }> = {
  SAFE_TO_ANSWER:  { icon: ShieldCheck,  en: '🟢 Safe to Answer',                    hi: '🟢 उत्तर देना सुरक्षित',              cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
  CAUTION:         { icon: AlertTriangle, en: '🟡 Exercise Caution',                  hi: '🟡 सावधानी बरतें',                    cls: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300' },
  VERIFY_IDENTITY: { icon: ShieldAlert,   en: '🟠 Verify Identity Before Sharing',    hi: '🟠 जानकारी देने से पहले पहचान सत्यापित करें', cls: 'bg-orange-500/15 border-orange-500/40 text-orange-300' },
  HIGH_RISK:       { icon: XCircle,       en: '🔴 High Scam Risk',                    hi: '🔴 उच्च स्कैम जोखिम',                 cls: 'bg-red-500/15 border-red-500/40 text-red-300' },
  BLOCK:           { icon: Ban,           en: '⚫ Block Immediately',                 hi: '⚫ तुरंत ब्लॉक करें',                  cls: 'bg-zinc-800 border-zinc-600 text-zinc-200' },
};

const STATUS_ICON: Record<string, any> = { PASS: CheckCircle, WARN: AlertTriangle, FAIL: XCircle, INFO: Info };
const STATUS_COLOR: Record<string, string> = { PASS: 'text-emerald-400', WARN: 'text-yellow-400', FAIL: 'text-red-400', INFO: 'text-cyan-400' };

interface Enrichment {
  carrier: string | null;
  carrierNote: string | null;
  carrierNoteHi: string | null;
  circle: string | null;
  origin: string;
  originHi: string;
  originConfidence: number;
  aiSummary: string | null;
  aiWhyPoints: string[];
  aiConfidenceNote: string | null;
  engine: 'ai' | 'rules';
}

export default function QuantumLocate() {
  const { lang } = useLanguage();
  const en = lang === 'en';

  const [input, setInput] = useState('');
  const [result, setResult] = useState<CallerIntel | null>(null);
  const [enrich, setEnrich] = useState<Enrichment | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState(false);

  const handleCheck = () => {
    const t = input.trim();
    if (!t) return;
    setResult(analyseCaller(t));
    setEnrich(null);
    setEnrichError(false);
  };

  const handleReset = () => {
    setInput(''); setResult(null); setEnrich(null); setEnrichError(false);
  };

  const handleEnrich = async () => {
    if (!result) return;
    setEnriching(true);
    setEnrichError(false);
    try {
      const res = await fetch(apiUrl('/api/caller-intel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: result.input }),
      });
      if (!res.ok) throw new Error('enrich failed');
      const data = await res.json();
      setEnrich(data as Enrichment);
    } catch {
      setEnrichError(true);
    } finally {
      setEnriching(false);
    }
  };

  const band = result ? BAND_CFG[result.riskBand] : null;
  const rec = result ? REC_CFG[result.recommendation] : null;

  // Origin/confidence reflect enrichment once loaded.
  const originText = enrich ? (en ? enrich.origin : enrich.originHi) : result ? (en ? result.origin : result.originHi) : '';
  const originConf = enrich ? enrich.originConfidence : result?.originConfidence ?? 0;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <BackToHome />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-2xl">
          <MapPin className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            QuantumLocate<span className="text-indigo-400">™</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {en
              ? 'AI Caller Intelligence · risk verdict runs 100% on-device'
              : 'AI कॉलर इंटेलिजेंस · जोखिम फैसला 100% ऑन-डिवाइस'}
          </p>
        </div>
      </div>

      {/* Honesty banner */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 mb-5 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          {en
            ? 'QuantumLocate estimates a Likely Origin from telecom data — never your caller\'s live GPS or exact address. Where evidence is thin, it says "Origin Unknown" instead of guessing.'
            : 'QuantumLocate टेलीकॉम डेटा से संभावित मूल का अनुमान लगाता है — कॉलर का लाइव GPS या सटीक पता कभी नहीं। सबूत कम होने पर यह अनुमान नहीं लगाता, "मूल अज्ञात" कहता है।'}
        </p>
      </div>

      {/* Input */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {en ? 'Enter a phone number to analyse' : 'विश्लेषण के लिए फोन नंबर दर्ज करें'}
        </label>
        <div className="flex gap-3">
          <input
            type="tel"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder={en ? '+91 98765 43210 · +1 202… · 140…' : '+91 98765 43210 · +1 202… · 140…'}
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            {en ? 'Analyse' : 'विश्लेषण'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {en
            ? 'Indian & international numbers. Country/type/risk checked offline; no number is sent unless you tap "Deep lookup".'
            : 'भारतीय व अंतर्राष्ट्रीय नंबर। देश/प्रकार/जोखिम ऑफलाइन जांचे जाते हैं; "डीप लुकअप" दबाने तक कोई नंबर नहीं भेजा जाता।'}
        </p>
      </div>

      {/* Results */}
      {result && band && rec && (
        <div className="space-y-5">

          {/* Verdict banner: Trust + Risk */}
          <div className={`rounded-2xl border p-5 ${band.border} ${band.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-xs mb-1">{en ? 'Trust Score' : 'ट्रस्ट स्कोर'}</div>
                <div className={`text-4xl font-black ${band.ring}`}>
                  {result.trustScore}<span className="text-lg text-slate-500 font-bold"> / 100</span>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 text-sm font-bold ${band.text}`}>
                  <ShieldAlert className="w-4 h-4" />
                  {en ? band.label : band.labelHi}
                  <span className="text-slate-500 font-normal">· {en ? 'Risk' : 'जोखिम'} {result.riskScore}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-xs mb-1">{result.e164 ?? result.input}</div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold ${rec.cls}`}>
                  <rec.icon className="w-4 h-4" />
                  {en ? rec.en : rec.hi}
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Likely origin */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-400 text-xs">{en ? 'Likely Origin' : 'संभावित मूल'}</span>
              </div>
              <div className="text-white font-semibold text-lg">{originText}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${originConf}%` }} />
                </div>
                <span className="text-xs text-slate-400">{originConf}% {en ? 'confidence' : 'विश्वास'}</span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {(en ? result.originConfidenceReasons : result.originConfidenceReasonsHi).map((r, i) => (
                  <li key={i} className="text-[11px] text-slate-500 flex gap-1.5"><span className="text-indigo-400">·</span>{r}</li>
                ))}
              </ul>
            </div>

            {/* Number type */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 text-xs">{en ? 'Number Type' : 'नंबर प्रकार'}</span>
              </div>
              <div className="text-white font-medium text-sm">{en ? result.numberType : result.numberTypeHi}</div>
              {result.isVirtualLikely && (
                <div className="text-[11px] text-orange-400 mt-1">{en ? 'Virtual / VoIP detected' : 'वर्चुअल / VoIP मिला'}</div>
              )}
            </div>

            {/* Country */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-xs">{en ? 'Country' : 'देश'}</span>
              </div>
              <div className="text-white font-medium text-sm">
                {en ? result.countryName : result.countryNameHi}{result.callingCode ? ` (${result.callingCode})` : ''}
              </div>
            </div>

            {/* Carrier (enrichment) */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400 text-xs">{en ? 'Carrier' : 'कैरियर'}</span>
              </div>
              {enrich?.carrier ? (
                <div className="text-white font-medium text-sm">{enrich.carrier}</div>
              ) : enrich ? (
                <div className="text-slate-500 text-sm">{en ? 'Not in offline database' : 'ऑफलाइन डेटाबेस में नहीं'}</div>
              ) : (
                <div className="text-slate-500 text-sm">{en ? 'Tap Deep lookup' : 'डीप लुकअप दबाएं'}</div>
              )}
              {enrich?.carrierNote && (
                <div className="text-[11px] text-slate-500 mt-1">{en ? enrich.carrierNote : enrich.carrierNoteHi}</div>
              )}
            </div>

            {/* Spam reports — honest empty state */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-xs">{en ? 'Community Spam Reports' : 'सामुदायिक स्पैम रिपोर्ट'}</span>
              </div>
              <div className="text-slate-500 text-sm">{en ? 'No report data on file' : 'कोई रिपोर्ट डेटा नहीं'}</div>
              <div className="text-[11px] text-slate-600 mt-1">
                {en ? 'We never fabricate report counts' : 'हम रिपोर्ट संख्या कभी नहीं गढ़ते'}
              </div>
            </div>
          </div>

          {/* Scam categories */}
          {result.scamCategories.length > 0 && (
            <div className={`rounded-2xl border p-4 ${band.border} ${band.bg}`}>
              <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${band.text}`} />
                {en ? 'Scam patterns linked to this number type' : 'इस नंबर प्रकार से जुड़े स्कैम पैटर्न'}
              </div>
              <div className="flex flex-wrap gap-2">
                {(en ? result.scamCategories : result.scamCategoriesHi).map((c, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${band.border} ${band.text}`}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI analysis */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-white font-semibold text-sm">{en ? 'AI Analysis' : 'AI विश्लेषण'}</h3>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                {enrich?.engine === 'ai' ? (en ? 'Gemini' : 'Gemini') : (en ? 'On-device' : 'ऑन-डिवाइस')}
              </span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {enrich?.aiSummary ?? (en ? result.summary : result.summaryHi)}
            </p>

            {enrich?.aiWhyPoints && enrich.aiWhyPoints.length > 0 && (
              <ul className="mt-3 space-y-1">
                {enrich.aiWhyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            )}
            {enrich?.aiConfidenceNote && (
              <p className="text-xs text-slate-500 mt-2 italic">{enrich.aiConfidenceNote}</p>
            )}

            {/* Deep lookup trigger */}
            {!enrich && (
              <button
                onClick={handleEnrich}
                disabled={enriching}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition"
              >
                {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {enriching
                  ? (en ? 'Looking up…' : 'खोज रहे हैं…')
                  : (en ? 'Deep lookup: carrier, circle & AI summary' : 'डीप लुकअप: कैरियर, सर्कल व AI सारांश')}
              </button>
            )}
            {!enrich && (
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                {en ? 'This sends the number to QuantumShield servers for carrier/circle metadata.' : 'यह कैरियर/सर्कल मेटाडेटा के लिए नंबर QuantumShield सर्वर पर भेजता है।'}
              </p>
            )}
            {enrichError && (
              <p className="text-xs text-red-400 mt-2 text-center">
                {en ? 'Lookup unavailable — your on-device verdict above still stands.' : 'लुकअप उपलब्ध नहीं — ऊपर आपका ऑन-डिवाइस फैसला मान्य है।'}
              </p>
            )}
          </div>

          {/* Why this score — explainable */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 text-sm">
              {en ? 'Why this score? (explainable)' : 'यह स्कोर क्यों? (व्याख्येय)'}
            </h3>
            {result.whyScore.length > 0 ? (
              <ul className="space-y-1.5 mb-4">
                {(en ? result.whyScore : result.whyScoreHi).map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`mt-0.5 ${band.text}`}>▸</span>{w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 mb-4">{en ? 'No risk signals fired in our on-device checks.' : 'हमारी ऑन-डिवाइस जांच में कोई जोखिम संकेत नहीं मिला।'}</p>
            )}

            <div className="border-t border-slate-800 pt-3 space-y-3">
              {result.signals.map((s, i) => {
                const Icon = STATUS_ICON[s.status];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_COLOR[s.status]}`} />
                    <div>
                      <div className="text-white text-sm font-medium">{en ? s.label : s.labelHi}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{en ? s.detail : s.detailHi}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 rounded-xl py-3 text-sm font-semibold transition"
            >
              <ExternalLink className="w-4 h-4" />
              {en ? 'Report on cybercrime.gov.in' : 'cybercrime.gov.in पर रिपोर्ट करें'}
            </a>
            <button
              onClick={handleReset}
              className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
            >
              {en ? 'Reset' : 'रीसेट'}
            </button>
          </div>

          {/* Golden rules */}
          <div className="bg-slate-900/60 border border-slate-700/30 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="text-slate-300 font-semibold text-sm mb-2">
              {en ? 'Universal rules (regardless of verdict)' : 'सार्वभौमिक नियम (परिणाम चाहे जो भी हो)'}
            </div>
            {(en ? [
              'Never share an OTP — not even with your bank, police, or TRAI.',
              'No government agency threatens "Digital Arrest" over a phone call.',
              'Banks never ask for card numbers, CVV, or passwords over the phone.',
              'If unsure, hang up and call back on the official number from the website.',
              'Report scam calls: dial 1930 or visit cybercrime.gov.in',
            ] : [
              'OTP किसी को न बताएं — बैंक, पुलिस या TRAI के नाम पर भी नहीं।',
              'कोई सरकारी एजेंसी फोन पर "डिजिटल अरेस्ट" की धमकी नहीं देती।',
              'बैंक कभी फोन पर कार्ड नंबर, CVV या पासवर्ड नहीं मांगते।',
              'संदेह हो तो फोन काटें और आधिकारिक वेबसाइट से नंबर लेकर वापस कॉल करें।',
              'स्कैम कॉल रिपोर्ट करें: 1930 डायल करें या cybercrime.gov.in पर जाएं।',
            ]).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
