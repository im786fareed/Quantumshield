/**
 * Google Safe Browsing v4 adapter — the same threat database Chrome uses.
 * Active when GOOGLE_SAFE_BROWSING_KEY is set. Server-side only.
 *
 * This is the single copy of the Safe Browsing call; /api/check-url (via the
 * router) and /api/trust-search (via safeBrowsingThreats) both use it.
 */

import type { IntelResult, IndicatorType, ThreatIntelProvider } from './provider';

const THREAT_LABELS: Record<string, string> = {
  MALWARE: 'Distributes malware',
  SOCIAL_ENGINEERING: 'Phishing / social engineering site',
  UNWANTED_SOFTWARE: 'Hosts unwanted software',
  POTENTIALLY_HARMFUL_APPLICATION: 'Potentially harmful application',
};

/**
 * Low-level lookup: returns the list of matched threat types, or null when
 * the service is not configured / unreachable (callers must treat null as
 * "not checked", never as "clean").
 */
export async function safeBrowsingThreats(url: string): Promise<string[] | null> {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!key) return null;

  const withProto = url.startsWith('http') ? url : `https://${url}`;
  const res = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        client: { clientId: 'quantumshield', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: withProto }],
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Safe Browsing HTTP ${res.status}`);
  const data = await res.json();
  const matches: Array<{ threatType: string }> = data?.matches ?? [];
  return matches.map((m) => m.threatType);
}

export const safeBrowsingProvider: ThreatIntelProvider = {
  id: 'google-safe-browsing',
  label: 'Google Safe Browsing',
  supports: ['url'],

  available() {
    return Boolean(process.env.GOOGLE_SAFE_BROWSING_KEY);
  },

  async lookup(indicator: string, type: IndicatorType): Promise<IntelResult | null> {
    if (type !== 'url') return null;
    const threats = await safeBrowsingThreats(indicator);
    if (threats === null) return null;

    if (threats.length === 0) {
      // Safe Browsing checked it and found nothing — genuine "no data".
      return null;
    }
    return {
      provider: this.id,
      providerLabel: this.label,
      indicator,
      indicatorType: type,
      classification: 'malicious',
      confidence: 95,
      normalizedRisk: 100,
      detail: threats.map((t) => THREAT_LABELS[t] ?? t).join('; '),
    };
  },
};
