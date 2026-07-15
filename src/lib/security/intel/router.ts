/**
 * Threat Intelligence Router — the switchboard between QuantumShield's
 * detection code and whichever providers are configured.
 *
 *   Detection Core ──► queryIntel(indicator, type)
 *                          ├─ cache (TTL, in-memory per instance)
 *                          ├─ circuit breaker per provider
 *                          └─ parallel fan-out with per-provider timeouts
 *
 * The outcome always says WHICH providers were actually consulted and which
 * were skipped, so the UI can report coverage honestly instead of implying
 * a check that never ran. Server-side only.
 */

import type { IndicatorType, IntelResult, ThreatIntelProvider } from './provider';
import { safeBrowsingProvider } from './safeBrowsing';
import { urlhausProvider } from './urlhaus';
import { malwareBazaarProvider } from './malwareBazaar';
import { xposedOrNotProvider } from './xposedOrNot';
import { virusTotalProvider } from './virusTotal';

const PROVIDERS: ThreatIntelProvider[] = [
  safeBrowsingProvider,
  urlhausProvider,
  malwareBazaarProvider,
  xposedOrNotProvider,
  virusTotalProvider,
];

export interface IntelOutcome {
  /** Positive findings only (providers with no data contribute nothing). */
  results: IntelResult[];
  /** Providers that answered (including "no data" answers). */
  providersQueried: string[];
  /** Providers not consulted: no API key, circuit open, or errored. */
  providersSkipped: string[];
  cached: boolean;
}

// ── Cache ──────────────────────────────────────────────────────────────────
// Per-serverless-instance in-memory cache. Malicious verdicts are stable
// (24 h); "nothing found" is rechecked sooner (30 min).
const CACHE = new Map<string, { expires: number; outcome: Omit<IntelOutcome, 'cached'> }>();
const TTL_MALICIOUS = 24 * 60 * 60 * 1000;
const TTL_EMPTY = 30 * 60 * 1000;
const CACHE_MAX = 500;

// ── Circuit breaker ────────────────────────────────────────────────────────
const FAIL_THRESHOLD = 3;
const COOLDOWN_MS = 5 * 60 * 1000;
const breaker = new Map<string, { failures: number; openUntil: number }>();

function circuitOpen(id: string): boolean {
  const b = breaker.get(id);
  return Boolean(b && b.openUntil > Date.now());
}

function recordFailure(id: string) {
  const b = breaker.get(id) ?? { failures: 0, openUntil: 0 };
  b.failures += 1;
  if (b.failures >= FAIL_THRESHOLD) {
    b.openUntil = Date.now() + COOLDOWN_MS;
    b.failures = 0;
  }
  breaker.set(id, b);
}

function recordSuccess(id: string) {
  breaker.delete(id);
}

// ── Router ─────────────────────────────────────────────────────────────────
export async function queryIntel(indicator: string, type: IndicatorType): Promise<IntelOutcome> {
  const key = `${type}:${indicator.toLowerCase()}`;
  const hit = CACHE.get(key);
  if (hit && hit.expires > Date.now()) {
    return { ...hit.outcome, cached: true };
  }

  const candidates = PROVIDERS.filter((p) => p.supports.includes(type));
  const providersQueried: string[] = [];
  const providersSkipped: string[] = [];
  const runnable: ThreatIntelProvider[] = [];

  for (const p of candidates) {
    if (!p.available() || circuitOpen(p.id)) {
      providersSkipped.push(p.id);
    } else {
      runnable.push(p);
    }
  }

  const settled = await Promise.allSettled(runnable.map((p) => p.lookup(indicator, type)));
  const results: IntelResult[] = [];
  settled.forEach((s, i) => {
    const p = runnable[i];
    if (s.status === 'fulfilled') {
      recordSuccess(p.id);
      providersQueried.push(p.id);
      if (s.value) results.push(s.value);
    } else {
      recordFailure(p.id);
      providersSkipped.push(p.id);
    }
  });

  const outcome = { results, providersQueried, providersSkipped };

  // Only cache when at least one provider actually answered.
  if (providersQueried.length > 0) {
    if (CACHE.size >= CACHE_MAX) {
      const first = CACHE.keys().next().value;
      if (first) CACHE.delete(first);
    }
    CACHE.set(key, {
      expires: Date.now() + (results.length > 0 ? TTL_MALICIOUS : TTL_EMPTY),
      outcome,
    });
  }

  return { ...outcome, cached: false };
}

/** Friendly labels for the UI ("checks performed" list). */
export const PROVIDER_LABELS: Record<string, string> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p.label])
);
