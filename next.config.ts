import type { NextConfig } from "next";

/** * QuantumShield Security Configuration
 * Optimized for Mobile Permissions and Educational Video Playback
 */

const securityHeaders = [
  { 
    key: "X-Frame-Options", 
    value: "DENY" 
  },
  { 
    key: "X-Content-Type-Options", 
    value: "nosniff" 
  },
  { 
    key: "Referrer-Policy", 
    value: "strict-origin-when-cross-origin" 
  },
  { 
    key: "X-DNS-Prefetch-Control", 
    value: "on" 
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    // FIXED: microphone for AI Analyzer and display-capture for Evidence Collector
    value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // FIXED: Added YouTube + MediaPipe CDN. Removed unsafe-eval (not needed in production builds)
      "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel-scripts.com https://www.youtube.com https://*.youtube.com https://s.ytimg.com https://*.youtube-nocookie.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // FIXED: connect-src allows AI, DNS tests, MediaPipe WASM, and phish.rocks URL lookup
      "connect-src 'self' https://*.vercel.app https://vitals.vercel-insights.com https://*.vercel-insights.com https://1.1.1.1 https://cdn.jsdelivr.net https://api.phish.rocks",
      // FIXED: frame-src is CRITICAL to allow the Education page to show YouTube videos
      "frame-src 'self' https://www.youtube.com https://youtube.com https://*.youtube.com https://*.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // CAPACITOR_BUILD=true → static export bundled into the Android APK.
  // API routes are excluded by scripts/build-android.mjs; the app calls
  // the production deployment instead (see src/lib/apiBase.ts).
  ...(process.env.CAPACITOR_BUILD === "true"
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {
        // Security headers apply to the server deployment only
        // (static export cannot set response headers).
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;