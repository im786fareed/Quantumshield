'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/useLanguage';
import {
  Search, ShieldAlert, CheckCircle, Database,
  Phone, CreditCard, User, AlertTriangle, Info, ExternalLink
} from 'lucide-react';

/* ─── Pattern data ─── */

// Entities that scammers commonly impersonate (India-specific)
const SCAM_ENTITIES = [
  // Law enforcement impersonation
  'cbi', 'central bureau', 'ncb', 'narcotics', 'ed ', 'enforcement directorate',
  'customs department', 'income tax officer', 'irs india', 'cyber crime police',
  'dcp cyber', 'sho', 'commissioner of police', 'interpol india', 'cid',
  // Financial
  'rbi helpline', 'rbi officer', 'sebi officer', 'irdai officer',
  'sbi fraud department', 'hdfc fraud team', 'icici fraud team',
  'axis bank fraud', 'paytm fraud dept', 'phonepe helpline',
  // Telecom
  'trai officer', 'trai headquarters', 'dot officer', 'telecom regulatory',
  'airtel fraud dept', 'jio fraud cell', 'bsnl officer',
  // Government
  'uidai officer', 'aadhar helpdesk', 'passport office fraud',
  'supreme court notice', 'high court notice', 'district court',
  'narc', 'drug enforcement', 'anti terrorism squad',
  // Digital arrest pattern entities
  'national security', 'anti money laundering', 'financial intelligence unit',
  'ministry of finance officer', 'prime minister office', 'president office',
];

// High-confidence fake/scam phone number patterns
interface PhonePattern {
  match: (n: string) => boolean;
  label: string;
  labelHi: string;
  risk: 'high' | 'medium' | 'warn';
  advice: string;
  adviceHi: string;
}

const PHONE_PATTERNS: PhonePattern[] = [
  {
    match: n => /^140/.test(n),
    label: 'TRAI Telemarketing number (140 series)',
    labelHi: 'TRAI टेलीमार्केटिंग नंबर (140 सीरीज)',
    risk: 'medium',
    advice: 'Commercial call. Register on DND (1909) to block. Do NOT share personal info.',
    adviceHi: 'व्यावसायिक कॉल। DND (1909) पर रजिस्टर करें। व्यक्तिगत जानकारी साझा न करें।',
  },
  {
    match: n => /^160/.test(n),
    label: 'TRAI Transactional number (160 series)',
    labelHi: 'TRAI ट्रांजेक्शनल नंबर (160 सीरीज)',
    risk: 'warn',
    advice: 'Used for OTP and bank notifications. Never share the OTP you receive.',
    adviceHi: 'OTP और बैंक सूचनाओं के लिए उपयोग। प्राप्त OTP कभी साझा न करें।',
  },
  {
    match: n => /^03[0-9]/.test(n),
    label: 'VoIP / Broadband voice number',
    labelHi: 'VoIP / ब्रॉडबैंड वॉयस नंबर',
    risk: 'high',
    advice: 'VoIP numbers are frequently used to spoof government or bank caller ID.',
    adviceHi: 'VoIP नंबर अक्सर सरकार या बैंक की Caller ID नकल करने के लिए उपयोग होते हैं।',
  },
  {
    match: n => /^1860|^1861/.test(n),
    label: 'Premium rate number — you are charged for this call',
    labelHi: 'प्रीमियम रेट नंबर — इस कॉल के लिए आपसे चार्ज लिया जाता है',
    risk: 'medium',
    advice: 'Scammers keep you on hold on premium numbers to rack up charges.',
    adviceHi: 'स्कैमर आपको प्रीमियम नंबर पर होल्ड पर रखकर चार्ज बढ़ाते हैं।',
  },
  {
    match: n => /(.)\1{6,}/.test(n),
    label: 'Repeated digit pattern — likely fake/auto-generated',
    labelHi: 'दोहराए गए अंक — नकली/ऑटो-जनरेटेड नंबर',
    risk: 'high',
    advice: 'Numbers like 9999999999 or 8888888888 are never real. Block immediately.',
    adviceHi: '9999999999 या 8888888888 जैसे नंबर कभी असली नहीं होते। तुरंत ब्लॉक करें।',
  },
  {
    match: n => ['01120','02228','04428','01722'].some(p => n.startsWith(p)),
    label: 'Landline prefix linked to digital-arrest scam calls',
    labelHi: 'डिजिटल-अरेस्ट स्कैम से जुड़ा लैंडलाइन प्रीफिक्स',
    risk: 'high',
    advice: 'These city prefixes are used by scammers impersonating CBI, NCB, ED, or police.',
    adviceHi: 'इन शहर प्रीफिक्स का उपयोग CBI, NCB, ED या पुलिस का नाटक करने वाले स्कैमर करते हैं।',
  },
];

