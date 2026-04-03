'use client';
import { useState } from 'react';
import {
  Shield, AlertTriangle, Phone, FileText, Mic,
  Lock, Scan, Smartphone, Globe, Activity,
  Brain, BookOpen, Newspaper, Bell, ChevronDown,
  Zap, CreditCard, Scale, MessageSquare, Database,
  TrendingUp, X, ExternalLink
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

  /* ── i18n ── */
  const t = {
    en: {
      betaText: 'BETA — Some features are demonstrations. For actual cybercrime report to',
      title: 'QuantumShield',
      subtitle: 'AI-Powered Cyber Protection for India',
      tagline: 'On-device · Zero storage · Free forever',
      statsCases: '28.15 Lakh', statsCasesLabel: 'Cases in India 2025',
      statsLost: '₹22,495 Cr',  statsLostLabel: 'Lost to fraud 2025',
      statsSaved: '₹8,189 Cr',  statsSavedLabel: 'Saved by I4C helpline',
      statsSource: 'Source: I4C / MHA Annual Report, Feb 2026',
      secEmergency: '🚨 Emergency',
      secScan: '🔍 Scan & Detect',
      secProtect: '🛡️ Protect',
      secLearn: '📚 Learn',
      secAntifraud: '⚡ Anti-Fraud',
      secMore: '🔧 More Tools',
      threatsTitle: 'Live Threat Watch · India 2025–26',
    },
    hi: {
      betaText: 'बीटा — कुछ फीचर प्रदर्शन हैं। साइबर अपराध के लिए',
      title: 'क्वांटमशील्ड',
      subtitle: 'भारत के लिए AI साइबर सुरक्षा',
      tagline: 'ऑन-डिवाइस · जीरो स्टोरेज · हमेशा मुफ्त',
      statsCases: '28.15 लाख', statsCasesLabel: '2025 में साइबर मामले',
      statsLost: '₹22,495 करोड़', statsLostLabel: '2025 में नुकसान',
      statsSaved: '₹8,189 करोड़', statsSavedLabel: 'I4C ने बचाए',
      statsSource: 'स्रोत: I4C / MHA वार्षिक रिपोर्ट, फरवरी 2026',
      secEmergency: '🚨 आपातकाल',
      secScan: '🔍 स्कैन',
      secProtect: '🛡️ सुरक्षा',
      secLearn: '📚 सीखें',
      secAntifraud: '⚡ एंटी-फ्रॉड',
      secMore: '🔧 अधिक टूल',
      threatsTitle: 'लाइव खतरे · भारत 2025–26',
    }
  }[language];

  /* ── Tools ── */
  const TOOLS: Tool[] = [
    // Emergency
    { id: 'circuitbreaker', name: 'Circuit Breaker',     nameHi: 'सर्किट ब्रेकर',    description: 'Anti-isolation · 6h unknown call alert',  descriptionHi: '6 घंटे अज्ञात कॉल → परिवार अलर्ट', icon: Zap,          path: '/circuit-breaker', category: 'emergency' },
    { id: 'globalguardian', name: 'Global Guardian',    nameHi: 'ग्लोबल गार्जियन',  description: '50+ countries · cyber hotlines · Safety Passport', descriptionHi: '50+ देश · साइबर हेल्पलाइन · सेफ्टी पासपोर्ट', icon: Globe, path: '/global-guardian', category: 'emergency' },
    { id: 'evidence',     name: 'Evidence Vault',      nameHi: 'एविडेंस वॉल्ट',    description: 'Record tamper-proof video proof',          descriptionHi: 'वीडियो सबूत रिकॉर्ड करें',         icon: FileText,     path: '/evidence',        category: 'emergency' },
    { id: 'emergency',    name: 'Emergency Contacts',  nameHi: 'आपातकालीन संपर्क',  description: 'One-tap 1930 & cybercrime helpline',       descriptionHi: '1930 त्वरित पहुंच',                icon: Phone,        path: '/emergency',       category: 'emergency' },
    { id: 'aianalyzer',   name: 'AI Call Analyzer',    nameHi: 'AI कॉल विश्लेषक',  description: 'Real-time scam & Hinglish detection',      descriptionHi: 'रीयल-टाइम स्कैम कॉल पहचान',       icon: Mic,          path: '/aianalyzer',      category: 'emergency' },
    // Scan
    { id: 'scanner',      name: 'AI Universal Scanner',nameHi: 'AI यूनिवर्सल स्कैनर',description: 'URLs · Files · APKs · Steganography',    descriptionHi: 'URL, फ़ाइल, APK स्कैन',            icon: Scan,         path: '/scanner',         category: 'scan' },
    { id: 'devicescan',   name: 'Device Scanner',      nameHi: 'डिवाइस स्कैनर',    description: 'Full device security assessment',          descriptionHi: 'डिवाइस सुरक्षा जांच',             icon: Smartphone,   path: '/devicescan',      category: 'scan' },
    // Protect
    { id: 'simprotect',   name: 'SIM Protection',      nameHi: 'SIM सुरक्षा',       description: 'Detect SIM swap attacks',                  descriptionHi: 'SIM स्वैप पहचान',                  icon: Smartphone,   path: '/simprotection',   category: 'protect' },
    { id: 'privacy',      name: 'Privacy Shield',      nameHi: 'गोपनीयता ढाल',     description: 'Audit app permissions & data leaks',       descriptionHi: 'ऐप अनुमति ऑडिट',                   icon: Lock,         path: '/privacy',         category: 'protect' },
    { id: 'guardian',     name: 'System Guardian',     nameHi: 'सिस्टम गार्जियन',  description: 'Breach check & ransomware protection',     descriptionHi: 'ब्रीच और रैनसमवेयर सुरक्षा',      icon: Shield,       path: '/system-guardian', category: 'protect' },
    { id: 'device',       name: 'Device Health',       nameHi: 'डिवाइस स्वास्थ्य', description: 'Overall security health score',            descriptionHi: 'सुरक्षा स्वास्थ्य स्कोर',          icon: Activity,     path: '/device',          category: 'protect' },
    { id: 'encryption',   name: 'File Encryption',     nameHi: 'फ़ाइल एन्क्रिप्शन', description: 'Encrypt sensitive files on-device',        descriptionHi: 'फ़ाइलें एन्क्रिप्ट करें',           icon: Lock,         path: '/encryption',      category: 'protect' },
    // Anti-Fraud
    { id: 'tuneup',       name: 'System Tune-Up',      nameHi: 'सिस्टम ट्यून-अप',  description: 'One-tap RAM clean · cache wipe · sweep',   descriptionHi: 'एक टैप: RAM, कैश, सुरक्षा जांच', icon: Zap,          path: '/tuneup',          category: 'antifraud' },
    { id: 'upiguard',     name: 'UPI & QR Guard',      nameHi: 'UPI/QR गार्ड',     description: 'Detect fake UPI IDs before you pay',       descriptionHi: 'नकली UPI ID पकड़ें',               icon: CreditCard,   path: '/upi-guard',       category: 'antifraud' },
    { id: 'legalaid',     name: 'Cyber Legal First Aid',nameHi: 'साइबर कानूनी सहायता',description: 'Digital Arrest guide · FIR · Rights',   descriptionHi: 'डिजिटल अरेस्ट गाइड + FIR',        icon: Scale,        path: '/legal-aid',       category: 'antifraud' },
    // Learn
    { id: 'education',    name: 'Learn Safety',        nameHi: 'सुरक्षा सीखें',    description: '48 expert fraud awareness videos',         descriptionHi: '48 विशेषज्ञ वीडियो',               icon: BookOpen,     path: '/education',       category: 'learn' },
    { id: 'awareness',    name: 'Scam Awareness',      nameHi: 'स्कैम जागरूकता',   description: 'Latest scam alerts & patterns',            descriptionHi: 'नवीनतम स्कैम अलर्ट',              icon: Bell,         path: '/awareness',       category: 'learn' },
    { id: 'news',         name: 'Cyber News',          nameHi: 'साइबर समाचार',     description: 'Real-time fraud news · verified sources',  descriptionHi: 'सत्यापित साइबर समाचार',            icon: Newspaper,    path: '/news',            category: 'learn' },
    // More
    { id: 'scamdb',       name: 'Scam Database',       nameHi: 'स्कैम डेटाबेस',    description: 'Search known scammer numbers & patterns',  descriptionHi: 'स्कैमर नंबर खोजें',               icon: Database,     path: '/scamdb',          category: 'more' },
    { id: 'threats',      name: 'Threat Intelligence', nameHi: 'खतरा विश्लेषण',    description: 'Live threat map & intelligence feed',      descriptionHi: 'लाइव खतरा मैप',                    icon: TrendingUp,   path: '/threats',         category: 'more' },
    { id: 'reporter',     name: 'Police Reporter',     nameHi: 'पुलिस रिपोर्टर',   description: 'Generate structured FIR-ready report',     descriptionHi: 'FIR रिपोर्ट बनाएं',               icon: FileText,     path: '/reporter',        category: 'more' },
    { id: 'whatsapp',     name: 'WhatsApp Guard',      nameHi: 'WhatsApp गार्ड',   description: 'Detect ghost pairing & account hijack',    descriptionHi: 'Ghost pairing पहचान',              icon: MessageSquare,path: '/whatsapp',        category: 'more' },
    { id: 'aboutai',      name: 'About Our AI',        nameHi: 'हमारा AI',         description: 'How QuantumShield\'s AI engine works',     descriptionHi: 'AI इंजन कैसे काम करता है',         icon: Brain,        path: '/aboutai',         category: 'more' },
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

  const getByCat = (cat: string) => TOOLS.filter(t => t.category === cat);

  /* ── Section renderer ── */
  const ToolGrid = ({ cat, cols = 3, accent = 'blue' }: { cat: string; cols?: number; accent?: string }) => {
    const tools = getByCat(cat);
    const accentMap: Record<string, string> = {
      red:    'hover:border-red-400/70 text-red-400',
      purple: 'hover:border-purple-400/70 text-purple-400',
      blue:   'hover:border-blue-400/70 text-blue-400',
      green:  'hover:border-green-400/70 text-green-400',
      teal:   'hover:border-teal-400/70 text-teal-400',
      cyan:   'hover:border-cyan-400/70 text-cyan-400',
      gray:   'hover:border-gray-400/70 text-gray-400',
    };
    const ac = accentMap[accent] ?? accentMap.blue;
    const gridCls = cols === 3
      ? 'grid grid-cols-2 md:grid-cols-3 gap-3'
      : 'grid grid-cols-2 md:grid-cols-4 gap-3';

    return (
      <div className={gridCls}>
        {tools.map(tool => {
          const Icon = tool.icon;
          const [iconColor] = ac.split(' ');
          return (
            <a
              key={tool.id}
              href={tool.path}
              className={`bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10 ${ac} group`}
            >
              <Icon className={`w-7 h-7 mb-2.5 transition-transform group-hover:scale-110 ${iconColor}`} />
              <h4 className="font-bold text-sm mb-1 leading-snug">
                {language === 'en' ? tool.name : tool.nameHi}
              </h4>
              <p className="text-[11px] text-gray-500 leading-snug">
                {language === 'en' ? tool.description : tool.descriptionHi}
              </p>
            </a>
          );
        })}
      </div>
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

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 mb-5">
            <Shield className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl font-bold text-gray-200 mb-1">{t.subtitle}</p>
          <p className="text-sm text-gray-500 mb-8">{t.tagline}</p>

          {/* Stats — real I4C 2025 data */}
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
          <p className="text-[10px] text-gray-600">{t.statsSource}</p>
        </div>

        {/* ── Emergency ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
            <span>{t.secEmergency}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {getByCat('emergency').map(tool => {
              const Icon = tool.icon;
              return (
                <a key={tool.id} href={tool.path}
                  className="bg-gradient-to-br from-red-600/20 to-orange-600/15 border border-red-500/40 rounded-xl p-5 hover:border-red-400 hover:from-red-600/30 transition-all group flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{language === 'en' ? tool.name : tool.nameHi}</h3>
                    <p className="text-[11px] text-gray-400">{language === 'en' ? tool.description : tool.descriptionHi}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Scan ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-purple-400 mb-3">{t.secScan}</h2>
          <ToolGrid cat="scan" cols={3} accent="purple" />
        </section>

        {/* ── Protect ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-blue-400 mb-3">{t.secProtect}</h2>
          <ToolGrid cat="protect" cols={3} accent="blue" />
        </section>

        {/* ── Anti-Fraud ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-green-400 mb-3">{t.secAntifraud}</h2>
          <ToolGrid cat="antifraud" cols={3} accent="green" />
        </section>

        {/* ── Learn ── */}
        <section className="mb-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-cyan-400 mb-3">{t.secLearn}</h2>
          <ToolGrid cat="learn" cols={3} accent="cyan" />
        </section>

        {/* ── More Tools ── */}
        <section className="mb-10">
          <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-3">{t.secMore}</h2>
          <ToolGrid cat="more" cols={4} accent="gray" />
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
