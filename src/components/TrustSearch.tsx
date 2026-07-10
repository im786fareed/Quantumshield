'use client';

/* =========================================================
   QuantumShield – Trust Search
   "Verify before you trust."

   A global digital-trust lookup: the user enters anything —
   a phone number, website, email, UPI ID, app, organization
   or support line — and the grounded AI engine (Gemini +
   Google Search) verifies it against real, authoritative
   sources and returns an evidence-backed trust verdict.

   Honesty by design:
   • Every verdict ships with its real evidence sources.
   • "Verified Official" is impossible without evidence.
   • When the AI engine is unavailable there is NO fallback —
     the user sees an honest error, never simulated results.
   ========================================================= */

import { useRef, useState, useEffect } from 'react';
import {
  Search, ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX,
  Phone, Globe, Mail, MapPin, Smartphone, AtSign, Copy, Check,
  ExternalLink, Share2, MessageCircle, Send, Loader2, AlertTriangle,
  BadgeCheck, LifeBuoy, Network, ListChecks, Link2, Clock, Sparkles,
  Mic, Volume2, Square,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiUrl } from '@/lib/apiBase';
import BackToHome from '@/components/BackToHome';

/* ── Types mirrored from the server engine ── */
type TrustStatus = 'verified_official' | 'unverified' | 'suspicious' | 'confirmed_scam';

interface TrustVerification {
  inputType: string;
  queryIntent: 'verify' | 'find' | 'learn';
  correctedQuery: string | null;
  directAnswer: string | null;
  subjectName: string;
  status: TrustStatus;
  trustScore: number;
  summary: string;
  officialWebsite: string | null;
  officialPhones: { number: string; label: string }[];
  officialEmails: { email: string; label: string }[];
  officialApps: { name: string; store: string }[];
  verifiedSocial: { platform: string; handle: string }[];
  locations: { name: string; address: string }[];
  supportChannels: string[];
  knownScams: string[];
  riskIndicators: string[];
  howVerified: string[];
  recommendation: string;
  saferAlternative: string | null;
  assistantIntro: string;
}

interface TrustEvidenceSource { title: string; url: string }

interface TrustResponse {
  success: boolean;
  checkedAt: string;
  verification: TrustVerification;
  sources: TrustEvidenceSource[];
  searchQueries: string[];
}

interface ChatTurn { role: 'user' | 'assistant'; text: string }

/* ── Client-side hint of what the user typed (display only —
     the server engine makes the real determination) ── */
function detectInputHint(q: string): string {
  const t = q.trim();
  if (!t) return '';
  if (/^\+?[\d\s()-]{7,16}$/.test(t)) return 'phone';
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(t)) return 'email';
  if (/^[\w.-]+@[a-z]{2,}$/i.test(t)) return 'upi';
  if (/^https?:\/\//i.test(t) || (!t.includes(' ') && /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}/i.test(t))) return 'website';
  return 'org';
}

