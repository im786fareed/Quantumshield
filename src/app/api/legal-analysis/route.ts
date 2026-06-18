import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeLegalCase, isLegalEngineAvailable } from "@/lib/ai/legalAnalyzer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Legal analysis is a heavier AI call than scam scoring — keep the
  // limit tight so the free Gemini tier is not exhausted by abuse.
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { report } = body;

    if (!report || typeof report !== "string" || report.trim().length < 20) {
      return NextResponse.json(
        { error: "Please describe the incident in a little more detail." },
        { status: 400 }
      );
    }

    if (!isLegalEngineAvailable()) {
      return NextResponse.json(
        {
          error:
            "The Legal Intelligence Engine is not configured on this server. Please try again later.",
        },
        { status: 503 }
      );
    }

    const analysis = await analyzeLegalCase(report);
    if (!analysis) {
      return NextResponse.json(
        {
          error:
            "The Legal Intelligence Engine could not complete the analysis right now. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, engine: "ai", analysis });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
