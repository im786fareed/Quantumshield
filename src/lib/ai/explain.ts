import type { RiskLevel } from "./textAnalyzer";

export interface ExplanationResult {
  title: string;
  summary: string;
  advice: string[];
  severityColor: string;
}

/**
 * Human-readable AI explanation layer
 * Converts raw risk → user-friendly meaning
 */
export function explainRisk(
  level: RiskLevel,
  score: number,
  reasons: string[]
): ExplanationResult {
  switch (level) {
    case "critical":
      return {
        title: "🚨 High Risk Scam Detected",
        summary:
          "This message shows strong indicators of a scam. It may attempt to scare or trick you into sharing sensitive information or money.",
        advice: [
          "Do NOT reply to the message",
          "Do NOT share OTP, PIN, or passwords",
          "Do NOT click on any links",
          "Block the sender immediately",
          "Report this to cybercrime (1930 or cybercrime.gov.in)",
        ],
        severityColor: "red",
      };

    case "high":
      return {
        title: "⚠️ High Scam Probability",
        summary:
          "Multiple scam indicators were found. This message is very likely unsafe.",
        advice: [
          "Avoid clicking links",
          "Verify the sender independently",
          "Do not share personal or banking details",
          "Consider blocking the sender",
        ],
        severityColor: "orange",
      };

    case "medium":
      return {
        title: "⚠️ Suspicious Content Detected",
        summary:
          "Some warning signs were detected. The message may be misleading or unsafe.",
        advice: [
          "Double-check the sender identity",
          "Avoid acting urgently",
          "Do not share sensitive information",
        ],
        severityColor: "yellow",
      };

    case "low":
      return {
        title: "ℹ️ Low Risk Detected",
        summary:
          "Only minor suspicious patterns were found. Risk appears low, but caution is still advised.",
        advice: [
          "Stay alert",
          "Avoid clicking unknown links",
          "Verify unexpected messages",
        ],
        severityColor: "blue",
      };

    default:
      return {
        title: "✅ No Scam Detected",
        summary:
          "No significant scam indicators were found in this message.",
        advice: [
          "Continue to stay cautious online",
          "Never share OTPs or passwords",
          "Verify unknown senders",
        ],
        severityColor: "green",
      };
  }
}
