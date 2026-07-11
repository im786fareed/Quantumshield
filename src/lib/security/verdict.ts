/**
 * QuantumShield Detection Core — shared evidence schema + risk engine.
 *
 * Every scanner produces SecuritySignals; this module turns them into ONE
 * consistent, explainable verdict with two separate dimensions:
 *
 *   • threatRisk        — how dangerous the finding pattern is (0–100)
 *   • evidenceConfidence — how sure we are, given which checks actually ran
 *
 * A scan that found nothing is NEVER labelled "safe"; it is reported as
 * low risk with the honest confidence the executed checks support.
 * Pure functions only — safe on device and on the server.
 */

export type RiskLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
export type ConfidenceLabel = 'weak' | 'limited' | 'strong' | 'very-strong';
export type SignalSource = 'ON_DEVICE' | 'QS_SERVER' | 'THIRD_PARTY_INTEL' | 'AI_ANALYSIS';

export interface SecuritySignal {
  /** Stable id, e.g. "file.doubleExtension". Also used for deduplication. */
  id: string;
  /** 0–100 — how dangerous this signal is on its own. */
  severity: number;
  /** 0–100 — how reliable the signal itself is (filename hints < byte-level proof). */
  confidence: number;
  title: string;
  titleHi: string;
  /** The exact evidence that triggered it (bytes, string, permission, URL…). */
  evidence: string;
  source: SignalSource;
  /**
   * Ids of other signals describing the SAME underlying fact.
   * The risk engine scores only the strongest of a correlated group,
   * so one fact is never double-counted.
   */
  correlatedWith?: string[];
}

export interface Verdict {
  threatRisk: number;
  riskLevel: RiskLevel;
  evidenceConfidence: number;
  confidenceLabel: ConfidenceLabel;
  /** True when too few checks could run to say anything meaningful. */
  insufficientEvidence: boolean;
  /** All signals, strongest first (including absorbed duplicates, flagged). */
  signals: (SecuritySignal & { absorbedBy?: string })[];
  /** Human-readable names of every check that actually executed. */
  checksRun: string[];
}

export function riskLevelOf(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'minimal';
}

export function confidenceLabelOf(score: number): ConfidenceLabel {
  if (score >= 81) return 'very-strong';
  if (score >= 61) return 'strong';
  if (score >= 31) return 'limited';
  return 'weak';
}

/**
 * Combine signals into a verdict.
 *
 * Scoring: signals are deduplicated (correlated groups keep the strongest),
 * then aggregated with diminishing weight (max + ½ next + ¼ next …) so five
 * weak hints don't add up to "critical", while genuinely independent strong
 * findings still escalate. Two independent severity≥50 signals add a small
 * correlation boost — matching how real analysts weigh converging evidence.
 */
export function computeVerdict(
  rawSignals: SecuritySignal[],
  checksRun: string[]
): Verdict {
  // ── 1. Deduplicate correlated evidence ────────────────────────────────
  const absorbed = new Map<string, string>(); // signalId -> absorbing signalId
  const byId = new Map(rawSignals.map((s) => [s.id, s]));
  for (const s of rawSignals) {
    for (const otherId of s.correlatedWith ?? []) {
      const other = byId.get(otherId);
      if (!other) continue;
      // The weaker of the pair is absorbed by the stronger.
      if (other.severity <= s.severity && !absorbed.has(s.id)) {
        absorbed.set(otherId, s.id);
      }
    }
  }

  const scored = rawSignals
    .filter((s) => !absorbed.has(s.id))
    .sort((a, b) => b.severity - a.severity);

  // ── 2. Threat risk with diminishing aggregation ───────────────────────
  let risk = 0;
  scored.forEach((s, i) => {
    // Signal contribution is scaled by its own reliability.
    const effective = s.severity * (0.5 + (s.confidence / 100) * 0.5);
    risk += effective / Math.pow(2, i);
  });
  const independentStrong = scored.filter((s) => s.severity >= 50).length;
  if (independentStrong >= 2) risk += 10;
  risk = Math.min(100, Math.round(risk));

  // ── 3. Evidence confidence ────────────────────────────────────────────
  let confidence: number;
  if (scored.length > 0) {
    // Severity-weighted average of signal reliabilities.
    const wSum = scored.reduce((s, x) => s + x.severity, 0) || 1;
    confidence = Math.round(
      scored.reduce((s, x) => s + x.confidence * x.severity, 0) / wSum
    );
    // Converging independent evidence increases certainty a little.
    if (independentStrong >= 2) confidence = Math.min(100, confidence + 8);
  } else {
    // Nothing found: confidence comes from how much we were able to check.
    // On-device static analysis alone can never exceed "limited/strong".
    confidence = Math.min(70, checksRun.length * 11);
  }

  const insufficientEvidence = scored.length === 0 && checksRun.length < 3;

  return {
    threatRisk: risk,
    riskLevel: riskLevelOf(risk),
    evidenceConfidence: confidence,
    confidenceLabel: confidenceLabelOf(confidence),
    insufficientEvidence,
    signals: rawSignals
      .map((s) => (absorbed.has(s.id) ? { ...s, absorbedBy: absorbed.get(s.id) } : s))
      .sort((a, b) => b.severity - a.severity),
    checksRun,
  };
}
