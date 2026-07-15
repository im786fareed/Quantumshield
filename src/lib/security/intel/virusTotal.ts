/**
 * VirusTotal adapter — file-hash and URL reputation across ~70 antivirus
 * engines. Free API key at virustotal.com; the free tier (4 req/min,
 * 500 req/day) is enough because the router caches answers and the circuit
 * breaker backs off on 429s. Privacy: only the SHA-256 or the URL leaves
 * the server — files are never uploaded. Requires VIRUSTOTAL_API_KEY.
 * Server-side only.
 */

import type { IntelResult, IndicatorType, ThreatIntelProvider } from './provider';

/** VirusTotal's URL identifier is the unpadded base64url of the URL itself. */
function vtUrlId(url: string): string {
  return Buffer.from(url)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const virusTotalProvider: ThreatIntelProvider = {
  id: 'virustotal',
  label: 'VirusTotal (multi-engine scan)',
  supports: ['fileHash', 'url'],

  available() {
    return Boolean(process.env.VIRUSTOTAL_API_KEY);
  },

  async lookup(indicator: string, type: IndicatorType): Promise<IntelResult | null> {
    const key = process.env.VIRUSTOTAL_API_KEY;
    if (!key) return null;

    let endpoint: string;
    if (type === 'fileHash') {
      endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`;
    } else if (type === 'url') {
      endpoint = `https://www.virustotal.com/api/v3/urls/${vtUrlId(indicator)}`;
    } else {
      return null;
    }

    const res = await fetch(endpoint, {
      headers: { 'x-apikey': key },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return null; // VT has never seen it → no data
    if (!res.ok) throw new Error(`VirusTotal HTTP ${res.status}`); // 429 etc. → circuit breaker
    const data = await res.json();

    const attrs = data?.data?.attributes;
    const stats = attrs?.last_analysis_stats;
    if (!stats) return null;

    const malicious: number = stats.malicious ?? 0;
    const suspicious: number = stats.suspicious ?? 0;
    const total =
      malicious + suspicious + (stats.harmless ?? 0) + (stats.undetected ?? 0);
    const family: string | undefined =
      attrs?.popular_threat_classification?.suggested_threat_label;
    const lastSeen = attrs?.last_analysis_date
      ? new Date(attrs.last_analysis_date * 1000).toISOString()
      : undefined;

    const base = {
      provider: this.id,
      providerLabel: this.label,
      indicator,
      indicatorType: type,
      lastSeen,
    };

    // 3+ independent engines agreeing is a solid detection; 1–2 is a weak
    // signal that must not be presented as a confirmed threat.
    if (malicious >= 3) {
      return {
        ...base,
        classification: 'malicious',
        confidence: Math.min(97, 75 + malicious),
        normalizedRisk: 100,
        detail: `flagged by ${malicious} of ${total} antivirus engines${family ? ` — ${family}` : ''}`,
      };
    }
    if (malicious + suspicious >= 1) {
      return {
        ...base,
        classification: 'suspicious',
        confidence: 60,
        normalizedRisk: 55,
        detail: `flagged by only ${malicious + suspicious} of ${total} engines — weak signal, possibly a false positive`,
      };
    }
    return {
      ...base,
      classification: 'clean',
      confidence: 85,
      normalizedRisk: 0,
      detail: `scanned by ${total} antivirus engines — none flagged it`,
    };
  },
};
