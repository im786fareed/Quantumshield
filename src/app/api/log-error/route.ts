import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
    limit: 60,
    windowMs: 60_000,
  });

  if (limited) return limited;

  try {
    const raw = await req.text();
    // Cap payload size so a bad client can't flood server logs.
    if (raw.length > 4_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const body = JSON.parse(raw);

    console.error("Client error log:", body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}
