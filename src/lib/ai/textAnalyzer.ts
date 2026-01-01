/* =========================================================
   QuantumShield – Text Scam Analyzer (Core AI Logic)
   Centralized, deterministic, explainable engine
   ========================================================= */

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface AnalysisResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
  indicators: string[];
}

/**
 * Normalize text for safer matching
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Keyword rules with weights
 */
const KEYWORD_RULES: Array<{
  keywords: string[];
  weight: number;
  reason: string;
}> = [
  {
    keywords: ["otp", "one time password", "verification code"],
    weight: 30,
    reason: "OTP request detected",
  },
  {
    keywords: ["urgent", "immediately", "asap", "act now"],
    weight: 20,
    reason: "Urgency or pressure language detected",
  },
  {
    keywords: ["arrest", "legal action", "police case", "court"],
    weight: 40,
    reason: "Threat of arrest or legal action",
  },
  {
    keywords: ["kyc", "update kyc", "verify kyc"],
    weight: 25,
    reason: "KYC update request",
  },
  {
    keywords: ["bank", "account", "credit card", "debit card"],
    weight: 20,
    reason: "Bank impersonation attempt",
  },
  {
    keywords: ["click", "tap here", "open link"],
    weight: 15,
    reason: "Suspicious link instruction",
  },
  {
    keywords: ["reward", "lottery", "won", "prize"],
    weight: 25,
    reason: "Fake reward / lottery lure",
  },
];

/**
 * Regex-based signal detection
 */
const REGEX_SIGNALS = {
  phoneNumber: /\b\d{10}\b/,
  link: /(https?:\/\/|www\.|bit\.ly|tinyurl)/i,
  money: /(rs\.?|₹|\$|rupees|dollars|lakh|crore)/i,
  urgency: /(urgent|immediately|now|within\s+\d+)/i,
};

/**
 * Score → Risk mapping
 */
function resolveRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "safe";
}

/**
 * MAIN ANALYZER
 */
export function analyzeText(text: string): AnalysisResult {
  const normalized = normalize(text);

  let score = 0;
  const reasons: string[] = [];
  const indicators: string[] = [];

  // Keyword-based rules
  for (const rule of KEYWORD_RULES) {
    for (const key of rule.keywords) {
      if (normalized.includes(key)) {
        score += rule.weight;
        reasons.push(rule.reason);
        indicators.push(key);
        break;
      }
    }
  }

  // Pattern-based signals
  if (REGEX_SIGNALS.phoneNumber.test(normalized)) {
    score += 10;
    reasons.push("Phone number detected");
    indicators.push("phone-number");
  }

  if (REGEX_SIGNALS.link.test(normalized)) {
    score += 20;
    reasons.push("Suspicious link detected");
    indicators.push("link");
  }

  if (REGEX_SIGNALS.money.test(normalized)) {
    score += 15;
    reasons.push("Money-related language detected");
    indicators.push("money");
  }

  if (REGEX_SIGNALS.urgency.test(normalized)) {
    score += 10;
    reasons.push("Urgency pattern detected");
    indicators.push("urgency");
  }

  // Clamp score
  score = Math.min(score, 100);

  const level = resolveRiskLevel(score);

  return {
    score,
    level,
    reasons: Array.from(new Set(reasons)),
    indicators: Array.from(new Set(indicators)),
  };
}
