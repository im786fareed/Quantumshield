/* =========================================================
   QuantumShield – LLM Scam Analyzer (real AI engine)
   Server-side only. Uses the Anthropic Claude API to classify
   scam/fraud content with multilingual understanding
   (English, Hindi, Hinglish, regional languages).

   Requires the ANTHROPIC_API_KEY environment variable.
   When the key is missing or the API call fails, callers fall
   back to the deterministic rule engine (textAnalyzer/threatEngine).
   ========================================================= */

import Anthropic from "@anthropic-ai/sdk";
import type { RiskLevel } from "./textAnalyzer";

export interface LlmAnalysis {
  score: number;
  level: RiskLevel;
  isThreat: boolean;
  threatType: string;
  message: string;
  reasons: string[];
  indicators: string[];
  recommendation: string;
  language: string;
}

// To reduce cost, this can be switched to "claude-haiku-4-5"
// (faster, ~5x cheaper, slightly less accurate on subtle scams).
const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are the detection engine of QuantumShield, a cyber-fraud protection app for users in India. You analyze a message, call transcript, or text snippet and decide whether it is a scam.

You are an expert on fraud patterns targeting Indians, including:
- "Digital arrest" scams (fake CBI/police/customs/narcotics officers on WhatsApp or Skype video calls, fake arrest warrants, demands to stay on the line, "money laundering case", "illegal parcel")
- UPI and bank fraud (fake KYC updates, account-blocked threats, OTP theft, fake payment confirmations, QR-code tricks where scanning SENDS money)
- Remote-access attacks (AnyDesk/TeamViewer/RustDesk install requests, screen sharing demands)
- Lottery/prize/job/loan/investment lures, fake electricity-bill disconnection threats, courier scams (FedEx/customs parcel), SIM-swap and WhatsApp-hijack attempts, sextortion, fake matrimonial/romance fraud
- Legitimate messages too: real bank alerts, real OTP messages from genuine services, ordinary conversation. Do NOT flag normal messages just because they mention money or banking.

The text may be in English, Hindi (Devanagari), Hinglish (Hindi in Latin script), or any Indian regional language, with deliberate misspellings (0TP, k.y.c, paytrn). Read through obfuscation.

Scoring guide for "score" (0-100):
- 0-19 safe: ordinary message, no fraud signals
- 20-39 low: mild caution, weak signals only
- 40-59 medium: several fraud signals, plausibly a scam
- 60-79 high: strong fraud pattern, very likely a scam
- 80-100 critical: unmistakable scam (digital arrest, OTP theft, remote-access demand)

Rules:
- "level" must match the score band above.
- "isThreat" is true when score >= 40.
- "threatType" is a short uppercase label like DIGITAL_ARREST, UPI_FRAUD, OTP_THEFT, REMOTE_ACCESS, PHISHING, LOTTERY_SCAM, JOB_SCAM, INVESTMENT_SCAM, SEXTORTION, COURIER_SCAM, KYC_FRAUD, SAFE, or OTHER.
- "message" is one or two sentences a worried non-technical user can understand instantly. If the input is in Hindi or Hinglish, write the message bilingually (English + Hindi).
- "reasons" lists each specific fraud signal you found, in plain language (max 6).
- "indicators" lists the exact suspicious phrases/numbers/links quoted from the text (max 6).
- "recommendation" tells the user exactly what to do next. For serious scams in India, always include: hang up / do not reply, never share OTP, and report to the 1930 cybercrime helpline or cybercrime.gov.in.
- "language" is the detected input language (e.g. "English", "Hindi", "Hinglish", "Telugu").`;

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    score: { type: "integer" },
    level: { type: "string", enum: ["safe", "low", "medium", "high", "critical"] },
    isThreat: { type: "boolean" },
    threatType: { type: "string" },
    message: { type: "string" },
    reasons: { type: "array", items: { type: "string" } },
    indicators: { type: "array", items: { type: "string" } },
    recommendation: { type: "string" },
    language: { type: "string" },
  },
  required: [
    "score",
    "level",
    "isThreat",
    "threatType",
    "message",
    "reasons",
    "indicators",
    "recommendation",
    "language",
  ],
  additionalProperties: false,
};

export function isLlmAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      // Hard cap so the user-facing scan never hangs; rule engine takes over.
      timeout: 25_000,
      maxRetries: 1,
    });
  }
  return client;
}

/**
 * Analyze text with Claude. Returns null when the API is not configured
 * or the call fails — callers must fall back to the rule engine.
 */
export async function analyzeWithLlm(text: string): Promise<LlmAnalysis | null> {
  if (!isLlmAvailable()) return null;

  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyze this content for fraud/scam signals:\n\n${text.slice(0, 8000)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text) as LlmAnalysis;

    // Clamp and sanity-check so the UI never receives garbage.
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    parsed.reasons = (parsed.reasons ?? []).slice(0, 6);
    parsed.indicators = (parsed.indicators ?? []).slice(0, 6);
    return parsed;
  } catch {
    // Any failure (rate limit, network, bad JSON) → rule-engine fallback.
    return null;
  }
}
