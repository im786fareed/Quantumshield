import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeText } from "@/lib/ai/textAnalyzer";
import { analyzeThreat } from "@/lib/ai/threatEngine";
import { analyzeWithLlm } from "@/lib/ai/llmAnalyzer";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    // Primary engine: Claude. Falls back to the rule engine when
    // unavailable (no API key, network failure, rate limit).
    const llm = await analyzeWithLlm(trimmed);
    if (llm) {
      return NextResponse.json({
        spam: llm.isThreat,
        engine: "ai",
        confidence: parseFloat(Math.min(0.99, llm.score / 100 + 0.05).toFixed(2)),
        score: llm.score,
        level: llm.level,
        threatType: llm.threatType,
        message: llm.isThreat ? llm.message : "No scam indicators detected in this message.",
        reasons: llm.reasons,
        indicators: llm.indicators,
        language: llm.language,
        recommendation: llm.recommendation,
      });
    }

    // Run both rule engines
    const textResult = analyzeText(trimmed);
    const threatResult = analyzeThreat(trimmed);

    // Merge scores — take the higher risk signal
    const combinedScore = Math.max(textResult.score, threatResult.riskScore);
    const isSpam = combinedScore >= 35;
    const confidence = Math.min(0.99, combinedScore / 100 + 0.05);

    return NextResponse.json({
      spam: isSpam,
      engine: "rules",
      confidence: parseFloat(confidence.toFixed(2)),
      score: combinedScore,
      level: textResult.level,
      threatType: threatResult.type,
      message: isSpam ? threatResult.message : "No scam indicators detected in this message.",
      reasons: textResult.reasons,
      indicators: textResult.indicators,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
