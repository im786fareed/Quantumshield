'use client';
import { useState } from 'react';
import { Phone, AlertTriangle, CheckCircle, XCircle, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import BackToHome from './BackToHome';

/* ── Types ── */
type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SCAM_LIKELY';

interface CheckResult {
  check: string;
  checkHi: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
  detailHi: string;
}

interface PhoneAnalysis {
  number: string;
  normalised: string;
  type: string;
  typeHi: string;
  operator: string;
  operatorHi: string;
  riskLevel: RiskLevel;
  score: number;
  flags: string[];
  flagsHi: string[];
  checks: CheckResult[];
  action: string;
  actionHi: string;
}

/* ── Helpers ── */
function normalise(raw: string): string {
  let n = raw.replace(/[\s\-().+]/g, '');
  if (n.startsWith('0091')) n = n.slice(4);
  else if (n.startsWith('91') && n.length === 12) n = n.slice(2);
  else if (n.startsWith('0') && n.length === 11) n = n.slice(1);
  return n;
}

function hasRepeatedDigits(n: string): boolean {
  for (let d = 0; d <= 9; d++) {
    if (n === String(d).repeat(n.length)) return true;
    if (n === String(d).repeat(7) + n.slice(7)) return true;
  }
  return /(.)\1{6,}/.test(n);
}

function hasSequentialDigits(n: string): boolean {
  const asc = '0123456789012345678';
  const desc = '9876543210987654321';
  return asc.includes(n.slice(0, 7)) || desc.includes(n.slice(0, 7));
}

/* ── Known series ── */
// Telemarketing (TRAI DND registry) — commercial calls must use 140 series
// Transactional (banks, OTP, delivery) — must use 160 series per TRAI
// These are NOT mobile numbers: calls from 6–9 series mobile claiming to be "bank" are RED FLAG

const EMERGENCY_NUMBERS = new Set(['100','101','102','103','104','108','112','1930','155260','1091','181','1098']);
const TOLL_FREE_PREFIX = ['1800'];
const PREMIUM_PREFIX = ['1860','1861'];
const TELEMARKETING_PREFIX = ['140'];
const TRANSACTIONAL_PREFIX = ['160'];

// VoIP/virtual number prefixes sometimes used in fraud
const VOIP_PREFIX = ['030','031','032','033','034','035','036','037','038','039'];

// High-risk international country codes calling Indian numbers (spoofed +91)
const RISKY_INTL_CODES = [
  { code: '+1', country: 'USA/Canada', hi: 'अमेरिका/कनाडा' },
  { code: '+44', country: 'UK', hi: 'यूके' },
  { code: '+92', country: 'Pakistan', hi: 'पाकिस्तान' },
  { code: '+86', country: 'China', hi: 'चीन' },
  { code: '+880', country: 'Bangladesh', hi: 'बांग्लादेश' },
  { code: '+66', country: 'Thailand', hi: 'थाईलैंड' },
  { code: '+855', country: 'Cambodia', hi: 'कंबोडिया' },
  { code: '+95', country: 'Myanmar', hi: 'म्यांमार' },
];

// Series that are predominantly used for fraud (based on cybercrime.gov.in reports)
// Digital arrest scams often use landline prefixes + automated calls
const GOVT_IMPERSONATION_SERIES = [
  '01120',  // Delhi fake "CBI/NCB" calls
  '02228',  // Mumbai fake "customs"
  '04428',  // Chennai fake "income tax"
  '01722',  // Chandigarh fake "police"
];

/* ── Operator detection (approximate TRAI series) ── */
function detectOperator(n: string): { name: string; nameHi: string } {
  const p4 = n.slice(0, 4);
  const p2 = n.slice(0, 2);
  if (p2 === '60' || p2 === '61' || p2 === '62' || p2 === '63' ||
      p2 === '75' || p2 === '76' || p2 === '73') return { name: 'Reliance Jio', nameHi: 'रिलायंस जियो' };
  if (p4 >= '7000' && p4 <= '7099') return { name: 'BSNL / Jio', nameHi: 'BSNL / जियो' };
  if (p4 >= '9400' && p4 <= '9459') return { name: 'BSNL', nameHi: 'BSNL' };
  if (p4 >= '9490' && p4 <= '9499') return { name: 'BSNL', nameHi: 'BSNL' };
  if (p2 === '98' || p2 === '96' || p2 === '97' || p2 === '87' || p2 === '86' || p2 === '81') return { name: 'Airtel', nameHi: 'एयरटेल' };
  if (p2 === '90' || p2 === '91' || p2 === '82' || p2 === '89' || p2 === '92' || p2 === '85' || p2 === '84') return { name: 'Vi (Vodafone-Idea)', nameHi: 'Vi (वोडाफोन-आइडिया)' };
  if (p2 === '88' || p2 === '70' || p2 === '71' || p2 === '72') return { name: 'Airtel / Jio', nameHi: 'एयरटेल / जियो' };
  if (/^[6-9]/.test(n)) return { name: 'Mobile Network', nameHi: 'मोबाइल नेटवर्क' };
  return { name: 'Landline / Unknown', nameHi: 'लैंडलाइन / अज्ञात' };
}

/* ── Core analysis ── */
function analyseNumber(raw: string): PhoneAnalysis {
  const normalised = normalise(raw.trim());
  const flags: string[] = [];
  const flagsHi: string[] = [];
  const checks: CheckResult[] = [];
  let score = 0;

  // ── Check 1: Emergency / helpline ──
  if (EMERGENCY_NUMBERS.has(normalised) || EMERGENCY_NUMBERS.has(raw.trim())) {
    return {
      number: raw.trim(),
      normalised,
      type: 'Emergency / Helpline',
      typeHi: 'आपात / हेल्पलाइन',
      operator: 'Government of India',
      operatorHi: 'भारत सरकार',
      riskLevel: 'SAFE',
      score: 0,
      flags: [],
      flagsHi: [],
      checks: [{ check: 'Emergency Helpline', checkHi: 'आपात हेल्पलाइन', status: 'PASS', detail: 'Official government / police helpline', detailHi: 'आधिकारिक सरकारी/पुलिस हेल्पलाइन' }],
      action: 'This is a government helpline. It is safe to call, but no official helpline will call YOU first asking for money.',
      actionHi: 'यह सरकारी हेल्पलाइन है। कोई भी सरकारी हेल्पलाइन आपको पहले फोन करके पैसे नहीं मांगती।',
    };
  }

  // ── Check 2: Toll-free ──
  const isTollFree = TOLL_FREE_PREFIX.some(p => normalised.startsWith(p));
  if (isTollFree) {
    checks.push({ check: 'Toll-Free Number', checkHi: 'टोल-फ्री नंबर', status: 'INFO', detail: '1800 series — free to call, used by businesses/banks. Do NOT share OTP.', detailHi: '1800 सीरीज — व्यापार/बैंक उपयोग करते हैं। OTP कभी न बताएं।' });
  }

  // ── Check 3: Premium rate ──
  const isPremium = PREMIUM_PREFIX.some(p => normalised.startsWith(p));
  if (isPremium) {
    score += 20;
    flags.push('Premium rate number — calls are charged to you');
    flagsHi.push('प्रीमियम नंबर — आपसे कॉल चार्ज लिया जाता है');
    checks.push({ check: 'Premium Rate', checkHi: 'प्रीमियम रेट', status: 'WARN', detail: '1860/1861 series — charged calls. Scammers sometimes use these.', detailHi: '1860/1861 सीरीज — चार्जेबल कॉल। स्कैमर्स इनका दुरुपयोग करते हैं।' });
  }

  // ── Check 4: TRAI Telemarketing series ──
  const isTelemarketing = TELEMARKETING_PREFIX.some(p => normalised.startsWith(p));
  if (isTelemarketing) {
    score += 25;
    flags.push('TRAI telemarketing number (140 series) — commercial call');
    flagsHi.push('TRAI टेलीमार्केटिंग नंबर (140 सीरीज) — व्यावसायिक कॉल');
    checks.push({ check: 'TRAI Telemarketing Prefix', checkHi: 'TRAI टेलीमार्केटिंग', status: 'WARN', detail: 'Per TRAI rules, commercial calls must use 140-series. Block if unwanted via DND.', detailHi: 'TRAI नियम: व्यावसायिक कॉल 140-सीरीज से होनी चाहिए। DND के लिए 1909 डायल करें।' });
  }

  // ── Check 5: TRAI Transactional (OTP/bank alerts) ──
  const isTransactional = TRANSACTIONAL_PREFIX.some(p => normalised.startsWith(p));
  if (isTransactional) {
    checks.push({ check: 'TRAI Transactional Prefix', checkHi: 'TRAI ट्रांजेक्शनल', status: 'INFO', detail: '160 series — banks, delivery, OTP notifications. Verify with your bank before responding.', detailHi: '160 सीरीज — बैंक, डिलीवरी, OTP। जवाब देने से पहले अपने बैंक से सत्यापित करें।' });
  }

  // ── Check 6: Number format ──
  const isMobile = /^[6-9]\d{9}$/.test(normalised);
  const isLandline = /^0\d{9,10}$/.test(normalised) || /^\d{6,8}$/.test(normalised);
  const validFormat = isMobile || isTollFree || isPremium || isTelemarketing || isTransactional || isLandline;

  if (!validFormat && normalised.length !== 10) {
    score += 30;
    flags.push(`Non-standard number length (${normalised.length} digits) — possible spoofed or VoIP number`);
    flagsHi.push(`असामान्य नंबर लंबाई (${normalised.length} अंक) — नकली या VoIP नंबर हो सकता है`);
    checks.push({ check: 'Number Format', checkHi: 'नंबर फॉर्मेट', status: 'FAIL', detail: `Expected 10 digits for Indian mobile/landline, got ${normalised.length}`, detailHi: `भारतीय नंबर 10 अंकों का होना चाहिए, मिला: ${normalised.length}` });
  } else {
    checks.push({ check: 'Number Format', checkHi: 'नंबर फॉर्मेट', status: 'PASS', detail: 'Valid Indian phone number format', detailHi: 'वैध भारतीय फोन नंबर फॉर्मेट' });
  }

  // ── Check 7: VoIP / broadband voice prefix ──
  const isVoIP = VOIP_PREFIX.some(p => normalised.startsWith(p));
  if (isVoIP) {
    score += 30;
    flags.push('VoIP / broadband voice number — often used to spoof caller ID');
    flagsHi.push('VoIP / ब्रॉडबैंड वॉयस नंबर — अक्सर कॉलर ID बदलने के लिए उपयोग');
    checks.push({ check: 'VoIP Indicator', checkHi: 'VoIP संकेतक', status: 'FAIL', detail: '03x prefix indicates VoIP — high risk for spoofed government/bank impersonation.', detailHi: '03x प्रीफिक्स VoIP का संकेत — सरकार/बैंक नकल के लिए उच्च जोखिम।' });
  }

  // ── Check 8: Repeated / sequential digit patterns ──
  if (isMobile && hasRepeatedDigits(normalised)) {
    score += 35;
    flags.push('Highly suspicious repeated digit pattern — test/fake/generated number');
    flagsHi.push('संदिग्ध दोहराए गए अंक — टेस्ट/नकली/जनरेटेड नंबर');
    checks.push({ check: 'Digit Pattern', checkHi: 'अंक पैटर्न', status: 'FAIL', detail: 'Repeated digits (e.g., 9999999999) indicate a fake or auto-generated number.', detailHi: 'दोहराए गए अंक (जैसे 9999999999) नकली या ऑटो-जनरेटेड नंबर दर्शाते हैं।' });
  } else if (isMobile && hasSequentialDigits(normalised)) {
    score += 25;
    flags.push('Sequential digit pattern — likely a test or fake number');
    flagsHi.push('क्रमिक अंक पैटर्न — टेस्ट या नकली नंबर');
    checks.push({ check: 'Digit Pattern', checkHi: 'अंक पैटर्न', status: 'WARN', detail: 'Sequential digits (e.g., 1234567890) — likely a fake number.', detailHi: 'क्रमिक अंक (जैसे 1234567890) — नकली नंबर की संभावना।' });
  } else if (isMobile) {
    checks.push({ check: 'Digit Pattern', checkHi: 'अंक पैटर्न', status: 'PASS', detail: 'No suspicious digit patterns detected', detailHi: 'कोई संदिग्ध अंक पैटर्न नहीं मिला' });
  }

  // ── Check 9: Known govt impersonation series ──
  const isGovtImpersonation = GOVT_IMPERSONATION_SERIES.some(p => normalised.startsWith(p) || raw.replace(/\s/g,'').startsWith(p));
  if (isGovtImpersonation) {
    score += 50;
    flags.push('Landline prefix associated with government-impersonation scam calls');
    flagsHi.push('सरकारी नकल स्कैम कॉल से जुड़ा लैंडलाइन प्रीफिक्स');
    checks.push({ check: 'Impersonation Pattern', checkHi: 'नकल पैटर्न', status: 'FAIL', detail: 'This prefix is frequently used in "Digital Arrest" and fake CBI/police scams.', detailHi: 'यह प्रीफिक्स "डिजिटल अरेस्ट" और नकली CBI/पुलिस स्कैम में अक्सर उपयोग होता है।' });
  }

  // ── Check 10: International number check ──
  const rawClean = raw.trim();
  const matchedIntl = RISKY_INTL_CODES.find(c => rawClean.startsWith(c.code) || raw.startsWith('00' + c.code.slice(1)));
  if (matchedIntl) {
    score += 40;
    flags.push(`International call from ${matchedIntl.country} — verify if you were expecting this call`);
    flagsHi.push(`${matchedIntl.hi} से अंतर्राष्ट्रीय कॉल — सत्यापित करें कि क्या आप इस कॉल की उम्मीद कर रहे थे`);
    checks.push({ check: 'International Number', checkHi: 'अंतर्राष्ट्रीय नंबर', status: 'WARN', detail: `${matchedIntl.country} country code. Unsolicited international calls are a red flag for scams.`, detailHi: `${matchedIntl.hi} कंट्री कोड। अनचाही अंतर्राष्ट्रीय कॉल स्कैम का संकेत है।` });
  }

  // ── Check 11: Mobile calling as "bank/government" pattern ──
  // If it's a regular mobile number AND caller claimed to be CBI/police/bank — flag it
  if (isMobile && !isTollFree && !isTransactional) {
    checks.push({ check: 'Mobile Caller', checkHi: 'मोबाइल कॉलर', status: 'INFO', detail: 'Real banks, police, and government agencies never call from personal mobile numbers.', detailHi: 'असली बैंक, पुलिस और सरकारी एजेंसियां कभी भी व्यक्तिगत मोबाइल नंबर से फोन नहीं करतीं।' });
  }

  const capped = Math.min(score, 100);
  const riskLevel: RiskLevel =
    capped >= 70 ? 'SCAM_LIKELY' :
    capped >= 50 ? 'HIGH' :
    capped >= 30 ? 'MEDIUM' :
    capped >= 15 ? 'LOW' : 'SAFE';

  const operator = detectOperator(normalised);
  let type = 'Mobile';
  let typeHi = 'मोबाइल';
  if (isTelemarketing) { type = 'Commercial Telemarketer'; typeHi = 'व्यावसायिक टेलीमार्केटर'; }
  else if (isTransactional) { type = 'Transactional (Bank/OTP)'; typeHi = 'ट्रांजेक्शनल (बैंक/OTP)'; }
  else if (isPremium) { type = 'Premium Rate'; typeHi = 'प्रीमियम रेट'; }
  else if (isTollFree) { type = 'Toll-Free'; typeHi = 'टोल-फ्री'; }
  else if (isVoIP) { type = 'VoIP / Broadband Voice'; typeHi = 'VoIP / ब्रॉडबैंड वॉयस'; }
  else if (!isMobile) { type = 'Landline'; typeHi = 'लैंडलाइन'; }

  let action = '';
  let actionHi = '';
  if (riskLevel === 'SCAM_LIKELY') {
    action = 'DO NOT engage. Block this number immediately. Report to 1930 (cyber helpline) or cybercrime.gov.in.';
    actionHi = 'जवाब न दें। तुरंत ब्लॉक करें। 1930 (साइबर हेल्पलाइन) या cybercrime.gov.in पर रिपोर्ट करें।';
  } else if (riskLevel === 'HIGH') {
    action = 'High risk. Do not share any personal info, OTP, or money. Call back on the official number to verify.';
    actionHi = 'उच्च जोखिम। कोई व्यक्तिगत जानकारी, OTP या पैसा न दें। आधिकारिक नंबर पर वापस कॉल करके सत्यापित करें।';
  } else if (riskLevel === 'MEDIUM') {
    action = 'Proceed with caution. Do not share OTP or financial information. Verify the caller\'s identity independently.';
    actionHi = 'सावधानी बरतें। OTP या वित्तीय जानकारी न दें। स्वतंत्र रूप से कॉलर की पहचान सत्यापित करें।';
  } else if (riskLevel === 'LOW') {
    action = 'Low risk but stay alert. Never share OTP, Aadhaar, or banking details over phone.';
    actionHi = 'कम जोखिम लेकिन सतर्क रहें। फोन पर OTP, आधार या बैंकिंग विवरण कभी न दें।';
  } else {
    action = 'No strong risk signals detected. Golden rule: never share OTP or passwords over any call.';
    actionHi = 'कोई मजबूत जोखिम संकेत नहीं। सुनहरा नियम: किसी भी कॉल पर OTP या पासवर्ड कभी न दें।';
  }

  return { number: raw.trim(), normalised, type, typeHi, operator: operator.name, operatorHi: operator.nameHi, riskLevel, score: capped, flags, flagsHi, checks, action, actionHi };
}

/* ── UI helpers ── */
const RISK_CONFIG: Record<RiskLevel, { label: string; labelHi: string; color: string; border: string; bg: string; icon: any }> = {
  SAFE:        { label: 'SAFE',        labelHi: 'सुरक्षित',      color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: CheckCircle },
  LOW:         { label: 'LOW RISK',    labelHi: 'कम जोखिम',      color: 'text-yellow-400',  border: 'border-yellow-500/40',  bg: 'bg-yellow-500/10',  icon: Info },
  MEDIUM:      { label: 'MEDIUM RISK', labelHi: 'मध्यम जोखिम',   color: 'text-orange-400',  border: 'border-orange-500/40',  bg: 'bg-orange-500/10',  icon: AlertTriangle },
  HIGH:        { label: 'HIGH RISK',   labelHi: 'उच्च जोखिम',    color: 'text-red-400',     border: 'border-red-500/40',     bg: 'bg-red-500/10',     icon: XCircle },
  SCAM_LIKELY: { label: 'SCAM LIKELY', labelHi: 'स्कैम संभव',    color: 'text-red-300',     border: 'border-red-400/60',     bg: 'bg-red-500/20',     icon: ShieldAlert },
};

const STATUS_COLOR: Record<string, string> = {
  PASS: 'text-emerald-400',
  WARN: 'text-yellow-400',
  FAIL: 'text-red-400',
  INFO: 'text-cyan-400',
};
const STATUS_ICON: Record<string, any> = {
  PASS: CheckCircle,
  WARN: AlertTriangle,
  FAIL: XCircle,
  INFO: Info,
};

/* ── Component ── */
export default function PhoneNumberChecker(_props?: { lang?: 'en' | 'hi' }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const { lang: language } = useLanguage();

  const en = language === 'en';

  const handleCheck = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setResult(analyseNumber(trimmed));
  };

  const handleReset = () => { setInput(''); setResult(null); };

  const rc = result ? RISK_CONFIG[result.riskLevel] : null;
  const RiskIcon = rc?.icon;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <BackToHome />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-500/20 rounded-2xl">
          <Phone className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {en ? 'Phone Number Guard' : 'फोन नंबर गार्ड'}
          </h1>
          <p className="text-slate-400 text-sm">
            {en
              ? 'India-specific scam call risk analyser · 100% on-device · No data sent'
              : 'भारत-विशिष्ट स्कैम कॉल जोखिम विश्लेषक · 100% ऑन-डिवाइस · कोई डेटा नहीं भेजा'}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {en ? 'Enter the suspicious phone number' : 'संदिग्ध फोन नंबर दर्ज करें'}
        </label>
        <div className="flex gap-3">
          <input
            type="tel"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder={en ? '+91 98765 43210 or 140xxxxxxx' : '+91 98765 43210 या 140xxxxxxx'}
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500"
          />
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            {en ? 'Check' : 'जांचें'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {en
            ? 'Accepts: 10-digit, +91 prefix, 0-prefix, 140/160 series, 1800/1860 toll-free'
            : 'स्वीकृत: 10-अंक, +91 प्रीफिक्स, 0-प्रीफिक्स, 140/160 सीरीज, 1800/1860 टोल-फ्री'}
        </p>
      </div>

      {/* Results */}
      {result && rc && RiskIcon && (
        <div className="space-y-5">

          {/* Verdict banner */}
          <div className={`rounded-2xl border p-5 ${rc.border} ${rc.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <RiskIcon className={`w-7 h-7 ${rc.color}`} />
                <div>
                  <div className={`text-xl font-bold ${rc.color}`}>
                    {en ? rc.label : rc.labelHi}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {result.normalised || result.number}
                  </div>
                </div>
              </div>
              {/* Score ring */}
              <div className="flex flex-col items-center">
                <div className={`text-2xl font-black ${rc.color}`}>{result.score}</div>
                <div className="text-slate-500 text-xs">{en ? '/100 Risk' : '/100 जोखिम'}</div>
              </div>
            </div>

            {/* Type + Operator */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-black/30 rounded-lg px-3 py-2">
                <div className="text-slate-500 text-xs mb-0.5">{en ? 'Number Type' : 'नंबर प्रकार'}</div>
                <div className="text-white font-medium">{en ? result.type : result.typeHi}</div>
              </div>
              <div className="bg-black/30 rounded-lg px-3 py-2">
                <div className="text-slate-500 text-xs mb-0.5">{en ? 'Operator' : 'ऑपरेटर'}</div>
                <div className="text-white font-medium">{en ? result.operator : result.operatorHi}</div>
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <ul className="space-y-1 mb-4">
                {(en ? result.flags : result.flagsHi).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <span className="text-slate-200">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Action advice */}
            <div className="bg-black/40 rounded-xl px-4 py-3 text-sm text-slate-200">
              <span className="font-semibold text-white">{en ? 'What to do: ' : 'क्या करें: '}</span>
              {en ? result.action : result.actionHi}
            </div>
          </div>

          {/* Detailed checks */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">
              {en ? `${result.checks.length} Security Checks` : `${result.checks.length} सुरक्षा जांच`}
            </h3>
            <div className="space-y-3">
              {result.checks.map((c, i) => {
                const Icon = STATUS_ICON[c.status];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_COLOR[c.status]}`} />
                    <div>
                      <div className="text-white text-sm font-medium">{en ? c.check : c.checkHi}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{en ? c.detail : c.detailHi}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report + Reset buttons */}
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
              {en ? 'Universal Rules (regardless of verdict)' : 'सार्वभौमिक नियम (परिणाम चाहे जो भी हो)'}
            </div>
            {(en ? [
              'Never share OTP with anyone — not even your bank, police, or TRAI.',
              'No government agency will threaten "Digital Arrest" over a phone call.',
              'Banks never ask for card numbers, CVV, or passwords over the phone.',
              'If in doubt, hang up and call back on the official number from the website.',
              'Report scam calls: Dial 1930 or visit cybercrime.gov.in',
            ] : [
              'OTP किसी के साथ साझा न करें — बैंक, पुलिस या TRAI के नाम पर भी नहीं।',
              'कोई भी सरकारी एजेंसी फोन पर "डिजिटल अरेस्ट" की धमकी नहीं देती।',
              'बैंक कभी फोन पर कार्ड नंबर, CVV या पासवर्ड नहीं मांगते।',
              'संदेह हो तो फोन काटें और आधिकारिक वेबसाइट से नंबर लेकर वापस कॉल करें।',
              'स्कैम कॉल रिपोर्ट करें: 1930 डायल करें या cybercrime.gov.in पर जाएं',
            ]).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
