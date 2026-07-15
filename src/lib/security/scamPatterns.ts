/**
 * Shared India-scam pattern corpus — the single source of truth for phrase-
 * based scam detection across QuantumShield.
 *
 * This corpus was the richest scam-phrase library in the app (it lived inside
 * the AI Call Analyzer). It is now shared so all previously-separate engines
 * agree:
 *   • AI Call Analyzer (live call transcripts) imports the data below;
 *   • the server rule engine (threatEngine) uses scoreScamText() as the
 *     deterministic fallback for /api/check-spam and /api/analyze when the AI
 *     engine is unavailable;
 *   • explainScamText() gives those routes their plain-language reasons —
 *     it replaced the old standalone textAnalyzer keyword engine.
 *
 * Pure data + pure functions — safe on client and server.
 */

export const SCAM_PATTERNS: Record<string, string[]> = {
  digitalArrest: [
    'digital arrest', 'digitally arrested', 'cyber arrest', 'online arrest',
    'virtual arrest', 'video call arrest', 'digital giraftari',
    'aapko digitally arrest kar rahe', 'aap arrested hain', 'aapki giraftari',
    'digital custody', 'online custody', 'video custody', 'monitored online',
    'cyber department arrest', 'digital surveillance', 'aapko monitor kar rahe',
    'aap hamare nazar mein hain', 'ghar se mat niklo', 'ghar mein hi rehna',
    'under digital supervision', 'virtual custody', 'online detention',
  ],
  authorityClaim: [
    'police', 'cbi', 'ed', 'income tax', 'customs', 'officer', 'ips', 'ias',
    'investigation', 'authority', 'government', 'enforcement directorate',
    'revenue department', 'cyber cell', 'narcotics', 'cbdt', 'sebi',
    'sarkar', 'adhikari', 'vibhag', 'jaanch', 'kedriya', 'puchh taach',
    'supreme court', 'high court', 'district court', 'national security',
    'intelligence bureau', 'raw agent', 'ib officer', 'interpol', 'ncb officer',
    'narcotics control', 'money laundering', 'pmla', 'financial crimes',
    'i am superintendent', 'senior officer', 'tehsildaar', 'commissioner',
    'rbi officer', 'reserve bank', 'sebi notice', 'income tax raid', 'tax raid',
    'delhi police', 'mumbai police', 'hyderabad police', 'cyber crime department',
    'national cyber crime', 'covert operation', 'sting operation',
  ],
  urgencyPressure: [
    'urgent', 'immediately', 'right now', 'within minutes', 'last chance',
    'time running out', 'hurry', 'quick', 'abhi', 'turant', 'jaldi',
    'warna', 'nahi to', 'baad mein mushkil', 'ek ghante mein',
    "before it's too late", 'do not waste time', 'act now', 'deadline',
    'last warning', 'final notice', 'do not delay', 'this is critical',
    'time is up', 'countdown started', 'non-negotiable', 'no extension',
    'aaj hi karna hoga', 'aaj raat tak', 'kal tak', 'agle ghante mein',
    'warna case darz hoga', 'warna giraftari', 'abhi karo nahi to',
    'ek second bhi mat ruko', 'turat nirnay', 'fauran karo',
  ],
  legalThreat: [
    'arrest', 'warrant', 'court', 'legal action', 'jail', 'police station',
    'fir', 'case registered', 'criminal', 'summons', 'chargesheet',
    'prosecution', 'judicial', 'magistrate',
    'giraftari', 'muqadma', 'case darz', 'pakad lenge', 'hawalat',
    'qanooni kaaryavahi', 'kaid', 'jail bhejenge',
    'non-bailable warrant', 'nbw', 'red notice', 'lookout notice',
    'absconding', 'fugitive', 'interpol red corner notice',
    'criminal record', 'black list', 'account freeze', 'passport cancel',
    'property seized', 'assets frozen', 'visa revoked',
    'pehle se case darj hai', 'naam kaali suchi mein hai',
    'passport roka ja sakta hai', 'property seize hogi',
    'court order', 'high court notice', 'bench warrant',
  ],
  financialRequest: [
    'transfer money', 'payment', 'fine', 'penalty', 'bail', 'transaction',
    'upi', 'neft', 'rtgs', 'send money', 'deposit', 'wire transfer', 'imps',
    'google pay', 'phonepe', 'paytm', 'bank account', 'routing',
    'paise bhejo', 'paise transfer karo', 'amount bhejo', 'paisa do',
    'rupaye', 'lakh', 'crore', 'ek hajar', 'das hajar',
    'account mein daalo', 'turant transfer',
    'processing fee', 'verification fee', 'security deposit', 'bail amount',
    'court fee', 'legal fee', 'penalty charges', 'fine payment',
    'advance payment', 'clearance fee', 'release fee', 'maintenance fee',
    'kuch paise bhejne honge', 'thoda amount lagega',
    'ek baar paise bhejo', 'secure amount', 'refundable deposit',
    'money order', 'demand draft', 'crypto', 'bitcoin', 'usdt',
  ],
  informationRequest: [
    'otp', 'cvv', 'pin', 'password', 'card number', 'account number',
    'aadhaar', 'pan card', 'date of birth', 'verify', 'share your',
    'tell me your', 'confirm your', "mother's maiden",
    'otp batao', 'pin batao', 'number share karo', 'number dijiye',
    'aadhaar number', 'aadhaar batao', 'pan batao', 'verify karo',
    'apna number do', 'mobile number do', 'details do',
    'ifsc code', 'bank details', 'net banking', 'internet banking password',
    'atm card number', '16 digit', 'expiry date', 'card verify',
    'account mein kya balance hai', 'apna account number do',
    'registered mobile number', 'linked mobile number',
  ],
  packageScam: [
    'courier', 'parcel', 'package', 'shipment', 'delivery', 'seized',
    'fedex', 'dhl', 'customs clearance', 'contraband', 'drug', 'narcotics',
    'illegal item', 'foreign parcel',
    'parsel', 'dabba', 'courier pakda gaya', 'customs mein roka',
    'your name on parcel', 'aapke naam ka parcel', 'package seized',
    'illegal drugs found', 'aadhaar linked parcel', 'sim card parcel',
    'suspicious package', 'detained at airport', 'aapka saman',
  ],
  silenceControl: [
    "don't tell anyone", 'keep secret', 'confidential', "don't disconnect",
    'stay on line', "don't hang up", 'keep this private', 'tell no one',
    'remain on call', 'do not leave', 'record kar rahe', 'sab sun rahe',
    'kisi ko mat batana', 'line mat kato', 'phone rakhna mat',
    'chup rehna', 'secret rakho', 'abhi mat jaana',
    'turn off your mobile', 'put phone on silent', 'disable other apps',
    'delete this call', 'end all other calls', 'close your door',
    'go to a private place', 'alone hoke baat karo',
    'kisi ke saamne mat bolna', 'bahar mat jao', 'phone mat rakhna',
    'apne ghar mein rah', 'media ko mat batana',
  ],
  kashmirBiharMTI: [
    'i am from cyber department', 'from cyber', 'from cbi', 'from it department',
    'ek minute', 'do minute', 'teen minute', 'char minute',
    'mera naam', 'meri id', 'mera number', 'main officer',
    'hamare pass information', 'aapke against case', 'case file hua',
    'notice send hua', 'notice bheja', 'court se notice',
    'aapke khilaf case', 'aapke upar fir darj', 'aapka number registered',
    'aapka sim illegal', 'aapka aadhaar misuse', 'aapka account suspicious',
    'hamari investigation mein', 'hamari team', 'hamare record mein',
  ],
  accountRequest: [
    'your account number', 'account details', 'bank details', 'full name on account',
    'net banking credentials', 'internet banking', 'online banking password',
    'screen share', 'share screen', 'anydesk', 'teamviewer', 'remote access',
    'install app', 'download app', 'apna screen share karo',
    'apna net banking kholo', 'banking app open karo',
  ],
  dataWipe: [
    'factory reset', 'factory settings', 'format your phone', 'format kar',
    'delete all data', 'erase all data', 'erase your data', 'wipe your phone',
    'wipe your data', 'phone reset karo', 'data delete karo', 'rustdesk',
    'remote control of your',
  ],
  bankScare: [
    'kyc', 're-kyc', 'kyc update', 'kyc expire', 'kyc pending', 'kyc suspend',
    'update your kyc', 'kyc verification',
    'account blocked', 'account will be blocked', 'account has been blocked',
    'account suspended', 'account frozen', 'card blocked', 'card has been blocked',
    'unauthorized transaction', 'suspicious transaction', 'sim block', 'sim band',
    'khata band', 'account band', 'pan card link', 'aadhaar link expire',
  ],
  prizeLure: [
    'lottery', 'you have won', 'you won a', 'you won the', 'winner selected',
    'lucky draw', 'lucky winner', 'jackpot', 'prize money', 'claim your prize',
    'claim your reward', 'scratch card', 'kbc', 'crore jeeta', 'lakh jeeta',
    'inaam jeeta', 'congratulations! you',
  ],
  clickBait: [
    'click here', 'click the link', 'click below', 'click on the link',
    'tap here', 'tap the link', 'open the link', 'open this link',
    'link par click', 'is link par', 'diye gaye link', 'link kholo',
  ],
};

