'use client';

import { Phone, AlertTriangle, CheckCircle, XCircle, Mail, Link as LinkIcon, ShieldAlert, ShieldCheck, Loader2, Brain } from 'lucide-react';
import { useState } from 'react';
import { apiUrl } from '@/lib/apiBase';
import VoiceDictationButton from './VoiceDictationButton';

interface AiVerdict {
  spam: boolean;
  score: number;
  level: string;
  threatType: string;
  message: string;
  reasons: string[];
  recommendation?: string;
  language?: string;
}

interface Props {
  lang: 'en' | 'hi';
}

interface DomainHeuristics {
  domain: string;
  hasBrandAbuse: boolean;
  abusedBrand: string;
  hasSubdomainSpam: boolean;
  subdomainCount: number;
  isInsecure: boolean;
  isRawIp: boolean;
}

interface CheckResult {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'SPAM';
  riskScore: number;
  message: string;
  type: 'phone' | 'email' | 'sms';
  indicators: {
    hasScamKeywords: boolean;
    hasPhoneNumber: boolean;
    hasLink: boolean;
    hasUrgency: boolean;
    hasMoney: boolean;
    hasLottery: boolean;
    hasSuspiciousSender: boolean;
    foundKeywords: string[];
    foundUrls: string[];
    suspiciousPatterns: string[];
    // Advanced fields
    zeroWidthCount: number;
    mathStyleCount: number;
    homoglyphsCount: number;
    foundEvasions: string[];
  };
  actions: string[];
  details?: {
    subject?: string;
    urlCount?: number;
    urgencyLevel?: string;
  };
  urlAnalysis?: {
    url: string;
    domain: string;
    heuristics: DomainHeuristics;
    phishRocksStatus: 'checking' | 'clean' | 'phishing' | 'failed';
  }[];
}

const CONTENT = {
  en: {
    title: 'AI Content Guardian & Phish Shield',
    subtitle: 'High-fidelity engine detecting homoglyphs, font-evasions, zero-width splits, and brand impersonation scams',
    phonePlaceholder: 'Paste suspicious message, SMS, email text or sender details here...\n\nExample of evasion:\nSubject: Update your 𝖯𝖺𝗒𝗍𝗆 KYC immediately!\nFrom: support@paytm-kyc-verify-portal.in\n\nClick link to claim your reward: http://198.51.100.42/login',
    checkButton: 'Initiate AI Content Audit',
    checking: 'Deobfuscating & Auditing...',
    result: 'Forensics Threat Assessment',
    riskScore: 'Spam/Scam Probability',
    indicators: 'Scam Indicators Identified',
    whatToDo: 'Immediate Security Directives',
    checkAnother: 'Scan Another Message',
    disclaimer: 'QuantumShield client-side guardian checks for Unicode bypasses, homoglyphs, and domain heuristics with absolute privacy.',
    foundUrls: 'Extracted URL Intelligence Map',
    suspiciousPatterns: 'Heuristic Warning Patterns',
    evasionsTitle: 'Obfuscation & Evasion Details',
    evasionsDetected: 'Evasions Blocked'
  },
  hi: {
    title: 'AI सुरक्षा गार्ड और फ़िशिंग शील्ड',
    subtitle: 'होमोग्लिफ़, फ़ॉन्ट-विचलन, छिपे हुए स्पेस और ब्रांड प्रतिरूपण धोखाधड़ी का विश्लेषण करें',
    phonePlaceholder: 'संदेश, SMS या ईमेल यहां पेस्ट करें...\n\nउदाहरण:\nSubject: अपने 𝖯𝖺𝗒𝗍𝗆 KYC को तुरंत अपडेट करें!\nFrom: support@paytm-kyc-verify-portal.in\n\nरिवॉर्ड पाने के लिए लिंक पर क्लिक करें: http://198.51.100.42/login',
    checkButton: 'AI सामग्री विश्लेषण शुरू करें',
    checking: 'डीओब्फ़स्केटिंग और ऑडिटिंग...',
    result: 'फॉरेंसिक खतरा मूल्यांकन',
    riskScore: 'धोखाधड़ी/स्पैम की संभावना',
    indicators: 'पहचाने गए खतरे',
    whatToDo: 'त्वरित सुरक्षा निर्देश',
    checkAnother: 'फिर से स्कैन करें',
    disclaimer: 'QuantumShield क्लाइंट-साइड सुरक्षा गार्ड गोपनीयता बनाए रखते हुए यूनिकोड बायपास, होमोग्लिफ़ और डोमेन का विश्लेषण करता है।',
    foundUrls: 'मिले URL विश्लेषण मानचित्र',
    suspiciousPatterns: 'सुरक्षा चेतावनी संकेत',
    evasionsTitle: 'छिपे हुए खतरे और बायपास प्रयास',
    evasionsDetected: 'पहचाने गए बायपास'
  }
};

