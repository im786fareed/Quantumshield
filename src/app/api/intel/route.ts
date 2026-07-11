import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { queryIntel } from "@/lib/security/intel/router";
import type { IndicatorType } from "@/lib/security/intel/provider";

/**
 * Threat-intelligence lookup endpoint.
 *
 * Clients send only an INDICATOR (a SHA-256 hash or a URL) — never file
 * contents. API keys for the underlying providers live server-side only.
 * The response always reports which providers were consulted and which
 * were skipped, so the UI can state coverage honestly.
 */
export const dynamic = "force-dynamic";

const ALLOWED_TYPES: IndicatorType[] = ["url", "fileHash", "domain"];
const SHA256_RE = /^[a-f0-9]{64}$/i;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const indicator: unknown = body?.indicator;
    const type: unknown = body?.type;

    if (
      typeof indicator !== "string" ||
      typeof type !== "string" ||
      !ALLOWED_TYPES.includes(type as IndicatorType) ||
      indicator.trim().length < 4 ||
      indicator.length > 2048
    ) {
      return NextResponse.json({ error: "indicator and valid type required" }, { status: 400 });
    }
    if (type === "fileHash" && !SHA256_RE.test(indicator.trim())) {
      return NextResponse.json({ error: "fileHash must be a SHA-256 hex digest" }, { status: 400 });
    }

    const outcome = await queryIntel(indicator.trim(), type as IndicatorType);
    return NextResponse.json({ success: true, ...outcome });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
