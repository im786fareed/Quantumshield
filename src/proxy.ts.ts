import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self' https:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
    media-src 'self' blob:;
    worker-src 'self' blob:;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', csp);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)',
  ],
};
