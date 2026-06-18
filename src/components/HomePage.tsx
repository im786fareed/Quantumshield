'use client';
import { useState } from 'react';
import {
  Shield, AlertTriangle, Phone, FileText, Mic,
  Lock, Scan, Smartphone, Activity,
  Brain, BookOpen, Newspaper, ChevronDown, ChevronUp,
  CreditCard, Scale, MessageSquare, Database,
  X, ExternalLink, PhoneCall, Users, Link2, ArrowRight
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  icon: any;
  path: string;
  category: string;
}

export default function HomePage({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [language] = useState<'en' | 'hi'>(lang);
  const [betaDismissed, setBetaDismissed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  /* ── i18n ── */
  const t = {
    en: {
      betaText: 'BETA — Some features are demonstrations. For actual cybercrime report to',
      title: 'QuantumShield',
      pitch: 'When a scammer has you on the phone,',
      pitchAccent: 'your phone warns you — and your family knows.',
      tagline: 'AI-powered protection during the scam, not after · Free forever',
      heroCallTitle: 'AI Call Analyzer',
      heroCallDesc: 'Listens to a suspicious call live, on your device, and warns you the moment digital-arrest or fraud patterns appear.',
      heroCallCta: 'Start live protection',
      heroCbTitle: 'Circuit Breaker',
      heroCbDesc: 'The instant a scam is detected, your chosen family members get an alert with your location. Scammers depend on isolating you — this breaks it.',
      heroCbCta: 'Set up family alerts',
      quickTitle: 'Got something suspicious right now?',
      quickMsg: 'Check a message', quickMsgDesc: 'SMS · WhatsApp · Email',
      quickUrl: 'Check a link', quickUrlDesc: 'Phishing & fake sites',
      quickNum: 'Check a number', quickNumDesc: 'Scam caller lookup',
      statsCases: '28.15 Lakh', statsCasesLabel: 'Cases in India 2025',
      statsLost: '₹22,495 Cr', statsLostLabel: 'Lost to fraud 2025',
      statsSaved: '₹8,189 Cr', statsSavedLabel: 'Saved by I4C helpline',
      statsSource: 'Source: I4C / MHA Annual Report, Feb 2026',
      coreTitle: 'Core Protection',
      threatsTitle: 'Live Threat Watch · India 2025–26',
      showAllBtn: 'All tools',
      hideAllBtn: 'Hide extra tools',
      secEmergency: '🚨 Emergency',
      secScan: '🔍 Scan & Detect',
      secProtect: '🛡️ Protect',
      secLearn: '📚 Learn',
      secAntifraud: '⚡ Anti-Fraud',
      secMore: '🔧 More Tools',
    },
    hi: {
      betaText: 'बीटा — कुछ फीचर प्रदर्शन हैं। साइबर अपराध के लिए',
      title: 'क्वांटमशील्ड',
      pitch: 'जब स्कैमर आपको फोन पर फंसाए,',
      pitchAccent: 'आपका फोन आपको चेताएगा — और परिवार को पता चलेगा।',
      tagline: 'स्कैम के दौरान सुरक्षा, बाद में नहीं · हमेशा मुफ्त',
      heroCallTitle: 'AI कॉल विश्लेषक',
      heroCallDesc: 'संदिग्ध कॉल को आपके डिवाइस पर लाइव सुनता है और डिजिटल-अरेस्ट या धोखाधड़ी के संकेत मिलते ही चेतावनी देता है।',
      heroCallCta: 'लाइव सुरक्षा शुरू करें',
      heroCbTitle: 'सर्किट ब्रेकर',
      heroCbDesc: 'स्कैम पकड़ते ही आपके चुने परिवार के सदस्यों को आपकी लोकेशन के साथ अलर्ट मिलता है। स्कैमर आपको अकेला करके लूटते हैं — यह उस अकेलेपन को तोड़ता है।',
      heroCbCta: 'परिवार अलर्ट सेट करें',
      quickTitle: 'अभी कुछ संदिग्ध मिला है?',
      quickMsg: 'मैसेज जांचें', quickMsgDesc: 'SMS · WhatsApp · ईमेल',
      quickUrl: 'लिंक जांचें', quickUrlDesc: 'फ़िशिंग और नकली साइट',
      quickNum: 'नंबर जांचें', quickNumDesc: 'स्कैम कॉलर खोज',
      statsCases: '28.15 लाख', statsCasesLabel: '2025 में साइबर मामले',
      statsLost: '₹22,495 करोड़', statsLostLabel: '2025 में नुकसान',
      statsSaved: '₹8,189 करोड़', statsSavedLabel: 'I4C ने बचाए',
      statsSource: 'स्रोत: I4C / MHA वार्षिक रिपोर्ट, फरवरी 2026',
      coreTitle: 'मुख्य सुरक्षा',
      threatsTitle: 'लाइव खतरे · भारत 2025–26',
      showAllBtn: 'सभी टूल',
      hideAllBtn: 'अतिरिक्त टूल छिपाएं',
      secEmergency: '🚨 आपातकाल',
      secScan: '🔍 स्कैन',
      secProtect: '🛡️ सुरक्षा',
      secLearn: '📚 सीखें',
      secAntifraud: '⚡ एंटी-फ्रॉड',
      secMore: '🔧 अधिक टूल',
    }
  }[language];

  /* ── Core tools — the curated grid shown to everyone ── */
  const CORE_TOOLS: Tool[] = [
    { id: 'scanner',    name: 'AI Scam Scanner',      nameHi: 'AI स्कैम स्कैनर',     description: 'Paste any message — AI explains if it\'s a scam', descriptionHi: 'कोई भी मैसेज पेस्ट करें — AI बताएगा स्कैम है या नहीं', icon: Scan,       path: '/scanner',        category: 'core' },
    { id: 'upiguard',   name: 'UPI & QR Guard',       nameHi: 'UPI/QR गार्ड',        description: 'Detect fake UPI IDs before you pay',             descriptionHi: 'भुगतान से पहले नकली UPI ID पकड़ें',                   icon: CreditCard, path: '/upi-guard',      category: 'core' },
    { id: 'evidence',   name: 'Evidence Vault',       nameHi: 'एविडेंस वॉल्ट',       description: 'Record tamper-proof proof of the scam',          descriptionHi: 'स्कैम का पक्का सबूत रिकॉर्ड करें',                     icon: FileText,   path: '/evidence',       category: 'core' },
    { id: 'reporter',   name: 'Police Reporter',      nameHi: 'पुलिस रिपोर्टर',      description: 'Generate an FIR-ready complaint in minutes',     descriptionHi: 'मिनटों में FIR-तैयार शिकायत बनाएं',                    icon: Scale,      path: '/reporter',       category: 'core' },
    { id: 'guardian',   name: 'Breach Check',         nameHi: 'ब्रीच जांच',          description: 'See if your email leaked in real data breaches', descriptionHi: 'जांचें कि आपका ईमेल डेटा लीक में है या नहीं',          icon: Database,   path: '/system-guardian',category: 'core' },
    { id: 'education',  name: 'Learn Safety',         nameHi: 'सुरक्षा सीखें',        description: '48 expert fraud-awareness videos',               descriptionHi: '48 विशेषज्ञ वीडियो',                                   icon: BookOpen,   path: '/education',      category: 'core' },
    { id: 'emergency',  name: 'Emergency: 1930',      nameHi: 'आपातकाल: 1930',       description: 'One-tap national cybercrime helpline',           descriptionHi: 'एक टैप में राष्ट्रीय हेल्पलाइन',                       icon: Phone,      path: '/emergency',      category: 'core' },
    { id: 'legalaid',   name: 'Cyber Legal First Aid',nameHi: 'साइबर कानूनी सहायता', description: 'Digital Arrest guide · FIR · your rights',       descriptionHi: 'डिजिटल अरेस्ट गाइड · FIR · आपके अधिकार',              icon: Shield,     path: '/legal-aid',      category: 'core' },
  ];

  /* ── Everything else — available under "All tools".
        Consolidated: 3 device tools → one Device Checkup,
        4 news/threat tools → one Scam Intel hub. ── */
  const MORE_TOOLS: Tool[] = [
    // Phone & number safety
    { id: 'phoneguard', name: 'Phone Number Guard', nameHi: 'फोन नंबर गार्ड',   description: 'Detect scam calls · TRAI · VoIP · Spoofed', descriptionHi: 'स्कैम कॉल पहचान',               icon: PhoneCall,     path: '/phoneguard',     category: 'antifraud' },
    { id: 'scamdb',     name: 'Scam Number Lookup', nameHi: 'स्कैम नंबर खोज',   description: 'Check a number against known scammers',     descriptionHi: 'ज्ञात स्कैमर नंबर जांचें',       icon: Database,      path: '/scamdb',         category: 'antifraud' },
    // Device safety — one place
    { id: 'tuneup',     name: 'Device Checkup',     nameHi: 'डिवाइस जांच',       description: 'Battery, storage & full security scan',     descriptionHi: 'बैटरी, स्टोरेज और सुरक्षा स्कैन', icon: Activity,      path: '/tuneup',         category: 'protect' },
    { id: 'simprotect', name: 'SIM Protection',     nameHi: 'SIM सुरक्षा',       description: 'Detect SIM swap attacks',                  descriptionHi: 'SIM स्वैप पहचान',               icon: Smartphone,    path: '/simprotection',  category: 'protect' },
    { id: 'privacy',    name: 'Privacy Shield',     nameHi: 'गोपनीयता ढाल',     description: 'Audit app permissions & data leaks',       descriptionHi: 'ऐप अनुमति ऑडिट',                icon: Lock,          path: '/privacy',        category: 'protect' },
    { id: 'encryption', name: 'File Encryption',    nameHi: 'फ़ाइल एन्क्रिप्शन', description: 'Encrypt sensitive files on-device',        descriptionHi: 'फ़ाइलें एन्क्रिप्ट करें',        icon: Lock,          path: '/encryption',     category: 'protect' },
    { id: 'whatsapp',   name: 'WhatsApp Guard',     nameHi: 'WhatsApp गार्ड',   description: 'Detect ghost pairing & account hijack',    descriptionHi: 'Ghost pairing पहचान',           icon: MessageSquare, path: '/whatsapp',       category: 'protect' },
    // News, alerts & threat map — one hub
    { id: 'news',       name: 'Scam Intel',         nameHi: 'स्कैम इंटेल',      description: 'News, alerts & live threat map in one feed', descriptionHi: 'समाचार, अलर्ट और लाइव खतरा मैप',  icon: Newspaper,     path: '/news',           category: 'learn' },
    { id: 'aboutai',    name: 'About Our AI',       nameHi: 'हमारा AI',         description: 'How QuantumShield\'s AI engine works',     descriptionHi: 'AI इंजन कैसे काम करता है',      icon: Brain,         path: '/aboutai',        category: 'more' },
  ];

  /* ── Real 2025-26 threat data ── */
  const THREATS = [
    { name: language === 'en' ? 'Digital Arrest' : 'डिजिटल अरेस्ट',   amount: '₹1,935Cr', tag: language === 'en' ? '1.23L cases · SC directed CBI probe' : '1.23 लाख मामले',  sev: 'critical' },
    { name: language === 'en' ? 'Investment Fraud' : 'निवेश धोखाधड़ी', amount: '₹22Cr+',   tag: language === 'en' ? 'Fake WhatsApp trading groups' : 'नकली ट्रेडिंग ग्रुप',     sev: 'critical' },
    { name: language === 'en' ? 'Deepfake / AI Scam' : 'डीपफेक AI स्कैम', amount: '₹2.68Cr', tag: language === 'en' ? 'Celebrity deepfakes on social media' : 'सेलिब्रिटी डीपफेक', sev: 'high' },
    { name: language === 'en' ? 'UPI / QR Fraud' : 'UPI / QR धोखाधड़ी',amount: '₹95Cr',   tag: language === 'en' ? 'Fake collect requests & QR codes' : 'नकली QR कोड',           sev: 'high' },
    { name: language === 'en' ? 'Job Scam' : 'नौकरी घोटाला',           amount: '₹100Cr',  tag: language === 'en' ? 'Cyber-slavery camps in SE Asia' : 'साइबर स्लेवरी कैंप',      sev: 'high' },
    { name: language === 'en' ? 'WhatsApp Hack' : 'WhatsApp हैक',       amount: '₹50Cr',   tag: language === 'en' ? 'Ghost pairing & OTP hijack' : 'Ghost pairing हमला',           sev: 'medium' },
  ];

  const sevStyle = (s: string) =>
    s === 'critical' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
    s === 'high'     ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' :
                       'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';

  const ToolCard = ({ tool, accent = 'text-blue-400' }: { tool: Tool; accent?: string }) => {
    const Icon = tool.icon;
    return (
      <a
        href={tool.path}
        className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10 hover:border-blue-400/60 group"
      >
        <Icon className={`w-7 h-7 mb-2.5 transition-transform group-hover:scale-110 ${accent}`} />
        <h4 className="font-bold text-sm mb-1 leading-snug">
          {language === 'en' ? tool.name : tool.nameHi}
        </h4>
        <p className="text-[11px] text-gray-500 leading-snug">
          {language === 'en' ? tool.description : tool.descriptionHi}
        </p>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── BETA banner ── */}
      {!betaDismissed && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-white flex items-center gap-2 flex-wrap">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {t.betaText}{' '}
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                className="underline font-bold whitespace-nowrap">
                cybercrime.gov.in
              </a>
            </p>
            <button onClick={() => setBetaDismissed(true)} className="shrink-0 text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">

        {/* ── Brand + pitch ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 mb-5">
            <Shield className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl md:text-3xl font-bold text-gray-100 leading-snug max-w-3xl mx-auto">
            {t.pitch}<br />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{t.pitchAccent}</span>
          </p>
          <p className="text-sm text-gray-500 mt-4">{t.tagline}</p>
        </div>

        {/* ── HERO: the two features nobody else has ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <a href="/aianalyzer"
            className="relative overflow-hidden bg-gradient-to-br from-red-600/25 via-orange-600/15 to-transparent border-2 border-red-500/50 rounded-2xl p-7 hover:border-red-400 hover:from-red-600/35 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/25 flex items-center justify-center">
                <Mic className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/15 border border-red-500/40 rounded-full px-3 py-1">
                {language === 'en' ? 'Live · During the call' : 'लाइव · कॉल के दौरान'}
              </span>
            </div>
            <h2 className="text-2xl font-black mb-2">{t.heroCallTitle}</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">{t.heroCallDesc}</p>
            <span className="inline-flex items-center gap-2 font-bold text-red-300 group-hover:gap-3 transition-all">
              {t.heroCallCta} <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          <a href="/circuit-breaker"
            className="relative overflow-hidden bg-gradient-to-br from-amber-500/25 via-yellow-600/10 to-transparent border-2 border-amber-500/50 rounded-2xl p-7 hover:border-amber-400 hover:from-amber-500/35 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/25 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/40 rounded-full px-3 py-1">
                {language === 'en' ? 'Family alert network' : 'परिवार अलर्ट नेटवर्क'}
              </span>
            </div>
            <h2 className="text-2xl font-black mb-2">{t.heroCbTitle}</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">{t.heroCbDesc}</p>
            <span className="inline-flex items-center gap-2 font-bold text-amber-300 group-hover:gap-3 transition-all">
              {t.heroCbCta} <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>

        {/* ── My Legal Rights — second home / legal intelligence engine ── */}
        <a href="/legal-rights"
          className="relative overflow-hidden flex items-center gap-5 bg-gradient-to-r from-indigo-600/25 via-violet-600/15 to-transparent border-2 border-indigo-500/50 rounded-2xl p-6 mb-10 hover:border-indigo-400 hover:from-indigo-600/35 transition-all group">
          <Scale className="absolute right-5 bottom-3 w-24 h-24 opacity-10" />
          <div className="w-12 h-12 rounded-xl bg-indigo-500/25 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black">{language === 'en' ? 'My Legal Rights' : 'मेरे कानूनी अधिकार'}</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/15 border border-indigo-500/40 rounded-full px-2.5 py-0.5">
                {language === 'en' ? 'New' : 'नया'}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-snug">
              {language === 'en'
                ? 'Faced a scam, harassment, fraud or rights violation? Describe it — AI maps your rights, relevant laws, the right authority, and builds a report-ready case file.'
                : 'धोखाधड़ी, उत्पीड़न या अधिकार हनन? बताएं — AI आपके अधिकार, कानून, सही प्राधिकरण बताकर रिपोर्ट-तैयार केस फाइल बनाता है।'}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-300 shrink-0 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* ── Quick check row ── */}
        <section className="mb-10">
          <h2 className="text-lg font-black mb-3 text-gray-200">{t.quickTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="/spam" className="flex items-center gap-4 bg-purple-600/15 border border-purple-500/40 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-600/25 transition-all group">
              <MessageSquare className="w-6 h-6 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-sm">{t.quickMsg}</div>
                <div className="text-[11px] text-gray-500">{t.quickMsgDesc}</div>
              </div>
            </a>
            <a href="/scanner" className="flex items-center gap-4 bg-blue-600/15 border border-blue-500/40 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-600/25 transition-all group">
              <Link2 className="w-6 h-6 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-sm">{t.quickUrl}</div>
                <div className="text-[11px] text-gray-500">{t.quickUrlDesc}</div>
              </div>
            </a>
            <a href="/phoneguard" className="flex items-center gap-4 bg-teal-600/15 border border-teal-500/40 rounded-xl p-4 hover:border-teal-400 hover:bg-teal-600/25 transition-all group">
              <PhoneCall className="w-6 h-6 text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-sm">{t.quickNum}</div>
                <div className="text-[11px] text-gray-500">{t.quickNumDesc}</div>
              </div>
            </a>
          </div>
        </section>

        {/* ── Stats — real I4C 2025 data ── */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4">
              <div className="text-xl md:text-3xl font-black text-red-400">{t.statsCases}</div>
              <div className="text-[11px] md:text-sm text-gray-400 mt-0.5">{t.statsCasesLabel}</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4">
              <div className="text-xl md:text-3xl font-black text-orange-400">{t.statsLost}</div>
              <div className="text-[11px] md:text-sm text-gray-400 mt-0.5">{t.statsLostLabel}</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 md:p-4">
              <div className="text-xl md:text-3xl font-black text-green-400">{t.statsSaved}</div>
              <div className="text-[11px] md:text-sm text-gray-400 mt-0.5">{t.statsSavedLabel}</div>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 text-center">{t.statsSource}</p>
        </div>

        {/* ── Core tools ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-blue-400 mb-3">{t.coreTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CORE_TOOLS.map(tool => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>

        {/* ── All tools (collapsed by default) ── */}
        <section className="mb-10">
          <button
            onClick={() => setShowAll(s => !s)}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 font-bold text-sm text-gray-300 transition"
          >
            {showAll ? t.hideAllBtn : t.showAllBtn}
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAll && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {MORE_TOOLS.map(tool => <ToolCard key={tool.id} tool={tool} accent="text-gray-400" />)}
            </div>
          )}
        </section>

        {/* ── Live Threat Watch ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-orange-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            {t.threatsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {THREATS.map((th, i) => (
              <div key={i} className={`border rounded-xl p-3 md:p-4 ${sevStyle(th.sev)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm">{th.name}</span>
                  <span className="font-black text-sm">{th.amount}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">{th.tag}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Source: I4C / MHA / Business Standard / CBI — 2025–2026</p>
        </section>

        {/* ── Footer CTA ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center border-t border-white/10 pt-8">
          <a href="tel:1930"
            className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-500 font-black px-8 py-3.5 rounded-xl transition text-sm shadow-lg shadow-red-600/20">
            📞 Emergency: Call 1930
          </a>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 font-bold px-8 py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
            Report Cybercrime <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
