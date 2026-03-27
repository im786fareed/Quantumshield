'use client';
import { useState } from 'react';
import {
  Scale, Shield, Phone, FileText, CheckSquare,
  ChevronRight, AlertTriangle, BookOpen, MessageCircle,
  Clock, User, Building, Mic, Lock, ExternalLink
} from 'lucide-react';
import BackToHome from './BackToHome';

const DIGITAL_ARREST_STEPS = [
  {
    step: 1,
    title: 'Stay Calm — It Is a Scam',
    titleHi: 'शांत रहें — यह एक घोटाला है',
    desc: 'Real police or CBI NEVER arrests you via a video call or WhatsApp. No Indian law allows "digital arrest." This is a psychological manipulation tactic.',
    descHi: 'असली पुलिस या CBI कभी वीडियो कॉल पर गिरफ्तार नहीं करती। "डिजिटल अरेस्ट" कोई कानून नहीं है।',
    action: 'Hang up the call immediately',
    actionHi: 'तुरंत कॉल काट दें',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
  },
  {
    step: 2,
    title: 'Do NOT Pay Anything',
    titleHi: 'कुछ भी न दें',
    desc: 'No court, police station, or government body will ever demand instant payment via UPI, cryptocurrency, gift cards, or wire transfer to "resolve" a case.',
    descHi: 'कोई भी सरकारी संस्था UPI या क्रिप्टो में भुगतान नहीं मांगती।',
    action: 'Block the number & account',
    actionHi: 'नंबर और अकाउंट ब्लॉक करें',
    icon: Lock,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    step: 3,
    title: 'Record Evidence',
    titleHi: 'सबूत रिकॉर्ड करें',
    desc: 'Screenshot the call, save the phone number, note the time & what was said. Evidence is critical for filing an FIR. Use the QuantumShield Evidence Vault.',
    descHi: 'कॉल का स्क्रीनशॉट, नंबर, और समय नोट करें। सबूत FIR के लिए जरूरी है।',
    action: 'Open Evidence Vault →',
    actionHi: 'एविडेंस वॉल्ट खोलें →',
    actionLink: '/evidence',
    icon: Mic,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    step: 4,
    title: 'Report to Cyber Crime',
    titleHi: 'साइबर क्राइम में रिपोर्ट करें',
    desc: 'File a complaint at cybercrime.gov.in (portal) or call the National Cyber Crime Helpline 1930. Available 24/7. Your complaint triggers official investigation.',
    descHi: 'cybercrime.gov.in पर शिकायत दर्ज करें या 1930 पर कॉल करें।',
    action: 'Call 1930',
    actionHi: '1930 पर कॉल करें',
    actionLink: 'tel:1930',
    icon: Phone,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
  },
  {
    step: 5,
    title: 'File a Police FIR',
    titleHi: 'FIR दर्ज कराएं',
    desc: 'Visit your nearest police station or use the online FIR portal. Under IT Act Section 66D, impersonation to cheat is punishable up to 3 years imprisonment.',
    descHi: 'नजदीकी थाने में FIR दर्ज कराएं। IT अधिनियम धारा 66D के तहत 3 साल जेल।',
    action: 'See FIR Checklist',
    actionHi: 'FIR चेकलिस्ट देखें',
    icon: FileText,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
  },
  {
    step: 6,
    title: 'Seek Legal Counsel',
    titleHi: 'कानूनी सलाह लें',
    desc: 'If money was lost, consult a cyber law advocate. NALSA provides free legal aid. Your bank may reverse fraudulent transactions if reported within 3 days.',
    descHi: 'अगर पैसा गया है, साइबर कानून वकील से मिलें। NALSA मुफ्त कानूनी सहायता देता है।',
    action: 'NALSA Legal Aid',
    actionHi: 'NALSA सहायता',
    actionLink: 'https://nalsa.gov.in',
    icon: Scale,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/30',
  },
];

const FIR_CHECKLIST = [
  { en: 'Screenshot of the call or chat', hi: 'कॉल/चैट का स्क्रीनशॉट' },
  { en: 'Caller\'s phone number(s)', hi: 'कॉलर का फोन नंबर' },
  { en: 'Date, time, and duration of call', hi: 'दिनांक, समय, कॉल की अवधि' },
  { en: 'Any UPI transaction IDs or bank reference numbers', hi: 'UPI ट्रांजेक्शन ID या बैंक रेफरेंस' },
  { en: 'Name/organization the fraudster claimed to be from', hi: 'ठग ने किसका नाम लिया' },
  { en: 'What was demanded (money, OTP, documents)', hi: 'क्या मांगा गया (पैसा, OTP, दस्तावेज)' },
  { en: 'Video/audio recording if available', hi: 'वीडियो/ऑडियो रिकॉर्डिंग अगर है' },
];

