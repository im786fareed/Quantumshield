import { Capacitor } from '@capacitor/core';

/**
 * Base URL for QuantumShield API routes.
 *
 * - On the web (Vercel), API routes live on the same origin → relative path.
 * - In the bundled Android/iOS app (Capacitor static export), there is no
 *   local server → calls go to the production deployment.
 */
const PROD_API_ORIGIN = 'https://quantumshield.in';

export function apiUrl(path: string): string {
  try {
    if (Capacitor.isNativePlatform()) {
      return `${PROD_API_ORIGIN}${path}`;
    }
  } catch {
    // Capacitor not available (plain web build) — fall through
  }
  return path;
}
