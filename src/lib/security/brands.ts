/**
 * Brand-impersonation registry for QuantumShield's URL engine.
 *
 * Scammers rarely reuse a URL long enough to land in a blocklist — but they
 * almost always impersonate a trusted Indian brand in the domain (sbi-kyc.xyz,
 * paytm-refund.top, icici.secure-login.in). This registry powers structural
 * lookalike detection that works on brand-new domains no feed has seen yet.
 *
 * Pure data + pure functions — safe to import on client and server.
 */

export interface Brand {
  /** Canonical short key used in the brand token, e.g. "sbi". */
  key: string;
  /** Display name for user-facing messages. */
  label: string;
  labelHi: string;
  category: 'bank' | 'upi' | 'government' | 'telecom' | 'courier' | 'ecommerce';
  /** The brand's genuine registrable domains — never flagged. */
  official: string[];
  /** Tokens that, when they appear in an unrelated domain, signal impersonation. */
  tokens: string[];
}

export const BRANDS: Brand[] = [
  { key: 'sbi', label: 'State Bank of India', labelHi: 'भारतीय स्टेट बैंक', category: 'bank',
    official: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'sbi.bank.in'], tokens: ['sbi', 'onlinesbi', 'yonosbi', 'sbicard'] },
  { key: 'hdfc', label: 'HDFC Bank', labelHi: 'एचडीएफसी बैंक', category: 'bank',
    official: ['hdfcbank.com', 'hdfc.com'], tokens: ['hdfc', 'hdfcbank'] },
  { key: 'icici', label: 'ICICI Bank', labelHi: 'आईसीआईसीआई बैंक', category: 'bank',
    official: ['icicibank.com', 'icici.com'], tokens: ['icici', 'icicibank'] },
  { key: 'axis', label: 'Axis Bank', labelHi: 'एक्सिस बैंक', category: 'bank',
    official: ['axisbank.com'], tokens: ['axisbank'] },
  { key: 'kotak', label: 'Kotak Mahindra Bank', labelHi: 'कोटक बैंक', category: 'bank',
    official: ['kotak.com'], tokens: ['kotak'] },
  { key: 'pnb', label: 'Punjab National Bank', labelHi: 'पंजाब नेशनल बैंक', category: 'bank',
    official: ['pnbindia.in', 'netpnb.com'], tokens: ['pnb', 'netpnb'] },
  { key: 'bob', label: 'Bank of Baroda', labelHi: 'बैंक ऑफ बड़ौदा', category: 'bank',
    official: ['bankofbaroda.in', 'bobibanking.com'], tokens: ['bankofbaroda', 'bobibanking'] },

  { key: 'paytm', label: 'Paytm', labelHi: 'पेटीएम', category: 'upi',
    official: ['paytm.com', 'paytmbank.com', 'paytm.in'], tokens: ['paytm'] },
  { key: 'phonepe', label: 'PhonePe', labelHi: 'फ़ोनपे', category: 'upi',
    official: ['phonepe.com'], tokens: ['phonepe'] },
  { key: 'gpay', label: 'Google Pay', labelHi: 'गूगल पे', category: 'upi',
    official: ['pay.google.com', 'gpay.app'], tokens: ['googlepay', 'gpayindia'] },
  { key: 'bhim', label: 'BHIM UPI', labelHi: 'भीम यूपीआई', category: 'upi',
    official: ['bhimupi.org.in', 'npci.org.in'], tokens: ['bhim', 'bhimupi'] },

  { key: 'uidai', label: 'Aadhaar (UIDAI)', labelHi: 'आधार (UIDAI)', category: 'government',
    official: ['uidai.gov.in'], tokens: ['uidai', 'aadhaar', 'aadhar', 'myaadhaar'] },
  { key: 'incometax', label: 'Income Tax Department', labelHi: 'आयकर विभाग', category: 'government',
    official: ['incometax.gov.in', 'incometaxindia.gov.in'], tokens: ['incometax', 'itrefund', 'itdept'] },
  { key: 'epfo', label: 'EPFO', labelHi: 'ईपीएफओ', category: 'government',
    official: ['epfindia.gov.in', 'epfo.gov.in'], tokens: ['epfo', 'epfindia'] },
  { key: 'cybercrime', label: 'Cyber Crime Portal', labelHi: 'साइबर क्राइम पोर्टल', category: 'government',
    official: ['cybercrime.gov.in'], tokens: ['cybercrime'] },
  { key: 'mparivahan', label: 'mParivahan / RTO', labelHi: 'एमपरिवहन / आरटीओ', category: 'government',
    official: ['parivahan.gov.in'], tokens: ['parivahan', 'mparivahan', 'echallan'] },

  { key: 'airtel', label: 'Airtel', labelHi: 'एयरटेल', category: 'telecom',
    official: ['airtel.in', 'airtel.com'], tokens: ['airtel'] },
  { key: 'jio', label: 'Jio', labelHi: 'जियो', category: 'telecom',
    official: ['jio.com', 'jiofiber.com'], tokens: ['jio', 'myjio', 'jiofiber'] },
  { key: 'vi', label: 'Vi (Vodafone Idea)', labelHi: 'Vi (वोडाफोन आइडिया)', category: 'telecom',
    official: ['myvi.in', 'vodafoneidea.com'], tokens: ['vodafone', 'myvi'] },

  { key: 'indiapost', label: 'India Post', labelHi: 'इंडिया पोस्ट', category: 'courier',
    official: ['indiapost.gov.in'], tokens: ['indiapost'] },
  { key: 'bluedart', label: 'Blue Dart', labelHi: 'ब्लू डार्ट', category: 'courier',
    official: ['bluedart.com'], tokens: ['bluedart'] },
  { key: 'delhivery', label: 'Delhivery', labelHi: 'डेल्हीवरी', category: 'courier',
    official: ['delhivery.com'], tokens: ['delhivery'] },
  { key: 'fedex', label: 'FedEx', labelHi: 'फ़ेडएक्स', category: 'courier',
    official: ['fedex.com'], tokens: ['fedex'] },

  { key: 'amazon', label: 'Amazon', labelHi: 'अमेज़न', category: 'ecommerce',
    official: ['amazon.in', 'amazon.com'], tokens: ['amazon'] },
  { key: 'flipkart', label: 'Flipkart', labelHi: 'फ्लिपकार्ट', category: 'ecommerce',
    official: ['flipkart.com'], tokens: ['flipkart'] },
];

