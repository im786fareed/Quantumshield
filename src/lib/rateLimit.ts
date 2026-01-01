// src/lib/rateLimit.ts
import { NextRequest, NextResponse } from "next/server";

type RateRecord = {
  count: number;
  reset: number;
};

const store = new Map<string, RateRecord>();

export function rateLimit(
  req: NextRequest,
  options?: { limit?: number; windowMs?: number }
) {
  const limit = options?.limit ?? 30;
  const windowMs = options?.windowMs ?? 60_000;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  const now = Date.now();
  const record = store.get(ip);

  if (!record || record.reset < now) {
    store.set(ip, { count: 1, reset: now + windowMs });
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
