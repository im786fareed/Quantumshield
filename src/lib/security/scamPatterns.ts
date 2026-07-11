/**
 * Shared India-scam pattern corpus — the single source of truth for phrase-
 * based scam detection across QuantumShield.
 *
 * This corpus was the richest scam-phrase library in the app (it lived inside
 * the AI Call Analyzer). It is now shared so three previously-separate engines
 * agree:
 *   • AI Call Analyzer (live call transcripts) imports the data below;
 *   • the server rule engine (threatEngine) uses scoreScamText() as the
 *     deterministic fallback for /api/check-spam and /api/analyze when the AI
 *     engine is unavailable.
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
};

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
};

const NEGATION_WORDS = [
  'not ', 'never ', 'no ', "isn't ", "aren't ", "don't ", "won't ", "can't ", "doesn't ",
  'nahi ', 'nahi', 'mat ', 'nahin ', 'nahi hai', 'nahi hoga', 'nahi kiya', 'nahi karunga',
];

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
    const matched = phrases.filter((p) => lower.includes(p) && !hasNegationBefore(lower, p));
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
