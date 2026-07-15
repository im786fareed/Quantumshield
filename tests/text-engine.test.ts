// Consolidated text rule-engine tests (shared corpus + threat engine).
// Run: npx tsx tests/text-engine.test.ts

import { explainScamText, textRiskLevel } from '../src/lib/security/scamPatterns';
import { analyzeThreat } from '../src/lib/ai/threatEngine';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { passed++; console.log(`✓ ${name} ${extra}`); }
  else { failed++; console.log(`✗ FAIL ${name} ${extra}`); }
}

// 1. KBC lottery lure (classic Indian scam) — prizeLure category
const kbc = explainScamText('Congratulations! You have won 25 lakh in KBC lucky draw lottery. Click here to claim your prize: http://kbc-winner.top');
check('KBC lottery scored as scam', kbc.scam.isScam, `(${kbc.score})`);
check('prizeLure category fired', kbc.scam.firedCategories.includes('prizeLure'));
check('clickBait category fired', kbc.scam.firedCategories.includes('clickBait'));
check('link reason present', kbc.reasons.includes('Contains a link'));

// 2. KYC scare — bankScare category
const kyc = explainScamText('Dear customer your account will be blocked today. KYC update pending, verify immediately');
check('KYC scare scored as scam', kyc.scam.isScam, `(${kyc.score})`);
check('bankScare category fired', kyc.scam.firedCategories.includes('bankScare'));

// 3. Reasons are plain language, not raw category keys
check('reasons are plain language', !kyc.reasons.some(r => /^[a-z]+[A-Z]/.test(r)), kyc.reasons.join(' | '));

// 4. Digital arrest routed by threat engine
const da = analyzeThreat('This is CBI officer, you are under digital arrest, transfer money for bail immediately');
check('digital arrest type', da.type === 'CYBER_FRAUD_DIGITAL_ARREST', `(${da.riskScore})`);

// 5. Remote-access emergency
const rd = analyzeThreat('Sir please install AnyDesk app so I can fix your bank account');
check('AnyDesk triggers emergency', rd.type === 'EMERGENCY_DATA_LOSS');

// 6. Regression: bare "reset" no longer a false-positive emergency
const benignReset = analyzeThreat('I will reset my wifi router password this evening');
check('bare reset is not an emergency', benignReset.type !== 'EMERGENCY_DATA_LOSS', `(type=${benignReset.type})`);

// 7. Benign message stays safe
const ok = explainScamText('Hi mom, I reached the office. Lunch at 1?');
check('benign message safe', ok.level === 'safe' && ok.reasons.length === 0, `(${ok.score})`);

// 8. Regression: short tokens must not match inside longer words
const sub1 = explainScamText('I reached home and finished the first draft, shopping later');
check('no phantom category from reached/first/shopping', sub1.scam.firedCategories.length === 0, `(${sub1.scam.firedCategories.join(',')})`);
const sub2 = explainScamText('I am calling from ED, there is a case against you, pay the fine now');
check('real ED reference still fires authorityClaim', sub2.scam.firedCategories.includes('authorityClaim'));

// 9. Level thresholds
check('level mapping', textRiskLevel(85) === 'critical' && textRiskLevel(65) === 'high' && textRiskLevel(45) === 'medium' && textRiskLevel(25) === 'low' && textRiskLevel(5) === 'safe');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
