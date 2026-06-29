import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { inspectRoom, isVisionAvailable } from "@/lib/ai/roomInspector";

export const dynamic = "force-dynamic";

// Roughly 6 MB of base64 (~4.5 MB image). Keeps requests sane.
const MAX_BASE64_LEN = 6_000_000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  // Vision calls are heavier than text — tighter limit.
  const limited = rateLimit(req, { limit: 12, windowMs: 60_000 });
  if (limited) return limited;

  if (!isVisionAvailable()) {
    return NextResponse.json(
      {
        success: false,
        engine: "none",
        error:
          "AI vision is not configured on the server. The room photo was NOT analysed and nothing was uploaded.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { image, mimeType = "image/jpeg", note } = body as {
      image?: string;
      mimeType?: string;
      note?: string;
    };

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "image field required" }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json({ error: "unsupported image type" }, { status: 400 });
    }

    // Accept either a raw base64 string or a data: URL; strip the prefix.
    const base64 = image.includes(",") ? image.slice(image.indexOf(",") + 1) : image;
    if (base64.length > MAX_BASE64_LEN) {
      return NextResponse.json({ error: "image too large" }, { status: 413 });
    }

    const result = await inspectRoom(base64, mimeType, typeof note === "string" ? note : undefined);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          engine: "none",
          error:
            "The vision analysis could not be completed right now. Please try again, or use the manual flashlight and EMF checks.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, engine: "ai", ...result });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
