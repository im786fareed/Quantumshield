/**
 * URLhaus adapter (abuse.ch) — community database of URLs actively used to
 * distribute malware. Free; requires an abuse.ch Auth-Key (register at
 * https://auth.abuse.ch) supplied via ABUSECH_AUTH_KEY. Server-side only.
 */

import type { IntelResult, IndicatorType, ThreatIntelProvider } from './provider';

export const urlhausProvider: ThreatIntelProvider = {
  id: 'urlhaus',
  label: 'URLhaus (abuse.ch)',
  supports: ['url'],

  available() {
    return Boolean(process.env.ABUSECH_AUTH_KEY);
  },

  async lookup(indicator: string, type: IndicatorType): Promise<IntelResult | null> {
    if (type !== 'url') return null;
    const key = process.env.ABUSECH_AUTH_KEY;
    if (!key) return null;

    const withProto = indicator.startsWith('http') ? indicator : `https://${indicator}`;
    const res = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': key,
      },
      signal: AbortSignal.timeout(8_000),
      body: new URLSearchParams({ url: withProto }).toString(),
    });
    if (!res.ok) throw new Error(`URLhaus HTTP ${res.status}`);
    const data = await res.json();

    if (data?.query_status !== 'ok') return null; // no_results / invalid_url → no data

    const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
    const online = data.url_status === 'online';
    return {
      provider: this.id,
      providerLabel: this.label,
      indicator,
      indicatorType: type,
      classification: 'malicious',
      confidence: online ? 92 : 80, // an offline entry may be remediated
      normalizedRisk: online ? 100 : 85,
      detail: `${data.threat ?? 'malicious URL'}${tags.length ? ` (tags: ${tags.slice(0, 4).join(', ')})` : ''}${online ? ', currently online' : ', currently offline'}`,
      lastSeen: data.date_added,
    };
  },
};
