/**
 * Phishing URL heuristics — the real detection logic shared by:
 *   • the /api/check-url server route (which also adds Google Safe Browsing), and
 *   • the on-launch Security Check, which runs these client-side so a copied
 *     link can be screened instantly, offline, on the user's device.
 *
 * Pure functions only — no server or browser globals — so it is safe to import
 * in both environments. No data leaves the device when used client-side.
 */

import { detectBrandImpersonation, isOfficialDomain } from "./brands";

export interface UrlAnalysis {
  url: string;
  safe: boolean;
  score: number;
  level: "safe" | "low" | "medium" | "high" | "critical";
  flags: string[];
  details: string;
}

// Confusable characters: non-ASCII letters that visually mimic ASCII ones
// (Cyrillic а/е/о/р/с, Greek ο/ν, etc.). Presence of ANY of these in a host
// label alongside ASCII letters is a homoglyph spoofing indicator.
const CONFUSABLE_RE = /[Ͱ-ϿЀ-ӿԀ-ԯ＀-￯]/;

/** Decode a punycode (xn--) label to its Unicode form for display, best-effort. */
function decodePunycodeHost(host: string): string {
  if (!host.includes("xn--")) return host;
  try {
    // The URL/URI machinery already has IDN support via the URL constructor
    // in most runtimes; fall back to the raw host if not.
    return new URL(`https://${host}`).hostname;
  } catch {
    return host;
  }
}

// Known safe domains — never flag these
const WHITELIST = new Set([
  "google.com", "youtube.com", "facebook.com", "amazon.in", "amazon.com",
  "flipkart.com", "hdfc.com", "icicibank.com", "sbi.co.in", "paytm.com",
  "phonepe.com", "gpay.com", "upi.org", "npci.org.in", "rbi.org.in",
  "gov.in", "nic.in", "cybercrime.gov.in", "mha.gov.in",
]);

// High-risk TLDs frequently abused in phishing
// Canonical high-risk TLD list — shared with fileAnalysis's embedded-URL check
// so a domain flagged risky on its own is treated the same when found inside a
// file. Exported as an array; used here as a Set for host-suffix matching.
export const RISKY_TLDS_LIST = [
  ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".click",
  ".loan", ".win", ".racing", ".work", ".stream", ".science",
  ".ru", ".cn",
];
const RISKY_TLDS = new Set(RISKY_TLDS_LIST);

// Shared http(s) URL extractor for pulling embedded links out of file/APK
// byte-strings. Global flag; used only with String.match (which ignores
// lastIndex), so it is safe to share across modules. Single source of truth
// so the extractor tuning never diverges between fileAnalysis and apkAnalysis.
export const EMBEDDED_URL_RE = /https?:\/\/[a-z0-9][a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]{5,120}/gi;

// Suspicious keywords in URLs
const SUSPICIOUS_KW = [
  "login", "signin", "verify", "secure", "update", "confirm",
  "account", "password", "otp", "kyc", "reward", "prize", "won",
  "free", "claim", "lucky", "winner", "bank", "paytm", "phonepe",
  "whatsapp", "sbi-", "hdfc-", "icici-", "airtel-", "jio-",
  "gov-in", "india-gov", "uidai-", "aadhar", "pan-card",
];

// Homoglyph/typosquat patterns for common Indian brands
const HOMOGLYPH_PATTERNS = [
  { real: "paytm", fakes: ["paytrn", "paytnn", "pay-tm", "p4ytm", "paytrm"] },
  { real: "sbi", fakes: ["sb1", "sbl", "s-bi", "sbi-bank"] },
  { real: "hdfc", fakes: ["hdf-c", "hdtc", "h-dfc"] },
  { real: "uidai", fakes: ["uidai-", "uid-ai", "u1dai"] },
  { real: "gov.in", fakes: ["gov-in", "govin", "g0v.in", "gov.ln"] },
];