const OFFICIAL_BRANDS: { [key: string]: string[] } = {
  paytm: ['paytm.com', 'paytmbank.com', 'paytmmall.com'],
  gpay: ['google.com', 'gpay.app.goo.gl', 'pay.google.com'],
  google: ['google.com', 'google.co.in', 'youtube.com', 'gmail.com'],
  phonepe: ['phonepe.com'],
  sbi: ['sbi.co.in', 'onlinesbi.sbi', 'statebankofindia.com', 'sbi'],
  hdfc: ['hdfcbank.com', 'hdfc.com'],
  icici: ['icicibank.com', 'icici.com'],
  paypal: ['paypal.com'],
  microsoft: ['microsoft.com', 'live.com', 'outlook.com', 'office.com'],
  netflix: ['netflix.com'],
  amazon: ['amazon.com', 'amazon.in'],
  apple: ['apple.com', 'icloud.com'],
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com']
};

function normalizeUnicodeText(text: string): {
  normalized: string;
  zeroWidthCount: number;
  mathStyleCount: number;
  homoglyphsCount: number;
  foundEvasions: string[];
} {
  let zeroWidthCount = 0;
  let mathStyleCount = 0;
  let homoglyphsCount = 0;
  const foundEvasions: string[] = [];

  // 1. Detect and strip zero-width characters and invisible splitters
  // Zero Width Space (200B), Zero Width Non-Joiner (200C), Zero Width Joiner (200D), Word Joiner (2060), Soft Hyphen (00AD)
  const zeroWidthRegex = /[\u200B-\u200D\u2060\u00AD]/g;
  const matchesZeroWidth = text.match(zeroWidthRegex);
  if (matchesZeroWidth) {
    zeroWidthCount = matchesZeroWidth.length;
    foundEvasions.push(`Invisible zero-width word-splitters (${zeroWidthCount} instances detected)`);
  }
  let cleanText = text.replace(zeroWidthRegex, '');

  // 2. Normalize Mathematical Alphanumeric Symbols (ranges 0x1D400 to 0x1D7FF)
  let normalizedText = '';
  for (const char of cleanText) {
    const cp = char.codePointAt(0);
    if (cp && cp >= 0x1D400 && cp <= 0x1D7FF) {
      mathStyleCount++;
      let normalChar = char;
      // Bold A-Z (0x1D400 - 0x1D419) -> A-Z (0x41 - 0x5A)
      if (cp >= 0x1D400 && cp <= 0x1D419) {
        normalChar = String.fromCodePoint(cp - 0x1D400 + 0x41);
      }
      // Bold a-z (0x1D41A - 0x1D433) -> a-z (0x61 - 0x7A)
      else if (cp >= 0x1D41A && cp <= 0x1D433) {
        normalChar = String.fromCodePoint(cp - 0x1D41A + 0x61);
      }
      // Italic A-Z (0x1D434 - 0x1D44D) -> A-Z
      else if (cp >= 0x1D434 && cp <= 0x1D44D) {
        normalChar = String.fromCodePoint(cp - 0x1D434 + 0x41);
      }
      // Italic a-z (0x1D44E - 0x1D467) -> a-z
      else if (cp >= 0x1D44E && cp <= 0x1D467) {
        normalChar = String.fromCodePoint(cp - 0x1D44E + 0x61);
      }
      // Bold Italic A-Z (0x1D468 - 0x1D481) -> A-Z
      else if (cp >= 0x1D468 && cp <= 0x1D481) {
        normalChar = String.fromCodePoint(cp - 0x1D468 + 0x41);
      }
      // Bold Italic a-z (0x1D482 - 0x1D49B) -> a-z
      else if (cp >= 0x1D482 && cp <= 0x1D49B) {
        normalChar = String.fromCodePoint(cp - 0x1D482 + 0x61);
      }
      // Script A-Z (0x1D49C - 0x1D4B5) -> A-Z
      else if (cp >= 0x1D49C && cp <= 0x1D4B5) {
        normalChar = String.fromCodePoint(cp - 0x1D49C + 0x41);
      }
      // Script a-z (0x1D4B6 - 0x1D4CF) -> a-z
      else if (cp >= 0x1D4B6 && cp <= 0x1D4CF) {
        normalChar = String.fromCodePoint(cp - 0x1D4B6 + 0x61);
      }
      // Bold Script A-Z (0x1D4D0 - 0x1D4E9) -> A-Z
      else if (cp >= 0x1D4D0 && cp <= 0x1D4E9) {
        normalChar = String.fromCodePoint(cp - 0x1D4D0 + 0x41);
      }
      // Bold Script a-z (0x1D4EA - 0x1D503) -> a-z
      else if (cp >= 0x1D4EA && cp <= 0x1D503) {
        normalChar = String.fromCodePoint(cp - 0x1D4EA + 0x61);
      }
      // Fraktur A-Z (0x1D504 - 0x1D51D) -> A-Z
      else if (cp >= 0x1D504 && cp <= 0x1D51D) {
        normalChar = String.fromCodePoint(cp - 0x1D504 + 0x41);
      }
      // Fraktur a-z (0x1D51E - 0x1D537) -> a-z
      else if (cp >= 0x1D51E && cp <= 0x1D537) {
        normalChar = String.fromCodePoint(cp - 0x1D51E + 0x61);
      }
      // Double-struck A-Z (0x1D538 - 0x1D551) -> A-Z
      else if (cp >= 0x1D538 && cp <= 0x1D551) {
        normalChar = String.fromCodePoint(cp - 0x1D538 + 0x41);
      }
      // Double-struck a-z (0x1D552 - 0x1D56B) -> a-z
      else if (cp >= 0x1D552 && cp <= 0x1D56B) {
        normalChar = String.fromCodePoint(cp - 0x1D552 + 0x61);
      }
      // Sans-serif A-Z (0x1D5A0 - 0x1D5B9) -> A-Z
      else if (cp >= 0x1D5A0 && cp <= 0x1D5B9) {
        normalChar = String.fromCodePoint(cp - 0x1D5A0 + 0x41);
      }
      // Sans-serif a-z (0x1D5BA - 0x1D5D3) -> a-z
      else if (cp >= 0x1D5BA && cp <= 0x1D5D3) {
        normalChar = String.fromCodePoint(cp - 0x1D5BA + 0x61);
      }
      // Sans-serif Bold A-Z (0x1D5D4 - 0x1D5ED) -> A-Z
      else if (cp >= 0x1D5D4 && cp <= 0x1D5ED) {
        normalChar = String.fromCodePoint(cp - 0x1D5D4 + 0x41);
      }
      // Sans-serif Bold a-z (0x1D5EE - 0x1D607) -> a-z
      else if (cp >= 0x1D5EE && cp <= 0x1D607) {
        normalChar = String.fromCodePoint(cp - 0x1D5EE + 0x61);
      }
      // Sans-serif Italic A-Z (0x1D608 - 0x1D621) -> A-Z
      else if (cp >= 0x1D608 && cp <= 0x1D621) {
        normalChar = String.fromCodePoint(cp - 0x1D608 + 0x41);
      }
      // Sans-serif Italic a-z (0x1D622 - 0x1D63B) -> a-z
      else if (cp >= 0x1D622 && cp <= 0x1D63B) {
        normalChar = String.fromCodePoint(cp - 0x1D622 + 0x61);
      }
      // Sans-serif Bold Italic A-Z (0x1D63C - 0x1D655) -> A-Z
      else if (cp >= 0x1D63C && cp <= 0x1D655) {
        normalChar = String.fromCodePoint(cp - 0x1D63C + 0x41);
      }
      // Sans-serif Bold Italic a-z (0x1D656 - 0x1D66F) -> a-z
      else if (cp >= 0x1D656 && cp <= 0x1D66F) {
        normalChar = String.fromCodePoint(cp - 0x1D656 + 0x61);
      }
      // Monospace A-Z (0x1D670 - 0x1D689) -> A-Z
      else if (cp >= 0x1D670 && cp <= 0x1D689) {
        normalChar = String.fromCodePoint(cp - 0x1D670 + 0x41);
      }
      // Monospace a-z (0x1D68A - 0x1D6A3) -> a-z
      else if (cp >= 0x1D68A && cp <= 0x1D6A3) {
        normalChar = String.fromCodePoint(cp - 0x1D68A + 0x61);
      }
      // Mathematical Digits Bold (0x1D7CE - 0x1D7D7) -> 0-9 (0x30 - 0x39)
      else if (cp >= 0x1D7CE && cp <= 0x1D7D7) {
        normalChar = String.fromCodePoint(cp - 0x1D7CE + 0x30);
      }
      // Mathematical Digits Double-struck (0x1D7D8 - 0x1D7E1) -> 0-9
      else if (cp >= 0x1D7D8 && cp <= 0x1D7E1) {
        normalChar = String.fromCodePoint(cp - 0x1D7D8 + 0x30);
      }
      // Mathematical Digits Sans-serif (0x1D7E2 - 0x1D7EB) -> 0-9
      else if (cp >= 0x1D7E2 && cp <= 0x1D7EB) {
        normalChar = String.fromCodePoint(cp - 0x1D7E2 + 0x30);
      }
      // Mathematical Digits Sans-serif Bold (0x1D7EC - 0x1D7F5) -> 0-9
      else if (cp >= 0x1D7EC && cp <= 0x1D7F5) {
        normalChar = String.fromCodePoint(cp - 0x1D7EC + 0x30);
      }
      // Mathematical Digits Monospace (0x1D7F6 - 0x1D7FF) -> 0-9
      else if (cp >= 0x1D7F6 && cp <= 0x1D7FF) {
        normalChar = String.fromCodePoint(cp - 0x1D7F6 + 0x30);
      }

      normalizedText += normalChar;
    } else {
      normalizedText += char;
    }
  }

  if (mathStyleCount > 0) {
    foundEvasions.push(`Stylized mathematical variant fonts (${mathStyleCount} characters normalized)`);
  }

  // 3. Detect mixed-script homoglyphs in each word of the normalized text
  const words = normalizedText.split(/\s+/);
  const latinRegex = /[a-zA-Z]/;
  const cyrillicRegex = /[\u0400-\u04FF]/;
  const greekRegex = /[\u0370-\u03FF]/;

  for (const word of words) {
    if (word.length > 2) {
      const hasLatin = latinRegex.test(word);
      const hasCyrillic = cyrillicRegex.test(word);
      const hasGreek = greekRegex.test(word);
      // Mix of scripts is a clear indicator of lookalike homoglyphs (e.g. Paytm with cyrillic 'а')
      if ((hasLatin && hasCyrillic) || (hasLatin && hasGreek) || (hasCyrillic && hasGreek)) {
        homoglyphsCount++;
      }
    }
  }

  if (homoglyphsCount > 0) {
    foundEvasions.push(`Mixed-script lookalike homoglyphs (${homoglyphsCount} words containing Latin + Cyrillic/Greek matches)`);
  }

  return {
    normalized: normalizedText,
    zeroWidthCount,
    mathStyleCount,
    homoglyphsCount,
    foundEvasions
  };
}

