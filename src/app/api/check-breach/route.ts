import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { queryIntel } from "@/lib/security/intel/router";

// Breach lookup via the shared threat-intelligence router (XposedOrNot
// adapter), which adds caching and a circuit breaker. The email is sent to
// XposedOrNot for the lookup and is not stored by us.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const outcome = await queryIntel(email.trim().toLowerCase(), "email");

    // No provider answered (all skipped/errored) — say so honestly rather
    // than implying the address is clean.
    if (outcome.providersQueried.length === 0) {
      return NextResponse.json(
        { error: "Breach service unavailable. Please try again later." },
        { status: 502 }
      );
    }

    const hit = outcome.results.find((r) => r.classification === "malicious");
    const breaches: string[] = Array.isArray(hit?.meta?.breaches)
      ? (hit!.meta!.breaches as string[])
      : [];

    return NextResponse.json({
      breached: breaches.length > 0,
      breaches,
      count: breaches.length,
      cached: outcome.cached,
    });
  } catch {
    return NextResponse.json(
      { error: "Breach check failed. Please try again." },
      { status: 502 }
    );
  }
}
