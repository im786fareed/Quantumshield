// Run with: npx tsx tests/verdict.test.ts
/* Risk-engine regression tests: baseline floors must let the Link/Message tabs
   share computeVerdict without lowering an authoritative server/AI score, while
   File/APK (no baseline) behaviour is unchanged. */
import { computeVerdict, type SecuritySignal } from '../src/lib/security/verdict';

let pass = 0, fail = 0;
function eq(label: string, got: unknown, want: unknown) {
  if (got === want) { pass++; console.log(`✓ ${label} = ${got}`); }
  else { fail++; console.log(`✗ ${label}: got ${got}, want ${want}`); }
}
const sig = (id: string, sev: number, conf = 80): SecuritySignal =>
  ({ id, severity: sev, confidence: conf, title: id, titleHi: id, evidence: 'x', source: 'QS_SERVER' });

// File/APK path (no baseline) — unchanged aggregation
const noBase = computeVerdict([sig('a', 88)], ['c1', 'c2', 'c3']);
eq('no-baseline single-strong level', noBase.riskLevel, 'high');

// Link: high server score, weak individual flags → floor holds at 100
const link = computeVerdict([sig('f1', 25), sig('f2', 25), sig('f3', 25)], ['c1', 'c2'], { baselineRisk: 100, baselineConfidence: 88 });
eq('link floor threatRisk', link.threatRisk, 100);
eq('link floor level', link.riskLevel, 'critical');

// Message: server=95 + supporting brand signal → not lowered below 95
const msg = computeVerdict([sig('r1', 60), sig('brand', 45)], ['c1', 'c2', 'c3'], { baselineRisk: 95, baselineConfidence: 80 });
eq('message floor >= 95', msg.threatRisk >= 95, true);

// Clean link (server=0, no signals) → minimal, NOT insufficient-evidence
const clean = computeVerdict([], ['c1', 'c2'], { baselineRisk: 0, baselineConfidence: 62 });
eq('clean link level', clean.riskLevel, 'minimal');
eq('clean link not insufficient', clean.insufficientEvidence, false);

// Sparse on-device scan (no baseline, <3 checks) → insufficient evidence
eq('sparse on-device insufficient', computeVerdict([], ['c1', 'c2']).insufficientEvidence, true);

// Correlated dedup still runs under a baseline. Contract: the STRONGER
// signal declares correlatedWith and absorbs the weaker referenced one
// (as file.doubleExtension@88 absorbs file.typeMismatch).
const dedup = computeVerdict(
  [{ ...sig('main', 70), correlatedWith: ['dup'] }, sig('dup', 40)],
  ['c1', 'c2'],
  { baselineRisk: 50 }
);
eq('dedup absorbs weaker under baseline', dedup.signals.find(s => s.id === 'dup')?.absorbedBy, 'main');

const permissionCombo = computeVerdict(
  [
    { ...sig('apk.combo', 60), correlatedWith: ['apk.perm.READ_SMS'] },
    sig('apk.perm.READ_SMS', 25),
  ],
  ['c1', 'c2']
);
eq('APK combo absorbs included permission', permissionCombo.signals.find(s => s.id === 'apk.perm.READ_SMS')?.absorbedBy, 'apk.combo');

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
