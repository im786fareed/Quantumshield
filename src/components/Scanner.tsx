'use client';

/**
 * QuantumShield Scanner — the ONE scanner.
 *
 * Merges the former FileScanner, UrlChecker, APKGuardian, SMSGuardian,
 * SpamChecker, DownloadScanner and RansomwareDetector into four tabs
 * (Link · File · APK · Message), each powered by the shared engines in
 * src/lib/security/* and the server AI routes.
 *
 * Honesty rules:
 *  • nothing simulated — no fake progress, no invented metadata;
 *  • files & APKs are analysed entirely on this device and never uploaded;
 *  • links & messages are sent to the QuantumShield server for checking
 *    (Google Safe Browsing + AI) — stated in the UI;
 *  • "found nothing" is reported as low risk with honest confidence,
 *    never as a guarantee of safety.
 */

import { useState, useRef, useEffect } from 'react';
import {
  Link as LinkIcon, FileText, Smartphone, MessageSquare, Loader2,
  ShieldAlert, ShieldCheck, Upload, X, Search, Info, AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { logCheck } from '@/lib/activity';
import { apiUrl } from '@/lib/apiBase';
import { analyzeUrl, findUrlInText } from '@/lib/security/urlHeuristics';
import { analyzeFileStatic } from '@/lib/security/fileAnalysis';
import { analyzeApk, type ApkAnalysis } from '@/lib/security/apkAnalysis';
import {
  computeVerdict, riskLevelOf, confidenceLabelOf,
  type Verdict, type SecuritySignal, type RiskLevel, type SignalSource,
} from '@/lib/security/verdict';

export type ScanTab = 'link' | 'file' | 'apk' | 'message';

const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB — hashed on-device

// ─────────────────────────────────────────────────────────────────────────
// Copy
// ─────────────────────────────────────────────────────────────────────────
const T = {
  en: {
    title: 'QuantumShield Scanner',
    subtitle: 'One scanner for links, files, APKs and messages — every result explained with its evidence',
    tabs: { link: 'Link', file: 'File', apk: 'APK', message: 'Message' } as Record<ScanTab, string>,
    linkPlaceholder: 'Paste a link, e.g. https://example.com/offer',
    linkPrivacy: 'The link is checked on your device and on the QuantumShield server (includes Google Safe Browsing when configured).',
    msgPlaceholder: 'Paste the suspicious SMS, WhatsApp or email text here…',
    msgPrivacy: 'The message text is sent to the QuantumShield server for AI analysis. It is not stored.',
    filePrivacy: 'Files are analysed entirely on your device — nothing is uploaded.',
    apkPrivacy: 'The APK is opened and analysed on your device — nothing is uploaded.',
    dropFile: 'Drag & drop a file here, or click to choose (up to 100 MB)',
    dropApk: 'Drag & drop an .apk file here, or click to choose (up to 100 MB)',
    scan: 'Scan now',
    scanning: 'Analysing…',
    remove: 'Remove',
    tryExample: 'Try an example',
    examples: [
      'URGENT: Your SBI account is blocked. Update KYC now: http://bit.ly/sbikycin',
      'Congratulations! You won ₹2,50,000 in Lucky Draw. Call 9876543210 to claim.',
      'Dear customer, pay ₹999 processing fee to 8765432109@paytm for your approved loan.',
    ],
    verdict: { minimal: 'MINIMAL RISK', low: 'LOW RISK', moderate: 'MODERATE RISK', high: 'HIGH RISK', critical: 'CRITICAL RISK' } as Record<RiskLevel, string>,
    insufficient: 'INSUFFICIENT EVIDENCE',
    threatRisk: 'Threat risk',
    evidence: 'Evidence confidence',
    confLabel: { weak: 'weak', limited: 'limited', strong: 'strong', 'very-strong': 'very strong' } as Record<string, string>,
    whatWeFound: 'What we found',
    noSignals: 'No risk signals were found by the checks below. That lowers the risk — it is not a guarantee of safety.',
    countedOnce: 'same evidence as above — counted once',
    checksRun: 'Checks performed',
    whatToDo: 'What to do now',
    fileInfo: 'File details',
    detectedType: 'Content type (from bytes)',
    hash: 'SHA-256 fingerprint',
    sizeLabel: 'Size',
    permissions: 'Extracted permissions',
    estPackage: 'Package (estimated from manifest)',
    notExtractable: 'not extractable in the browser',
    engineAi: 'Analysed by QuantumShield AI (Gemini) with rule-engine cross-check',
    engineRules: 'Analysed by the deterministic rule engine (AI engine not configured/reachable)',
    linkInMsg: 'A link inside the message was also checked',
    offline: 'Server unreachable — result is from on-device checks only, so confidence is reduced.',
    sources: { ON_DEVICE: 'on your device', QS_SERVER: 'QuantumShield server', THIRD_PARTY_INTEL: 'threat intelligence', AI_ANALYSIS: 'AI analysis' } as Record<SignalSource, string>,
    errGeneric: 'Analysis failed. Please try again.',
    errTooBig: 'File is larger than 100 MB. Please analyse a smaller file.',
    errNotApk: 'Please choose an .apk file for APK analysis.',
    apkHint: 'This file is an Android app — full APK analysis was applied automatically.',
    scanAnother: 'Scan something else',
  },
  hi: {
    title: 'QuantumShield स्कैनर',
    subtitle: 'लिंक, फ़ाइल, APK और संदेश — एक ही स्कैनर, हर नतीजा सबूत के साथ',
    tabs: { link: 'लिंक', file: 'फ़ाइल', apk: 'APK', message: 'संदेश' } as Record<ScanTab, string>,
    linkPlaceholder: 'लिंक पेस्ट करें, जैसे https://example.com/offer',
    linkPrivacy: 'लिंक आपके डिवाइस और QuantumShield सर्वर पर जांचा जाता है (Google Safe Browsing सहित, जब कॉन्फ़िगर हो)।',
    msgPlaceholder: 'संदिग्ध SMS, WhatsApp या ईमेल टेक्स्ट यहाँ पेस्ट करें…',
    msgPrivacy: 'संदेश AI विश्लेषण के लिए QuantumShield सर्वर पर भेजा जाता है। इसे संग्रहीत नहीं किया जाता।',
    filePrivacy: 'फ़ाइलें पूरी तरह आपके डिवाइस पर जांची जाती हैं — कुछ भी अपलोड नहीं होता।',
    apkPrivacy: 'APK आपके डिवाइस पर खोला और जांचा जाता है — कुछ भी अपलोड नहीं होता।',
    dropFile: 'फ़ाइल यहाँ खींचें-छोड़ें या चुनने के लिए क्लिक करें (100 MB तक)',
    dropApk: '.apk फ़ाइल यहाँ खींचें-छोड़ें या चुनने के लिए क्लिक करें (100 MB तक)',
    scan: 'अभी स्कैन करें',
    scanning: 'विश्लेषण हो रहा है…',
    remove: 'हटाएँ',
    tryExample: 'उदाहरण आज़माएँ',
    examples: [
      'अत्यावश्यक: आपका SBI खाता ब्लॉक है। KYC अपडेट करें: http://bit.ly/sbikycin',
      'बधाई! Lucky Draw में आपने ₹2,50,000 जीते। 9876543210 पर कॉल करें।',
      'ग्राहक, ₹999 प्रोसेसिंग शुल्क 8765432109@paytm पर भेजें।',
    ],
    verdict: { minimal: 'न्यूनतम जोखिम', low: 'कम जोखिम', moderate: 'मध्यम जोखिम', high: 'उच्च जोखिम', critical: 'गंभीर जोखिम' } as Record<RiskLevel, string>,
    insufficient: 'अपर्याप्त प्रमाण',
    threatRisk: 'खतरे का स्तर',
    evidence: 'प्रमाण विश्वसनीयता',
    confLabel: { weak: 'कमज़ोर', limited: 'सीमित', strong: 'मज़बूत', 'very-strong': 'बहुत मज़बूत' } as Record<string, string>,
    whatWeFound: 'हमें क्या मिला',
    noSignals: 'नीचे दी गई जाँचों में कोई जोखिम संकेत नहीं मिला। इससे जोखिम कम होता है — यह सुरक्षा की गारंटी नहीं है।',
    countedOnce: 'ऊपर वाले सबूत के समान — एक बार गिना गया',
    checksRun: 'की गई जाँचें',
    whatToDo: 'अब क्या करें',
    fileInfo: 'फ़ाइल विवरण',
    detectedType: 'सामग्री प्रकार (bytes से)',
    hash: 'SHA-256 फ़िंगरप्रिंट',
    sizeLabel: 'आकार',
    permissions: 'निकाली गई अनुमतियाँ',
    estPackage: 'पैकेज (manifest से अनुमानित)',
    notExtractable: 'ब्राउज़र में नहीं निकाला जा सकता',
    engineAi: 'QuantumShield AI (Gemini) + नियम-इंजन से विश्लेषित',
    engineRules: 'नियम-इंजन से विश्लेषित (AI इंजन उपलब्ध नहीं)',
    linkInMsg: 'संदेश के अंदर मिले लिंक की भी जाँच की गई',
    offline: 'सर्वर उपलब्ध नहीं — नतीजा केवल डिवाइस-जाँचों से है, इसलिए विश्वसनीयता कम है।',
    sources: { ON_DEVICE: 'आपके डिवाइस पर', QS_SERVER: 'QuantumShield सर्वर', THIRD_PARTY_INTEL: 'थ्रेट इंटेलिजेंस', AI_ANALYSIS: 'AI विश्लेषण' } as Record<SignalSource, string>,
    errGeneric: 'विश्लेषण विफल। कृपया पुनः प्रयास करें।',
    errTooBig: 'फ़ाइल 100 MB से बड़ी है। कृपया छोटी फ़ाइल जांचें।',
    errNotApk: 'APK विश्लेषण के लिए .apk फ़ाइल चुनें।',
    apkHint: 'यह फ़ाइल एक Android ऐप है — पूर्ण APK विश्लेषण स्वतः लागू किया गया।',
    scanAnother: 'कुछ और स्कैन करें',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Result model shown by the VerdictCard
// ─────────────────────────────────────────────────────────────────────────
interface ScanOutcome {
  verdict: Verdict;
  /** extra facts panel (hash, type, permissions…) */
  facts?: Array<{ label: string; value: string; mono?: boolean }>;
  /** engine / privacy footnotes */
  notes: string[];
  recommendations: string[];
}

function recsFor(level: RiskLevel, tab: ScanTab, hi: boolean): string[] {
  const critical = tab === 'apk'
    ? [hi ? 'इस ऐप को इंस्टॉल न करें। फ़ाइल हटा दें।' : 'Do NOT install this app. Delete the file.',
       hi ? 'अगर पहले से इंस्टॉल है: तुरंत अनइंस्टॉल करें और बैंकिंग पासवर्ड बदलें।' : 'If already installed: uninstall now and change your banking passwords.',
       hi ? '1930 साइबर हेल्पलाइन या cybercrime.gov.in पर रिपोर्ट करें।' : 'Report it on the 1930 cyber helpline or cybercrime.gov.in.']
    : tab === 'file'
    ? [hi ? 'इस फ़ाइल को न खोलें और न चलाएँ। इसे हटा दें।' : 'Do not open or run this file. Delete it.',
       hi ? 'अगर खोल चुके हैं: Device Check चलाएँ और पासवर्ड बदलें।' : 'If you already opened it: run Device Check and change important passwords.',
       hi ? 'भेजने वाले को ब्लॉक करें और 1930 पर रिपोर्ट करें।' : 'Block the sender and report to 1930.']
    : tab === 'link'
    ? [hi ? 'इस लिंक पर न जाएँ, आगे न भेजें।' : 'Do not visit or forward this link.',
       hi ? 'अगर आपने वहाँ कुछ भरा है: तुरंत पासवर्ड बदलें और बैंक को बताएं।' : 'If you entered anything there: change passwords immediately and alert your bank.',
       hi ? '1930 साइबर हेल्पलाइन पर रिपोर्ट करें।' : 'Report it on the 1930 cyber helpline.']
    : [hi ? 'जवाब न दें, कोई OTP/PIN साझा न करें, कोई भुगतान न करें।' : 'Do not reply, share any OTP/PIN, or make any payment.',
       hi ? 'भेजने वाले को ब्लॉक करें।' : 'Block the sender.',
       hi ? '1930 या cybercrime.gov.in पर रिपोर्ट करें।' : 'Report to 1930 or cybercrime.gov.in.'];

  if (level === 'critical' || level === 'high') return critical;
  if (level === 'moderate') {
    return [
      hi ? 'सावधानी बरतें — आगे बढ़ने से पहले भेजने वाले की किसी दूसरे, भरोसेमंद माध्यम से पुष्टि करें।' : 'Proceed with caution — verify the sender through a separate, trusted channel first.',
      hi ? 'ऊपर दिए गए सबूत पढ़ें और तय करें कि जोखिम क्यों दिखा।' : 'Read the evidence above to understand exactly why this was flagged.',
    ];
  }
  return [
    hi ? 'जाँचों में कोई गंभीर संकेत नहीं मिला, फिर भी अनजान स्रोत पर आँख बंद कर भरोसा न करें।' : 'Nothing serious was found in these checks — still, never blindly trust an unknown source.',
    hi ? 'शक हो तो Trust Search से आधिकारिक जानकारी सत्यापित करें।' : 'If in doubt, verify official details with Trust Search.',
  ];
}

const levelStyles: Record<RiskLevel, string> = {
  minimal: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
  low: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
  moderate: 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400',
  high: 'bg-orange-500/15 border-orange-500/60 text-orange-400',
  critical: 'bg-red-500/15 border-red-500/60 text-red-400',
};

// ─────────────────────────────────────────────────────────────────────────
export default function Scanner({ initialTab = 'link' }: { lang?: 'en' | 'hi'; initialTab?: ScanTab }) {
  const { lang } = useLanguage();
  const hi = lang === 'hi';
  const t = T[lang];

  const [tab, setTab] = useState<ScanTab>(initialTab);
  const [urlInput, setUrlInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const reset = () => { setOutcome(null); setError(''); setFile(null); setUrlInput(''); setMsgInput(''); };
  const switchTab = (next: ScanTab) => { setTab(next); setOutcome(null); setError(''); setFile(null); };

  const finish = (o: ScanOutcome) => {
    setOutcome(o);
    logCheck(o.verdict.threatRisk >= 40);
  };

  // ── LINK ────────────────────────────────────────────────────────────────
  const scanLink = async (raw?: string) => {
    const url = (raw ?? urlInput).trim();
    if (url.length < 4) return;
    setBusy(true); setError(''); setOutcome(null);
    setStage(hi ? 'लिंक की जाँच…' : 'Checking link…');
    try {
      const outcomeSignals: SecuritySignal[] = [];
      const checksRun: string[] = ['On-device URL heuristics', 'QuantumShield server URL engine'];
      const notes: string[] = [t.linkPrivacy];

      // APK-download link — the single most dangerous Indian scam vector.
      if (/\.apk(\?|#|$)/i.test(url)) {
        outcomeSignals.push({
          id: 'url.apkDownload',
          severity: 90, confidence: 90,
          title: hi ? 'यह लिंक Play Store के बाहर से Android ऐप (APK) इंस्टॉल कराता है' : 'This link installs an Android app (APK) from outside the Play Store',
          titleHi: 'यह लिंक Play Store के बाहर से Android ऐप (APK) इंस्टॉल कराता है',
          evidence: url,
          source: 'ON_DEVICE',
        });
      }

      let serverOk = false;
      let serverScore = 0;
      let verified = false;
      try {
        const res = await fetch(apiUrl('/api/check-url'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          const data = await res.json();
          serverOk = true;
          serverScore = data.score ?? 0;
          verified = data.verifiedBy === 'google-safe-browsing';
          if (verified) checksRun.push('Google Safe Browsing (Chrome threat database)');
          for (const flag of (data.flags ?? []) as string[]) {
            const isIntel = flag.includes('Safe Browsing');
            outcomeSignals.push({
              id: `url.flag.${outcomeSignals.length}`,
              severity: isIntel ? 95 : Math.min(65, Math.max(25, serverScore)),
              confidence: isIntel ? 95 : 70,
              title: flag.replace(/^⛔\s*/, ''),
              titleHi: flag.replace(/^⛔\s*/, ''),
              evidence: data.url ?? url,
              source: isIntel ? 'THIRD_PARTY_INTEL' : 'QS_SERVER',
            });
          }
        }
      } catch { /* offline → on-device only */ }

      if (!serverOk) {
        const local = analyzeUrl(url);
        notes.push(t.offline);
        serverScore = local.score;
        for (const flag of local.flags) {
          outcomeSignals.push({
            id: `url.local.${outcomeSignals.length}`,
            severity: Math.min(60, Math.max(20, local.score)),
            confidence: 55,
            title: flag, titleHi: flag,
            evidence: url,
            source: 'ON_DEVICE',
          });
        }
      }

      const risk = Math.max(serverScore, outcomeSignals.some(s => s.id === 'url.apkDownload') ? 90 : 0);
      const confidence = verified ? 88 : serverOk ? 62 : 45;
      const verdict: Verdict = {
        threatRisk: risk,
        riskLevel: riskLevelOf(risk),
        evidenceConfidence: outcomeSignals.length ? confidence : Math.min(confidence, 60),
        confidenceLabel: confidenceLabelOf(outcomeSignals.length ? confidence : Math.min(confidence, 60)),
        insufficientEvidence: false,
        signals: outcomeSignals.sort((a, b) => b.severity - a.severity),
        checksRun,
      };
      finish({ verdict, notes, recommendations: recsFor(verdict.riskLevel, 'link', hi) });
    } catch {
      setError(t.errGeneric);
    } finally {
      setBusy(false); setStage('');
    }
  };

  // ── FILE (auto-upgrades to APK analysis when the file is an APK) ───────
  const scanFile = async () => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setError(t.errTooBig); return; }
    setBusy(true); setError(''); setOutcome(null);
    try {
      const isApk = file.name.toLowerCase().endsWith('.apk');
      setStage(hi ? 'डिवाइस पर फ़ाइल विश्लेषण…' : 'Analysing on your device…');

      if (isApk || tab === 'apk') {
        if (!isApk) { setError(t.errNotApk); setBusy(false); setStage(''); return; }
        const a: ApkAnalysis = await analyzeApk(file);
        const verdict = computeVerdict(a.signals, a.checksRun);
        const facts = [
          { label: t.hash, value: a.sha256, mono: true },
          { label: t.sizeLabel, value: fmtSize(a.size) },
          { label: t.estPackage, value: a.estimatedPackage ?? t.notExtractable, mono: true },
          { label: 'DEX / native libs', value: `${a.dexFileCount} dex · ${a.nativeLibCount} .so` },
          { label: t.permissions, value: a.permissions.length ? a.permissions.join(', ') : t.notExtractable, mono: true },
        ];
        if (a.embeddedUrls.length) facts.push({ label: 'Embedded URLs', value: a.embeddedUrls.join('  ·  '), mono: true });
        const notes = [t.apkPrivacy];
        if (tab === 'file') notes.unshift(t.apkHint);
        finish({ verdict, facts, notes, recommendations: recsFor(verdict.riskLevel, 'apk', hi) });
      } else {
        const a = await analyzeFileStatic(file);
        const verdict = computeVerdict(a.signals, a.checksRun);
        const facts = [
          { label: t.detectedType, value: a.detectedType },
          { label: t.sizeLabel, value: fmtSize(a.size) },
          { label: t.hash, value: a.sha256, mono: true },
        ];
        if (a.embeddedUrls.length) facts.push({ label: 'Embedded URLs', value: a.embeddedUrls.join('  ·  '), mono: true });
        finish({ verdict, facts, notes: [t.filePrivacy], recommendations: recsFor(verdict.riskLevel, 'file', hi) });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric);
    } finally {
      setBusy(false); setStage('');
    }
  };

  // ── MESSAGE (server AI + automatic link cross-check) ───────────────────
  const scanMessage = async (raw?: string) => {
    const text = (raw ?? msgInput).trim();
    if (text.length < 3) return;
    setBusy(true); setError(''); setOutcome(null);
    setStage(hi ? 'AI विश्लेषण…' : 'AI analysis…');
    try {
      const res = await fetch(apiUrl('/api/check-spam'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.errGeneric);

      const aiEngine = data.engine === 'ai';
      const source: SignalSource = aiEngine ? 'AI_ANALYSIS' : 'QS_SERVER';
      const signals: SecuritySignal[] = [];
      const reasons: string[] = data.reasons ?? [];
      const indicators: string[] = data.indicators ?? [];
      reasons.forEach((r, i) => signals.push({
        id: `msg.reason.${i}`,
        severity: Math.max(20, (data.score ?? 0) - i * 8),
        confidence: aiEngine ? 80 : 65,
        title: r, titleHi: r,
        evidence: indicators[i] ?? indicators[0] ?? '—',
        source,
      }));

      const checksRun = [
        aiEngine ? 'QuantumShield AI (Gemini) fraud analysis' : 'Deterministic scam rule engine',
        'India scam-pattern library',
      ];
      const notes = [t.msgPrivacy, aiEngine ? t.engineAi : t.engineRules];
      if (data.recommendation) notes.push(String(data.recommendation));

      // Cross-check: if the message carries a link, run it through the URL engine.
      let risk: number = data.score ?? 0;
      const embedded = findUrlInText(text);
      if (embedded) {
        setStage(hi ? 'संदेश के लिंक की जाँच…' : 'Checking the link inside…');
        checksRun.push('URL engine cross-check of embedded link');
        try {
          const ures = await fetch(apiUrl('/api/check-url'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: embedded }),
          });
          if (ures.ok) {
            const u = await ures.json();
            if ((u.score ?? 0) >= 35 || u.verifiedBy === 'google-safe-browsing' && u.safe === false) {
              const intel = (u.flags ?? []).some((f: string) => f.includes('Safe Browsing'));
              signals.push({
                id: 'msg.embeddedLink',
                severity: Math.min(95, Math.max(50, u.score ?? 50)),
                confidence: intel ? 95 : 70,
                title: hi ? `संदेश का लिंक खतरनाक पाया गया (${u.score}/100)` : `The link inside this message was flagged (${u.score}/100)`,
                titleHi: `संदेश का लिंक खतरनाक पाया गया (${u.score}/100)`,
                evidence: `${embedded} — ${(u.flags ?? [])[0] ?? ''}`,
                source: intel ? 'THIRD_PARTY_INTEL' : 'QS_SERVER',
              });
              risk = Math.max(risk, u.score ?? 0);
              notes.push(t.linkInMsg);
            }
          }
        } catch { /* link check optional */ }
      }

      const confidence = signals.length ? (aiEngine ? 80 : 62) : (aiEngine ? 72 : 55);
      const verdict: Verdict = {
        threatRisk: Math.min(100, Math.round(risk)),
        riskLevel: riskLevelOf(risk),
        evidenceConfidence: confidence,
        confidenceLabel: confidenceLabelOf(confidence),
        insufficientEvidence: false,
        signals: signals.sort((a, b) => b.severity - a.severity),
        checksRun,
      };
      finish({ verdict, notes, recommendations: recsFor(verdict.riskLevel, 'message', hi) });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errGeneric);
    } finally {
      setBusy(false); setStage('');
    }
  };

  const onPickFile = (f?: File | null) => {
    if (!f) return;
    setError(''); setOutcome(null);
    if (f.size > MAX_FILE_BYTES) { setError(t.errTooBig); return; }
    if (tab === 'apk' && !f.name.toLowerCase().endsWith('.apk')) { setError(t.errNotApk); return; }
    setFile(f);
  };

  const tabIcon: Record<ScanTab, typeof LinkIcon> = { link: LinkIcon, file: FileText, apk: Smartphone, message: MessageSquare };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl mb-4">
          <Search className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">{t.title}</h1>
        <p className="text-slate-400 text-sm">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {(['link', 'file', 'apk', 'message'] as ScanTab[]).map((k) => {
          const Icon = tabIcon[k];
          return (
            <button key={k} onClick={() => switchTab(k)}
              className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl font-bold text-xs transition ${
                tab === k ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}>
              <Icon className="w-5 h-5" />
              {t.tabs[k]}
            </button>
          );
        })}
      </div>

      {/* ── Inputs ── */}
      {!outcome && (
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          {tab === 'link' && (
            <>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !busy && scanLink()}
                placeholder={t.linkPlaceholder}
                className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
              />
              <p className="text-xs text-slate-500 flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5" />{t.linkPrivacy}</p>
              <button onClick={() => scanLink()} disabled={busy || urlInput.trim().length < 4}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition">
                {busy ? <><Loader2 className="w-5 h-5 animate-spin" />{stage || t.scanning}</> : t.scan}
              </button>
            </>
          )}

          {tab === 'message' && (
            <>
              <textarea
                rows={5}
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder={t.msgPlaceholder}
                className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5" />{t.msgPrivacy}</p>
              <button onClick={() => scanMessage()} disabled={busy || msgInput.trim().length < 3}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition">
                {busy ? <><Loader2 className="w-5 h-5 animate-spin" />{stage || t.scanning}</> : t.scan}
              </button>
              <div className="pt-1">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">{t.tryExample}</p>
                <div className="space-y-2">
                  {t.examples.map((ex, i) => (
                    <button key={i} onClick={() => { setMsgInput(ex); }}
                      className="w-full text-left text-xs bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 text-slate-400 transition">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(tab === 'file' || tab === 'apk') && (
            <>
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); onPickFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                    dragOver ? 'border-cyan-500 bg-cyan-600/10' : 'border-slate-700 hover:border-slate-500'
                  }`}>
                  <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p className="text-slate-300 text-sm">{tab === 'apk' ? t.dropApk : t.dropFile}</p>
                  <input ref={fileRef} type="file" accept={tab === 'apk' ? '.apk' : undefined} className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0])} />
                </div>
              ) : (
                <div className="bg-black/40 rounded-xl p-4 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{fmtSize(file.size)}</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <X className="w-4 h-4" />{t.remove}
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5" />{tab === 'apk' ? t.apkPrivacy : t.filePrivacy}</p>
              <button onClick={scanFile} disabled={busy || !file}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition">
                {busy ? <><Loader2 className="w-5 h-5 animate-spin" />{stage || t.scanning}</> : t.scan}
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-600/15 border border-red-500/40 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Verdict ── */}
      {outcome && (
        <VerdictCard outcome={outcome} t={t} hi={hi} onReset={reset} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function VerdictCard({ outcome, t, hi, onReset }: {
  outcome: ScanOutcome; t: typeof T['en']; hi: boolean; onReset: () => void;
}) {
  const v = outcome.verdict;
  const danger = v.riskLevel === 'high' || v.riskLevel === 'critical';
  const label = v.insufficientEvidence ? t.insufficient : t.verdict[v.riskLevel];

  return (
    <div className="space-y-4">
      {/* Verdict header */}
      <div className={`rounded-2xl border p-5 ${levelStyles[v.riskLevel]}`}>
        <div className="flex items-center gap-3 mb-4">
          {danger ? <ShieldAlert className="w-10 h-10 shrink-0" /> : <ShieldCheck className="w-10 h-10 shrink-0" />}
          <div>
            <h2 className="text-2xl font-black tracking-tight">{label}</h2>
            <p className="text-xs opacity-80">{t.threatRisk}: {v.threatRisk}/100 · {t.evidence}: {v.evidenceConfidence}/100 ({t.confLabel[v.confidenceLabel]})</p>
          </div>
        </div>
        <Meter label={t.threatRisk} value={v.threatRisk} />
        <Meter label={t.evidence} value={v.evidenceConfidence} />
      </div>

      {/* Evidence */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">{t.whatWeFound}</h3>
        {v.signals.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noSignals}</p>
        ) : (
          <ul className="space-y-3">
            {v.signals.map((s) => (
              <li key={s.id} className={`text-sm ${s.absorbedBy ? 'opacity-50' : ''}`}>
                <p className="text-slate-200">
                  <span className="text-cyan-400 mr-1.5">•</span>
                  {hi ? s.titleHi : s.title}
                  {s.absorbedBy && <span className="text-xs text-slate-500"> ({t.countedOnce})</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 pl-4 break-all">
                  <span className="font-mono">{s.evidence}</span>
                  <span className="ml-2 uppercase tracking-wider text-[10px] text-slate-600">[{t.sources[s.source]}]</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Facts (file/apk details) */}
      {outcome.facts && (
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">{t.fileInfo}</h3>
          <dl className="space-y-2 text-sm">
            {outcome.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-slate-500 text-xs">{f.label}</dt>
                <dd className={`text-slate-300 break-all ${f.mono ? 'font-mono text-xs' : ''}`}>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-3">{t.whatToDo}</h3>
        <ul className="space-y-2">
          {outcome.recommendations.map((r, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${danger ? 'bg-red-400' : 'bg-emerald-400'}`} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Checks + notes */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-1.5">{t.checksRun}</p>
          <p className="text-xs text-slate-400">{v.checksRun.join(' · ')}</p>
        </div>
        {outcome.notes.map((n, i) => (
          <p key={i} className="text-xs text-slate-500 flex items-start gap-2"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />{n}</p>
        ))}
      </div>

      <button onClick={onReset}
        className="w-full bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold text-white transition">
        {t.scanAnother}
      </button>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] opacity-70 mb-1">
        <span>{label}</span><span className="font-mono">{value}/100</span>
      </div>
      <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-current transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function fmtSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
