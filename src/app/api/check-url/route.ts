import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

interface UrlAnalysis {
  url: string;
  safe: boolean;
  score: number;
  level: "safe" | "low" | "medium" | "high" | "critical";
  flags: string[];
  details: string;
}

// Known safe domains — never flag these
const WHITELIST = new Set([
  "google.com", "youtube.com", "facebook.com", "amazon.in", "amazon.com",
  "flipkart.com", "hdfc.com", "icicibank.com", "sbi.co.in", "paytm.com",
  "phonepe.com", "gpay.com", "upi.org", "npci.org.in", "rbi.org.in",
  "gov.in", "nic.in", "cybercrime.gov.in", "mha.gov.in",
]);

// High-risk TLDs frequently abused in phishing
const RISKY_TLDS = new Set([
  ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".click",
  ".loan", ".win", ".racing", ".work", ".stream", ".science",
]);

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

function extractDomain(raw: string): string {
  try {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const u = new URL(withProto);
    return u.hostname.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function analyzeUrl(rawUrl: string): UrlAnalysis {
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

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const url: string = body?.url;

    if (!url || typeof url !== "string" || url.trim().length < 4) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
    }

    const result = analyzeUrl(url);
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
