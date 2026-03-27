'use client';
import { useState } from 'react';
import {
  CreditCard, AlertTriangle, CheckCircle, XCircle,
  Search, Shield, QrCode, ChevronRight, Info,
  Eye, AlertCircle, Lock
} from 'lucide-react';
import BackToHome from './BackToHome';

interface RiskResult {
  score: number;
  level: 'safe' | 'suspicious' | 'danger';
  flags: string[];
  advice: string[];
}

const UPI_FRAUD_PATTERNS = [
  { name: 'Fake Merchant', nameHi: 'नकली व्यापारी', desc: 'Fraudulent QR codes with lookalike merchant names', descHi: 'नकली QR कोड', icon: QrCode, amount: '₹45Cr', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  { name: 'Request Scam', nameHi: 'रिक्वेस्ट स्कैम', desc: '"Collect money" sent as payment request', descHi: 'भुगतान अनुरोध घोटाला', icon: CreditCard, amount: '₹28Cr', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  { name: 'Cashback Fraud', nameHi: 'कैशबैक धोखा', desc: 'Pay ₹1 to get ₹1000 cashback trick', descHi: '₹1 दो, ₹1000 पाओ — झूठ', icon: AlertTriangle, amount: '₹15Cr', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  { name: 'Screen Share Hack', nameHi: 'स्क्रीन शेयर हैक', desc: 'Attacker views PIN via remote access apps', descHi: 'रिमोट ऐप से PIN देखना', icon: Eye, amount: '₹7Cr', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
];

const SAFE_CHECKLIST = [
  { en: 'Verify the merchant name matches the shop/person', hi: 'व्यापारी का नाम सत्यापित करें' },
  { en: 'Never scan a QR sent via WhatsApp/Telegram from unknown', hi: 'अज्ञात QR स्कैन न करें' },
  { en: '"Collect" = you GIVE money — not receive it', hi: '"Collect" का मतलब आप पैसे देते हैं' },
  { en: 'Real cashback never asks you to pay first', hi: 'असली कैशबैक पहले भुगतान नहीं मांगता' },
  { en: 'Never share UPI PIN with anyone — ever', hi: 'UPI PIN कभी किसी को न बताएं' },
  { en: 'Check receiver VPA carefully before confirming', hi: 'VPA ध्यान से जांचें' },
];

function analyzeUPI(input: string): RiskResult {
  const lower = input.toLowerCase().trim();
  const flags: string[] = [];
  let score = 0;

  // Suspicious UPI ID patterns
  if (lower.includes('support') || lower.includes('help') || lower.includes('service') || lower.includes('refund')) {
    flags.push('Contains support/help/refund keywords — common in fraud UPI IDs');
    score += 35;
  }
  if (lower.includes('paytm') && !lower.endsWith('@paytm')) {
    flags.push('Impersonating Paytm but not official domain');
    score += 40;
  }
  if (lower.includes('google') && !lower.endsWith('@okaxis') && !lower.endsWith('@okhdfcbank') && !lower.endsWith('@okicici') && !lower.endsWith('@oksbi')) {
    flags.push('May impersonate Google Pay — check official handle');
    score += 30;
  }
  if (/\d{10,}/.test(lower)) {
    flags.push('Long number sequence — verify it is a legitimate registered ID');
    score += 15;
  }
  if (lower.includes('cashback') || lower.includes('prize') || lower.includes('winner') || lower.includes('lottery')) {
    flags.push('Fraud keyword detected: cashback/prize/winner');
    score += 50;
  }
  if (lower.includes('verify') || lower.includes('kyc') || lower.includes('block') || lower.includes('freeze')) {
    flags.push('Urgency keyword — typical scammer tactic to pressure payment');
    score += 45;
  }
  // Known safe domains
  const safeDomains = ['@oksbi', '@okaxis', '@okicici', '@okhdfcbank', '@ybl', '@ibl', '@axl', '@upi', '@hdfcbank', '@sbi', '@icici', '@kotak', '@paytm', '@apl', '@rajgovnp', '@yapl'];
  const hasSafeDomain = safeDomains.some(d => lower.endsWith(d));
  if (hasSafeDomain && score === 0) {
    flags.push('Registered on a known banking handle');
  }
  if (!lower.includes('@')) {
    flags.push('Missing @ — not a valid UPI VPA format');
    score += 20;
  }

  const advice: string[] = [];
  if (score >= 60) {
    advice.push('Do NOT proceed with this payment.');
    advice.push('Report this UPI ID at cybercrime.gov.in or call 1930.');
    advice.push('Block the sender immediately.');
  } else if (score >= 25) {
    advice.push('Proceed with caution. Verify the recipient in person or via trusted channel.');
    advice.push('Start with a ₹1 test transaction if unsure.');
    advice.push('Confirm the name shown in your UPI app matches the person.');
  } else {
    advice.push('Looks like a legitimate UPI format.');
    advice.push('Always verify the receiver\'s name shown after entering VPA.');
    advice.push('Never share your UPI PIN with anyone.');
  }

  return {
    score,
    level: score >= 60 ? 'danger' : score >= 25 ? 'suspicious' : 'safe',
    flags: flags.length ? flags : ['No immediate red flags detected in format'],
    advice,
  };
}

export default function UPIGuard() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [activeTab, setActiveTab] = useState<'check' | 'patterns' | 'safety'>('check');

  const t = {
    en: {
      title: 'UPI & QR Fraud Guard',
      subtitle: 'India\'s #2 Digital Fraud — Defeated',
      checkTab: 'Check UPI ID',
      patternsTab: 'Fraud Patterns',
      safetyTab: 'Safety Rules',
      inputLabel: 'Enter UPI VPA or Suspicious ID',
      inputPlaceholder: 'e.g. support-refund@xyz or merchant123@paytm',
      btnAnalyze: 'Analyze Risk',
      btnClear: 'Clear',
      resultTitle: 'Risk Analysis Result',
      safeLabel: 'SAFE',
      suspLabel: 'SUSPICIOUS',
      dangerLabel: 'DANGER',
      flagsTitle: 'Red Flags Detected',
      adviceTitle: 'Recommended Action',
      fraudTitle: 'Common UPI Fraud Patterns',
      safetyTitle: 'The 6 UPI Safety Rules',
      reportCTA: 'Report to Cyber Crime',
      callCTA: 'Call 1930 Helpline',
    },
    hi: {
      title: 'UPI और QR फ्रॉड गार्ड',
      subtitle: 'भारत का #2 डिजिटल फ्रॉड — रोकें',
      checkTab: 'UPI ID जांचें',
      patternsTab: 'फ्रॉड पैटर्न',
      safetyTab: 'सुरक्षा नियम',
      inputLabel: 'संदिग्ध UPI VPA दर्ज करें',
      inputPlaceholder: 'जैसे: support-refund@xyz',
      btnAnalyze: 'जोखिम विश्लेषण करें',
      btnClear: 'साफ करें',
      resultTitle: 'जोखिम विश्लेषण परिणाम',
      safeLabel: 'सुरक्षित',
      suspLabel: 'संदिग्ध',
      dangerLabel: 'खतरनाक',
      flagsTitle: 'पहचाने गए खतरे',
      adviceTitle: 'सुझाई गई कार्रवाई',
      fraudTitle: 'सामान्य UPI फ्रॉड पैटर्न',
      safetyTitle: '6 UPI सुरक्षा नियम',
      reportCTA: 'साइबर क्राइम रिपोर्ट',
      callCTA: '1930 हेल्पलाइन',
    }
  }[lang];

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setResult(analyzeUPI(input));
  };

  const getLevelStyle = (level: RiskResult['level']) => {
    if (level === 'safe') return { bg: 'bg-green-500/20 border-green-500/50', text: 'text-green-400', label: t.safeLabel, icon: CheckCircle };
    if (level === 'suspicious') return { bg: 'bg-yellow-500/20 border-yellow-500/50', text: 'text-yellow-400', label: t.suspLabel, icon: AlertTriangle };
    return { bg: 'bg-red-500/20 border-red-500/50', text: 'text-red-400', label: t.dangerLabel, icon: XCircle };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        <BackToHome />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/30 border border-orange-500/50 mb-5">
            <CreditCard className="w-10 h-10 text-orange-400" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-400">{t.subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-300">₹95 Crore lost to UPI fraud annually in India</span>
          </div>
          <div className="mt-2">
            <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition">
              {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
          {(['check', 'patterns', 'safety'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                activeTab === tab ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'check' ? t.checkTab : tab === 'patterns' ? t.patternsTab : t.safetyTab}
            </button>
          ))}
        </div>

        {/* Tab: Check UPI */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                {t.inputLabel}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none font-mono text-sm"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!input.trim()}
                  className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {t.btnAnalyze}
                </button>
              </div>
              {input && (
                <button onClick={() => { setInput(''); setResult(null); }} className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition">
                  {t.btnClear}
                </button>
              )}
            </div>

            {result && (() => {
              const style = getLevelStyle(result.level);
              const Icon = style.icon;
              return (
                <div className={`border rounded-2xl p-6 ${style.bg}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <Icon className={`w-8 h-8 ${style.text}`} />
                    <div>
                      <h3 className="text-xl font-black">{t.resultTitle}</h3>
                      <span className={`text-sm font-bold ${style.text}`}>{style.label} — Risk Score: {result.score}/100</span>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="bg-black/30 rounded-full h-3 mb-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.level === 'safe' ? 'bg-green-400' :
                        result.level === 'suspicious' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.max(result.score, 5)}%` }}
                    />
                  </div>

                  <div className="mb-4">
                    <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">{t.flagsTitle}</h4>
                    <ul className="space-y-2">
                      {result.flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-5">
                    <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">{t.adviceTitle}</h4>
                    <ul className="space-y-2">
                      {result.advice.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.level === 'danger' && (
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="https://cybercrime.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-bold transition"
                      >
                        <Shield className="w-4 h-4" />
                        {t.reportCTA}
                      </a>
                      <a
                        href="tel:1930"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-bold transition"
                      >
                        📞 {t.callCTA}
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab: Fraud Patterns */}
        {activeTab === 'patterns' && (
          <div>
            <h2 className="text-xl font-bold mb-5">{t.fraudTitle}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {UPI_FRAUD_PATTERNS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.name} className={`border rounded-xl p-5 ${p.bg}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className={`w-6 h-6 shrink-0 ${p.color}`} />
                      <div>
                        <h3 className="font-bold">{lang === 'en' ? p.name : p.nameHi}</h3>
                        <p className="text-xs text-gray-400 mt-1">{lang === 'en' ? p.desc : p.descHi}</p>
                      </div>
                    </div>
                    <div className={`text-xl font-black ${p.color}`}>{p.amount}</div>
                    <div className="text-xs text-gray-500">estimated annual losses</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Safety Rules */}
        {activeTab === 'safety' && (
          <div>
            <h2 className="text-xl font-bold mb-5">{t.safetyTitle}</h2>
            <div className="space-y-3">
              {SAFE_CHECKLIST.map((rule, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 font-black text-orange-400 text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{lang === 'en' ? rule.en : rule.hi}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gradient-to-r from-orange-600/10 to-red-600/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-bold text-orange-400">Golden Rule:</span> UPI is for sending money. You do NOT need to enter your PIN or scan a QR to <em>receive</em> money. Anyone asking you to do so is a scammer.
              </p>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
          <Info className="w-3 h-3" />
          <span>All analysis is heuristic-based and on-device. No UPI IDs are stored or transmitted.</span>
        </div>
      </div>
    </div>
  );
}
