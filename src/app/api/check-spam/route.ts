import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeText } from "@/lib/ai/textAnalyzer";
import { analyzeThreat } from "@/lib/ai/threatEngine";

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

    // Run both engines
    const textResult = analyzeText(trimmed);
    const threatResult = analyzeThreat(trimmed);

    // Merge scores — take the higher risk signal
    const combinedScore = Math.max(textResult.score, threatResult.riskScore);
    const isSpam = combinedScore >= 35;
    const confidence = Math.min(0.99, combinedScore / 100 + 0.05);

    return NextResponse.json({
      spam: isSpam,
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