/** Remote-access tooling — combined with dataWipe it marks the live
 *  "caller is taking over the device" emergency in the threat engine. */
export const REMOTE_TOOL_RE = /anydesk|teamviewer|rustdesk|screen ?shar|remote (access|control)/i;

export const BANKING_KEYWORDS = [
  'bank', 'account', 'transfer', 'payment', 'upi', 'neft', 'rtgs', 'transaction',
  'money', 'amount', 'rupees', 'lakh', 'crore', 'withdraw', 'deposit', 'balance',
  'paisa', 'paise', 'rupay', 'bhejo', 'daalo', 'fund',
];

export const CATEGORY_WEIGHTS: Record<string, number> = {
  digitalArrest: 70,
  authorityClaim: 18,
  urgencyPressure: 15,
  legalThreat: 18,
  financialRequest: 25,
  informationRequest: 25,
  packageScam: 20,
  silenceControl: 20,
  kashmirBiharMTI: 12,
  accountRequest: 30,
  dataWipe: 35,
  bankScare: 25,
  prizeLure: 25,
  clickBait: 15,
};

/** Plain-language reason shown to users when a category fires. */
export const CATEGORY_LABELS: Record<string, string> = {
  digitalArrest: "'Digital arrest' scam language — no such thing exists in Indian law",
  authorityClaim: 'Claims to be police/CBI/government authority',
  urgencyPressure: 'Urgency and pressure tactics',
  legalThreat: 'Threats of arrest or legal action',
  financialRequest: 'Demands money or payment',
  informationRequest: 'Asks for OTP, PIN or personal information',
  packageScam: 'Fake parcel/courier storyline',
  silenceControl: 'Tries to isolate you and keep this secret',
  kashmirBiharMTI: 'Matches known scam-call script phrasing',
  accountRequest: 'Asks for account access, screen sharing or app install',
  dataWipe: 'Tries to make you wipe or hand over control of your device',
  bankScare: 'Fake bank/KYC scare (account blocked, KYC expiry)',
  prizeLure: 'Lottery / prize / reward lure',
  clickBait: 'Pressures you to click a link',
};

