/* =========================================================
   QuantumLocate™ – Caller Intelligence Engine (on-device core)

   Turns a phone number into an explainable security assessment.
   This module is CLIENT-SAFE: it depends only on libphonenumber-js
   (lightweight, offline) plus QuantumShield's India scam-rule set.
   No number ever leaves the device for this core analysis.

   Carrier + telecom-circle enrichment and the optional AI summary
   live server-side (see /api/caller-intel) because they need the
   heavier offline metadata / the Gemini API. Those are OPTIONAL and
   clearly labelled in the UI as "sends the number".

   Honesty rules baked in (see MEMORY: no-fake-data-principle):
   - Never invent a city, carrier, or spam-report count.
   - Indian mobile numbers are portable, so we can only report the
     ORIGINAL allocated carrier and cannot derive a city — we say so.
   - When evidence is insufficient we return "Origin Unknown" rather
     than guessing (PRD core principle #7).
   ========================================================= */

import { parsePhoneNumberFromString, type PhoneNumber } from 'libphonenumber-js';

/* ── Public types ── */

// PRD risk scale: 0-25 Safe · 26-50 Low · 51-75 Suspicious · 76-100 Dangerous
export type RiskBand = 'SAFE' | 'LOW' | 'SUSPICIOUS' | 'DANGEROUS';

// PRD recommendation ladder (green → black)
export type Recommendation =
  | 'SAFE_TO_ANSWER'
  | 'CAUTION'
  | 'VERIFY_IDENTITY'
  | 'HIGH_RISK'
  | 'BLOCK';

export type OriginLevel = 'city' | 'state' | 'country' | 'unknown';

export interface IntelSignal {
  label: string;
  labelHi: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
  detailHi: string;
}

export interface CallerIntel {
  /* raw + parsing */
  input: string;
  valid: boolean;
  parseable: boolean;
  e164: string | null;
  national: string | null;

  /* Layer 1 – Country intelligence */
  country: string | null;          // ISO 3166 alpha-2, e.g. "IN"
  countryName: string;
  countryNameHi: string;
  callingCode: string | null;      // e.g. "+91"

  /* Layer 2 – Telecom intelligence */
  numberType: string;
  numberTypeHi: string;
  numberTypeSource: 'india-rules' | 'libphonenumber' | 'unknown';
  isVirtualLikely: boolean;

  /* Layer 3 – Estimated origin (never GPS / never a fabricated city) */
  origin: string;
  originHi: string;
  originLevel: OriginLevel;
  originConfidence: number;        // 0-100, about the origin we DO state
  originConfidenceReasons: string[];
  originConfidenceReasonsHi: string[];

  /* Layer 4/5 – Reputation & scam pattern intelligence */
  riskScore: number;               // 0-100 (higher = more dangerous)
  trustScore: number;              // 100 - riskScore
  riskBand: RiskBand;
  scamCategories: string[];        // known-scam categories the PATTERN is linked to
  scamCategoriesHi: string[];

  /* Reputation / community — honest empty state (no free source) */
  spamReportsAvailable: false;

  /* Layer 9/10 – Confidence & explainability */
  signals: IntelSignal[];
  whyScore: string[];
  whyScoreHi: string[];

  /* Guidance */
  recommendation: Recommendation;
  summary: string;
  summaryHi: string;

  /* Enrichment slots — filled server-side, null until then */
  carrier: string | null;
  carrierNote: string | null;
  carrierNoteHi: string | null;
  circle: string | null;           // telecom circle / geocoded region
  aiSummary: string | null;
  enriched: boolean;
}

/* ── India-specific reference data (ported & consolidated from the
     original PhoneNumberChecker rule set) ── */

const EMERGENCY_NUMBERS = new Set([
  '100', '101', '102', '103', '104', '108', '112', '1930', '155260', '1091', '181', '1098',
]);
const TOLL_FREE_PREFIX = ['1800'];
const PREMIUM_PREFIX = ['1860', '1861'];
const TELEMARKETING_PREFIX = ['140'];
const TRANSACTIONAL_PREFIX = ['160'];
const VOIP_PREFIX = ['030', '031', '032', '033', '034', '035', '036', '037', '038', '039'];

