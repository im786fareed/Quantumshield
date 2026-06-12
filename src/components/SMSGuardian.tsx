'use client';
import { MessageSquare, Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Loader2, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import { apiUrl } from '@/lib/apiBase';

interface Props { lang: 'en' | 'hi' }

interface AnalysisResult {
  spam: boolean;
  confidence: number;
  score: number;
  level: string;
  threatType: string;
  message: string;
  reasons: string[];
  indicators: string[];
}

export default function SMSGuardian({ lang }: Props) {
  const en = lang !== 'hi';
  const [activeTab, setActiveTab] = useState<'check' | 'learn'>('check');
  const [smsText, setSmsText] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<AnalysisResult | null>(null);
  const [error,    setError]    = useState('');

  const analyse = async () => {
    const text = smsText.trim();
    if (!text || text.length < 3) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res  = await fetch(apiUrl('/api/check-spam'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data as AnalysisResult);
    } catch (e: any) {
      setError(e.message ?? 'Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const threatColor = (level?: string) => {
    if (!level) return 'border-slate-600 bg-slate-800/40';
    const l = level.toLowerCase();
    if (l === 'critical' || l === 'high') return 'border-red-500/60 bg-red-500/10';
    if (l === 'medium') return 'border-orange-500/60 bg-orange-500/10';
    if (l === 'low') return 'border-yellow-500/60 bg-yellow-500/10';
    return 'border-emerald-500/60 bg-emerald-500/10';
  };

  const examples = en ? [
    'URGENT: Your SBI account is blocked. Update KYC now: http://bit.ly/sbikycin',
    'Congratulations! You have won ₹2,50,000 in Lucky Draw. Call 9876543210 to claim.',
    'Dear customer, your PNB loan of ₹2L is approved. Pay processing fee ₹999 to 8765432109@paytm',
  ] : [
    'अत्यावश्यक: आपका SBI खाता ब्लॉक है। KYC अपडेट करें: http://bit.ly/sbikycin',
    'बधाई! Lucky Draw में आपने ₹2,50,000 जीते। 9876543210 पर कॉल करें।',
    'ग्राहक, आपका ₹2L लोन मंजूर। ₹999 प्रोसेसिंग शुल्क 8765432109@paytm पर भेजें',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl mb-4">
          <MessageSquare className="w-12 h-12 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold mb-1 text-white">
          {en ? 'SMS Guardian' : 'SMS गार्डियन'}
        </h1>
        <p className="text-slate-400">
          {en ? 'Paste any suspicious SMS or message — AI analyses it instantly' : 'कोई भी संदिग्ध SMS पेस्ट करें — AI तुरंत विश्लेषण करेगा'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        {(['check', 'learn'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold transition text-sm ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {tab === 'check' ? (en ? 'Analyse SMS' : 'SMS विश्लेषण') : (en ? 'Learn' : 'सीखें')}
          </button>
        ))}
      </div>

      {/* ── CHECK TAB ── */}
      {activeTab === 'check' && (
        <div className="space-y-5">
          {/* Input */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {en ? 'Paste suspicious SMS or message text' : 'संदिग्ध SMS या संदेश पेस्ट करें'}
            </label>
            <textarea
              rows={5}
              value={smsText}
              onChange={e => { setSmsText(e.target.value); setResult(null); setError(''); }}
              placeholder={en
                ? 'Example: "URGENT: Your account will be blocked. Verify KYC at http://bit.ly/verify-now"'
                : 'उदाहरण: "अत्यावश्यक: आपका खाता ब्लॉक हो जाएगा। KYC सत्यापित करें: http://bit.ly/verify-now"'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-slate-500 text-xs">{smsText.length} {en ? 'chars' : 'अक्षर'}</span>
              <button
                onClick={analyse}
                disabled={!smsText.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm transition"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{en ? 'Analysing…' : 'विश्लेषण…'}</> : (en ? 'Analyse' : 'विश्लेषण करें')}
              </button>
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center">{en ? 'Try:' : 'उदाहरण:'}</span>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setSmsText(ex); setResult(null); }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition truncate max-w-[200px]"
              >
                {ex.slice(0, 38)}…
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border p-5 ${threatColor(result.level)}`}>
              {/* Verdict row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {result.spam
                    ? <XCircle className="w-7 h-7 text-red-400" />
                    : <CheckCircle className="w-7 h-7 text-emerald-400" />}
                  <div>
                    <div className={`text-xl font-black ${result.spam ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.spam
                        ? (en ? 'SCAM / SPAM DETECTED' : 'स्कैम / स्पैम मिला')
                        : (en ? 'LOOKS SAFE' : 'सुरक्षित लगता है')}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">{result.threatType}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-black ${result.spam ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="text-slate-500 text-xs">{en ? 'Confidence' : 'विश्वास'}</div>
                </div>
              </div>

              {/* AI message */}
              <div className="bg-black/30 rounded-xl px-4 py-3 text-sm text-slate-200 mb-4">
                {result.message}
              </div>

              {/* Indicators */}
              {(result.indicators?.length > 0 || result.reasons?.length > 0) && (
                <div className="mb-4">
                  <div className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    {en ? 'Threat Indicators' : 'खतरे के संकेतक'}
                  </div>
                  <ul className="space-y-1">
                    {[...(result.indicators ?? []), ...(result.reasons ?? [])].map((ind, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 shrink-0">•</span>{ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advice */}
              <div className="bg-black/20 rounded-xl px-4 py-3 text-sm">
                <span className="font-bold text-white">{en ? 'What to do: ' : 'क्या करें: '}</span>
                <span className="text-slate-300">
                  {result.spam
                    ? (en
                      ? 'Do NOT click any links. Do NOT share OTP. Block the sender. Report to 1930 if you suffered a loss.'
                      : 'किसी भी लिंक पर क्लिक न करें। OTP साझा न करें। प्रेषक को ब्लॉक करें। नुकसान होने पर 1930 पर रिपोर्ट करें।')
                    : (en
                      ? 'No strong scam signals found. Always stay alert — never share OTP or passwords.'
                      : 'कोई मजबूत स्कैम संकेत नहीं। हमेशा सतर्क रहें — OTP या पासवर्ड कभी साझा न करें।')}
                </span>
              </div>
            </div>
          )}

          {/* Privacy notice */}
          <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-emerald-200 text-xs">
              {en
                ? 'Analysis runs on this server only to check text patterns — no SMS is ever stored, shared, or logged. Zero PII transmitted.'
                : 'विश्लेषण केवल टेक्स्ट पैटर्न जांच के लिए इस सर्वर पर चलता है — कोई SMS संग्रहीत, साझा या लॉग नहीं किया जाता।'}
            </p>
          </div>
        </div>
      )}

      {/* ── LEARN TAB ── */}
      {activeTab === 'learn' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            {en ? 'Common SMS Scams in India' : 'भारत में सामान्य SMS स्कैम'}
          </h2>
          {[
            {
              color: 'red', title: en ? '1. OTP Fraud' : '1. OTP धोखाधड़ी',
              body: en
                ? 'Scammers impersonate banks and ask you to share the OTP you receive. Once shared, they empty your account within seconds. Real banks NEVER ask for OTP.'
                : 'स्कैमर बैंक का नाटक करते हैं और आपको मिला OTP मांगते हैं। एक बार साझा होने पर वे तुरंत खाता खाली कर देते हैं। असली बैंक कभी OTP नहीं मांगते।',
            },
            {
              color: 'orange', title: en ? '2. KYC / Account Block' : '2. KYC / खाता ब्लॉक',
              body: en
                ? 'Message claims your KYC is pending and account will be blocked. Contains a phishing link that steals credentials. Your bank will NEVER send a link via SMS to update KYC.'
                : 'संदेश में कहा जाता है कि KYC पेंडिंग है और खाता ब्लॉक हो जाएगा। SMS में दिया लिंक आपकी जानकारी चुरा लेता है।',
            },
            {
              color: 'yellow', title: en ? '3. Lottery / Prize Fraud' : '3. लॉटरी / पुरस्कार',
              body: en
                ? 'You "won" a prize in a draw you never entered. They ask for a processing fee to release your winnings. No legitimate lottery asks for money upfront.'
                : 'आपने बिना हिस्सा लिए कोई लॉटरी "जीती"। वे "प्रोसेसिंग शुल्क" मांगते हैं। कोई वैध लॉटरी पहले पैसे नहीं मांगती।',
            },
            {
              color: 'purple', title: en ? '4. Loan Processing Fee' : '4. लोन प्रोसेसिंग शुल्क',
              body: en
                ? 'SMS says your loan is approved and asks you to pay a processing/insurance fee to receive the amount. Once you pay, the loan never comes and they vanish.'
                : 'SMS कहता है लोन मंजूर है और प्रोसेसिंग/बीमा शुल्क मांगता है। शुल्क देने के बाद लोन नहीं आता और वे गायब हो जाते हैं।',
            },
            {
              color: 'pink', title: en ? '5. TRAI / SIM Block' : '5. TRAI / SIM ब्लॉक',
              body: en
                ? 'Fake TRAI message claims your mobile number will be disconnected for illegal use. They ask you to "verify" by calling them — it\'s a trap to extort money.'
                : 'नकली TRAI संदेश कहता है कि आपका नंबर गैरकानूनी उपयोग के लिए बंद होगा। "सत्यापन" के लिए कॉल करवाते हैं — यह पैसे वसूलने का जाल है।',
            },
          ].map(({ color, title, body }) => (
            <div key={title} className={`bg-${color}-900/20 rounded-xl border border-${color}-500/50 p-5`}>
              <h3 className={`font-bold text-${color}-400 mb-2`}>{title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{body}</p>
            </div>
          ))}

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition mt-2"
          >
            <ExternalLink className="w-4 h-4" />
            {en ? 'Report a scam at cybercrime.gov.in' : 'cybercrime.gov.in पर स्कैम रिपोर्ट करें'}
          </a>
        </div>
      )}
    </div>
  );
}