const NEGATION_WORDS = [
  'not ', 'never ', 'no ', "isn't ", "aren't ", "don't ", "won't ", "can't ", "doesn't ",
  'nahi ', 'nahi', 'mat ', 'nahin ', 'nahi hai', 'nahi hoga', 'nahi kiya', 'nahi karunga',
];

/**
 * Short tokens like 'ed', 'fir', 'pin', 'upi' must match whole words only —
 * plain substring matching fires them inside 'reachED', 'FIRst', 'shopPINg',
 * 'occUPIed'. Longer phrases keep substring matching so 'arrest' still
 * catches 'arrested'.
 */
const SHORT_PHRASE_MAX = 4;
const boundaryCache = new Map<string, RegExp>();

export function phraseMatches(lowerText: string, phrase: string): boolean {
  if (phrase.length > SHORT_PHRASE_MAX || phrase.includes(' ')) {
    return lowerText.includes(phrase);
  }
  let re = boundaryCache.get(phrase);
  if (!re) {
    re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    boundaryCache.set(phrase, re);
  }
  return re.test(lowerText);
}

export function hasNegationBefore(lower: string, phrase: string): boolean {
  const idx = lower.indexOf(phrase);
  if (idx < 0) return false;
  const prefix = lower.substring(Math.max(0, idx - 35), idx);
  return NEGATION_WORDS.some((neg) => prefix.includes(neg));
}

