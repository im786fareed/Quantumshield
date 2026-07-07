import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeUrl, extractDomain } from "@/lib/security/urlHeuristics";
import { isTrustEngineAvailable, verifyTrust } from "@/lib/ai/trustVerifier";

export const dynamic = "force-dynamic";

/** Does the query look like a URL or bare domain? */
function looksLikeUrl(q: string): boolean {
  const t = q.trim();
  if (/^https?:\/\//i.test(t)) return true;
  // bare domain like "canon-support.xyz" — one token containing a dot, no spaces
  return !t.includes(" ") && /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i.test(t);
}

// Google Safe Browsing v4 — same threat database Chrome uses.
// Active when GOOGLE_SAFE_BROWSING_KEY is set.
async function checkSafeBrowsing(url: string): Promise<string[] | null> {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!key) return null;

  try {
    const withProto = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({
          client: { clientId: "quantumshield", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: withProto }],
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const matches: Array<{ threatType: string }> = data?.matches ?? [];
    return matches.map((m) => m.threatType);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Grounded verification is the heaviest AI call in the app — keep the
  // per-IP limit tight so the free Gemini tier survives abuse.
  const limited = rateLimit(req, { limit: 8, windowMs: 60_000 });
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