const RIGHTS = [
  {
    right: 'Right to Remain Silent',
    rightHi: 'चुप रहने का अधिकार',
    desc: 'You are not legally required to answer questions from unverified callers claiming to be police.',
    descHi: 'आप अज्ञात कॉलर के सवालों का जवाब देने के लिए बाध्य नहीं हैं।',
    law: 'Article 20(3), Constitution of India',
  },
  {
    right: 'Right to Verify Identity',
    rightHi: 'पहचान सत्यापन का अधिकार',
    desc: 'You have the right to demand official ID proof before complying with any police/official request.',
    descHi: 'आप किसी भी सरकारी कर्मचारी से ID दिखाने की मांग कर सकते हैं।',
    law: 'IT Act 2000',
  },
  {
    right: 'Right to Legal Representation',
    rightHi: 'कानूनी प्रतिनिधित्व का अधिकार',
    desc: 'In any genuine arrest, you have the right to consult a lawyer immediately.',
    descHi: 'वास्तविक गिरफ्तारी में आपको तुरंत वकील से मिलने का अधिकार है।',
    law: 'Article 22, Constitution of India',
  },
  {
    right: 'Right to File FIR',
    rightHi: 'FIR दर्ज कराने का अधिकार',
    desc: 'Police cannot refuse to file your FIR against cybercrime. If refused, approach SP/DCP directly.',
    descHi: 'पुलिस FIR दर्ज करने से इनकार नहीं कर सकती। इनकार पर SP/DCP से मिलें।',
    law: 'Section 154 CrPC',
  },
];

const RESOURCES = [
  { name: 'National Cyber Crime Portal', nameHi: 'राष्ट्रीय साइबर अपराध पोर्टल', url: 'https://cybercrime.gov.in', icon: Building },
  { name: 'NALSA Free Legal Aid', nameHi: 'NALSA मुफ्त कानूनी सहायता', url: 'https://nalsa.gov.in', icon: Scale },
  { name: 'RBI Complaint (Bank Fraud)', nameHi: 'RBI शिकायत (बैंक फ्रॉड)', url: 'https://bankingombudsman.rbi.org.in', icon: Building },
  { name: 'Cyber Crime Helpline 1930', nameHi: 'साइबर क्राइम हेल्पलाइन 1930', url: 'tel:1930', icon: Phone },
];

