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
    value: "camera=(), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // FIXED: Added YouTube domains to allow scripts and styles for education videos
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com https://www.youtube.com https://s.ytimg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // FIXED: connect-src allows the AI and DNS tests to reach external APIs
      "connect-src 'self' https://*.vercel.app https://vitals.vercel-insights.com https://*.vercel-insights.com https://1.1.1.1",
      // FIXED: frame-src is CRITICAL to allow the Education page to show YouTube videos
      "frame-src 'self' https://www.youtube.com https://youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This ensures the security headers are applied to every page of your app
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;