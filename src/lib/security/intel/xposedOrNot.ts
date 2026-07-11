/**
 * XposedOrNot adapter — checks whether an email appears in known data
 * breaches. Free public API, no key required. Server-side only.
 *
 * The email is sent to XposedOrNot for the lookup and is not stored by us.
 * Going through the router gives this lookup caching (so the same email
 * isn't re-queried repeatedly) and a circuit breaker.
 */

import type { IntelResult, IndicatorType, ThreatIntelProvider } from './provider';

export const xposedOrNotProvider: ThreatIntelProvider = {
  id: 'xposedornot',
  label: 'XposedOrNot breach database',
  supports: ['email'],

  // Keyless public API — always available.
  available() {
    return true;
  },

  async lookup(indicator: string, type: IndicatorType): Promise<IntelResult | null> {
    if (type !== 'email') return null;

    const res = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(indicator.toLowerCase())}`,
      {
        headers: { 'User-Agent': 'QuantumShield-BreachCheck' },
        signal: AbortSignal.timeout(15_000),
        cache: 'no-store',
      }
    );

    // 404 = the email is in no known breach. A genuine "checked, clean"
    // answer — return null (no positive finding) so the router caches it.
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`XposedOrNot HTTP ${res.status}`);

    const data = await res.json();
    // Response shape: { "breaches": [["SiteA", "SiteB", ...]] }
    const breaches: string[] = Array.isArray(data?.breaches?.[0]) ? data.breaches[0] : [];
    if (breaches.length === 0) return null;

    return {
      provider: this.id,
      providerLabel: this.label,
      indicator,
      indicatorType: type,
      classification: 'malicious', // "exposed in a breach" — actionable finding
      confidence: 90,
      normalizedRisk: Math.min(100, 40 + breaches.length * 10),
      detail: `Found in ${breaches.length} known breach${breaches.length > 1 ? 'es' : ''}: ${breaches.slice(0, 6).join(', ')}`,
      meta: { breaches },
    };
  },
};