export default function CyberLegalAid() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'response' | 'fir' | 'rights' | 'resources'>('response');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const t = {
    en: {
      title: 'Cyber Legal First Aid',
      subtitle: 'Digital Arrest & Cyber Fraud Response Guide',
      tagline: 'Know your rights. Protect yourself. Act immediately.',
      tab1: 'Emergency Response',
      tab2: 'FIR Checklist',
      tab3: 'Your Rights',
      tab4: 'Resources',
      step: 'Step',
      firTitle: 'Evidence Checklist for FIR',
      firDesc: 'Collect these before visiting the police station',
      firProgress: 'items ready',
      rightsTitle: 'Your Legal Rights Against Cyber Fraud',
      resourcesTitle: 'Official Help Resources',
      panicBanner: 'Under Digital Arrest right now?',
      panicBtn: 'Call 1930 Immediately',
    },
    hi: {
      title: 'साइबर कानूनी प्राथमिक चिकित्सा',
      subtitle: 'डिजिटल अरेस्ट और साइबर फ्रॉड प्रतिक्रिया गाइड',
      tagline: 'अपने अधिकार जानें। खुद को बचाएं। तुरंत कार्रवाई करें।',
      tab1: 'आपातकालीन प्रतिक्रिया',
      tab2: 'FIR चेकलिस्ट',
      tab3: 'आपके अधिकार',
      tab4: 'संसाधन',
      step: 'चरण',
      firTitle: 'FIR के लिए सबूत चेकलिस्ट',
      firDesc: 'थाने जाने से पहले ये इकट्ठा करें',
      firProgress: 'आइटम तैयार',
      rightsTitle: 'साइबर फ्रॉड के खिलाफ आपके कानूनी अधिकार',
      resourcesTitle: 'आधिकारिक सहायता संसाधन',
      panicBanner: 'अभी डिजिटल अरेस्ट का सामना कर रहे हैं?',
      panicBtn: 'तुरंत 1930 पर कॉल करें',
    }
  }[lang];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        <BackToHome />

        {/* Panic Banner */}
        <div className="mb-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0" />
            <span className="font-bold text-white">{t.panicBanner}</span>
          </div>
          <a
            href="tel:1930"
            className="shrink-0 bg-white text-red-700 font-black px-6 py-2.5 rounded-xl text-sm hover:bg-yellow-100 transition shadow"
          >
            📞 {t.panicBtn}
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/50 mb-5">
            <Scale className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-300 font-semibold">{t.subtitle}</p>
          <p className="text-gray-500 text-sm mt-1">{t.tagline}</p>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="mt-3 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition">
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-6 bg-white/5 rounded-xl p-1">
          {(['response', 'fir', 'rights', 'resources'] as const).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {[t.tab1, t.tab2, t.tab3, t.tab4][i]}
            </button>
          ))}
        </div>

        {/* Tab: Emergency Response */}
        {activeTab === 'response' && (
          <div className="space-y-4">
            {DIGITAL_ARREST_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className={`border rounded-2xl p-5 ${s.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 font-black ${s.color} border-current`}>
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-black text-lg mb-1 ${s.color}`}>
                        {lang === 'en' ? s.title : s.titleHi}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">
                        {lang === 'en' ? s.desc : s.descHi}
                      </p>
                      {s.actionLink ? (
                        <a
                          href={s.actionLink}
                          target={s.actionLink.startsWith('http') ? '_blank' : undefined}
                          rel={s.actionLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-black/30 hover:bg-black/50 transition ${s.color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {lang === 'en' ? s.action : s.actionHi}
                        </a>
                      ) : (
                        <div className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-black/30 ${s.color}`}>
                          <Icon className="w-4 h-4" />
                          {lang === 'en' ? s.action : s.actionHi}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: FIR Checklist */}
        {activeTab === 'fir' && (
          <div>
            <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="font-black text-xl mb-1">{t.firTitle}</h2>
              <p className="text-sm text-gray-400 mb-4">{t.firDesc}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-black/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${(checkedItems.size / FIR_CHECKLIST.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-green-400">{checkedItems.size}/{FIR_CHECKLIST.length} {t.firProgress}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {FIR_CHECKLIST.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border transition text-left ${
                    checkedItems.has(i) ? 'bg-green-500/10 border-green-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition ${
                    checkedItems.has(i) ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}>
                    {checkedItems.has(i) && <span className="text-white text-xs font-black">✓</span>}
                  </div>
                  <span className={`text-sm font-medium ${checkedItems.has(i) ? 'text-green-300 line-through opacity-75' : 'text-white'}`}>
                    {lang === 'en' ? item.en : item.hi}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                <span className="font-bold">Tip:</span> You can also report online at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">cybercrime.gov.in</a> without visiting a police station. Online complaints are equally valid.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Rights */}
        {activeTab === 'rights' && (
          <div>
            <h2 className="text-xl font-black mb-5">{t.rightsTitle}</h2>
            <div className="space-y-4">
              {RIGHTS.map((r, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-purple-300">{lang === 'en' ? r.right : r.rightHi}</h3>
                      <p className="text-xs text-purple-500/70 mb-2">{r.law}</p>
                      <p className="text-sm text-gray-300">{lang === 'en' ? r.desc : r.descHi}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-sm text-yellow-300">
                <span className="font-bold">Remember:</span> "Digital Arrest" is NOT a legal concept in India. It is a scam tactic. PM Modi himself addressed this publicly. You cannot be arrested over a video call.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Resources */}
        {activeTab === 'resources' && (
          <div>
            <h2 className="text-xl font-black mb-5">{t.resourcesTitle}</h2>
            <div className="space-y-3 mb-8">
              {RESOURCES.map((r) => {
                const Icon = r.icon;
                const isPhone = r.url.startsWith('tel:');
                return (
                  <a
                    key={r.name}
                    href={r.url}
                    target={isPhone ? undefined : '_blank'}
                    rel={isPhone ? undefined : 'noopener noreferrer'}
                    className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{lang === 'en' ? r.name : r.nameHi}</div>
                      <div className="text-xs text-gray-500">{r.url.replace('tel:', '')}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />
                  </a>
                );
              })}
            </div>

            {/* QuantumShield internal tools */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
                <Shield className="w-5 h-5" />
                QuantumShield Tools for Legal Cases
              </h3>
              <div className="space-y-3">
                <a href="/evidence" className="flex items-center gap-3 text-sm hover:text-blue-400 transition">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  Evidence Vault — Record & preserve tamper-proof proof
                </a>
                <a href="/aianalyzer" className="flex items-center gap-3 text-sm hover:text-blue-400 transition">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  AI Call Analyzer — Detect scam call patterns in real-time
                </a>
                <a href="/reporter" className="flex items-center gap-3 text-sm hover:text-blue-400 transition">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  Police Reporter — Generate structured report for FIR
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-xs text-gray-600 text-center">
          This guide provides general legal information, not legal advice. Consult a qualified advocate for your specific case.
        </div>
      </div>
    </div>
  );
}