const OFFICIAL_DOMAINS = new Set(BRANDS.flatMap((b) => b.official));

/** Is this host one of the brand's genuine domains (exact or a subdomain)? */
export function isOfficialDomain(host: string): boolean {
  const h = host.toLowerCase();
  for (const d of OFFICIAL_DOMAINS) {
    if (h === d || h.endsWith(`.${d}`)) return true;
  }
  return false;
}

/** Levenshtein distance, capped for early exit. */
export function editDistance(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > cap) return cap + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

export interface BrandMatch {
  brand: Brand;
  /** 'lookalike' = misspelled token; 'abuse' = exact brand token on an unofficial domain. */
  kind: 'lookalike' | 'abuse';
  matchedLabel: string;
}

/**
 * Detect brand impersonation in a host that is NOT an official domain.
 * Splits the registrable part and subdomains into labels and compares each
 * against every brand token (exact abuse + near-miss lookalike).
 */
export function detectBrandImpersonation(host: string): BrandMatch | null {
  const h = host.toLowerCase();
  if (isOfficialDomain(h)) return null;

  // Break the host into alphanumeric segments: "sbi-kyc.secure-login.xyz"
  // → ["sbi", "kyc", "secure", "login", "xyz"]
  const segments = h.split(/[.\-_]/).filter((s) => s.length >= 2);

  let best: BrandMatch | null = null;
  for (const brand of BRANDS) {
    for (const token of brand.tokens) {
      for (const seg of segments) {
        if (seg === token) {
          // Exact brand token on a domain we already know isn't official.
          return { brand, kind: 'abuse', matchedLabel: token };
        }
        // Near-miss only for tokens long enough that an edit isn't noise.
        if (token.length >= 4) {
          const d = editDistance(seg, token, 1);
          if (d === 1 && seg.length >= token.length - 1) {
            best = best ?? { brand, kind: 'lookalike', matchedLabel: seg };
          }
        }
      }
    }
  }
  return best;
}
