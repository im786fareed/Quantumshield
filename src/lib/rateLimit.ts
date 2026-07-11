// src/lib/rateLimit.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Per-IP fixed-window rate limiter.
 *
 * Durable when Upstash Redis is configured (UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN) — the counter then survives serverless cold
 * starts and is shared across all instances, so abuse can't be reset by
 * simply waiting for a new lambda. When Upstash is absent OR unreachable it
 * falls back to a per-instance in-memory counter (still useful, just weaker),
 * so local dev and un-provisioned deploys keep working unchanged.
 *
 * Both paths are fail-open: an infrastructure error never blocks a genuine
 * user, it only downgrades the strength of the limit.
 */

type RateRecord = { count: number; reset: number };
const store = new Map<string, RateRecord>();

interface RateOptions {
  limit?: number;
  windowMs?: number;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    "anonymous"
  );
}

function tooMany(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests", retryAfter: retryAfterSec },
    { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
  );
}

/** In-memory fixed-window fallback. */
function memoryLimit(ip: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  const record = store.get(ip);
  if (!record || record.reset < now) {
    store.set(ip, { count: 1, reset: now + windowMs });
    return null;
  }
  if (record.count >= limit) {
    return tooMany(Math.ceil((record.reset - now) / 1000));
  }
  record.count++;
  store.set(ip, record);
  return null;
}

/**
 * Durable counter via the Upstash Redis REST API (no SDK dependency).
 * Returns the current count for the window, or null if Redis is not
 * configured / the call failed (caller then uses the memory fallback).
 */
async function redisIncr(
  ip: string,
  windowMs: number
): Promise<{ count: number; reset: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const reset = windowStart + windowMs;
  const key = `rl:${ip}:${windowStart}`;
  const expireSec = Math.ceil(windowMs / 1000);

  try {
    // Pipeline: INCR the window key, then set its TTL (NX = only if unset).
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(2_000),
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, expireSec.toString(), "NX"],
      ]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = data?.[0]?.result;
    if (typeof count !== "number") return null;
    return { count, reset };
  } catch {
    return null; // network/timeout → caller falls back to memory
  }
}

export async function rateLimit(
  req: NextRequest,
  options?: RateOptions
): Promise<NextResponse | null> {
  const limit = options?.limit ?? 30;
  const windowMs = options?.windowMs ?? 60_000;
  const ip = clientIp(req);

  const redis = await redisIncr(ip, windowMs);
  if (redis) {
    if (redis.count > limit) {
      return tooMany(Math.max(1, Math.ceil((redis.reset - Date.now()) / 1000)));
    }
    return null;
  }

  // Upstash not configured or unreachable — per-instance fallback.
  return memoryLimit(ip, limit, windowMs);
}