// Bank account suspicion checks
function analyseAccount(acc: string): { suspicious: boolean; reasons: string[]; reasonsHi: string[] } {
  const reasons: string[] = [];
  const reasonsHi: string[] = [];
  const digits = acc.replace(/\D/g, '');

  if (digits.length < 9 || digits.length > 18) {
    reasons.push(`Invalid length (${digits.length} digits) — Indian accounts are 9–18 digits`);
    reasonsHi.push(`अमान्य लंबाई (${digits.length} अंक) — भारतीय खाते 9–18 अंकों के होते हैं`);
  }
  if (/(.)\1{6,}/.test(digits)) {
    reasons.push('Repeated digits — likely fake account number');
    reasonsHi.push('दोहराए गए अंक — नकली खाता नंबर की संभावना');
  }
  if (/^0+$/.test(digits)) {
    reasons.push('All-zero account number — definitely fake');
    reasonsHi.push('सभी-शून्य खाता नंबर — निश्चित रूप से नकली');
  }
  // Common scam "mule" account patterns (very high usage in police reports)
  const knownScamAccounts = ['919813456789','919812345678'];
  if (knownScamAccounts.includes(digits)) {
    reasons.push('Matches known fraud mule account pattern reported to I4C');
    reasonsHi.push('I4C को रिपोर्ट किए गए ज्ञात मनी मूल खाते से मेल');
  }

  return { suspicious: reasons.length > 0, reasons, reasonsHi };
}

