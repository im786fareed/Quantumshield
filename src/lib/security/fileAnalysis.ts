/**
 * Shared static file analysis pipeline — the single engine behind the
 * unified Scanner's File tab (replaces FileScanner, DownloadScanner,
 * RansomwareDetector and Scanner's private copies).
 *
 * Everything here runs ON DEVICE. The file never leaves the browser.
 * Checks: SHA-256, magic-byte vs extension, double extensions, dangerous
 * extensions, ransomware filename indicators, byte entropy, embedded
 * URL / IP / script-command extraction.
 */

import JSZip from 'jszip';
import { sha256Hex } from './hash';
import { RISKY_TLDS_LIST, EMBEDDED_URL_RE as URL_RE } from './urlHeuristics';
import type { SecuritySignal } from './verdict';

export interface FileAnalysis {
  fileName: string;
  size: number;
  sha256: string;
  /** What the file's own bytes say it is (magic-byte identification). */
  detectedType: string;
  signals: SecuritySignal[];
  checksRun: string[];
  /** Up to 5 URLs found inside the file's readable strings. */
  embeddedUrls: string[];
}

// ── Magic-byte signatures (byte-level truth beats the filename) ──────────
const MAGIC: Array<{
  hex: string;
  type: string;
  okExts: string[];
  /** severity when the extension lies about this type */
  mismatchSeverity: number;
  kind: 'image' | 'document' | 'archive' | 'executable';
}> = [
  { hex: '89 50 4E 47', type: 'PNG image', okExts: ['png'], mismatchSeverity: 60, kind: 'image' },
  { hex: 'FF D8 FF', type: 'JPEG image', okExts: ['jpg', 'jpeg'], mismatchSeverity: 60, kind: 'image' },
  { hex: '47 49 46 38', type: 'GIF image', okExts: ['gif'], mismatchSeverity: 55, kind: 'image' },
  { hex: '25 50 44 46', type: 'PDF document', okExts: ['pdf'], mismatchSeverity: 65, kind: 'document' },
  { hex: '50 4B 03 04', type: 'ZIP-based archive', okExts: ['zip', 'apk', 'docx', 'xlsx', 'pptx', 'jar', 'epub', 'aar', 'kmz', 'xpi'], mismatchSeverity: 70, kind: 'archive' },
  { hex: '52 61 72 21', type: 'RAR archive', okExts: ['rar'], mismatchSeverity: 60, kind: 'archive' },
  { hex: '37 7A BC AF', type: '7-Zip archive', okExts: ['7z'], mismatchSeverity: 60, kind: 'archive' },
  { hex: '1F 8B', type: 'GZIP archive', okExts: ['gz', 'tgz'], mismatchSeverity: 55, kind: 'archive' },
  { hex: '4D 5A', type: 'Windows executable (MZ)', okExts: ['exe', 'dll', 'sys', 'scr', 'msi', 'com'], mismatchSeverity: 92, kind: 'executable' },
  { hex: '7F 45 4C 46', type: 'Linux/Android executable (ELF)', okExts: ['bin', 'so', 'out', 'elf', ''], mismatchSeverity: 90, kind: 'executable' },
];

const SCRIPT_EXTS = ['exe', 'msi', 'bat', 'cmd', 'vbs', 'js', 'jse', 'wsf', 'scr', 'ps1', 'reg', 'hta', 'jar', 'sh'];
const DECOY_EXTS = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'mp3', 'zip'];

// Filename patterns historically used by ransomware (filename-level hints
// only — reliability is capped accordingly in the signal's confidence).
const RANSOM_EXTS = [
  '.locked', '.encrypted', '.crypto', '.locky', '.cerber', '.wannacry', '.wncry',
  '.wcry', '.crypt', '.cryptolocker', '.cryptowall', '.teslacrypt', '.dharma',
  '.wallet', '.onion', '.kraken', '.thor', '.micro', '.lechiffre',
];
const RANSOM_NOTE_WORDS = ['decrypt', 'ransom', 'how_to_decrypt', 'help_decrypt', 'restore_files', 'your_files', 'read_me_for_decrypt'];

