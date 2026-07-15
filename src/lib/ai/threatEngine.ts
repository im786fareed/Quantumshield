// Deterministic threat engine for QuantumShield's server rule-engine fallback.
// Uses the shared India-scam corpus (src/lib/security/scamPatterns.ts) — the
// same phrases the AI Call Analyzer uses — so message, SMS and call detection
// all agree when the AI engine is unavailable.

import { scoreScamText, REMOTE_TOOL_RE } from "@/lib/security/scamPatterns";

export interface ThreatResult {
  type: string;
  riskScore: number;
  riskLevel: "safe" | "suspicious" | "dangerous";
  message: string;
}

export const analyzeThreat = (text: string): ThreatResult => {
  // Rich corpus scoring (shared with the Call Analyzer and text routes).
  const scam = scoreScamText(text);

  // 1. Remote-access / data-wipe coercion is the highest-priority live danger.
  //    (Corpus dataWipe phrases or a remote-control tool being named —
  //    a bare word like "reset" no longer trips this alone.)
  if (scam.firedCategories.includes("dataWipe") || REMOTE_TOOL_RE.test(text)) {
    return {
      type: "EMERGENCY_DATA_LOSS",
      riskScore: 100,
      riskLevel: "dangerous",
      message:
        "🚨 EMERGENCY: Caller is trying to wipe your data or access your device remotely! DO NOT follow instructions. Disconnect and turn off internet now.",
    };
  }

  if (scam.hasDigitalArrest) {
    return {
      type: "CYBER_FRAUD_DIGITAL_ARREST",
      riskScore: Math.max(scam.score, 90),
      riskLevel: "dangerous",
      message:
        "🚨 SCAM DETECTED: 'Digital Arrest' is not real — Indian authorities NEVER arrest anyone over WhatsApp/Skype video calls. Hang up immediately and report to 1930.",
    };
  }

  if (scam.isScam) {
    const dangerous = scam.score >= 60;
    return {
      type: scam.firedCategories.includes("financialRequest")
        ? "FINANCIAL_SCAM"
        : "SUSPECTED_SCAM",
      riskScore: scam.score,
      riskLevel: dangerous ? "dangerous" : "suspicious",
      message: dangerous
        ? "🚨 SCAM PATTERN: This message combines several known fraud tactics. Do not share OTP/PIN, do not pay, and report to 1930."
        : "⚠️ SUSPICIOUS: This message shows fraud warning signs. Do not share OTPs, passwords or money, and verify independently.",
    };
  }

  return {
    type: "SAFE",
    riskScore: Math.min(scam.score, 15),
    riskLevel: "safe",
    message: "No immediate scam patterns detected. Stay alert.",
  };
};
