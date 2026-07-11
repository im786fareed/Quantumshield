/**
 * Shared APK analysis — the engine behind the unified Scanner's APK tab
 * (replaces APKGuardian's and Scanner's private copies).
 *
 * Runs ON DEVICE via JSZip. Honesty rules baked in:
 *  • no invented version numbers or SDK levels — if a value cannot be read
 *    from the package it is reported as "not extractable in the browser";
 *  • risk comes from PERMISSION COMBINATIONS (the banking-trojan pattern),
 *    never from one permission alone;
 *  • parsing failure is an error, never silently replaced with defaults.
 */

import JSZip from 'jszip';
import { sha256Hex } from './hash';
import type { SecuritySignal } from './verdict';

export interface ApkAnalysis {
  fileName: string;
  size: number;
  sha256: string;
  /** Best-effort guess from manifest strings — explicitly labelled estimated. */
  estimatedPackage: string | null;
  permissions: string[];
  /** APK signing files found in META-INF (presence only, not validation). */
  signatureFiles: string[];
  dexFileCount: number;
  nativeLibCount: number;
  signals: SecuritySignal[];
  checksRun: string[];
  embeddedUrls: string[];
}

const URL_RE = /https?:\/\/[a-z0-9][a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]{5,120}/gi;

// Dangerous permissions with standalone weights (kept deliberately moderate —
// combinations, not single permissions, drive the verdict).
const PERMISSION_INFO: Record<string, { severity: number; en: string; hi: string }> = {
  BIND_ACCESSIBILITY_SERVICE: {
    severity: 60,
    en: 'Requests Accessibility control — can read the screen and tap buttons by itself',
    hi: 'Accessibility नियंत्रण मांगता है — स्क्रीन पढ़ और खुद बटन दबा सकता है',
  },
  SYSTEM_ALERT_WINDOW: {
    severity: 45,
    en: 'Can draw over other apps — the technique used for fake PIN/login overlays',
    hi: 'दूसरे ऐप्स के ऊपर स्क्रीन बना सकता है — नकली PIN/लॉगिन overlay की तकनीक',
  },
  READ_SMS: { severity: 55, en: 'Can read your SMS inbox (including bank OTPs)', hi: 'आपके SMS पढ़ सकता है (बैंक OTP सहित)' },
  RECEIVE_SMS: { severity: 55, en: 'Sees every incoming SMS the moment it arrives (OTP interception)', hi: 'हर आने वाला SMS तुरंत देख सकता है (OTP चोरी)' },
  SEND_SMS: { severity: 45, en: 'Can send SMS from your number (premium-rate fraud)', hi: 'आपके नंबर से SMS भेज सकता है' },
  REQUEST_INSTALL_PACKAGES: { severity: 40, en: 'Can trigger installation of more apps (dropper behaviour)', hi: 'और ऐप्स इंस्टॉल करवा सकता है (dropper व्यवहार)' },
  BIND_DEVICE_ADMIN: { severity: 50, en: 'Requests device-administrator power (can resist uninstall)', hi: 'डिवाइस-एडमिन अधिकार मांगता है (अनइंस्टॉल रोक सकता है)' },
  READ_CONTACTS: { severity: 25, en: 'Reads your full contact list', hi: 'आपकी पूरी संपर्क सूची पढ़ता है' },
  READ_CALL_LOG: { severity: 30, en: 'Reads your call history', hi: 'आपका कॉल इतिहास पढ़ता है' },
  RECORD_AUDIO: { severity: 30, en: 'Can record from the microphone', hi: 'माइक्रोफ़ोन से रिकॉर्ड कर सकता है' },
  CAMERA: { severity: 25, en: 'Can use the camera', hi: 'कैमरा इस्तेमाल कर सकता है' },
  ACCESS_FINE_LOCATION: { severity: 20, en: 'Tracks precise GPS location', hi: 'सटीक GPS लोकेशन ट्रैक करता है' },
  RECEIVE_BOOT_COMPLETED: { severity: 20, en: 'Starts itself when the phone boots', hi: 'फ़ोन चालू होते ही खुद शुरू होता है' },
  BIND_NOTIFICATION_LISTENER_SERVICE: { severity: 45, en: 'Reads every notification (including OTP notifications)', hi: 'हर notification पढ़ता है (OTP सहित)' },
};