// Landline prefixes repeatedly seen in government-impersonation / digital-arrest
// campaigns (cybercrime.gov.in advisories). Linked to specific scam categories.
const GOVT_IMPERSONATION_SERIES: { prefix: string; cats: string[]; catsHi: string[] }[] = [
  { prefix: '01120', cats: ['Digital Arrest', 'Fake CBI / NCB'], catsHi: ['डिजिटल अरेस्ट', 'नकली CBI / NCB'] },
  { prefix: '02228', cats: ['Fake Customs', 'Parcel Scam'], catsHi: ['नकली कस्टम', 'पार्सल स्कैम'] },
  { prefix: '04428', cats: ['Fake Income Tax'], catsHi: ['नकली आयकर विभाग'] },
  { prefix: '01722', cats: ['Fake Police', 'Digital Arrest'], catsHi: ['नकली पुलिस', 'डिजिटल अरेस्ट'] },
];

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

/* Minimal ISO country-name map for the codes we most commonly see.
   libphonenumber gives us the ISO code; we render a friendly name.
   Unknown codes fall back to the ISO code itself (never fabricated). */
const COUNTRY_NAMES: Record<string, { en: string; hi: string }> = {
  IN: { en: 'India', hi: 'भारत' },
  US: { en: 'United States', hi: 'संयुक्त राज्य अमेरिका' },
  CA: { en: 'Canada', hi: 'कनाडा' },
  GB: { en: 'United Kingdom', hi: 'यूनाइटेड किंगडम' },
  PK: { en: 'Pakistan', hi: 'पाकिस्तान' },
  CN: { en: 'China', hi: 'चीन' },
  BD: { en: 'Bangladesh', hi: 'बांग्लादेश' },
  NP: { en: 'Nepal', hi: 'नेपाल' },
  LK: { en: 'Sri Lanka', hi: 'श्रीलंका' },
  AE: { en: 'United Arab Emirates', hi: 'संयुक्त अरब अमीरात' },
  SG: { en: 'Singapore', hi: 'सिंगापुर' },
  MY: { en: 'Malaysia', hi: 'मलेशिया' },
  TH: { en: 'Thailand', hi: 'थाईलैंड' },
  KH: { en: 'Cambodia', hi: 'कंबोडिया' },
  MM: { en: 'Myanmar', hi: 'म्यांमार' },
  NG: { en: 'Nigeria', hi: 'नाइजीरिया' },
};

/* ── Helpers ── */

