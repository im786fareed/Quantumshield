import { NextRequest, NextResponse } from "next/server";

type RateRecord = {
  count: number;
  reset: number;
};

// Note: In production (Vercel/Serverless), this Map will reset frequently.
// For stable rate limiting, use Redis.
const store = new Map<string, RateRecord>();

// REMOVED 'export' - This is now a private helper function
function rateLimit(
  req: NextRequest,
  options?: {
    limit?: number;
    windowMs?: number;
  }
) {
  const limit = options?.limit ?? 30;
  const windowMs = options?.windowMs ?? 60_000;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";

  const now = Date.now();
  const record = store.get(ip);

  if (!record || record.reset < now) {
    store.set(ip, {
      count: 1,
      reset: now + windowMs,
    });
    return null;
  }

  if (record.count >= limit) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.ceil((record.reset - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (record.reset - now) / 1000
          ).toString(),
        },
      }
    );
  }

  record.count++;
  store.set(ip, record);

  return null;
}

// VALID EXPORT: Next.js expects these names
export async function POST(req: NextRequest) {
  // 1. Call your rate limiter
  const limitResponse = rateLimit(req);
  if (limitResponse) return limitResponse;

  try {
    const body = await req.json();
    // Your logic for checking the URL here...
    
    return NextResponse.json({ success: true, url: body.url });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}