export const AMOUNT_REGEX = /(?:₹|rs\.?\s*|rupees?\s*|inr\s*)(\d[\d,]*)(?:\s*(?:lakh|lac|crore|thousand|k))?/gi;

export interface ScamScore {
  score: number;              // 0–100
  isScam: boolean;            // score > 35
  firedCategories: string[];  // categories with at least one non-negated hit
  hits: Record<string, string[]>; // category → matched phrases
  hasDigitalArrest: boolean;
  amount: string | null;      // first monetary demand found
}

/**
 * Language-neutral core scorer used by the server rule engine. The Call
 * Analyzer keeps its own UI-rich wrapper but shares this exact corpus.
 */
export function scoreScamText(text: string): ScamScore {
  const lower = text.toLowerCase();
  const firedCategories: string[] = [];
  const hits: Record<string, string[]> = {};
  let total = 0;

  for (const [cat, phrases] of Object.entries(SCAM_PATTERNS)) {
    const matched = phrases.filter((p) => phraseMatches(lower, p) && !hasNegationBefore(lower, p));
    if (!matched.length) continue;
    firedCategories.push(cat);
    hits[cat] = matched.slice(0, 4);
    const w = (cat === 'digitalArrest' ? 75 : CATEGORY_WEIGHTS[cat] ?? 10) * Math.min(matched.length, 3);
    total += w;
  }

  // Co-occurrence bonuses — scam scripts combine multiple pressure tactics.
  if (firedCategories.length >= 3) total += 15;
  if (firedCategories.length >= 5) total += 20;
  if (
    firedCategories.includes('authorityClaim') &&
    firedCategories.includes('legalThreat') &&
    firedCategories.includes('financialRequest')
  ) {
    total += 25;
  }

  const amountMatch = [...lower.matchAll(AMOUNT_REGEX)][0]?.[0]?.trim() ?? null;
  if (amountMatch) total += 15;

  const score = Math.min(total, 100);
  return {
    score,
    isScam: score > 35,
    firedCategories,
    hits,
    hasDigitalArrest: firedCategories.includes('digitalArrest'),
    amount: amountMatch,
  };
}

/** Message-risk scale used by the text routes and the AI analyzer. */
export type TextRiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export function textRiskLevel(score: number): TextRiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

export interface TextExplanation {
  score: number;
  level: TextRiskLevel;
  reasons: string[];     // plain-language, one per fired category + extras
  indicators: string[];  // the matched phrases themselves
  scam: ScamScore;
}

const LINK_RE = /(https?:\/\/|www\.|bit\.ly|tinyurl)/i;
const PHONE_RE = /\b\d{10}\b/;

/**
 * Corpus-driven replacement for the old standalone textAnalyzer: same
 * output shape (score/level/reasons/indicators) but the reasons come from
 * the shared corpus, so every engine explains threats with one voice.
 */
export function explainScamText(text: string): TextExplanation {
  const scam = scoreScamText(text);
  const reasons = scam.firedCategories.map((c) => CATEGORY_LABELS[c] ?? c);
  const indicators = Object.values(scam.hits).flat().slice(0, 12);
  let score = scam.score;

  if (LINK_RE.test(text)) {
    score = Math.min(100, score + 15);
    reasons.push('Contains a link');
    indicators.push('link');
  }
  if (PHONE_RE.test(text)) {
    reasons.push('Contains a phone number');
    indicators.push('phone-number');
  }
  if (scam.amount) {
    reasons.push(`Monetary demand found: ${scam.amount}`);
  }

  return { score, level: textRiskLevel(score), reasons, indicators, scam };
}
