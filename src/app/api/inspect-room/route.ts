import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { inspectRoom, isVisionAvailable } from "@/lib/ai/roomInspector";

export const dynamic = "force-dynamic";

// Roughly 6 MB of base64 (~4.5 MB image). Keeps requests sane.
const MAX_BASE64_LEN = 6_000_000;
// Video sweep: sampled frames, small each, capped in count and total.
const MAX_FRAMES = 10;
const MIN_FRAMES = 2;
const MAX_FRAME_BASE64_LEN = 1_500_000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Accept either a raw base64 string or a data: URL; strip the prefix. */
const stripDataUrl = (s: string) =>
  s.includes(",") ? s.slice(s.indexOf(",") + 1) : s;

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
    const { image, frames, mimeType = "image/jpeg", note, mode = "wide", target } = body as {
      image?: string;
      frames?: string[];
      mimeType?: string;
      note?: string;
      mode?: string;
      target?: string;
    };

    if (mode !== "wide" && mode !== "closeup" && mode !== "video") {
      return NextResponse.json({ error: "invalid mode" }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json({ error: "unsupported image type" }, { status: 400 });
    }

    let payload: string | string[];
    if (mode === "video") {
      if (!Array.isArray(frames) || frames.some((f) => typeof f !== "string" || !f)) {
        return NextResponse.json({ error: "frames field required" }, { status: 400 });
      }
      if (frames.length < MIN_FRAMES || frames.length > MAX_FRAMES) {
        return NextResponse.json(
          { error: `frames must contain ${MIN_FRAMES}-${MAX_FRAMES} images` },
          { status: 400 }
        );
      }
      const cleaned = frames.map(stripDataUrl);
      const total = cleaned.reduce((sum, f) => sum + f.length, 0);
      if (cleaned.some((f) => f.length > MAX_FRAME_BASE64_LEN) || total > MAX_BASE64_LEN) {
        return NextResponse.json({ error: "video frames too large" }, { status: 413 });
      }
      payload = cleaned;
    } else {
      if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "image field required" }, { status: 400 });
      }
      const base64 = stripDataUrl(image);
      if (base64.length > MAX_BASE64_LEN) {
        return NextResponse.json({ error: "image too large" }, { status: 413 });
      }
      payload = base64;
    }

    const result = await inspectRoom(
      payload,
      mimeType,
      typeof note === "string" ? note : undefined,
      mode,
      typeof target === "string" ? target : undefined
    );
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