// Correlated permission patterns — how banking trojans / stalkerware actually look.
const COMBOS: Array<{
  id: string;
  needs: string[][];      // every group must have ≥1 match
  severity: number;
  en: string;
  hi: string;
  evidence: (perms: string[]) => string;
}> = [
  {
    id: 'apk.bankingTrojanPattern',
    needs: [['BIND_ACCESSIBILITY_SERVICE'], ['SYSTEM_ALERT_WINDOW', 'READ_SMS', 'RECEIVE_SMS', 'BIND_NOTIFICATION_LISTENER_SERVICE']],
    severity: 95,
    en: 'Banking-trojan permission pattern: Accessibility control combined with SMS/overlay/notification access — the exact combination Android banking malware uses to steal OTPs and UPI PINs',
    hi: 'बैंकिंग-ट्रोजन अनुमति पैटर्न: Accessibility + SMS/overlay/notification — Android बैंकिंग मैलवेयर की सटीक पहचान',
    evidence: (p) => `BIND_ACCESSIBILITY_SERVICE together with ${p.filter((x) => ['SYSTEM_ALERT_WINDOW', 'READ_SMS', 'RECEIVE_SMS', 'BIND_NOTIFICATION_LISTENER_SERVICE'].includes(x)).join(' + ')}`,
  },
  {
    id: 'apk.otpTheftPattern',
    needs: [['READ_SMS', 'RECEIVE_SMS'], ['INTERNET']],
    severity: 70,
    en: 'OTP-theft capability: reads incoming SMS and has internet access to send them out',
    hi: 'OTP-चोरी क्षमता: आने वाले SMS पढ़ता है और इंटरनेट से बाहर भेज सकता है',
    evidence: (p) => p.filter((x) => ['READ_SMS', 'RECEIVE_SMS', 'INTERNET'].includes(x)).join(' + '),
  },
  {
    id: 'apk.overlayPhishingPattern',
    needs: [['SYSTEM_ALERT_WINDOW'], ['INTERNET']],
    severity: 50,
    en: 'Overlay capability: can draw fake screens over banking/UPI apps',
    hi: 'Overlay क्षमता: बैंकिंग/UPI ऐप्स के ऊपर नकली स्क्रीन बना सकता है',
    evidence: () => 'SYSTEM_ALERT_WINDOW + INTERNET',
  },
  {
    id: 'apk.stalkerwarePattern',
    needs: [['RECEIVE_BOOT_COMPLETED'], ['RECORD_AUDIO', 'CAMERA', 'ACCESS_FINE_LOCATION', 'READ_CALL_LOG']],
    severity: 65,
    en: 'Stalkerware pattern: auto-starts on boot and can record audio / camera / location in the background',
    hi: 'Stalkerware पैटर्न: फ़ोन चालू होते ही शुरू होकर पीछे से रिकॉर्ड कर सकता है',
    evidence: (p) => `RECEIVE_BOOT_COMPLETED + ${p.filter((x) => ['RECORD_AUDIO', 'CAMERA', 'ACCESS_FINE_LOCATION', 'READ_CALL_LOG'].includes(x)).join(' + ')}`,
  },
  {
    id: 'apk.dropperPattern',
    needs: [['REQUEST_INSTALL_PACKAGES']],
    severity: 42,
    en: 'Dropper capability: can trigger installation of further packages outside the Play Store',
    hi: 'Dropper क्षमता: Play Store के बाहर और पैकेज इंस्टॉल करवा सकता है',
    evidence: () => 'REQUEST_INSTALL_PACKAGES',
  },
];