export function extractDomain(raw: string): string {
  try {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const u = new URL(withProto);
    return u.hostname.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

/** Pull the first http(s):// or bare-domain-looking token out of arbitrary text. */
export function findUrlInText(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  const withProto = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (withProto) return withProto[0];
  // bare domain like example.com/path or sub.example.in
  const bare = trimmed.match(/\b[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s"'<>]*)?/i);
  if (bare && /\.[a-z]{2,}/i.test(bare[0])) return bare[0];
  return null;
}

export function analyzeUrl(rawUrl: string): UrlAnalysis {
  const flags: string[] = [];
  let score = 0;
  const url = rawUrl.trim();
  const lower = url.toLowerCase();
  const domain = extractDomain(url);

  // 1. Whitelist check
  for (const safe of WHITELIST) {
    if (domain === safe || domain.endsWith(`.${safe}`)) {
      return { url, safe: true, score: 0, level: "safe", flags: [], details: `Verified safe domain: ${domain}` };
    }
  }
  // A brand's own official domain is likewise trusted outright.
  if (isOfficialDomain(domain)) {
    return { url, safe: true, score: 0, level: "safe", flags: [], details: `Verified official domain: ${domain}` };
  }

  // 1b. IDN / punycode host
  if (domain.includes("xn--")) {
    score += 35;
    const decoded = decodePunycodeHost(domain);
    flags.push(
      decoded !== domain
        ? `Internationalised (punycode) domain that displays as "${decoded}" — a classic look-alike technique`
        : "Internationalised (punycode) domain — often used to imitate trusted brands"
    );
  }

  // 1c. Unicode homoglyph / mixed-script host
  if (CONFUSABLE_RE.test(url) && /[a-z]/i.test(domain)) {
    score += 45;
    flags.push("Mixed-script look-alike characters in the address (e.g. Cyrillic letters imitating Latin ones) — strong spoofing indicator");
  }

  // 1d. Brand impersonation (works on brand-new domains no blocklist has seen)
  const brandHit = detectBrandImpersonation(domain);
  if (brandHit) {
    if (brandHit.kind === "abuse") {
      score += 45;
      flags.push(`Uses the "${brandHit.brand.label}" name in a domain that is NOT its official website — likely impersonation`);
    } else {
      score += 40;
      flags.push(`Domain looks like a misspelling of "${brandHit.brand.label}" ("${brandHit.matchedLabel}") — likely a look-alike scam site`);
    }
  }

  // 2. HTTP (not HTTPS)
  if (lower.startsWith("http://")) {
    score += 20;
    flags.push("No HTTPS — connection is unencrypted");
  }

  // 3. IP address as host
  if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(lower)) {
    score += 40;
    flags.push("IP address used instead of domain — strong phishing indicator");
  }

  // 4. Risky TLD
  for (const tld of RISKY_TLDS) {
    if (domain.endsWith(tld)) {
      score += 25;
      flags.push(`High-risk TLD (${tld}) — frequently used in phishing`);
      break;
    }
  }

  // 5. Suspicious keywords
  const kwHits = SUSPICIOUS_KW.filter(k => lower.includes(k));
  if (kwHits.length >= 3) {
    score += 30;
    flags.push(`Multiple suspicious keywords: ${kwHits.slice(0, 4).join(", ")}`);
  } else if (kwHits.length >= 1) {
    score += 15;
    flags.push(`Suspicious keyword in URL: ${kwHits[0]}`);
  }

  // 6. Homoglyph / typosquat
  for (const brand of HOMOGLYPH_PATTERNS) {
    for (const fake of brand.fakes) {
      if (domain.includes(fake)) {
        score += 50;
        flags.push(`Typosquatting detected — impersonates "${brand.real}"`);
        break;
      }
    }
  }

  // 7. Excessive subdomains
  const subParts = domain.split(".");
  if (subParts.length >= 5) {
    score += 20;
    flags.push(`Excessive subdomains (${subParts.length}) — common obfuscation technique`);
  }

  // 8. Very long URL
  if (url.length > 150) {
    score += 10;
    flags.push("Unusually long URL — may be obfuscating destination");
  }

  // 9. URL shorteners
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "ow.ly", "goo.gl", "tiny.cc", "rebrand.ly", "rb.gy"];
  if (shorteners.some(s => domain.includes(s))) {
    score += 20;
    flags.push("URL shortener — destination is hidden, verify before clicking");
  }

  // 10. Numeric subdomain (e.g. 82736.paytm-help.com)
  if (/\d{5,}/.test(domain)) {
    score += 20;
    flags.push("Long numeric string in domain — phishing indicator");
  }

  const capped = Math.min(score, 100);
  const level: UrlAnalysis["level"] =
    capped >= 80 ? "critical" :
    capped >= 60 ? "high" :
    capped >= 40 ? "medium" :
    capped >= 20 ? "low" : "safe";

  return {
    url,
    safe: capped < 35,
    score: capped,
    level,
    flags,
    details: capped >= 35
      ? `Risk score ${capped}/100. Do NOT visit this URL.`
      : flags.length > 0
        ? `Low risk (${capped}/100) but has minor concerns. Proceed with caution.`
        : `No risk signals detected (${capped}/100).`,
  };
}