// Script / payload command strings that matter inside documents & unknowns.
const SUSPICIOUS_COMMANDS = [
  'powershell', '-encodedcommand', ' -enc ', 'cmd /c', 'cmd.exe',
  'wscript.shell', 'createobject(', 'shellexecute', 'downloadstring(',
  'invoke-expression', 'iex(', 'certutil -urlcache', 'bitsadmin /transfer',
  'frombase64string', 'autoopen', 'document_open',
];

const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?\b/g;

// Extensions that are dangerous when found INSIDE an archive (a document
// that unzips to an executable is a classic delivery trick).
const DANGEROUS_INSIDE_ARCHIVE = ['exe', 'scr', 'bat', 'cmd', 'vbs', 'js', 'jse', 'wsf', 'ps1', 'hta', 'jar', 'msi', 'lnk', 'com', 'pif'];
const NESTED_ARCHIVE_RE = /\.(zip|rar|7z|gz|tar|bz2|xz|iso|cab|jar)$/i;

// PDF active-content tokens — legitimate PDFs rarely need these; malware uses
// them to auto-run scripts or launch programs when the file is opened.
const PDF_ACTIVE_TOKENS: Array<{ token: string; label: string; labelHi: string; severity: number }> = [
  { token: '/JavaScript', label: 'embedded JavaScript', labelHi: 'एम्बेडेड JavaScript', severity: 60 },
  { token: '/OpenAction', label: 'auto-run action on open', labelHi: 'खुलते ही स्वतः चलने वाला एक्शन', severity: 65 },
  { token: '/AA', label: 'automatic action trigger', labelHi: 'स्वचालित एक्शन ट्रिगर', severity: 50 },
  { token: '/Launch', label: 'launches an external program', labelHi: 'बाहरी प्रोग्राम चलाता है', severity: 75 },
  { token: '/EmbeddedFile', label: 'embedded file payload', labelHi: 'एम्बेडेड फ़ाइल payload', severity: 55 },
];

/** Shannon entropy (bits/byte, 0–8) of a byte sample. */
export function shannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;
  const counts = new Array<number>(256).fill(0);
  for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
  let h = 0;
  for (let i = 0; i < 256; i++) {
    if (!counts[i]) continue;
    const p = counts[i] / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}

/** Extract printable-ASCII strings (len ≥ 6) from a byte sample. */
function extractStrings(bytes: Uint8Array, maxChars = 2_000_000): string {
  const out: string[] = [];
  let run: number[] = [];
  const limit = Math.min(bytes.length, maxChars);
  for (let i = 0; i < limit; i++) {
    const b = bytes[i];
    if (b >= 0x20 && b <= 0x7e) {
      run.push(b);
    } else {
      if (run.length >= 6) out.push(String.fromCharCode(...run));
      run = [];
    }
  }
  if (run.length >= 6) out.push(String.fromCharCode(...run));
  return out.join('\n');
}

