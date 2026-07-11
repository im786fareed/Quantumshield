/**
 * Threat Intelligence Provider interface — QuantumShield is never tied to
 * one vendor. Every provider adapter normalises its answer into this one
 * schema; the router (router.ts) fans out, caches and merges.
 *
 * SERVER-SIDE ONLY: adapters hold API keys from environment variables and
 * must never be imported into client components. Clients go through
 * /api/intel or /api/check-url.
 */

export type IndicatorType = 'url' | 'domain' | 'fileHash' | 'ip' | 'email';

export type IntelClassification = 'malicious' | 'suspicious' | 'clean' | 'unknown';

export interface IntelResult {
  /** Provider id, e.g. "google-safe-browsing", "urlhaus", "malwarebazaar". */
  provider: string;
  /** Human-readable provider name shown to users. */
  providerLabel: string;
  indicator: string;
  indicatorType: IndicatorType;
  classification: IntelClassification;
  /** 0–100: how authoritative this specific answer is. */
  confidence: number;
  /** 0–100 on the QuantumShield risk scale. */
  normalizedRisk: number;
  /** Plain-language detail, e.g. "malware distribution URL (tags: apk, banker)". */
  detail: string;
  /** ISO date the provider last saw this indicator, when reported. */
  lastSeen?: string;
  /** Optional structured payload (e.g. the list of breach site names). */
  meta?: Record<string, unknown>;
}

export interface ThreatIntelProvider {
  id: string;
  label: string;
  supports: IndicatorType[];
  /** False when the required API key is missing — the router skips it honestly. */
  available(): boolean;
  /**
   * Look an indicator up. Return null when the provider has NO DATA
   * (which is not the same as "clean"). Throw on transport errors —
   * the router's circuit breaker counts those.
   */
  lookup(indicator: string, type: IndicatorType): Promise<IntelResult | null>;
}
