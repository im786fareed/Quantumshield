// Deterministic threat engine for QuantumShield's server rule-engine fallback.
// Uses the shared India-scam corpus (src/lib/security/scamPatterns.ts) — the
// same phrases the AI Call Analyzer uses — so message, SMS and call detection
// all agree when the AI engine is unavailable.

import { scoreScamText } from "@/lib/security/scamPatterns";

// Retained for any callers importing the legacy keyword lists directly.
export const SCAM_DATABASE = {
  dataLoss: [
    "reset", "format", "factory settings", "delete all", "erase data",
    "anydesk", "teamviewer", "rustdesk", "remote control", "screen share",
  ],
  digitalArrest: [
    "digital arrest", "cbi", "narcotics", "customs", "money laundering",
    "illegal parcel", "skype call", "whatsapp video", "police station",
    "arrest warrant", "supreme court", "central bureau",
  ],
  financial: [
    "otp", "password", "transaction limit", "beneficiary", "kyc update",
    "account blocked", "unauthorized transaction",
  ],
};

export interface ThreatResult {
  type: string;
  riskScore: number;
  riskLevel: "safe" | "suspicious" | "dangerous";
  message: string;
}

export const analyzeThreat = (text: string): ThreatResult => {
  const lower = text.toLowerCase();

  // 1. Remote-access / data-wipe coercion is the highest-priority live danger.
  const dataLossMatch = SCAM_DATABASE.dataLoss.find((w) => lower.includes(w));
  if (dataLossMatch) {
    return {
      type: "EMERGENCY_DATA_LOSS",
      riskScore: 100,
      riskLevel: "dangerous",
      message:
        "🚨 EMERGENCY: Caller is trying to wipe your data or access your device remotely! DO NOT follow instructions. Disconnect and turn off internet now.",
    };
  }

  // 2. Rich corpus scoring (shared with the Call Analyzer).
  const scam = scoreScamText(text);

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
