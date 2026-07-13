import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeUrl, extractDomain } from "@/lib/security/urlHeuristics";
import { isTrustEngineAvailable, verifyTrust } from "@/lib/ai/trustVerifier";
import { safeBrowsingThreats } from "@/lib/security/intel/safeBrowsing";

export const dynamic = "force-dynamic";

/** Does the query look like a URL or bare domain? */
function looksLikeUrl(q: string): boolean {
  const t = q.trim();
  if (/^https?:\/\//i.test(t)) return true;
  // bare domain like "canon-support.xyz" — one token containing a dot, no spaces
  return !t.includes(" ") && /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i.test(t);
}

// Google Safe Browsing lives in the shared intel adapter now — one copy
// serves both this route and /api/check-url. Null = not checked.
async function checkSafeBrowsing(url: string): Promise<string[] | null> {
  try {
    return await safeBrowsingThreats(url);
  } catch {
    return null; // transport error — treat as "not checked"
  }
}

export async function POST(req: NextRequest) {
  // Grounded verification is the heaviest AI call in the app — keep the
  // per-IP limit tight so the free Gemini tier survives abuse.
  const limited = await rateLimit(req, { limit: 8, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const query: string = body?.query;
    const lang: "en" | "hi" = body?.lang === "hi" ? "hi" : "en";

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter something to verify." },
        { status: 400 }
      );
    }
    if (query.length > 2_000) {
      return NextResponse.json({ error: "Query is too long" }, { status: 413 });
    }

    if (!isTrustEngineAvailable()) {
      return NextResponse.json(
        {
          error:
            "The Trust Search engine is not configured on this server. Please try again later.",
        },
        { status: 503 }
      );
    }

    const trimmed = query.trim();

    // Real technical signals for URLs/domains, computed before the AI
    // call so the model can weigh them as evidence.
    const technicalSignals: string[] = [];
    let safeBrowsingThreats: string[] | null = null;

    if (looksLikeUrl(trimmed)) {
      const heuristics = analyzeUrl(trimmed);
      if (heuristics.flags.length > 0) {
        technicalSignals.push(
          `QuantumShield URL heuristics for ${extractDomain(trimmed)} (risk score ${heuristics.score}/100): ${heuristics.flags.join("; ")}`
        );
      }
      safeBrowsingThreats = await checkSafeBrowsing(trimmed);
      if (safeBrowsingThreats && safeBrowsingThreats.length > 0) {
        technicalSignals.push(
          `Google Safe Browsing flags this URL as: ${safeBrowsingThreats.join(", ")}. This is authoritative — the URL is dangerous.`
        );
      } else if (safeBrowsingThreats !== null) {
        technicalSignals.push(
          "Google Safe Browsing has no current flag for this URL (absence of a flag alone does not prove it is official)."
        );
      }
    }

    const result = await verifyTrust(trimmed, lang, technicalSignals);
    if (result === "quota") {
      return NextResponse.json(
        {
          error:
            lang === "hi"
              ? "आज की मुफ़्त खोज सीमा पूरी हो गई है। कृपया कुछ घंटों बाद फिर प्रयास करें।"
              : "Today's free search limit has been reached. Please try again in a few hours.",
        },
        { status: 503 }
      );
    }
    if (!result) {
      return NextResponse.json(
        {
          error:
            "The Trust Search engine could not complete this verification right now. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    // A Safe Browsing hit is authoritative technical evidence — never
    // let the verdict be softer than "confirmed_scam" in that case.
    if (safeBrowsingThreats && safeBrowsingThreats.length > 0) {
      result.verification.status = "confirmed_scam";
      result.verification.trustScore = Math.min(result.verification.trustScore, 5);
      result.verification.howVerified = [
        "Flagged in Google's Safe Browsing threat database (the same list Chrome uses).",
        ...result.verification.howVerified,
      ];
    }

    return NextResponse.json({
      success: true,
      engine: "ai",
      checkedAt: new Date().toISOString(),
      ...result,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
