'use client';
import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Search, ExternalLink, Database } from 'lucide-react';

interface BreachResult {
  breached: boolean;
  breaches: string[];
  count: number;
}

export default function DataBreachChecker({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const content = {
    en: {
      title: '🔍 Data Breach Checker',
      subtitle: 'Check if your email appears in known data breaches — powered by the XposedOrNot breach database',
      emailLabel: 'Enter Email Address',
      emailPlaceholder: 'your.email@example.com',
      checkButton: 'Check Breaches',
      checking: 'Checking...',
      breachedTitle: (n: number) => `⚠️ Found in ${n} known breach${n === 1 ? '' : 'es'}`,
      breachedText: 'This email appeared in the following breached services. Change those passwords now.',
      safeTitle: '✅ Good news — no known breaches',
      safeText: 'This email does not appear in any publicly known data breach. Keep using strong, unique passwords.',
      privacy: 'Your email is checked against the public XposedOrNot database and is never stored by QuantumShield.',
      alsoCheck: 'You can also cross-check on',
      whatToDo: 'What to Do If Breached',
      steps: [
        'Change passwords immediately',
        'Enable two-factor authentication',
        'Monitor account activity',
        'Use unique passwords per account',
        'Consider a password manager'
      ],
      errorGeneric: 'Could not check right now. Please try again in a minute.'
    },
    hi: {
      title: '🔍 डेटा उल्लंघन जांचकर्ता',
      subtitle: 'जांचें कि क्या आपका ईमेल किसी ज्ञात डेटा उल्लंघन में शामिल है — XposedOrNot डेटाबेस द्वारा संचालित',
      emailLabel: 'ईमेल पता दर्ज करें',
      emailPlaceholder: 'your.email@example.com',
      checkButton: 'उल्लंघन जांचें',
      checking: 'जांच रहे हैं...',
      breachedTitle: (n: number) => `⚠️ ${n} ज्ञात उल्लंघन में पाया गया`,
      breachedText: 'यह ईमेल इन सेवाओं के डेटा उल्लंघन में मिला। उन पासवर्ड को तुरंत बदलें।',
      safeTitle: '✅ अच्छी खबर — कोई ज्ञात उल्लंघन नहीं',
      safeText: 'यह ईमेल किसी सार्वजनिक रूप से ज्ञात डेटा उल्लंघन में नहीं मिला। मजबूत, अद्वितीय पासवर्ड उपयोग करते रहें।',
      privacy: 'आपका ईमेल सार्वजनिक XposedOrNot डेटाबेस से जांचा जाता है और QuantumShield द्वारा कभी संग्रहीत नहीं किया जाता।',
      alsoCheck: 'आप यहां भी जांच सकते हैं',
      whatToDo: 'यदि उल्लंघन हो तो क्या करें',
      steps: [
        'तुरंत पासवर्ड बदलें',
        'दो-कारक प्रमाणीकरण सक्षम करें',
        'खाता गतिविधि की निगरानी करें',
        'प्रति खाते अद्वितीय पासवर्ड का उपयोग करें',
        'पासवर्ड प्रबंधक पर विचार करें'
      ],
      errorGeneric: 'अभी जांच नहीं हो सकी। कृपया एक मिनट में फिर प्रयास करें।'
    }
  };

  const t = content[lang];

  const checkBreaches = async () => {
    const trimmed = email.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/check-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || t.errorGeneric);
      } else {
        setResult(data as BreachResult);
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-orange-100">{t.subtitle}</p>
      </div>

      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <label className="block text-sm font-semibold mb-2">{t.emailLabel}</label>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkBreaches()}
            placeholder={t.emailPlaceholder}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={checkBreaches}
            disabled={loading || !email.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            {loading ? t.checking : t.checkButton}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-3">{t.privacy}</p>
      </div>

      {error && (
        <div className="bg-yellow-600/20 border-2 border-yellow-500/50 rounded-xl p-5 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />
          <p className="text-gray-200">{error}</p>
        </div>
      )}

      {result && result.breached && (
        <div className="bg-red-600/20 border-2 border-red-500/60 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <h3 className="font-bold text-red-300 text-xl mb-1">{t.breachedTitle(result.count)}</h3>
              <p className="text-gray-200">{t.breachedText}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.breaches.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 text-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                <Database className="w-3.5 h-3.5" />
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {result && !result.breached && (
        <div className="bg-green-600/20 border-2 border-green-500/50 rounded-xl p-6 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-8 h-8 text-green-400 shrink-0" />
          <div>
            <h3 className="font-bold text-green-300 text-xl mb-1">{t.safeTitle}</h3>
            <p className="text-gray-200">{t.safeText}</p>
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-2xl mb-4">{t.whatToDo}</h2>
        <ol className="space-y-3">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-gray-400 text-sm text-center">
        {t.alsoCheck}{' '}
        <a
          href="https://haveibeenpwned.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300 inline-flex items-center gap-1">
          Have I Been Pwned <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </p>
    </div>
  );
}