export async function analyzeApk(file: File): Promise<ApkAnalysis> {
  const signals: SecuritySignal[] = [];
  const checksRun: string[] = [];

  const buffer = await file.arrayBuffer();
  const sha256 = await sha256Hex(buffer);
  checksRun.push('SHA-256 fingerprint');

  const zip = await JSZip.loadAsync(buffer);
  checksRun.push('APK archive structure');

  const manifestFile = zip.file('AndroidManifest.xml');
  if (!manifestFile) {
    throw new Error('Not a valid APK: AndroidManifest.xml is missing from the package.');
  }

  // Binary AXML — string pool still exposes permission constants and
  // package-like strings as readable text. Approximate but real.
  const manifestBytes = await manifestFile.async('uint8array');
  const manifestText = new TextDecoder('utf-8', { fatal: false }).decode(manifestBytes);

  // ── Permissions ─────────────────────────────────────────────────────────
  checksRun.push('Permission extraction from manifest');
  const permissions = Array.from(
    new Set((manifestText.match(/android\.permission\.[A-Z_]+/g) ?? []).map((p) => p.replace('android.permission.', '')))
  );
  if (permissions.length === 0) {
    signals.push({
      id: 'apk.unreadableManifest',
      severity: 35,
      confidence: 60,
      title: 'Permissions could not be extracted from this APK — heavy obfuscation or an unusual manifest encoding. Treat with extra caution',
      titleHi: 'इस APK से अनुमतियाँ नहीं पढ़ी जा सकीं — असामान्य/obfuscated manifest। अतिरिक्त सावधानी रखें',
      evidence: 'Manifest string pool yielded zero android.permission.* entries',
      source: 'ON_DEVICE',
    });
  }

  // ── Combination correlation first (drives the verdict) ─────────────────
  checksRun.push('Permission-combination correlation');
  const firedComboPerms = new Set<string>();
  for (const combo of COMBOS) {
    const ok = combo.needs.every((group) => group.some((p) => permissions.includes(p)));
    if (!ok) continue;
    signals.push({
      id: combo.id,
      severity: combo.severity,
      confidence: 85,
      title: combo.en,
      titleHi: combo.hi,
      evidence: combo.evidence(permissions),
      source: 'ON_DEVICE',
    });
    combo.needs.flat().forEach((p) => firedComboPerms.add(p));
  }

  // ── Standalone dangerous permissions (informational unless no combo) ───
  for (const perm of permissions) {
    const info = PERMISSION_INFO[perm];
    if (!info) continue;
    const partOfCombo = firedComboPerms.has(perm);
    signals.push({
      id: `apk.perm.${perm}`,
      severity: partOfCombo ? Math.min(info.severity, 25) : info.severity,
      confidence: 90,
      title: info.en,
      titleHi: info.hi,
      evidence: `android.permission.${perm}`,
      source: 'ON_DEVICE',
      // A permission that already fired inside a combo is the same evidence.
      correlatedWith: partOfCombo
        ? COMBOS.filter((c) => c.needs.flat().includes(perm)).map((c) => c.id)
        : undefined,
    });
  }

  // ── Signature presence (informational only) ────────────────────────────
  // We can detect a v1 (JAR) signature block (META-INF/*.RSA|DSA|EC), but v2/v3
  // signatures live in the APK Signing Block — a region between the ZIP entries
  // and the central directory that JSZip cannot see. So the ABSENCE of v1 files
  // does NOT prove an APK is unsigned (it may be v2/v3-only, which is normal for
  // modern apps). Emitting an "unsigned = risky" signal here would be a false
  // claim, so we surface signing info as a fact but raise no risk signal.
  checksRun.push('Signing-certificate presence (v1)');
  const signatureFiles = Object.keys(zip.files).filter((f) =>
    /^META-INF\/.+\.(RSA|DSA|EC)$/i.test(f)
  );

  // ── Structure counts + estimated package (honestly labelled) ───────────
  const dexFileCount = Object.keys(zip.files).filter((f) => f.endsWith('.dex')).length;
  const nativeLibCount = Object.keys(zip.files).filter((f) => f.startsWith('lib/') && f.endsWith('.so')).length;

  const packageMatches = manifestText.match(/(?:[a-zA-Z_][a-zA-Z0-9_]*\.)+[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
  const estimatedPackage =
    packageMatches.find(
      (p) =>
        /^(com|org|net|in|io|app)\./.test(p) &&
        p.split('.').length >= 3 &&
        !/android|google|schemas|xmlns/.test(p)
    ) ?? null;

  // ── Embedded URLs in the manifest + first DEX sample ────────────────────
  checksRun.push('Embedded URL extraction');
  let stringsSource = manifestText;
  const firstDex = zip.file('classes.dex');
  if (firstDex) {
    const dexBytes = await firstDex.async('uint8array');
    stringsSource += new TextDecoder('utf-8', { fatal: false }).decode(dexBytes.slice(0, 3_000_000));
  }
  const embeddedUrls = Array.from(new Set(stringsSource.match(URL_RE) ?? []))
    .filter((u) => !/schemas\.android\.com|www\.w3\.org|apache\.org/.test(u))
    .slice(0, 5);

  return {
    fileName: file.name,
    size: file.size,
    sha256,
    estimatedPackage,
    permissions,
    signatureFiles,
    dexFileCount,
    nativeLibCount,
    signals,
    checksRun,
    embeddedUrls,
  };
}