const parseDomain = (urlStr: string): string => {
  try {
    let formattedUrl = urlStr;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }
    const urlObj = new URL(formattedUrl);
    return urlObj.hostname.toLowerCase();
  } catch (e) {
    // Regex fallback
    const match = urlStr.match(/(?:https?:\/\/)?([^\/\s]+)/i);
    return match ? match[1].toLowerCase() : '';
  }
};

const analyzeDomainHeuristics = (urlStr: string): DomainHeuristics => {
  const domain = parseDomain(urlStr);
  const isRawIp = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(domain);
  const subdomains = domain.split('.');
  const cleanSubdomains = subdomains.filter(s => s !== 'www');
  const subdomainCount = cleanSubdomains.length;
  const hasSubdomainSpam = subdomainCount > 3;

  let hasBrandAbuse = false;
  let abusedBrand = '';

  for (const [brand, officialDomains] of Object.entries(OFFICIAL_BRANDS)) {
    if (domain.includes(brand)) {
      const isOfficial = officialDomains.some(offDom => {
        return domain === offDom || domain.endsWith('.' + offDom);
      });
      if (!isOfficial) {
        hasBrandAbuse = true;
        abusedBrand = brand;
        break;
      }
    }
  }

  const isInsecure = urlStr.toLowerCase().startsWith('http://');

  return {
    domain,
    hasBrandAbuse,
    abusedBrand,
    hasSubdomainSpam,
    subdomainCount,
    isInsecure,
    isRawIp
  };
};