function hexOf(bytes: Uint8Array, n: number): string {
  return Array.from(bytes.slice(0, n))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

export async function analyzeFileStatic(file: File): Promise<FileAnalysis> {
  const signals: SecuritySignal[] = [];
  const checksRun: string[] = [];
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const name = file.name;
  const lower = name.toLowerCase();
  const parts = lower.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : '';

  // ── 1. Cryptographic hash ───────────────────────────────────────────────
  const sha256 = await sha256Hex(buffer);
  checksRun.push('SHA-256 fingerprint');

  // ── 2. Magic-byte identification vs extension ───────────────────────────
  checksRun.push('File-type verification (magic bytes)');
  const header = hexOf(bytes, 4);
  let detectedType = file.type || 'Unrecognised binary data';
  let detectedKind: 'image' | 'document' | 'archive' | 'executable' | 'unknown' = 'unknown';
  for (const m of MAGIC) {
    if (header.startsWith(m.hex)) {
      detectedType = m.type;
      detectedKind = m.kind;
      if (!m.okExts.includes(ext)) {
        const isExec = m.kind === 'executable';
        signals.push({
          id: 'file.typeMismatch',
          severity: m.mismatchSeverity,
          confidence: 95,
          title: isExec
            ? `This is really a ${m.type} disguised as ".${ext}"`
            : `File content is a ${m.type} but the name claims ".${ext}"`,
          titleHi: isExec
            ? `यह असल में ${m.type} है, ".${ext}" के रूप में छिपाई गई`
            : `फ़ाइल असल में ${m.type} है, नाम ".${ext}" बताता है`,
          evidence: `Header bytes ${m.hex} identify a ${m.type}; filename ends in ".${ext}"`,
          source: 'ON_DEVICE',
        });
      }
      break;
    }
  }

  // ── 3. Double-extension trap ───────────────────────────────────────────
  checksRun.push('Double-extension check');
  if (parts.length > 2) {
    const last = parts[parts.length - 1];
    const beforeLast = parts[parts.length - 2];
    if (SCRIPT_EXTS.includes(last) && DECOY_EXTS.includes(beforeLast)) {
      signals.push({
        id: 'file.doubleExtension',
        severity: 88,
        confidence: 95,
        title: `Double-extension trick (".${beforeLast}.${last}") — an executable posing as a document`,
        titleHi: `डबल-एक्सटेंशन चाल (".${beforeLast}.${last}") — दस्तावेज़ के रूप में छिपी executable फ़ाइल`,
        evidence: `Filename "${name}" ends in .${beforeLast}.${last}`,
        source: 'ON_DEVICE',
        correlatedWith: ['file.typeMismatch'],
      });
    }
  }

  // ── 4. Dangerous extension advisory ────────────────────────────────────
  checksRun.push('Executable / script format check');
  if (SCRIPT_EXTS.includes(ext) && !signals.some((s) => s.id === 'file.doubleExtension')) {
    signals.push({
      id: 'file.activeFormat',
      severity: 30,
      confidence: 90,
      title: `Active format (.${ext}) — runs code when opened. Only open if you fully trust the sender`,
      titleHi: `सक्रिय फ़ॉर्मैट (.${ext}) — खोलने पर कोड चलता है। केवल पूर्ण विश्वास होने पर खोलें`,
      evidence: `Extension .${ext} is a program/script format, not a document`,
      source: 'ON_DEVICE',
    });
  }

  // ── 5. Ransomware filename indicators (hints, honestly capped) ─────────
  checksRun.push('Ransomware filename indicators');
  for (const rext of RANSOM_EXTS) {
    if (lower.endsWith(rext)) {
      signals.push({
        id: 'file.ransomExtension',
        severity: 80,
        confidence: 65, // filename evidence only — content not verifiable this way
        title: `Filename ends in "${rext}" — an extension used by known ransomware families`,
        titleHi: `फ़ाइल नाम "${rext}" पर खत्म होता है — ज्ञात रैंसमवेयर की पहचान`,
        evidence: `Extension ${rext} (filename indicator only, not content proof)`,
        source: 'ON_DEVICE',
      });
      break;
    }
  }
  const noteHits = RANSOM_NOTE_WORDS.filter((w) => lower.includes(w));
  if (noteHits.length >= 1 && (ext === 'txt' || ext === 'html' || ext === 'hta' || SCRIPT_EXTS.includes(ext))) {
    signals.push({
      id: 'file.ransomNoteName',
      severity: 50,
      confidence: 50,
      title: 'Filename resembles a ransom note',
      titleHi: 'फ़ाइल नाम रैंसम नोट जैसा है',
      evidence: `Filename contains: ${noteHits.join(', ')}`,
      source: 'ON_DEVICE',
    });
  }

  // ── 6. Entropy (packing/encryption indicator for executables) ──────────
  // Archives, media and PDFs are legitimately high-entropy — only meaningful
  // for executables and unrecognised binaries.
  checksRun.push('Byte-entropy analysis');
  if (detectedKind === 'executable' || detectedKind === 'unknown') {
    const sample = bytes.length > 3_000_000
      ? new Uint8Array([...bytes.slice(0, 2_000_000), ...bytes.slice(-1_000_000)])
      : bytes;
    const entropy = shannonEntropy(sample);
    if (entropy > 7.4 && detectedKind === 'executable') {
      signals.push({
        id: 'file.highEntropy',
        severity: 45,
        confidence: 60,
        title: 'Executable content is packed or encrypted — a common malware-obfuscation technique (also used by some legitimate installers)',
        titleHi: 'Executable सामग्री पैक/एन्क्रिप्टेड है — मैलवेयर छिपाने की सामान्य तकनीक',
        evidence: `Byte entropy ${entropy.toFixed(2)} / 8.00 (above the 7.40 packing threshold)`,
        source: 'ON_DEVICE',
      });
    }
  }

  // ── 7. Embedded URLs / IPs / script commands ────────────────────────────
  checksRun.push('Embedded URL & command-string extraction');
  const strings = extractStrings(bytes).toLowerCase();
  const embeddedUrls = Array.from(new Set(strings.match(URL_RE) ?? [])).slice(0, 5);
  const embeddedIps = Array.from(new Set(strings.match(IP_RE) ?? []))
    .filter((ip) => ip.split('.').every((o) => +o.split(':')[0] <= 255))
    .slice(0, 5);

  const riskyUrls = embeddedUrls.filter((u) => RISKY_TLDS_LIST.some((t) => u.includes(t)));
  if (riskyUrls.length > 0) {
    signals.push({
      id: 'file.riskyEmbeddedUrl',
      severity: 55,
      confidence: 70,
      title: 'File contains links to high-risk domains',
      titleHi: 'फ़ाइल में उच्च-जोखिम वाले डोमेन के लिंक हैं',
      evidence: riskyUrls.slice(0, 3).join('  ·  '),
      source: 'ON_DEVICE',
    });
  }
  if (embeddedIps.length > 0 && (detectedKind === 'executable' || SCRIPT_EXTS.includes(ext))) {
    signals.push({
      id: 'file.embeddedIp',
      severity: 40,
      confidence: 55,
      title: 'Hard-coded IP address inside an executable/script — a way to contact servers while bypassing domain checks',
      titleHi: 'Executable में सीधा IP पता — डोमेन जांच से बचने की तकनीक',
      evidence: embeddedIps.slice(0, 3).join(', '),
      source: 'ON_DEVICE',
    });
  }

  const cmdHits = SUSPICIOUS_COMMANDS.filter((c) => strings.includes(c));
  const cmdRelevant = detectedKind !== 'image'; // command text inside a real image is noise
  if (cmdHits.length > 0 && cmdRelevant) {
    const encoded = cmdHits.some((c) => c.includes('enc') || c.includes('base64'));
    signals.push({
      id: 'file.scriptCommands',
      severity: encoded ? 70 : 50,
      confidence: 70,
      title: encoded
        ? 'Contains encoded PowerShell/script commands — a hallmark of malicious payloads'
        : 'Contains script/command-execution strings',
      titleHi: encoded
        ? 'एन्कोडेड PowerShell/स्क्रिप्ट कमांड मिले — दुर्भावनापूर्ण payload की पहचान'
        : 'स्क्रिप्ट/कमांड-निष्पादन स्ट्रिंग्स मिलीं',
      evidence: cmdHits.slice(0, 4).join(', '),
      source: 'ON_DEVICE',
    });
  }

  // ── 8. PDF active content ───────────────────────────────────────────────
  if (detectedType === 'PDF document') {
    checksRun.push('PDF active-content inspection');
    // PDF keywords are ASCII; scan a bounded latin1 view (head + tail, where
    // the catalog / xref usually live) so large PDFs stay fast.
    const head = new TextDecoder('latin1').decode(bytes.subarray(0, 4_000_000));
    const tail = bytes.length > 5_000_000
      ? new TextDecoder('latin1').decode(bytes.subarray(bytes.length - 1_000_000))
      : '';
    const pdfText = head + tail;
    const hits = PDF_ACTIVE_TOKENS.filter((t) => pdfText.includes(t.token));
    if (hits.length > 0) {
      const top = hits.reduce((a, b) => (b.severity > a.severity ? b : a));
      signals.push({
        id: 'file.pdfActiveContent',
        severity: top.severity,
        confidence: 75,
        title: `PDF contains active content (${hits.map((h) => h.label).join(', ')}) — most everyday PDFs do not, and this is how malicious PDFs run code`,
        titleHi: `PDF में सक्रिय सामग्री है (${hits.map((h) => h.labelHi).join(', ')}) — सामान्य PDF में ऐसा नहीं होता`,
        evidence: hits.map((h) => h.token).join(' '),
        source: 'ON_DEVICE',
      });
    }
  }

  // ── 9. Archive & Office-document contents ───────────────────────────────
  // Real ZIP by magic bytes (covers .zip and Office .docx/.xlsx/.pptx, which
  // are ZIP containers). APKs are handled by the dedicated APK analyzer.
  if (header.startsWith('50 4B 03 04') && ext !== 'apk') {
    checksRun.push('Archive contents inspection');
    try {
      const zip = await JSZip.loadAsync(buffer);
      const entries = Object.values(zip.files).filter((f) => !f.dir);
      const names = entries.map((f) => f.name);

      // Office VBA macro — the primary way malicious documents execute code.
      if (names.some((n) => /(^|\/)vbaProject\.bin$/i.test(n))) {
        signals.push({
          id: 'file.officeMacro',
          severity: 72,
          confidence: 85,
          title: 'Document contains an embedded VBA macro — the main way malicious Office files run code. Do not enable macros unless you fully trust the source',
          titleHi: 'दस्तावेज़ में एम्बेडेड VBA मैक्रो है — दुर्भावनापूर्ण Office फ़ाइलें इसी से कोड चलाती हैं। स्रोत पर पूर्ण भरोसा न हो तो मैक्रो सक्षम न करें',
          evidence: names.find((n) => /vbaProject\.bin$/i.test(n)) ?? 'vbaProject.bin',
          source: 'ON_DEVICE',
        });
      }

      // Executable / script hidden inside the archive.
      const dangerousInside = names.filter((n) => {
        const inExt = n.toLowerCase().split('.').pop() ?? '';
        return DANGEROUS_INSIDE_ARCHIVE.includes(inExt);
      });
      if (dangerousInside.length > 0) {
        signals.push({
          id: 'file.executableInArchive',
          severity: 78,
          confidence: 85,
          title: `Archive hides ${dangerousInside.length} executable/script file(s) inside — a common way to smuggle malware past a quick look`,
          titleHi: `संग्रह के अंदर ${dangerousInside.length} executable/स्क्रिप्ट फ़ाइल(एं) छिपी हैं — मैलवेयर छिपाने की सामान्य तकनीक`,
          evidence: dangerousInside.slice(0, 4).join(', '),
          source: 'ON_DEVICE',
        });
      }

      // Nested archive — layered zips are used to evade scanners.
      const nested = names.filter((n) => NESTED_ARCHIVE_RE.test(n));
      if (nested.length > 0 && ext !== 'docx' && ext !== 'xlsx' && ext !== 'pptx') {
        signals.push({
          id: 'file.nestedArchive',
          severity: 40,
          confidence: 70,
          title: `Archive contains ${nested.length} more archive(s) inside — layered packing is often used to hide contents from scanners`,
          titleHi: `संग्रह के अंदर ${nested.length} और संग्रह हैं — स्कैनर से सामग्री छिपाने की तकनीक`,
          evidence: nested.slice(0, 4).join(', '),
          source: 'ON_DEVICE',
        });
      }
    } catch {
      // Corrupt or encrypted central directory — report honestly, don't guess.
      signals.push({
        id: 'file.archiveUnreadable',
        severity: 35,
        confidence: 55,
        title: 'Archive could not be opened for inspection — it may be corrupt or password-protected, so its contents were not checked',
        titleHi: 'संग्रह निरीक्षण के लिए नहीं खोला जा सका — यह करप्ट या पासवर्ड-सुरक्षित हो सकता है, सामग्री जांची नहीं गई',
        evidence: 'JSZip could not read the archive structure',
        source: 'ON_DEVICE',
      });
    }
  }

  return {
    fileName: name,
    size: file.size,
    sha256,
    detectedType,
    signals,
    checksRun,
    embeddedUrls,
  };
}
