// Run with: npx tsx tests/url-heuristics.test.ts
/* URL engine fixtures: IDN/punycode, homoglyph, brand impersonation, and
   NO false positives on official/whitelisted domains. */
import { analyzeUrl } from '../src/lib/security/urlHeuristics';

let pass = 0, fail = 0;
function check(label: string, url: string, expect: { minScore?: number; maxScore?: number; flag?: string }) {
  const r = analyzeUrl(url);
  const problems: string[] = [];
  if (expect.minScore !== undefined && r.score < expect.minScore) problems.push(`score ${r.score} < ${expect.minScore}`);
  if (expect.maxScore !== undefined && r.score > expect.maxScore) problems.push(`score ${r.score} > ${expect.maxScore}`);
  if (expect.flag && !r.flags.some((f) => f.toLowerCase().includes(expect.flag!.toLowerCase()))) problems.push(`missing flag ~"${expect.flag}"`);
  if (problems.length) { fail++; console.log(`✗ ${label} [${url}] → score ${r.score}, level ${r.level} :: ${problems.join('; ')}`); }
  else { pass++; console.log(`✓ ${label} → score ${r.score} (${r.level}) ${r.flags[0] ?? ''}`); }
}

// Official / whitelisted domains must stay clean (no false positives)
check('official SBI', 'https://onlinesbi.sbi/personal', { maxScore: 0 });
check('official Paytm', 'https://paytm.com/offers', { maxScore: 0 });
check('whitelisted google', 'https://google.com', { maxScore: 0 });
check('legit unrelated', 'https://example.org/blog', { maxScore: 20 });

// Brand abuse — exact brand token on a non-official domain
check('sbi abuse', 'http://sbi-kyc-update.xyz/verify', { minScore: 60, flag: 'State Bank' });
check('paytm abuse', 'https://paytm-refund.top/claim', { minScore: 55, flag: 'Paytm' });
check('aadhaar abuse', 'https://uidai-verify.online/update', { minScore: 45, flag: 'Aadhaar' });

// Brand look-alike — misspelling
check('paytm typo', 'https://paytrm-secure.com/login', { minScore: 40, flag: 'look' });

// IDN / punycode
check('punycode host', 'https://xn--pated-esa.com/login', { minScore: 30, flag: 'punycode' });

// Homoglyph (Cyrillic 'а' in "pаytm")
check('cyrillic homoglyph', 'https://pаytm.com/login', { minScore: 40, flag: 'look-alike' });

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
