import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const limited = rateLimit(req, {
    limit: 30,
    windowMs: 60_000,
  });

  if (limited) return limited;

  try {
    const body = await req.json();

    // TODO: plug your AI logic here
    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
