import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  isTrustEngineAvailable,
  trustAssist,
  type AssistTurn,
} from "@/lib/ai/trustVerifier";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const question: string = body?.question;
    const context: string = typeof body?.context === "string" ? body.context : "";
    const lang: "en" | "hi" = body?.lang === "hi" ? "hi" : "en";

    const history: AssistTurn[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (t: any) =>
              t &&
              (t.role === "user" || t.role === "assistant") &&
              typeof t.text === "string"
          )
          .slice(-8)
      : [];

    if (!question || typeof question !== "string" || question.trim().length < 2) {
      return NextResponse.json({ error: "Please ask a question." }, { status: 400 });
    }

    if (!isTrustEngineAvailable()) {
      return NextResponse.json(
        {
          error:
            "The Trust Assistant is not configured on this server. Please try again later.",
        },
        { status: 503 }
      );
    }

    const result = await trustAssist(question.trim(), context, history, lang);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "The Trust Assistant could not answer right now. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, engine: "ai", ...result });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
