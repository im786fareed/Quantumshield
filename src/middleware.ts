import { NextRequest, NextResponse } from "next/server";

/**
 * CORS for the bundled mobile app.
 *
 * The Android/iOS app ships its own pages inside the APK and calls these
 * API routes cross-origin. Browsers/webviews send an OPTIONS preflight
 * first — without these headers every API call from the app would fail.
 * Only Capacitor app origins are allowed; normal web traffic is same-origin
 * and unaffected.
 */
const ALLOWED_ORIGINS = new Set([
  "capacitor://localhost", // iOS Capacitor
  "https://localhost",     // Android Capacitor (default androidScheme)
  "http://localhost",
]);

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const isApp = ALLOWED_ORIGINS.has(origin);

  // Preflight
  if (req.method === "OPTIONS" && isApp) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const res = NextResponse.next();
  if (isApp) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
