import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Real breach lookup via XposedOrNot (free public API, no key required).
// The email is sent to XposedOrNot for the lookup and is not stored by us.
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

    const target = email.trim().toLowerCase();
    const res = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(target)}`,
      {
        headers: { "User-Agent": "QuantumShield-BreachCheck" },
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      }
    );

    // XposedOrNot returns 404 when the email appears in no known breach.
    if (res.status === 404) {
      return NextResponse.json({ breached: false, breaches: [], count: 0 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Breach service unavailable. Please try again later." },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Response shape: { "breaches": [["SiteA", "SiteB", ...]] }
    const breaches: string[] = Array.isArray(data?.breaches?.[0])
      ? data.breaches[0]
      : [];

    return NextResponse.json({
      breached: breaches.length > 0,
      breaches,
      count: breaches.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Breach check failed. Please try again." },
      { status: 502 }
    );
  }
}