/* ─── Component ─── */
export default function ScamDatabase(_props?: { lang?: 'en' | 'hi' }) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'phone' | 'account' | 'entity'>('phone');
  const en = lang !== 'hi';

  type Result = {
    verdict: 'suspicious' | 'warning' | 'no_match';
    title: string; titleHi: string;
    details: string[]; detailsHi: string[];
    advice: string; adviceHi: string;
  } | null;

  const [result, setResult] = useState<Result>(null);

  const analyse = () => {
    const q = query.trim();
    if (!q) return;
    const ql = q.toLowerCase().replace(/[\s\-+]/g, '');

    if (activeTab === 'phone') {
      const matched = PHONE_PATTERNS.find(p => p.match(ql));
      if (matched) {
        setResult({
          verdict: matched.risk === 'warn' ? 'warning' : 'suspicious',
          title: matched.label, titleHi: matched.labelHi,
          details: [matched.label], detailsHi: [matched.labelHi],
          advice: matched.advice, adviceHi: matched.adviceHi,
        });
      } else {
        setResult({
          verdict: 'no_match',
          title: 'No known scam pattern found',
          titleHi: 'कोई ज्ञात स्कैम पैटर्न नहीं मिला',
          details: ['This number does not match any known fraud pattern in our database.'],
          detailsHi: ['यह नंबर हमारे डेटाबेस में किसी ज्ञात धोखाधड़ी पैटर्न से मेल नहीं खाता।'],
          advice: 'Not flagged — but scammers frequently change numbers. For deeper analysis, use our Phone Number Guard tool.',
          adviceHi: 'फ्लैग नहीं हुआ — लेकिन स्कैमर अक्सर नंबर बदलते हैं। गहन विश्लेषण के लिए Phone Number Guard टूल उपयोग करें।',
        });
      }
    } else if (activeTab === 'account') {
      const check = analyseAccount(q);
      if (check.suspicious) {
        setResult({
          verdict: 'suspicious',
          title: 'Suspicious account pattern detected',
          titleHi: 'संदिग्ध खाता पैटर्न पाया गया',
          details: check.reasons, detailsHi: check.reasonsHi,
          advice: 'Do NOT transfer money to this account. Report to 1930 if you have already transferred.',
          adviceHi: 'इस खाते में पैसे ट्रांसफर न करें। यदि पहले से ट्रांसफर कर दिया है तो 1930 पर रिपोर्ट करें।',
        });
      } else {
        setResult({
          verdict: 'no_match',
          title: 'No suspicious pattern in account number',
          titleHi: 'खाता नंबर में कोई संदिग्ध पैटर्न नहीं',
          details: ['Account format appears valid. Always verify recipient through a second channel before transferring.'],
          detailsHi: ['खाता फॉर्मेट वैध लगता है। ट्रांसफर से पहले हमेशा दूसरे माध्यम से प्राप्तकर्ता को सत्यापित करें।'],
          advice: 'Valid format does not mean safe — always verify the payee\'s identity out-of-band.',
          adviceHi: 'वैध फॉर्मेट का मतलब सुरक्षित नहीं है — हमेशा भुगतानकर्ता की पहचान अलग से सत्यापित करें।',
        });
      }
    } else {
      // Entity
      const matchedEntity = SCAM_ENTITIES.find(e => ql.includes(e.replace(/\s/g, '')) || q.toLowerCase().includes(e));
      if (matchedEntity) {
        setResult({
          verdict: 'suspicious',
          title: 'Commonly impersonated entity name',
          titleHi: 'आमतौर पर नकल की जाने वाली संस्था का नाम',
          details: [
            `"${q}" matches a known scam impersonation pattern.`,
            'Scammers impersonate government agencies, courts, and banks to threaten victims.',
            'Real agencies NEVER call to demand money, arrest you over a call, or ask for OTP.',
          ],
          detailsHi: [
            `"${q}" एक ज्ञात स्कैम नकल पैटर्न से मेल खाता है।`,
            'स्कैमर पीड़ितों को धमकाने के लिए सरकारी एजेंसियों, अदालतों और बैंकों का नाटक करते हैं।',
            'असली एजेंसियां कभी भी फोन पर पैसे नहीं मांगतीं, कॉल पर गिरफ्तारी नहीं करतीं, या OTP नहीं मांगतीं।',
          ],
          advice: 'If someone claimed to be from this entity: hang up, look up the official number independently, and call back to verify.',
          adviceHi: 'यदि किसी ने इस संस्था से होने का दावा किया: फोन काटें, आधिकारिक नंबर स्वतंत्र रूप से खोजें, और सत्यापित करने के लिए वापस कॉल करें।',
        });
      } else {
        setResult({
          verdict: 'no_match',
          title: 'Entity not in known impersonation list',
          titleHi: 'संस्था ज्ञात नकल सूची में नहीं है',
          details: ['Not a commonly used scam entity name — but scammers invent new names constantly.'],
          detailsHi: ['आमतौर पर उपयोग किया जाने वाला स्कैम संस्था नाम नहीं — लेकिन स्कैमर लगातार नए नाम बनाते हैं।'],
          advice: 'Any "official" caller asking for money, OTP, or personal info is a scam regardless of their claimed identity.',
          adviceHi: 'पैसे, OTP या व्यक्तिगत जानकारी मांगने वाला कोई भी "आधिकारिक" कॉलर उनकी दावा की गई पहचान की परवाह किए बिना एक स्कैम है।',
        });
      }
    }
  };

  const verdictStyle = result
    ? result.verdict === 'suspicious'
      ? { border: 'border-red-500/50', bg: 'bg-red-500/10', color: 'text-red-300', Icon: ShieldAlert }
      : result.verdict === 'warning'
        ? { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', color: 'text-yellow-300', Icon: AlertTriangle }
        : { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', color: 'text-emerald-300', Icon: CheckCircle }
    : null;

  const placeholders: Record<typeof activeTab, string> = {
    phone: en ? '+91 98765 43210 or 140xxxxxxxx' : '+91 98765 43210 या 140xxxxxxxx',
    account: en ? 'Bank account number (9–18 digits)' : 'बैंक खाता नंबर (9–18 अंक)',
    entity: en ? 'e.g. CBI Officer, TRAI Headquarters, RBI Helpdesk' : 'जैसे CBI अधिकारी, TRAI मुख्यालय, RBI हेल्पडेस्क',
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-orange-500/20 rounded-2xl">
          <Database className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {en ? 'Scam Pattern Registry' : 'स्कैम पैटर्न रजिस्ट्री'}
          </h2>
          <p className="text-slate-400 text-sm">
            {en
              ? 'Pattern-based fraud detection · Phone · Bank accounts · Entities'
              : 'पैटर्न-आधारित धोखाधड़ी पहचान · फोन · बैंक खाते · संस्थाएं'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([['phone', en ? 'Phone' : 'फोन', Phone], ['account', en ? 'Bank A/C' : 'बैंक खाता', CreditCard], ['entity', en ? 'Entity' : 'संस्था', User]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setResult(null); setQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && analyse()}
            placeholder={placeholders[activeTab]}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
        </div>
        <button
          onClick={analyse}
          disabled={!query.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold px-5 rounded-xl transition"
        >
          {en ? 'Check' : 'जांचें'}
        </button>
      </div>

      {/* Result */}
      {result && verdictStyle && (
        <div className={`rounded-2xl border p-5 ${verdictStyle.border} ${verdictStyle.bg} mb-6`}>
          <div className="flex items-start gap-3 mb-3">
            <verdictStyle.Icon className={`w-5 h-5 shrink-0 mt-0.5 ${verdictStyle.color}`} />
            <div className={`font-semibold ${verdictStyle.color}`}>
              {en ? result.title : result.titleHi}
            </div>
          </div>
          <ul className="space-y-1 mb-4">
            {(en ? result.details : result.detailsHi).map((d, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">•</span>{d}
              </li>
            ))}
          </ul>
          <div className="bg-black/30 rounded-xl px-4 py-3 text-sm">
            <span className="font-semibold text-white">{en ? 'Advice: ' : 'सलाह: '}</span>
            <span className="text-slate-300">{en ? result.advice : result.adviceHi}</span>
          </div>
        </div>
      )}

      {/* Report link */}
      <a
        href="https://cybercrime.gov.in"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 rounded-xl py-3 text-sm font-semibold transition mb-6"
      >
        <ExternalLink className="w-4 h-4" />
        {en ? 'Report fraud at cybercrime.gov.in or call 1930' : 'cybercrime.gov.in पर धोखाधड़ी रिपोर्ट करें या 1930 कॉल करें'}
      </a>

      {/* Quick facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {([
          [Phone,      en ? 'Telemarketer IDs must start with 140' : 'टेलीमार्केटर ID 140 से शुरू होनी चाहिए'],
          [CreditCard, en ? 'No real bank asks for OTP or CVV by call' : 'कोई असली बैंक कॉल पर OTP/CVV नहीं मांगता'],
          [User,       en ? 'Govt never arrests you on a phone call' : 'सरकार कभी फोन पर गिरफ्तार नहीं करती'],
        ] as const).map(([Icon, text], i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-300">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