export default function SpamChecker({ lang }: Props) {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [aiVerdict, setAiVerdict] = useState<AiVerdict | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'checking' | 'done' | 'unavailable'>('idle');
  const [dictating, setDictating] = useState<{ on: boolean; lang: 'en-IN' | 'hi-IN' }>({ on: false, lang: 'en-IN' });
  const content = CONTENT[lang];

  const extractUrls = (text: string): string[] => {
    // Match URLs starting with http/https or plain domains ending with common TLDs to catch sneaky URLs
    const urlRegex = /((?:https?:\/\/)[^\s]+)|((?:[a-zA-Z0-9-]+\.)+(?:com|in|org|net|xyz|club|live|info|top|site|vip|cc|tk|ml|ga|cf|gq)(?:\/[^\s]*)?)/gi;
    const matches = text.match(urlRegex) || [];
    // Deduplicate and filter out simple domains without paths or schemas that are just common text abbreviations
    return Array.from(new Set(matches)).map(url => {
      // Auto-append protocol if missing for display/heuristic purposes
      if (!/^https?:\/\//i.test(url)) {
        return 'http://' + url;
      }
      return url;
    });
  };

  const extractSubject = (text: string): string => {
    const subjectMatch = text.match(/subject:?\s*(.+)/i);
    return subjectMatch ? subjectMatch[1].trim() : '';
  };

  const extractSender = (text: string): string => {
    const fromMatch = text.match(/from:?\s*(.+)/i);
    return fromMatch ? fromMatch[1].trim() : '';
  };

  const handleCheck = async () => {
    if (!input.trim()) return;

    setIsChecking(true);
    setResult(null);
    setAiVerdict(null);
    setAiStatus('checking');

    // Deep AI analysis runs server-side in parallel with the instant
    // on-device heuristics below; the panel updates when it returns.
    fetch(apiUrl('/api/check-spam'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        // Only surface the panel for genuine AI verdicts — the rule-engine
        // fallback adds nothing beyond the local heuristics already shown.
        if (data && data.engine === 'ai') {
          setAiVerdict(data as AiVerdict);
          setAiStatus('done');
        } else {
          setAiStatus('unavailable');
        }
      })
      .catch(() => setAiStatus('unavailable'));

    // Deobfuscation step
    const { normalized, zeroWidthCount, mathStyleCount, homoglyphsCount, foundEvasions } = normalizeUnicodeText(input);

    const text = normalized.toLowerCase();
    const originalText = input;

    const isPhoneOnly = /^[\d\s\-\+\(\)]+$/.test(input.trim());
    const hasSubject = /subject:/i.test(input);
    const type: 'phone' | 'email' | 'sms' = isPhoneOnly ? 'phone' : hasSubject ? 'email' : 'sms';

    const subject = extractSubject(originalText);
    const sender = extractSender(originalText);
    const foundUrls = extractUrls(originalText);

    // Core scam indicators
    const scamKeywords = [
      'congratulations', 'winner', 'won', 'lottery', 'prize', 'jackpot', 'lucky',
      'selected', 'chosen', 'award', 'lakh', 'crore', 'million', 'claim now',
      'kyc', 'verify account', 'suspended', 'blocked', 'deactivated', 'expired',
      'update details', 'confirm identity', 'reactivate', 'bank alert',
      'urgent', 'immediately', 'expire', 'within 24 hours', 'last chance',
      'act now', 'limited time', 'hurry', 'fast', 'today only', 'deadline',
      'refund', 'penalty', 'fine', 'legal action', 'court', 'arrest', 'warrant',
      'tax', 'outstanding', 'payment failed', 'dues',
      'parcel', 'courier', 'customs', 'delivery failed', 'shipment', 'package',
      'clearance fee', 'customs duty',
      'guaranteed returns', 'risk-free', 'double money', 'instant profit',
      'trading', 'forex', 'cryptocurrency', 'bitcoin investment',
      'work from home', 'earn daily', 'part time job', 'easy money',
      'registration fee', 'training fee',
      'lonely', 'friendship', 'meet me', 'video call', 'dating',
      'virus detected', 'computer infected', 'security alert', 'microsoft support',
      'income tax', 'aadhar', 'pan card', 'election commission', 'rbi',
      'click here', 'tap here', 'open link', 'download', 'install app'
    ];

    let riskScore = 0;
    const foundKeywords: string[] = [];
    const suspiciousPatterns: string[] = [];

    // 1. Unicode bypass risk increments
    if (zeroWidthCount > 0) {
      riskScore += 25;
      suspiciousPatterns.push(`Zero-width character padding detected (Evasion technique)`);
    }
    if (mathStyleCount > 0) {
      riskScore += 25;
      suspiciousPatterns.push(`Stylized Math font evasion detected (Evasion technique)`);
    }
    if (homoglyphsCount > 0) {
      riskScore += 35;
      suspiciousPatterns.push(`Mixed-script lookalike letters (Homoglyph spoofing threat)`);
    }

    // 2. Keyword scans (against deobfuscated normalized text!)
    for (const keyword of scamKeywords) {
      if (text.includes(keyword)) {
        riskScore += 15;
        foundKeywords.push(keyword);
      }
    }

    // 3. Prize / Lottery pattern
    const lotteryWords = ['lottery', 'won', 'winner', 'prize', 'jackpot', 'lucky draw'];
    const hasLottery = lotteryWords.some(word => text.includes(word));
    if (hasLottery) {
      riskScore += 30;
      suspiciousPatterns.push('High-risk lottery/prize bait sequence matched');
    }

    // 4. Urgency
    const urgencyWords = ['urgent', 'immediately', 'expire', '24 hours', 'today', 'now', 'hurry', 'fast'];
    const hasUrgency = urgencyWords.some(word => text.includes(word));
    if (hasUrgency) {
      riskScore += 20;
      suspiciousPatterns.push('Pressure tactic (psychological urgency threat)');
    }

    // 5. Financial triggers
    const moneyWords = ['₹', 'rupees', 'rs.', 'lakh', 'crore', 'dollar', '$', '£', '€', 'prize', 'reward', 'cash'];
    const hasMoney = moneyWords.some(word => text.includes(word));
    if (hasMoney) {
      riskScore += 15;
      suspiciousPatterns.push('Financial disbursement or fee request detected');
    }

    // 6. Sender/Subject issues
    if (sender) {
      const suspiciousDomains = ['unknown', 'noreply', 'lottery', 'prize', 'winner', 'claim', 'verify', 'update'];
      const hasSuspiciousSender = suspiciousDomains.some(domain => sender.toLowerCase().includes(domain));
      if (hasSuspiciousSender) {
        riskScore += 30;
        suspiciousPatterns.push(`High-threat sender metadata matching: "${sender}"`);
      }
    }
    if (subject) {
      const suspiciousSubjects = ['won', 'winner', 'urgent', 'verify', 'suspended', 'claim', 'kyc', 'alert'];
      const hasSuspiciousSubject = suspiciousSubjects.some(word => subject.toLowerCase().includes(word));
      if (hasSuspiciousSubject) {
        riskScore += 20;
        suspiciousPatterns.push(`Suspicious header subject: "${subject}"`);
      }
    }

    // 7. Excessive punctuation or caps
    if (/!!!|!!!!/.test(text)) {
      riskScore += 10;
    }
    const capsWords = originalText.match(/\b[A-Z]{4,}\b/g);
    if (capsWords && capsWords.length > 3) {
      riskScore += 10;
    }

    // 8. URL Heuristic assessments
    const urlAnalysisList = foundUrls.map(url => {
      const heuristics = analyzeDomainHeuristics(url);
      
      // Increment risk based on domain analysis
      if (heuristics.hasBrandAbuse) {
        riskScore += 45;
        suspiciousPatterns.push(`Domain impersonates trusted brand [${heuristics.abusedBrand}] -> "${heuristics.domain}"`);
      }
      if (heuristics.isRawIp) {
        riskScore += 35;
        suspiciousPatterns.push(`Server reference relies on a direct numeric IP address: "${heuristics.domain}"`);
      }
      if (heuristics.hasSubdomainSpam) {
        riskScore += 25;
        suspiciousPatterns.push(`Extremely complex subdomain stacking (${heuristics.subdomainCount} subdomains)`);
      }
      if (heuristics.isInsecure) {
        riskScore += 15;
        suspiciousPatterns.push(`Unencrypted and insecure link structure: "${url}"`);
      }

      return {
        url,
        domain: heuristics.domain,
        heuristics,
        phishRocksStatus: 'checking' as const
      };
    });

    riskScore = Math.min(riskScore, 100);

    let verdict: 'SAFE' | 'SUSPICIOUS' | 'SPAM' = 'SAFE';
    let message = '';

    if (riskScore >= 75) {
      verdict = 'SPAM';
      message = lang === 'en'
        ? '🚨 CRITICAL MALICIOUS VERDICT! Threat signature matched scam, evasion attempt or brand abuse. Do NOT interact or click links.'
        : '🚨 अत्यंत खतरनाक धोखाधड़ी संदेश! सुरक्षा अलर्ट: संदेश में स्कैम या संदेहास्पद कोड है। किसी लिंक पर क्लिक न करें।';
    } else if (riskScore >= 40) {
      verdict = 'SUSPICIOUS';
      message = lang === 'en'
        ? '⚠️ SUSPICIOUS context indicators matched. Evasion or suspicious links present. Verify the sender through trusted offline sources.'
        : '⚠️ संदेहास्पद सामग्री का पता चला। किसी भी प्रकार की वित्तीय गतिविधि से पहले प्रेषक को अवश्य सत्यापित करें।';
    } else {
      verdict = 'SAFE';
      message = lang === 'en'
        ? '✅ Safe signature. No critical lookalike glyphs or standard phishing indicators detected.'
        : '✅ कोई बड़ा खतरा नहीं पाया गया। हालांकि, संवेदनशील जानकारी साझा करते समय हमेशा सतर्क रहें।';
    }

    const actions = riskScore >= 75 ? [
      lang === 'en' ? '🚫 Absolutely DO NOT reply to this message/sender' : '🚫 प्रेषक को बिल्कुल भी जवाब न दें',
      lang === 'en' ? '🚫 DO NOT click any of the extracted links' : '🚫 किसी भी लिंक पर क्लिक न करें',
      lang === 'en' ? '🚫 Never reveal OTPs, passwords, UPI PINs, or card credentials' : '🚫 OTP, पासवर्ड, UPI पिन या कार्ड नंबर साझा न करें',
      lang === 'en' ? '📧 Delete this message immediately to prevent accidental activation' : '📧 दुर्घटना से बचने के लिए इसे तुरंत हटा दें',
      lang === 'en' ? '📞 Report the sender details to official cybercrime cell (Helpline: 1930)' : '📞 आधिकारिक साइबर हेल्पलाइन 1930 पर रिपोर्ट करें'
    ] : riskScore >= 40 ? [
      lang === 'en' ? '🔍 Double check domain registrations and certificates' : '🔍 डोमेन पंजीकरण और प्रमाणपत्र की दोबारा जांच करें',
      lang === 'en' ? '🚫 Guard private information from being sent' : '🚫 निजी जानकारी भेजने से बचें',
      lang === 'en' ? '🔗 Inspect the visual details of links before tapping' : '🔗 टैप करने से पहले लिंक के विवरण को ध्यान से देखें',
      lang === 'en' ? '⏰ Refuse to be rushed by artificial urgency prompts' : '⏰ दबाव और जल्दी वाले संकेतों को अनदेखा करें'
    ] : [
      lang === 'en' ? '✓ Standard vigilance is recommended for any external input' : '✓ किसी भी बाहरी संदेश के लिए सामान्य सतर्कता रखें',
      lang === 'en' ? '✓ Check sender identity if high value action is requested' : '✓ महत्वपूर्ण कार्रवाई का अनुरोध होने पर प्रेषक की जांच करें'
    ];

    const initialResult: CheckResult = {
      verdict,
      riskScore,
      message,
      type,
      indicators: {
        hasScamKeywords: foundKeywords.length > 0,
        hasPhoneNumber: /\d{10}/.test(originalText),
        hasLink: foundUrls.length > 0,
        hasUrgency,
        hasMoney,
        hasLottery,
        hasSuspiciousSender: !!sender,
        foundKeywords,
        foundUrls,
        suspiciousPatterns,
        zeroWidthCount,
        mathStyleCount,
        homoglyphsCount,
        foundEvasions
      },
      actions,
      details: {
        subject,
        urlCount: foundUrls.length,
        urgencyLevel: riskScore >= 75 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'
      },
      urlAnalysis: urlAnalysisList
    };

    setResult(initialResult);
    setIsChecking(false);

    // 9. Fire off background live api.phish.rocks checks!
    if (urlAnalysisList.length > 0) {
      urlAnalysisList.forEach(async (item, idx) => {
        try {
          const checkRes = await fetch(`https://api.phish.rocks/check?domain=${encodeURIComponent(item.domain)}`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            // standard phish.rocks check schema: { "phishing": true }
            const isPhish = !!(data.phishing || data.status === 'phishing' || data.match);
            
            setResult(prev => {
              if (!prev || !prev.urlAnalysis) return prev;
              const updatedAnalysis = [...prev.urlAnalysis];
              if (updatedAnalysis[idx]) {
                updatedAnalysis[idx] = {
                  ...updatedAnalysis[idx],
                  phishRocksStatus: isPhish ? 'phishing' : 'clean'
                };
              }

              let newRisk = prev.riskScore;
              let newVerdict = prev.verdict;
              let newMsg = prev.message;
              const updatedPatterns = [...prev.indicators.suspiciousPatterns];

              if (isPhish) {
                newRisk = 100;
                newVerdict = 'SPAM';
                newMsg = lang === 'en'
                  ? `🚨 DOMAIN BLACKLIST BLOCK! Live phish.rocks engine verified domain "${item.domain}" is active phishing.`
                  : `🚨 ब्लैकलिस्टेड डोमेन ब्लॉक! लाइव phish.rocks डेटाबेस ने "${item.domain}" को फ़िशिंग डोमेन घोषित किया है।`;
                if (!updatedPatterns.includes(`Phish.rocks Blacklisted Domain: ${item.domain}`)) {
                  updatedPatterns.push(`Phish.rocks Blacklisted Domain: ${item.domain}`);
                }
              }

              return {
                ...prev,
                riskScore: newRisk,
                verdict: newVerdict,
                message: newMsg,
                indicators: {
                  ...prev.indicators,
                  suspiciousPatterns: updatedPatterns
                },
                urlAnalysis: updatedAnalysis
              };
            });
          } else {
            throw new Error('API failed');
          }
        } catch (e) {
          // Gracefully fallback to heuristics without breaking the UI
          setResult(prev => {
            if (!prev || !prev.urlAnalysis) return prev;
            const updatedAnalysis = [...prev.urlAnalysis];
            if (updatedAnalysis[idx]) {
              updatedAnalysis[idx] = {
                ...updatedAnalysis[idx],
                phishRocksStatus: 'failed'
              };
            }
            return {
              ...prev,
              urlAnalysis: updatedAnalysis
            };
          });
        }
      });
    }
  };

  const getVerdictStyles = (verdict: string) => {
    if (verdict === 'SAFE') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (verdict === 'SUSPICIOUS') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === 'SAFE') return <CheckCircle className="w-12 h-12 text-emerald-400" />;
    if (verdict === 'SUSPICIOUS') return <AlertTriangle className="w-12 h-12 text-amber-400" />;
    return <XCircle className="w-12 h-12 text-rose-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5 animate-pulse">
          <Mail className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          {content.title}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
          {content.subtitle}
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'en' ? 'Paste or speak the message' : 'संदेश पेस्ट करें या बोलें'}
          </span>
          <VoiceDictationButton
            value={input}
            onChange={setInput}
            idleLabel={lang === 'en' ? 'Speak' : 'बोलें'}
            onListeningChange={(on, l) => setDictating({ on, lang: l })}
          />
        </div>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={content.phonePlaceholder}
            className="w-full h-72 bg-slate-950/70 rounded-xl p-5 text-gray-100 placeholder-slate-500 border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none transition-all duration-300 font-mono text-sm leading-relaxed"
          />
          {input && (
            <button
              onClick={() => setInput('')}
              className="absolute right-4 top-4 text-gray-500 hover:text-white px-2 py-1 bg-slate-800 rounded text-xs"
            >
              Clear
            </button>
          )}
        </div>
        {dictating.on && (
          <p className="text-[11px] text-red-300 -mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            {lang === 'en'
              ? `Listening in ${dictating.lang === 'en-IN' ? 'English' : 'Hindi'}… speak now. Tap “Stop” when done.`
              : `${dictating.lang === 'en-IN' ? 'अंग्रेज़ी' : 'हिंदी'} में सुन रहे हैं… अब बोलें। पूरा होने पर "Stop" दबाएं।`}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={isChecking || !input.trim()}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
              {content.checking}
            </span>
          ) : (
            content.checkButton
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

          {/* ── AI deep-analysis verdict ── */}
          {aiStatus === 'checking' && (
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 flex items-center gap-3">
              <Brain className="w-6 h-6 text-violet-400 animate-pulse shrink-0" />
              <p className="text-sm text-violet-200">
                {lang === 'en'
                  ? 'AI is reading the message (understands Hindi, Hinglish & disguised text)…'
                  : 'AI संदेश पढ़ रहा है (हिंदी, हिंग्लिश और छिपा टेक्स्ट समझता है)…'}
              </p>
            </div>
          )}
          {aiVerdict && (
            <div className={`rounded-2xl border-2 p-6 ${aiVerdict.spam
              ? 'bg-rose-500/10 border-rose-500/50'
              : 'bg-emerald-500/10 border-emerald-500/40'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Brain className={`w-7 h-7 ${aiVerdict.spam ? 'text-rose-400' : 'text-emerald-400'}`} />
                <h3 className="font-black text-lg">
                  {lang === 'en' ? 'AI Verdict' : 'AI निर्णय'}
                </h3>
                <span className={`ml-auto text-sm font-black px-3 py-1 rounded-full ${aiVerdict.spam
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {aiVerdict.score}/100 · {aiVerdict.threatType?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-gray-100 font-semibold mb-3">{aiVerdict.message}</p>
              {aiVerdict.reasons?.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {aiVerdict.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${aiVerdict.spam ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              {aiVerdict.recommendation && (
                <p className={`text-sm font-semibold rounded-lg p-3 ${aiVerdict.spam
                  ? 'bg-rose-950/40 text-rose-200'
                  : 'bg-emerald-950/40 text-emerald-200'}`}>
                  {aiVerdict.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Warning disclaimer */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 backdrop-blur rounded-xl p-4 flex gap-3 items-center">
            <ShieldAlert className="w-6 h-6 text-cyan-400 flex-shrink-0" />
            <p className="text-sm text-cyan-200">
              {content.disclaimer}
            </p>
          </div>

          {/* Core Verdict Box */}
          <div className={`backdrop-blur rounded-2xl border-2 p-8 ${getVerdictStyles(result.verdict)} shadow-2xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
              <div className="flex items-center gap-4">
                {getVerdictIcon(result.verdict)}
                <div>
                  <h3 className="text-3xl font-black tracking-tight">{result.verdict}</h3>
                  <p className="text-sm opacity-80 mt-1">
                    {content.riskScore}: <span className="font-bold font-mono text-base">{result.riskScore}%</span>
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-64 bg-slate-950/50 rounded-full h-3 overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.verdict === 'SAFE' ? 'bg-emerald-500' : result.verdict === 'SUSPICIOUS' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
            <hr className="my-6 border-white/10" />
            <p className="text-lg font-medium leading-relaxed">{result.message}</p>
          </div>

          {/* Evasion Techniques Blocked */}
          {result.indicators.foundEvasions.length > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 space-y-4">
              <h4 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                {content.evasionsDetected}:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.indicators.foundEvasions.map((evasion, i) => (
                  <li key={i} className="flex items-center gap-3 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping flex-shrink-0" />
                    <span className="text-sm text-purple-200">{evasion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* URL Intelligence Map */}
          {result.urlAnalysis && result.urlAnalysis.length > 0 && (
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-6">
              <h4 className="text-xl font-bold flex items-center gap-2 text-indigo-300">
                <LinkIcon className="w-6 h-6" />
                {content.foundUrls}:
              </h4>
              <div className="space-y-4">
                {result.urlAnalysis.map((item, i) => (
                  <div key={i} className="bg-slate-950/80 rounded-xl p-5 border border-white/5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="font-mono text-sm break-all text-cyan-400">
                        {item.url}
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-shrink-0">
                        <span className="text-gray-400">Real-time DB:</span>
                        {item.phishRocksStatus === 'checking' && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                          </span>
                        )}
                        {item.phishRocksStatus === 'clean' && (
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold flex items-center gap-1">
                            ✓ Verified Clean
                          </span>
                        )}
                        {item.phishRocksStatus === 'phishing' && (
                          <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full font-black animate-bounce flex items-center gap-1">
                            ⚠️ Phishing Blocked
                          </span>
                        )}
                        {item.phishRocksStatus === 'failed' && (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
                            Checked (Offline)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-900 rounded p-2.5 border border-white/5 space-y-1">
                        <div className="text-gray-500">Domain impersonation</div>
                        <div className={`font-semibold ${item.heuristics.hasBrandAbuse ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.heuristics.hasBrandAbuse ? `Abusing brand [${item.heuristics.abusedBrand}]` : 'Clean'}
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded p-2.5 border border-white/5 space-y-1">
                        <div className="text-gray-500">Protocol encryption</div>
                        <div className={`font-semibold ${item.heuristics.isInsecure ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.heuristics.isInsecure ? 'Insecure HTTP' : 'Secure HTTPS'}
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded p-2.5 border border-white/5 space-y-1">
                        <div className="text-gray-500">Subdomain depth</div>
                        <div className={`font-semibold ${item.heuristics.hasSubdomainSpam ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.heuristics.subdomainCount} subdomains
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded p-2.5 border border-white/5 space-y-1">
                        <div className="text-gray-500">Numeric host</div>
                        <div className={`font-semibold ${item.heuristics.isRawIp ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.heuristics.isRawIp ? 'Raw IP server host' : 'Named domain'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heuristic Warnings */}
          {result.indicators.suspiciousPatterns.length > 0 && (
            <div className="bg-rose-900/10 border border-rose-500/20 backdrop-blur rounded-2xl p-6 space-y-4">
              <h4 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                {content.suspiciousPatterns}:
              </h4>
              <ul className="space-y-3">
                {result.indicators.suspiciousPatterns.map((pattern, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                    <span className="text-gray-300 font-medium">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Directives/What to do */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xl font-bold flex items-center gap-2 text-cyan-300">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              {content.whatToDo}:
            </h4>
            <ul className="space-y-3">
              {result.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-950/40 rounded-xl p-3 border border-white/5">
                  <span className="text-cyan-400 font-bold font-mono text-sm">{i + 1}.</span>
                  <span className="text-gray-300 text-sm leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => { setResult(null); setInput(''); setAiVerdict(null); setAiStatus('idle'); }}
            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all duration-300 border border-white/10 active:scale-[0.99]"
          >
            {content.checkAnother}
          </button>
        </div>
      )}
    </div>
  );
}