function normaliseIndia(raw: string): string {
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

function countryName(iso: string | null): { en: string; hi: string } {
  if (!iso) return { en: 'Unknown', hi: 'अज्ञात' };
  return COUNTRY_NAMES[iso] ?? { en: iso, hi: iso };
}

/* Map libphonenumber's line type to friendly bilingual labels.
   Used for NON-India numbers, or as a fallback for India. */
function libTypeLabel(t: string | undefined): { en: string; hi: string } | null {
  switch (t) {
    case 'MOBILE': return { en: 'Mobile', hi: 'मोबाइल' };
    case 'FIXED_LINE': return { en: 'Landline', hi: 'लैंडलाइन' };
    case 'FIXED_LINE_OR_MOBILE': return { en: 'Mobile / Landline', hi: 'मोबाइल / लैंडलाइन' };
    case 'TOLL_FREE': return { en: 'Toll-Free', hi: 'टोल-फ्री' };
    case 'PREMIUM_RATE': return { en: 'Premium Rate', hi: 'प्रीमियम रेट' };
    case 'VOIP': return { en: 'VoIP / Internet Call', hi: 'VoIP / इंटरनेट कॉल' };
    case 'PERSONAL_NUMBER': return { en: 'Personal (VoIP-style)', hi: 'व्यक्तिगत (VoIP जैसा)' };
    case 'UAN': return { en: 'Corporate (UAN)', hi: 'कॉर्पोरेट (UAN)' };
    case 'PAGER': return { en: 'Pager', hi: 'पेजर' };
    case 'VOICEMAIL': return { en: 'Voicemail', hi: 'वॉयसमेल' };
    default: return null;
  }
}

function bandFor(score: number): RiskBand {
  if (score >= 76) return 'DANGEROUS';
  if (score >= 51) return 'SUSPICIOUS';
  if (score >= 26) return 'LOW';
  return 'SAFE';
}

function recommendationFor(score: number, isVirtual: boolean): Recommendation {
  if (score >= 76) return 'BLOCK';
  if (score >= 51) return 'HIGH_RISK';
  if (score >= 26) return isVirtual ? 'VERIFY_IDENTITY' : 'CAUTION';
  if (score >= 10) return 'CAUTION';
  return 'SAFE_TO_ANSWER';
}

/* ── Core analysis (on-device) ── */

export function analyseCaller(raw: string, defaultCountry: 'IN' = 'IN'): CallerIntel {
  const input = raw.trim();

  // libphonenumber parse — tries E.164 first, then the default region.
  let pn: PhoneNumber | undefined;
  try {
    pn = parsePhoneNumberFromString(input, defaultCountry);
  } catch {
    pn = undefined;
  }

  const country = pn?.country ?? null;
  const cn = countryName(country);
  const callingCode = pn?.countryCallingCode ? `+${pn.countryCallingCode}` : null;
  const e164 = pn?.number ?? null;
  const national = pn?.formatNational() ?? null;
  const valid = pn?.isValid() ?? false;
  const parseable = Boolean(pn);
  const isIndia = country === 'IN' || (!country && /^(\+?91|0)?[6-9]\d{9}$/.test(normaliseIndia(input)));

  const signals: IntelSignal[] = [];
  const whyScore: string[] = [];
  const whyScoreHi: string[] = [];
  const scamCategories: string[] = [];
  const scamCategoriesHi: string[] = [];
  let score = 0;

  /* Signal: parse validity — the foundation of every downstream claim. */
  if (valid) {
    signals.push({
      label: 'Valid number format', labelHi: 'वैध नंबर फॉर्मेट', status: 'PASS',
      detail: `Parses as a valid number${country ? ` for ${cn.en}` : ''}.`,
      detailHi: `${country ? cn.hi + ' के लिए ' : ''}वैध नंबर के रूप में पहचाना गया।`,
    });
    whyScore.push('Number passes format & length validation');
    whyScoreHi.push('नंबर फॉर्मेट और लंबाई जांच में पास');
  } else if (parseable) {
    score += 15;
    signals.push({
      label: 'Number fails validation', labelHi: 'नंबर सत्यापन में विफल', status: 'WARN',
      detail: 'The number can be read but does not match a valid range for its country.',
      detailHi: 'नंबर पढ़ा जा सकता है लेकिन अपने देश की वैध रेंज से मेल नहीं खाता।',
    });
    whyScore.push('Number does not match a valid allocated range');
    whyScoreHi.push('नंबर किसी वैध आवंटित रेंज से मेल नहीं खाता');
  } else {
    score += 30;
    signals.push({
      label: 'Unrecognised number', labelHi: 'अपरिचित नंबर', status: 'FAIL',
      detail: 'Could not be parsed as a real phone number — possibly spoofed or malformed.',
      detailHi: 'वास्तविक फोन नंबर के रूप में नहीं पढ़ा जा सका — नकली या गलत हो सकता है।',
    });
    whyScore.push('Could not be parsed as a real phone number');
    whyScoreHi.push('वास्तविक फोन नंबर के रूप में नहीं पढ़ा जा सका');
  }

  /* Number-type resolution.
     India: rule set is authoritative (libphonenumber often returns
     undefined for Indian mobiles). Elsewhere: use libphonenumber. */
  let numberType = 'Unknown';
  let numberTypeHi = 'अज्ञात';
  let numberTypeSource: CallerIntel['numberTypeSource'] = 'unknown';
  let isVirtualLikely = false;
  let indiaMobile = false;

  const nrm = normaliseIndia(input);

  if (isIndia) {
    numberTypeSource = 'india-rules';
    const isEmergency = EMERGENCY_NUMBERS.has(nrm) || EMERGENCY_NUMBERS.has(input);
    const isTollFree = TOLL_FREE_PREFIX.some(p => nrm.startsWith(p));
    const isPremium = PREMIUM_PREFIX.some(p => nrm.startsWith(p));
    const isTelemarketing = TELEMARKETING_PREFIX.some(p => nrm.startsWith(p));
    const isTransactional = TRANSACTIONAL_PREFIX.some(p => nrm.startsWith(p));
    const isVoIP = VOIP_PREFIX.some(p => nrm.startsWith(p));
    const isMobile = /^[6-9]\d{9}$/.test(nrm);
    indiaMobile = isMobile;
    const isLandline = /^0?\d{9,10}$/.test(nrm) && !isMobile;

    if (isEmergency) { numberType = 'Emergency / Helpline'; numberTypeHi = 'आपात / हेल्पलाइन'; }
    else if (isTelemarketing) {
      numberType = 'Commercial Telemarketer (140)'; numberTypeHi = 'व्यावसायिक टेलीमार्केटर (140)';
      score += 25;
      signals.push({ label: 'TRAI telemarketing prefix', labelHi: 'TRAI टेलीमार्केटिंग प्रीफिक्स', status: 'WARN',
        detail: 'Per TRAI rules commercial calls must use the 140 series. Block via DND (1909) if unwanted.',
        detailHi: 'TRAI नियम: व्यावसायिक कॉल 140-सीरीज से। न चाहें तो DND (1909) पर ब्लॉक करें।' });
      whyScore.push('Registered commercial telemarketing series (140)');
      whyScoreHi.push('पंजीकृत व्यावसायिक टेलीमार्केटिंग सीरीज (140)');
    }
    else if (isTransactional) {
      numberType = 'Transactional (Bank / OTP · 160)'; numberTypeHi = 'ट्रांजेक्शनल (बैंक / OTP · 160)';
      signals.push({ label: 'TRAI transactional prefix', labelHi: 'TRAI ट्रांजेक्शनल प्रीफिक्स', status: 'INFO',
        detail: '160 series — banks, delivery and OTP notifications. Verify with your bank before acting.',
        detailHi: '160 सीरीज — बैंक, डिलीवरी, OTP। कार्रवाई से पहले अपने बैंक से सत्यापित करें।' });
    }
    else if (isTollFree) { numberType = 'Toll-Free (1800)'; numberTypeHi = 'टोल-फ्री (1800)';
      signals.push({ label: 'Toll-free number', labelHi: 'टोल-फ्री नंबर', status: 'INFO',
        detail: '1800 series — free to call, used by businesses/banks. Never share an OTP.',
        detailHi: '1800 सीरीज — मुफ्त कॉल, व्यापार/बैंक उपयोग करते हैं। OTP कभी न बताएं।' });
    }
    else if (isPremium) { numberType = 'Premium Rate (1860)'; numberTypeHi = 'प्रीमियम रेट (1860)';
      score += 20;
      signals.push({ label: 'Premium-rate number', labelHi: 'प्रीमियम-रेट नंबर', status: 'WARN',
        detail: '1860/1861 series — calls are charged to you and are sometimes abused by scammers.',
        detailHi: '1860/1861 सीरीज — आपसे कॉल चार्ज होता है, स्कैमर्स कभी-कभी इनका दुरुपयोग करते हैं।' });
      whyScore.push('Premium-rate series (caller charges apply)');
      whyScoreHi.push('प्रीमियम-रेट सीरीज (कॉल चार्ज लगता है)');
    }
    else if (isVoIP) {
      numberType = 'VoIP / Broadband Voice'; numberTypeHi = 'VoIP / ब्रॉडबैंड वॉयस';
      isVirtualLikely = true; score += 30;
      signals.push({ label: 'VoIP prefix (03x)', labelHi: 'VoIP प्रीफिक्स (03x)', status: 'FAIL',
        detail: '03x prefix indicates a VoIP line — high risk for spoofed bank/government impersonation.',
        detailHi: '03x प्रीफिक्स VoIP लाइन दर्शाता है — बैंक/सरकार नकल के लिए उच्च जोखिम।' });
      whyScore.push('VoIP line — commonly used to spoof caller ID');
      whyScoreHi.push('VoIP लाइन — कॉलर ID बदलने में आम');
    }
    else if (isMobile) { numberType = 'Mobile SIM'; numberTypeHi = 'मोबाइल SIM'; }
    else if (isLandline) { numberType = 'Landline'; numberTypeHi = 'लैंडलाइन'; }
    else { numberType = 'Non-standard / Possibly Spoofed'; numberTypeHi = 'गैर-मानक / संभवतः नकली'; }

    /* Digit-pattern anomalies (mobiles only). */
    if (isMobile && hasRepeatedDigits(nrm)) {
      score += 35;
      signals.push({ label: 'Repeated-digit pattern', labelHi: 'दोहराए अंक पैटर्न', status: 'FAIL',
        detail: 'Repeated digits (e.g. 9999999999) indicate a fake or auto-generated number.',
        detailHi: 'दोहराए अंक (जैसे 9999999999) नकली या ऑटो-जनरेटेड नंबर दर्शाते हैं।' });
      whyScore.push('Repeated-digit pattern (test / generated number)');
      whyScoreHi.push('दोहराए अंक पैटर्न (टेस्ट / जनरेटेड नंबर)');
    } else if (isMobile && hasSequentialDigits(nrm)) {
      score += 25;
      signals.push({ label: 'Sequential-digit pattern', labelHi: 'क्रमिक अंक पैटर्न', status: 'WARN',
        detail: 'Sequential digits (e.g. 1234567890) are typical of fake or test numbers.',
        detailHi: 'क्रमिक अंक (जैसे 1234567890) नकली या टेस्ट नंबर के विशिष्ट हैं।' });
      whyScore.push('Sequential-digit pattern (likely fake number)');
      whyScoreHi.push('क्रमिक अंक पैटर्न (संभवतः नकली नंबर)');
    }

    /* Government-impersonation landline series. */
    const govt = GOVT_IMPERSONATION_SERIES.find(
      g => nrm.startsWith(g.prefix) || input.replace(/\s/g, '').startsWith(g.prefix),
    );
    if (govt) {
      score += 50;
      scamCategories.push(...govt.cats);
      scamCategoriesHi.push(...govt.catsHi);
      signals.push({ label: 'Impersonation-linked prefix', labelHi: 'नकल-संबंधित प्रीफिक्स', status: 'FAIL',
        detail: 'This landline prefix is repeatedly reported in "Digital Arrest" and fake CBI/police scams.',
        detailHi: 'यह लैंडलाइन प्रीफिक्स "डिजिटल अरेस्ट" और नकली CBI/पुलिस स्कैम में बार-बार रिपोर्ट हुआ है।' });
      whyScore.push('Prefix linked to government-impersonation campaigns');
      whyScoreHi.push('सरकारी-नकल अभियानों से जुड़ा प्रीफिक्स');
    }

    /* A real bank/police/agency never calls from a personal mobile. */
    if (isMobile && !isTollFree && !isTransactional) {
      signals.push({ label: 'Personal mobile caller', labelHi: 'व्यक्तिगत मोबाइल कॉलर', status: 'INFO',
        detail: 'Real banks, police and government agencies never call from a personal mobile number.',
        detailHi: 'असली बैंक, पुलिस और सरकारी एजेंसियां कभी व्यक्तिगत मोबाइल नंबर से फोन नहीं करतीं।' });
    }
  } else {
    /* Non-India: libphonenumber line type. */
    const t = pn?.getType();
    const lbl = libTypeLabel(t);
    if (lbl) { numberType = lbl.en; numberTypeHi = lbl.hi; numberTypeSource = 'libphonenumber'; }
    if (t === 'VOIP' || t === 'PERSONAL_NUMBER') {
      isVirtualLikely = true; score += 25;
      signals.push({ label: 'VoIP / virtual line', labelHi: 'VoIP / वर्चुअल लाइन', status: 'WARN',
        detail: 'Internet-based number — origin is easy to disguise. Common in international scam calls.',
        detailHi: 'इंटरनेट-आधारित नंबर — मूल छिपाना आसान। अंतर्राष्ट्रीय स्कैम कॉल में आम।' });
      whyScore.push('Internet/VoIP line — origin easily disguised');
      whyScoreHi.push('इंटरनेट/VoIP लाइन — मूल आसानी से छिपाया जा सकता है');
    }
  }

  /* International-call risk (unsolicited foreign calls to Indian users). */
  const rawClean = input.replace(/\s/g, '');
  const matchedIntl = RISKY_INTL_CODES.find(
    c => rawClean.startsWith(c.code) || rawClean.startsWith('00' + c.code.slice(1)),
  );
  if (matchedIntl && country !== 'IN') {
    score += 40;
    signals.push({ label: 'International caller', labelHi: 'अंतर्राष्ट्रीय कॉलर', status: 'WARN',
      detail: `${matchedIntl.country} country code. Unsolicited international calls are a common scam vector.`,
      detailHi: `${matchedIntl.hi} कंट्री कोड। अनचाही अंतर्राष्ट्रीय कॉल स्कैम का आम तरीका है।` });
    whyScore.push(`Unsolicited international call (${matchedIntl.country})`);
    whyScoreHi.push(`अनचाही अंतर्राष्ट्रीय कॉल (${matchedIntl.hi})`);
  }

  /* If we detected a virtual line and the caller pattern is risky, surface
     the broad scam families that abuse virtual numbers (honest, pattern-level). */
  if (isVirtualLikely && scamCategories.length === 0 && score >= 26) {
    scamCategories.push('Investment / Job Scam', 'KYC / Bank Fraud');
    scamCategoriesHi.push('निवेश / नौकरी स्कैम', 'KYC / बैंक धोखाधड़ी');
  }

  const riskScore = Math.min(score, 100);
  const trustScore = 100 - riskScore;
  const riskBand = bandFor(riskScore);
  const recommendation = recommendationFor(riskScore, isVirtualLikely);

  /* ── Layer 3: Estimated origin (honest granularity only) ──
     On-device we can state COUNTRY confidently. City/circle require the
     server enrichment (geocoder). Indian mobiles are portable, so even
     enrichment yields only the ORIGINAL circle, never a live city. */
  let origin: string;
  let originHi: string;
  let originLevel: OriginLevel;
  let originConfidence: number;
  const ocr: string[] = [];
  const ocrHi: string[] = [];

  if (!parseable) {
    origin = 'Origin Unknown'; originHi = 'मूल अज्ञात'; originLevel = 'unknown'; originConfidence = 0;
    ocr.push('Number could not be parsed'); ocrHi.push('नंबर पढ़ा नहीं जा सका');
  } else if (country) {
    origin = cn.en; originHi = cn.hi; originLevel = 'country';
    originConfidence = valid ? 92 : 60;
    ocr.push(`Country code ${callingCode} maps to ${cn.en}`);
    ocrHi.push(`कंट्री कोड ${callingCode} → ${cn.hi}`);
    if (valid) { ocr.push('Number is within a valid allocated range'); ocrHi.push('नंबर वैध आवंटित रेंज में है'); }
    if (indiaMobile) {
      ocr.push('Indian mobile numbers are portable — no city can be derived; Deep lookup shows the original carrier');
      ocrHi.push('भारतीय मोबाइल नंबर पोर्टेबल हैं — शहर नहीं निकाला जा सकता; डीप लुकअप मूल कैरियर दिखाता है');
    } else if (isIndia) {
      ocr.push('Landline circle/city can be resolved via Deep lookup');
      ocrHi.push('लैंडलाइन सर्कल/शहर डीप लुकअप से मिल सकता है');
    }
  } else {
    origin = 'Origin Unknown'; originHi = 'मूल अज्ञात'; originLevel = 'unknown'; originConfidence = 25;
    ocr.push('No country code could be determined'); ocrHi.push('कोई कंट्री कोड निर्धारित नहीं हो सका');
  }

  /* Natural-language summary — deterministic, grounded ONLY in the above
     facts. The optional Gemini summary (server) can enrich this later. */
  const { summary, summaryHi } = buildSummary({
    valid, origin, originHi, numberType, numberTypeHi, riskBand, isVirtualLikely,
    scamCategories, hasSignals: score > 0,
  });

  return {
    input, valid, parseable, e164, national,
    country, countryName: cn.en, countryNameHi: cn.hi, callingCode,
    numberType, numberTypeHi, numberTypeSource, isVirtualLikely,
    origin, originHi, originLevel, originConfidence,
    originConfidenceReasons: ocr, originConfidenceReasonsHi: ocrHi,
    riskScore, trustScore, riskBand,
    scamCategories, scamCategoriesHi,
    spamReportsAvailable: false,
    signals, whyScore, whyScoreHi,
    recommendation, summary, summaryHi,
    carrier: null, carrierNote: null, carrierNoteHi: null, circle: null,
    aiSummary: null, enriched: false,
  };
}

/* ── Deterministic summary builder ── */

function buildSummary(f: {
  valid: boolean;
  origin: string; originHi: string;
  numberType: string; numberTypeHi: string;
  riskBand: RiskBand; isVirtualLikely: boolean;
  scamCategories: string[]; hasSignals: boolean;
}): { summary: string; summaryHi: string } {
  const originClause = f.origin === 'Origin Unknown'
    ? 'The origin could not be reliably determined'
    : `This number most likely originates from ${f.origin}`;
  const originClauseHi = f.originHi === 'मूल अज्ञात'
    ? 'मूल विश्वसनीय रूप से निर्धारित नहीं हो सका'
    : `यह नंबर संभवतः ${f.originHi} से है`;

  if (f.riskBand === 'DANGEROUS' || f.riskBand === 'SUSPICIOUS') {
    const cats = f.scamCategories.length ? ` It matches patterns linked to ${f.scamCategories.join(', ')}.` : '';
    const catsHi = f.scamCategories.length ? ` यह ${f.scamCategories.join(', ')} से जुड़े पैटर्न से मेल खाता है।` : '';
    return {
      summary: `${originClause}. ${f.isVirtualLikely ? 'It appears to be a virtual/VoIP line, so the true location cannot be confirmed. ' : ''}Multiple risk signals were detected (${f.numberType}).${cats} Treat this call with strong caution.`,
      summaryHi: `${originClauseHi}। ${f.isVirtualLikely ? 'यह वर्चुअल/VoIP लाइन प्रतीत होती है, इसलिए वास्तविक स्थान की पुष्टि नहीं हो सकती। ' : ''}कई जोखिम संकेत मिले (${f.numberTypeHi})।${catsHi} इस कॉल को लेकर बहुत सतर्क रहें।`,
    };
  }
  if (f.riskBand === 'LOW') {
    return {
      summary: `${originClause}. It reads as a ${f.numberType.toLowerCase()}, but a few caution signals were found. No confirmed fraud — stay alert and never share an OTP.`,
      summaryHi: `${originClauseHi}। यह ${f.numberTypeHi} जैसा है, लेकिन कुछ सावधानी संकेत मिले। कोई पुष्ट धोखाधड़ी नहीं — सतर्क रहें और OTP कभी न बताएं।`,
    };
  }
  return {
    summary: `${originClause}. It reads as a ${f.numberType.toLowerCase()} with no significant risk signals in our on-device checks. Golden rule: never share an OTP or password on any call.`,
    summaryHi: `${originClauseHi}। यह ${f.numberTypeHi} जैसा है और हमारी ऑन-डिवाइस जांच में कोई बड़ा जोखिम संकेत नहीं मिला। सुनहरा नियम: किसी भी कॉल पर OTP या पासवर्ड कभी न बताएं।`,
  };
}
