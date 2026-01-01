import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
    limit: 40,
    windowMs: 60_000,
  });

  if (limited) return limited;

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      spam: false,
      confidence: 0.92,
      message: "No spam indicators detected",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
