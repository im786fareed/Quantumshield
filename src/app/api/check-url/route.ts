import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { analyzeUrl } from "@/lib/security/urlHeuristics";
import { queryIntel } from "@/lib/security/intel/router";

/**
 * URL check = transparent on-server heuristics + the threat-intelligence
 * router (Google Safe Browsing and URLhaus when configured). An intel hit
 * is authoritative — it overrides heuristics including the whitelist,
 * because a "safe" domain can be compromised.
 */
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const url: string = body?.url;

    if (!url || typeof url !== "string" || url.trim().length < 4) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
    }

    const result = analyzeUrl(url);
    const intel = await queryIntel(url.trim(), "url");
    const malicious = intel.results.filter((r) => r.classification === "malicious");

    // Structured findings so clients can style/weight by source instead of
    // re-parsing display strings. `flags` remains for older clients.
    const heuristicSignals = result.flags.map((text) => ({
      text,
      source: "heuristic" as const,
    }));

    if (malicious.length > 0) {
      const intelSignals = malicious.map((m) => ({
        text: `${m.providerLabel}: ${m.detail}`,
        source: "intel" as const,
        provider: m.provider,
      }));
      return NextResponse.json({
        success: true,
        ...result,
        safe: false,
        score: 100,
        level: "critical",
        signals: [...intelSignals, ...heuristicSignals],
        flags: [
          ...malicious.map((m) => `⛔ ${m.providerLabel}: ${m.detail}`),
          ...result.flags,
        ],
        details:
          "This URL is listed in a live threat-intelligence database. Do NOT visit it.",
        // kept for backward compatibility with existing clients
        verifiedBy: intel.providersQueried.includes("google-safe-browsing")
          ? "google-safe-browsing"
          : undefined,
        providers: intel.providersQueried,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
      signals: heuristicSignals,
      ...(intel.providersQueried.includes("google-safe-browsing")
        ? { verifiedBy: "google-safe-browsing" }
        : {}),
      providers: intel.providersQueried,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
