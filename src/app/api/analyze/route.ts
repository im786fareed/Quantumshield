import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeText } from "@/lib/ai/textAnalyzer";
import { analyzeThreat } from "@/lib/ai/threatEngine";
import { analyzeWithLlm } from "@/lib/ai/llmAnalyzer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { text, type = "text" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text field required" }, { status: 400 });
    }

    // Primary engine: Gemini (real language understanding — English,
    // Hindi, Hinglish, obfuscated text). Falls back to the deterministic
    // rule engine when the API key is absent or the call fails.
    const llm = await analyzeWithLlm(text);
    if (llm) {
      return NextResponse.json({
        success: true,
        type,
        engine: "ai",
        score: llm.score,
        level: llm.level,
        isThreat: llm.isThreat,
        threatType: llm.threatType,
        riskLevel: llm.isThreat ? (llm.score >= 60 ? "dangerous" : "suspicious") : "safe",
        message: llm.message,
        reasons: llm.reasons,
        indicators: llm.indicators,
        language: llm.language,
        recommendation: llm.recommendation,
      });
    }

    const textResult = analyzeText(text);
    const threatResult = analyzeThreat(text);

    const combinedScore = Math.max(textResult.score, threatResult.riskScore);
    const isThreat = combinedScore >= 35;

    return NextResponse.json({
      success: true,
      type,
      engine: "rules",
      score: combinedScore,
      level: textResult.level,
      isThreat,
      threatType: threatResult.type,
      riskLevel: threatResult.riskLevel,
      message: threatResult.message,
      reasons: textResult.reasons,
      indicators: textResult.indicators,
      recommendation: isThreat
        ? "Do not comply with any demands. Hang up and report to 1930 or cybercrime.gov.in."
        : "No immediate scam patterns found. Stay alert to unusual requests.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