export default function TrustSearch() {
  const lang = useLanguage((s) => s.lang);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrustResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Trust Assistant chat state
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice: dictation in (Web Speech API) + read-aloud out (speech synthesis).
  // Feature-detected in an effect so server and first client render match.
  const [micSupported, setMicSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    setMicSupported(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    setTtsSupported('speechSynthesis' in window);
    return () => {
      try { recRef.current?.stop(); } catch { /* noop */ }
      try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    };
  }, []);

  const toggleDictation = () => {
    if (listening) {
      try { recRef.current?.stop(); } catch { /* noop */ }
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    // Browser picks up whatever language the user speaks best when set to
    // their system language — part of the "no language barrier" goal.
    rec.lang = navigator.language || 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as ArrayLike<any>).map((r: any) => r[0].transcript).join('');
      setQuery(text);
      if (e.results[e.results.length - 1].isFinal) {
        try { rec.stop(); } catch { /* noop */ }
        runSearch(text);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch { /* mic busy */ }
  };

  const toggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const t = {
    en: {
      title: 'Trust Search',
      subtitle: 'Verify before you trust.',
      intro: 'Search like you would anywhere — "Canon support number", a link you received, a UPI ID — and get only details confirmed against real, official sources. Most fraud starts with a wrong number from an ordinary search; this one only returns verified answers.',
      placeholder: 'Ask anything — "SBI customer care number" · +91 1800… · canon-support.xyz',
      verify: 'Verify',
      verifying: 'Checking real sources…',
      verifyingSub: 'Searching official websites, registries and scam intelligence. This takes a few seconds.',
      examplesTitle: 'Try verifying:',
      examples: ['SBI customer care number', 'Life cycle of a butterfly', 'How do I contact Amazon about a refund?', 'irctc.co.in'],
      answer: 'Verified answer',
      answerNote: 'Confirmed against the official sources listed below — not from ads or random listings.',
      showingFor: 'Showing results for:',
      learnVerified: 'Verified Information',
      learnVerifiedSub: 'From authoritative sources',
      listen: 'Listen',
      stopListen: 'Stop',
      micStart: 'Search by voice',
      micStop: 'Stop listening',
      hint: { phone: 'Phone number', email: 'Email address', upi: 'UPI / payment ID', website: 'Website', org: 'Organization / search' },
      status: {
        verified_official: 'Verified Official',
        unverified: 'Unverified',
        suspicious: 'Suspicious',
        confirmed_scam: 'Confirmed Scam / Malicious',
      },
      statusSub: {
        verified_official: 'Confirmed using authoritative sources',
        unverified: 'No reliable evidence found — be careful',
        suspicious: 'Risk indicators detected — do not engage yet',
        confirmed_scam: 'Credible evidence of fraud — do not engage',
      },
      trustScore: 'AI trust assessment',
      trustScoreNote: 'Evidence-based confidence from the AI engine — not a guarantee.',
      officialInfo: 'Verified information',
      website: 'Official website',
      phones: 'Official phone numbers',
      emails: 'Official email addresses',
      apps: 'Official apps',
      social: 'Verified social profiles',
      locations: 'Locations',
      support: 'Support channels',
      knownScams: 'Known scams impersonating this',
      riskIndicators: 'Risk indicators found',
      howVerified: 'How this was verified',
      evidence: 'Evidence sources',
      evidenceNote: 'Real pages the AI consulted for this verdict.',
      queries: 'Searches performed',
      trustGraph: 'Digital Trust Graph',
      recommendation: 'What you should do',
      saferAlt: 'Safer alternative',
      checkedAt: 'Checked',
      justNow: 'just now',
      call: 'Call', copy: 'Copy', copiedLbl: 'Copied', visit: 'Visit', maps: 'Map', share: 'Share', report: 'Report scam',
      assistant: 'AI Trust Assistant',
      assistantSub: 'Ask anything about this result',
      chatPlaceholder: 'e.g. How do I reach real support?',
      chatSend: 'Ask',
      chatThinking: 'Checking…',
      suggested: ['Why should I trust this verdict?', 'What scams use this name?', 'What if I already paid?'],
      emptyLeft: 'No verified contact details could be confirmed from official sources. That does not mean it is fake — it means you should find contacts on the official website yourself.',
      errGeneric: 'Something went wrong. Please try again.',
      noAds: 'No ads · No sponsored results · Evidence only',
      report1930: 'Victim of fraud? Call 1930 (India) or report at cybercrime.gov.in',
      disclaimer: 'Trust Search is AI-assisted verification using real public sources. Always cross-check critical details on the official website before sending money or sharing personal information.',
    },
    hi: {
      title: 'ट्रस्ट सर्च',
      subtitle: 'भरोसा करने से पहले जांचें।',
      intro: 'जैसे कहीं भी सर्च करते हैं वैसे ही पूछें — "Canon सपोर्ट नंबर", कोई लिंक, कोई UPI ID — और सिर्फ़ असली आधिकारिक स्रोतों से पुष्ट जानकारी पाएं। ज़्यादातर धोखाधड़ी आम सर्च से मिले गलत नंबर से शुरू होती है; यह सर्च सिर्फ़ सत्यापित जवाब देता है।',
      placeholder: 'कुछ भी पूछें — "SBI कस्टमर केयर नंबर" · +91 1800… · canon-support.xyz',
      verify: 'जांचें',
      verifying: 'असली स्रोत जांचे जा रहे हैं…',
      verifyingSub: 'आधिकारिक वेबसाइट, रजिस्ट्री और स्कैम डेटा खोजे जा रहे हैं। कुछ सेकंड लगेंगे।',
      examplesTitle: 'इन्हें जांच कर देखें:',
      examples: ['SBI कस्टमर केयर नंबर', 'तितली का जीवन चक्र', 'Amazon रिफंड के लिए संपर्क कैसे करूं?', 'irctc.co.in'],
      answer: 'सत्यापित उत्तर',
      answerNote: 'नीचे दिए आधिकारिक स्रोतों से पुष्टि की गई — विज्ञापनों या अनजान लिस्टिंग से नहीं।',
      showingFor: 'इसके परिणाम दिखाए जा रहे हैं:',
      learnVerified: 'सत्यापित जानकारी',
      learnVerifiedSub: 'आधिकारिक स्रोतों से',
      listen: 'सुनें',
      stopListen: 'रोकें',
      micStart: 'बोलकर खोजें',
      micStop: 'सुनना बंद करें',
      hint: { phone: 'फोन नंबर', email: 'ईमेल पता', upi: 'UPI / पेमेंट ID', website: 'वेबसाइट', org: 'संस्था / खोज' },
      status: {
        verified_official: 'सत्यापित आधिकारिक',
        unverified: 'असत्यापित',
        suspicious: 'संदिग्ध',
        confirmed_scam: 'पुष्ट स्कैम / खतरनाक',
      },
      statusSub: {
        verified_official: 'आधिकारिक स्रोतों से पुष्टि हुई',
        unverified: 'कोई भरोसेमंद प्रमाण नहीं मिला — सावधान रहें',
        suspicious: 'जोखिम के संकेत मिले — अभी संपर्क न करें',
        confirmed_scam: 'धोखाधड़ी के पक्के प्रमाण — बिल्कुल संपर्क न करें',
      },
      trustScore: 'AI ट्रस्ट आकलन',
      trustScoreNote: 'AI इंजन का प्रमाण-आधारित आकलन — गारंटी नहीं।',
      officialInfo: 'सत्यापित जानकारी',
      website: 'आधिकारिक वेबसाइट',
      phones: 'आधिकारिक फोन नंबर',
      emails: 'आधिकारिक ईमेल',
      apps: 'आधिकारिक ऐप्स',
      social: 'सत्यापित सोशल प्रोफाइल',
      locations: 'पते',
      support: 'सहायता के तरीके',
      knownScams: 'इसके नाम पर चलने वाले स्कैम',
      riskIndicators: 'मिले जोखिम संकेत',
      howVerified: 'जांच कैसे हुई',
      evidence: 'प्रमाण स्रोत',
      evidenceNote: 'AI ने इस नतीजे के लिए ये असली पेज देखे।',
      queries: 'की गई खोजें',
      trustGraph: 'डिजिटल ट्रस्ट ग्राफ',
      recommendation: 'आपको क्या करना चाहिए',
      saferAlt: 'सुरक्षित विकल्प',
      checkedAt: 'जांचा गया',
      justNow: 'अभी',
      call: 'कॉल', copy: 'कॉपी', copiedLbl: 'कॉपी हुआ', visit: 'खोलें', maps: 'नक्शा', share: 'साझा करें', report: 'स्कैम रिपोर्ट करें',
      assistant: 'AI ट्रस्ट असिस्टेंट',
      assistantSub: 'इस नतीजे के बारे में कुछ भी पूछें',
      chatPlaceholder: 'जैसे: असली सपोर्ट से कैसे बात करूं?',
      chatSend: 'पूछें',
      chatThinking: 'जांच रहा है…',
      suggested: ['इस नतीजे पर भरोसा क्यों करूं?', 'इस नाम से कौन से स्कैम चलते हैं?', 'अगर मैंने पैसे भेज दिए तो?'],
      emptyLeft: 'आधिकारिक स्रोतों से कोई संपर्क विवरण पुष्ट नहीं हुआ। इसका मतलब नकली होना नहीं है — खुद आधिकारिक वेबसाइट से संपर्क खोजें।',
      errGeneric: 'कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।',
      noAds: 'कोई विज्ञापन नहीं · कोई पेड रैंकिंग नहीं · केवल प्रमाण',
      report1930: 'धोखाधड़ी हुई है? 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट करें',
      disclaimer: 'ट्रस्ट सर्च असली सार्वजनिक स्रोतों पर आधारित AI-सहायित जांच है। पैसे भेजने या निजी जानकारी देने से पहले आधिकारिक वेबसाइट पर विवरण खुद जांचें।',
    },
  }[lang];

  const STATUS_STYLE: Record<TrustStatus, { icon: any; wrap: string; text: string; dot: string }> = {
    verified_official: { icon: ShieldCheck,    wrap: 'bg-green-500/10 border-green-500/40',  text: 'text-green-400',  dot: 'bg-green-400' },
    unverified:        { icon: ShieldQuestion, wrap: 'bg-yellow-500/10 border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    suspicious:        { icon: ShieldAlert,    wrap: 'bg-orange-500/10 border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-400' },
    confirmed_scam:    { icon: ShieldX,        wrap: 'bg-red-500/10 border-red-500/50',       text: 'text-red-400',    dot: 'bg-red-500' },
  };

  const hint = detectInputHint(query);

  const doCopy = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const doShare = async () => {
    if (!result) return;
    const v = result.verification;
    const text = `QuantumShield Trust Search — "${v.subjectName}": ${t.status[v.status]}. ${v.summary}`;
    try {
      if (navigator.share) await navigator.share({ title: 'QuantumShield Trust Search', text });
      else await doCopy(text, 'share');
    } catch { /* user cancelled */ }
  };

  const runSearch = async (q?: string) => {
    const searchFor = (q ?? query).trim();
    if (!searchFor || loading) return;
    if (q) setQuery(q);

    setLoading(true);
    setError(null);
    setResult(null);
    setChat([]);
    setChatError(null);

    try {
      const res = await fetch(apiUrl('/api/trust-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchFor, lang }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || t.errGeneric);
        return;
      }
      setResult(data as TrustResponse);
      setChat([{ role: 'assistant', text: (data as TrustResponse).verification.assistantIntro }]);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const askAssistant = async (q?: string) => {
    const question = (q ?? chatInput).trim();
    if (!question || chatBusy || !result) return;

    setChat((c) => [...c, { role: 'user', text: question }]);
    setChatInput('');
    setChatBusy(true);
    setChatError(null);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await fetch(apiUrl('/api/trust-search/assist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          lang,
          context: JSON.stringify(result.verification),
          history: chat.slice(-8),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setChatError(data?.error || t.errGeneric);
        return;
      }
      setChat((c) => [...c, { role: 'assistant', text: data.answer }]);
    } catch {
      setChatError(t.errGeneric);
    } finally {
      setChatBusy(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  /* ── Small building blocks ── */
  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
        <Icon className="w-4 h-4 text-blue-400" /> {title}
      </h3>
      {children}
    </div>
  );

  const ActionBtn = ({ onClick, href, children }: { onClick?: () => void; href?: string; children: React.ReactNode }) => {
    const cls = 'inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition';
    return href
      ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>{children}</a>
      : <button onClick={onClick} className={cls}>{children}</button>;
  };

  const v = result?.verification;
  const style = v ? STATUS_STYLE[v.status] : null;
  const StatusIcon = style?.icon ?? ShieldQuestion;

  const hasAnyOfficialInfo = v && (
    v.officialWebsite || v.officialPhones.length > 0 || v.officialEmails.length > 0 ||
    v.officialApps.length > 0 || v.verifiedSocial.length > 0 || v.locations.length > 0 ||
    v.supportChannels.length > 0
  );

  /* Trust Graph rows built only from evidence-backed data */
  const graphRows = v ? [
    { label: v.subjectName, danger: false, root: true },
    ...(v.officialWebsite ? [{ label: v.officialWebsite, danger: false }] : []),
    ...v.officialPhones.map((p) => ({ label: `${p.number} — ${p.label}`, danger: false })),
    ...v.officialEmails.map((e) => ({ label: e.email, danger: false })),
    ...v.officialApps.map((a) => ({ label: `${a.name} (${a.store})`, danger: false })),
    ...v.verifiedSocial.map((s) => ({ label: `${s.platform}: ${s.handle}`, danger: false })),
    ...v.knownScams.map((s) => ({ label: s, danger: true })),
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <BackToHome />

      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="mx-auto w-fit flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-5">
          <BadgeCheck className="w-3.5 h-3.5 text-blue-300" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-blue-300">{t.noAds}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <p className="text-lg font-bold text-gray-200 mb-2">{t.subtitle}</p>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">{t.intro}</p>
      </div>

      {/* ── Search bar ── */}
      <div className="max-w-3xl mx-auto mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder={t.placeholder}
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-12 pr-24 py-4 text-sm outline-none focus:border-blue-400 placeholder-gray-600 transition"
            />
            {hint && !listening && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded-full px-2.5 py-1">
                {t.hint[hint as keyof typeof t.hint]}
              </span>
            )}
            {listening && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 bg-red-500/15 border border-red-500/40 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> {t.micStop}
              </span>
            )}
          </div>
          {micSupported && (
            <button
              onClick={toggleDictation}
              aria-label={listening ? t.micStop : t.micStart}
              title={listening ? t.micStop : t.micStart}
              className={`px-4 rounded-xl border transition flex items-center ${
                listening
                  ? 'bg-red-600/80 hover:bg-red-500 border-red-400 animate-pulse'
                  : 'bg-white/5 hover:bg-white/15 border-white/15'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => runSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {t.verify}
          </button>
        </div>

        {/* examples */}
        {!result && !loading && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-gray-500">{t.examplesTitle}</span>
            {t.examples.map((ex) => (
              <button
                key={ex}
                onClick={() => runSearch(ex)}
                className="text-[11px] font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 transition"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Loading (honest about what is happening) ── */}
      {loading && (
        <div className="max-w-3xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-10 mt-6">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="font-bold text-gray-200">{t.verifying}</p>
          <p className="text-xs text-gray-500 mt-1">{t.verifyingSub}</p>
        </div>
      )}

      {/* ── Error (no fake fallback, ever) ── */}
      {error && !loading && (
        <div className="max-w-3xl mx-auto flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4 mt-6">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* ── "Showing results for" (typo correction, Google-style) ── */}
      {v && !loading && v.correctedQuery && (
        <p className="max-w-6xl mx-auto mt-5 text-sm text-gray-400">
          {t.showingFor} <span className="font-bold text-blue-300">{v.correctedQuery}</span>
        </p>
      )}

      {/* ── Result: two synchronized panels ── */}
      {v && style && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">

          {/* ═══ LEFT: structured verified information ═══ */}
          <div className="lg:col-span-3 space-y-4">

            {/* direct verified answer (find & learn queries) */}
            {v.directAnswer && (
              <div className="bg-green-500/10 border-2 border-green-500/40 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-300">
                    <BadgeCheck className="w-4 h-4" /> {t.answer}
                  </h3>
                  {ttsSupported && (
                    <button
                      onClick={() => toggleSpeak(v.directAnswer!)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition"
                      aria-label={speaking ? t.stopListen : t.listen}
                    >
                      {speaking ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {speaking ? t.stopListen : t.listen}
                    </button>
                  )}
                </div>
                <p className="text-base font-bold text-gray-100 leading-relaxed">{v.directAnswer}</p>
                <p className="text-[11px] text-gray-500 mt-2">{t.answerNote}</p>
              </div>
            )}

            {/* status banner */}
            <div className={`border-2 rounded-2xl p-5 ${style.wrap}`}>
              <div className="flex items-start gap-4">
                <StatusIcon className={`w-10 h-10 shrink-0 ${style.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-black text-lg ${style.text}`}>
                      {v.queryIntent === 'learn' && v.status === 'verified_official' ? t.learnVerified : t.status[v.status]}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-black/30 rounded-full px-2 py-0.5">
                      {v.queryIntent === 'learn' && v.status === 'verified_official' ? t.learnVerifiedSub : t.statusSub[v.status]}
                    </span>
                  </div>
                  <h2 className="text-xl font-black break-words">{v.subjectName}</h2>
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">{v.summary}</p>
                </div>
              </div>

              {/* AI trust assessment bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span className="font-bold">{t.trustScore}</span>
                  <span className={`font-black ${style.text}`}>{v.trustScore}/100</span>
                </div>
                <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                  <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${v.trustScore}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{t.trustScoreNote}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <ActionBtn onClick={doShare}><Share2 className="w-3 h-3" /> {copied === 'share' ? t.copiedLbl : t.share}</ActionBtn>
                {ttsSupported && !v.directAnswer && (
                  <ActionBtn onClick={() => toggleSpeak(`${v.summary} ${v.recommendation}`)}>
                    {speaking ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />} {speaking ? t.stopListen : t.listen}
                  </ActionBtn>
                )}
                {(v.status === 'suspicious' || v.status === 'confirmed_scam') && (
                  <ActionBtn href="https://cybercrime.gov.in"><ExternalLink className="w-3 h-3" /> {t.report}</ActionBtn>
                )}
                <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3" /> {t.checkedAt}: {t.justNow}
                </span>
              </div>
            </div>

            {/* recommendation */}
            {v.recommendation && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300 mb-2">
                  <ListChecks className="w-4 h-4" /> {t.recommendation}
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{v.recommendation}</p>
                {v.saferAlternative && (
                  <p className="text-sm text-green-300 mt-2">
                    <span className="font-bold">{t.saferAlt}:</span> {v.saferAlternative}
                  </p>
                )}
              </div>
            )}

            {/* verified information */}
            {hasAnyOfficialInfo ? (
              <div className="space-y-4">
                {v.officialWebsite && (
                  <Section icon={Globe} title={t.website}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-100 break-all">{v.officialWebsite}</span>
                      <ActionBtn href={v.officialWebsite.startsWith('http') ? v.officialWebsite : `https://${v.officialWebsite}`}>
                        <ExternalLink className="w-3 h-3" /> {t.visit}
                      </ActionBtn>
                      <ActionBtn onClick={() => doCopy(v.officialWebsite!, 'site')}>
                        {copied === 'site' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied === 'site' ? t.copiedLbl : t.copy}
                      </ActionBtn>
                    </div>
                  </Section>
                )}

                {v.officialPhones.length > 0 && (
                  <Section icon={Phone} title={t.phones}>
                    <div className="space-y-2">
                      {v.officialPhones.map((p, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-100">{p.number}</span>
                            <span className="text-[11px] text-gray-500 ml-2">{p.label}</span>
                          </div>
                          <ActionBtn href={`tel:${p.number.replace(/[^\d+]/g, '')}`}><Phone className="w-3 h-3" /> {t.call}</ActionBtn>
                          <ActionBtn onClick={() => doCopy(p.number, `ph${i}`)}>
                            {copied === `ph${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied === `ph${i}` ? t.copiedLbl : t.copy}
                          </ActionBtn>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {v.officialEmails.length > 0 && (
                  <Section icon={Mail} title={t.emails}>
                    <div className="space-y-2">
                      {v.officialEmails.map((e, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-100 break-all">{e.email}</span>
                            <span className="text-[11px] text-gray-500 ml-2">{e.label}</span>
                          </div>
                          <ActionBtn onClick={() => doCopy(e.email, `em${i}`)}>
                            {copied === `em${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied === `em${i}` ? t.copiedLbl : t.copy}
                          </ActionBtn>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {v.officialApps.length > 0 && (
                  <Section icon={Smartphone} title={t.apps}>
                    <div className="space-y-1.5">
                      {v.officialApps.map((a, i) => (
                        <div key={i} className="text-sm text-gray-200">
                          <span className="font-bold">{a.name}</span>
                          <span className="text-[11px] text-gray-500 ml-2">{a.store}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {v.verifiedSocial.length > 0 && (
                  <Section icon={AtSign} title={t.social}>
                    <div className="space-y-1.5">
                      {v.verifiedSocial.map((s, i) => (
                        <div key={i} className="text-sm text-gray-200">
                          <span className="text-[11px] text-gray-500 mr-2">{s.platform}</span>
                          <span className="font-bold break-all">{s.handle}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {v.locations.length > 0 && (
                  <Section icon={MapPin} title={t.locations}>
                    <div className="space-y-2">
                      {v.locations.map((l, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                          <div className="flex-1 min-w-0 text-sm text-gray-200">
                            <span className="font-bold">{l.name}</span>
                            <span className="text-[11px] text-gray-500 ml-2">{l.address}</span>
                          </div>
                          <ActionBtn href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.name} ${l.address}`)}`}>
                            <MapPin className="w-3 h-3" /> {t.maps}
                          </ActionBtn>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {v.supportChannels.length > 0 && (
                  <Section icon={LifeBuoy} title={t.support}>
                    <ul className="space-y-1.5">
                      {v.supportChannels.map((s, i) => (
                        <li key={i} className="text-sm text-gray-200 flex gap-2">
                          <span className="text-blue-400">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-400">{t.emptyLeft}</p>
              </div>
            )}

            {/* risk indicators */}
            {v.riskIndicators.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-300 mb-2">
                  <AlertTriangle className="w-4 h-4" /> {t.riskIndicators}
                </h3>
                <ul className="space-y-1.5">
                  {v.riskIndicators.map((r, i) => (
                    <li key={i} className="text-sm text-orange-100 flex gap-2"><span>⚠</span> {r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* known scams */}
            {v.knownScams.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-300 mb-2">
                  <ShieldX className="w-4 h-4" /> {t.knownScams}
                </h3>
                <ul className="space-y-1.5">
                  {v.knownScams.map((s, i) => (
                    <li key={i} className="text-sm text-red-100 flex gap-2"><span>✕</span> {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* trust graph */}
            {graphRows.length > 1 && (
              <Section icon={Network} title={t.trustGraph}>
                <div className="space-y-0">
                  {graphRows.map((row, i) => (
                    <div key={i} className="flex items-stretch gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${row.danger ? 'bg-red-500' : (row as any).root ? style.dot : 'bg-blue-400'}`} />
                        {i < graphRows.length - 1 && <span className="w-px flex-1 bg-white/15" />}
                      </div>
                      <p className={`text-sm pb-3 break-words min-w-0 ${row.danger ? 'text-red-300' : (row as any).root ? 'font-black text-gray-100' : 'text-gray-300'}`}>
                        {row.danger ? '⚠ ' : ''}{row.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* how verified + evidence */}
            {v.howVerified.length > 0 && (
              <Section icon={ShieldCheck} title={t.howVerified}>
                <ul className="space-y-1.5">
                  {v.howVerified.map((h, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">✓</span> {h}</li>
                  ))}
                </ul>
              </Section>
            )}

            {result!.sources.length > 0 && (
              <Section icon={Link2} title={t.evidence}>
                <p className="text-[11px] text-gray-500 mb-2">{t.evidenceNote}</p>
                <div className="space-y-1.5">
                  {result!.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 hover:underline break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {s.title}
                    </a>
                  ))}
                </div>
                {result!.searchQueries.length > 0 && (
                  <p className="text-[10px] text-gray-600 mt-3">
                    {t.queries}: {result!.searchQueries.join(' · ')}
                  </p>
                )}
              </Section>
            )}
          </div>

          {/* ═══ RIGHT: AI Trust Assistant ═══ */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="w-9 h-9 rounded-xl bg-blue-500/25 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{t.assistant}</h3>
                  <p className="text-[10px] text-gray-400">{t.assistantSub}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[16rem]">
                {chat.map((turn, i) => (
                  <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      turn.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white/10 text-gray-100 rounded-bl-sm'
                    }`}>
                      {turn.text}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.chatThinking}
                  </div>
                )}
                {chatError && (
                  <p className="text-xs text-red-300">{chatError}</p>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* suggested follow-ups */}
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {t.suggested.map((s) => (
                  <button
                    key={s}
                    onClick={() => askAssistant(s)}
                    disabled={chatBusy}
                    className="text-[10px] font-bold text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 rounded-full px-2.5 py-1 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAssistant()}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 placeholder-gray-600 transition"
                  />
                  <button
                    onClick={() => askAssistant()}
                    disabled={chatBusy || !chatInput.trim()}
                    className="px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label={t.chatSend}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer: reporting + honesty ── */}
      <div className="max-w-3xl mx-auto mt-10 space-y-3">
        <a
          href="tel:1930"
          className="flex items-center justify-center gap-2 bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 rounded-xl px-4 py-3 text-sm font-bold text-red-200 transition"
        >
          <MessageCircle className="w-4 h-4" /> {t.report1930}
        </a>
        <p className="text-[10px] text-gray-600 text-center leading-relaxed">{t.disclaimer}</p>
      </div>
    </div>
  );
}
