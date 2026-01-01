import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
    limit: 60,
    windowMs: 60_000,
  });

  if (limited) return limited;

  try {
    const body = await req.json();

    console.error("Client error log:", body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}
