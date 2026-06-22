import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeUrl } from "@/lib/security/urlHeuristics";

// Google Safe Browsing v4 — the same threat database Chrome uses.
// Active when GOOGLE_SAFE_BROWSING_KEY is set; otherwise heuristics only.
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
    return null; // service unreachable — heuristics still apply
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const url: string = body?.url;

    if (!url || typeof url !== "string" || url.trim().length < 4) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
    }

    const result = analyzeUrl(url);

    // A Safe Browsing hit is authoritative — overrides heuristics,
    // including the whitelist (a safe domain could be compromised).
    const threats = await checkSafeBrowsing(url.trim());
    if (threats && threats.length > 0) {
      const labels: Record<string, string> = {
        MALWARE: "Distributes malware",
        SOCIAL_ENGINEERING: "Phishing / social engineering site",
        UNWANTED_SOFTWARE: "Hosts unwanted software",
        POTENTIALLY_HARMFUL_APPLICATION: "Potentially harmful application",
      };
      return NextResponse.json({
        success: true,
        ...result,
        safe: false,
        score: 100,
        level: "critical",
        flags: [
          ...threats.map((t) => `⛔ Google Safe Browsing: ${labels[t] ?? t}`),
          ...result.flags,
        ],
        details:
          "This URL is flagged in Google's Safe Browsing threat database. Do NOT visit it.",
        verifiedBy: "google-safe-browsing",
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
      ...(threats !== null ? { verifiedBy: "google-safe-browsing" } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
