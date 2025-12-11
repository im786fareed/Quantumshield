'use client';

import { Phone, AlertTriangle, CheckCircle, XCircle, Mail, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
  lang: 'en' | 'hi';
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
  };
  actions: string[];
  details?: {
    subject?: string;
    urlCount?: number;
    urgencyLevel?: string;
  };
}

const CONTENT = {
  en: {
    title: 'AI Email & SMS Spam Detector',
    subtitle: 'Paste full email or message for deep content analysis',
    phonePlaceholder: 'Paste complete email (subject + body) or SMS message here...\n\nExample:\nSubject: You Won 50 Lakh!\nFrom: lottery@unknown.com\n\nDear Winner, Click here to claim...',
    checkButton: 'AI Analyze Email',
    checking: 'AI analyzing content...',
    result: 'AI Analysis Result',
    riskScore: 'Spam Probability',
    indicators: 'Detected Red Flags',
    whatToDo: 'Recommended Actions',
    checkAnother: 'Analyze Another',
    disclaimer: 'AI-powered content analysis. Checks email text, URLs, sender patterns, and scam indicators.',
    foundUrls: 'URLs Found in Email',
    suspiciousPatterns: 'Warning Signs'
  },
  hi: {
    title: 'AI ईमेल और SMS स्पैम डिटेक्टर',
    subtitle: 'गहन सामग्री विश्लेषण के लिए पूरा ईमेल पेस्ट करें',
    phonePlaceholder: 'पूरा ईमेल (विषय + संदेश) या SMS यहां पेस्ट करें...',
    checkButton: 'AI विश्लेषण करें',
    checking: 'AI विश्लेषण हो रहा है',
    result: 'AI विश्लेषण परिणाम',
    riskScore: 'स्पैम संभावना',
    indicators: 'खोजे गए खतरे',
    whatToDo: 'अनुशंसित कार्रवाई',
    checkAnother: 'फिर विश्लेषण करें',
    disclaimer: 'AI संचालित सामग्री विश्लेषण। ईमेल टेक्स्ट, URL, प्रेषक पैटर्न जांचता है।',
    foundUrls: 'ईमेल में मिले URL',
    suspiciousPatterns: 'चेतावनी संकेत'
  }
};

export default function SpamChecker({ lang }: Props) {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const content = CONTENT[lang];

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
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

    await new Promise(resolve => setTimeout(resolve, 1500));

    const text = input.toLowerCase();
    const originalText = input;
    
    const isPhoneOnly = /^[\d\s\-\+\(\)]+$/.test(input.trim());
    const hasSubject = /subject:/i.test(input);
    const type: 'phone' | 'email' | 'sms' = isPhoneOnly ? 'phone' : hasSubject ? 'email' : 'sms';

    const subject = extractSubject(originalText);
    const sender = extractSender(originalText);
    const foundUrls = extractUrls(originalText);

    // ENHANCED SCAM KEYWORDS
    const scamKeywords = [
      // Lottery & Prize scams
      'congratulations', 'winner', 'won', 'lottery', 'prize', 'jackpot', 'lucky',
      'selected', 'chosen', 'award', 'lakh', 'crore', 'million', 'claim now',
      
      // Banking & KYC scams
      'kyc', 'verify account', 'suspended', 'blocked', 'deactivated', 'expired',
      'update details', 'confirm identity', 'reactivate', 'bank alert',
      
      // Urgency tactics
      'urgent', 'immediately', 'expire', 'within 24 hours', 'last chance',
      'act now', 'limited time', 'hurry', 'fast', 'today only', 'deadline',
      
      // Financial threats
      'refund', 'penalty', 'fine', 'legal action', 'court', 'arrest', 'warrant',
      'tax', 'outstanding', 'payment failed', 'dues',
      
      // Fake delivery
      'parcel', 'courier', 'customs', 'delivery failed', 'shipment', 'package',
      'clearance fee', 'customs duty',
      
      // Investment scams
      'guaranteed returns', 'risk-free', 'double money', 'instant profit',
      'trading', 'forex', 'cryptocurrency', 'bitcoin investment',
      
      // Job scams
      'work from home', 'earn daily', 'part time job', 'easy money',
      'registration fee', 'training fee',
      
      // Dating & loneliness scams
      'lonely', 'friendship', 'meet me', 'video call', 'dating',
      
      // Tech support scams
      'virus detected', 'computer infected', 'security alert', 'microsoft support',
      
      // Government impersonation
      'income tax', 'aadhar', 'pan card', 'election commission', 'rbi',
      
      // Click baits
      'click here', 'tap here', 'open link', 'download', 'install app'
    ];

    let riskScore = 0;
    const foundKeywords: string[] = [];
    const suspiciousPatterns: string[] = [];

    // KEYWORD DETECTION (20 points each for critical keywords)
    for (const keyword of scamKeywords) {
      if (text.includes(keyword)) {
        riskScore += 15;
        foundKeywords.push(keyword);
      }
    }

    // LOTTERY/PRIZE DETECTION (Critical - 30 points)
    const lotteryWords = ['lottery', 'won', 'winner', 'prize', 'jackpot', 'lucky draw'];
    const hasLottery = lotteryWords.some(word => text.includes(word));
    if (hasLottery) {
      riskScore += 30;
      suspiciousPatterns.push('Lottery/Prize scam pattern detected');
    }

    // URL ANALYSIS (25 points per suspicious URL)
    const hasLink = foundUrls.length > 0;
    if (hasLink) {
      for (const url of foundUrls) {
        const lowerUrl = url.toLowerCase();
        
        // Suspicious URL patterns
        if (lowerUrl.includes('bit.ly') || lowerUrl.includes('tinyurl') || 
            lowerUrl.includes('short') || lowerUrl.includes('tiny')) {
          riskScore += 25;
          suspiciousPatterns.push(`Shortened URL: ${url}`);
        }
        
        // Legitimate domains with spam content
        if (lowerUrl.includes('mail.google.com') || lowerUrl.includes('outlook')) {
          suspiciousPatterns.push('Email contains link to email service (check content carefully)');
        }
        
        // Suspicious domains
        if (!lowerUrl.includes('https://')) {
          riskScore += 15;
          suspiciousPatterns.push(`Insecure URL (no HTTPS): ${url}`);
        }
      }
    }

    // PHONE NUMBER DETECTION (10 points)
    const hasPhoneNumber = /\d{10}/.test(text);
    if (hasPhoneNumber && type === 'email') {
      riskScore += 10;
      suspiciousPatterns.push('Unusual phone number in email body');
    }

    // URGENCY DETECTION (25 points)
    const urgencyWords = ['urgent', 'immediately', 'expire', '24 hours', 'today', 'now', 'hurry', 'fast'];
    const hasUrgency = urgencyWords.some(word => text.includes(word));
    if (hasUrgency) {
      riskScore += 25;
      suspiciousPatterns.push('Urgency tactics detected (pressure to act quickly)');
    }

    // MONEY MENTIONS (25 points)
    const moneyWords = ['₹', 'rupees', 'rs.', 'lakh', 'crore', 'dollar', '$', '£', '€', 'prize', 'reward', 'cash'];
    const hasMoney = moneyWords.some(word => text.includes(word));
    if (hasMoney) {
      riskScore += 20;
      suspiciousPatterns.push('Financial amount mentioned');
    }

    // SENDER ANALYSIS (30 points for suspicious sender)
    let hasSuspiciousSender = false;
    if (sender) {
      const suspiciousDomains = ['unknown', 'noreply', 'lottery', 'prize', 'winner', 'claim'];
      hasSuspiciousSender = suspiciousDomains.some(domain => sender.toLowerCase().includes(domain));
      if (hasSuspiciousSender) {
        riskScore += 30;
        suspiciousPatterns.push(`Suspicious sender: ${sender}`);
      }
    }

    // SUBJECT ANALYSIS
    if (subject) {
      const suspiciousSubjects = ['won', 'winner', 'urgent', 'verify', 'suspended', 'claim'];
      const hasSuspiciousSubject = suspiciousSubjects.some(word => subject.toLowerCase().includes(word));
      if (hasSuspiciousSubject) {
        riskScore += 20;
        suspiciousPatterns.push(`Suspicious subject line: "${subject}"`);
      }
    }

    // MULTIPLE EXCLAMATION MARKS (10 points)
    if (/!!!|!!!!/.test(text)) {
      riskScore += 10;
      suspiciousPatterns.push('Excessive punctuation (!!!)');
    }

    // ALL CAPS TEXT (15 points)
    const capsWords = text.match(/\b[A-Z]{4,}\b/g);
    if (capsWords && capsWords.length > 3) {
      riskScore += 15;
      suspiciousPatterns.push('Excessive capitalization');
    }

    riskScore = Math.min(riskScore, 100);

    let verdict: 'SAFE' | 'SUSPICIOUS' | 'SPAM' = 'SAFE';
    let message = '';

    if (riskScore >= 70) {
      verdict = 'SPAM';
      message = lang === 'en' 
        ? '🚨 HIGH SPAM PROBABILITY! This is likely a scam. Do NOT respond, click links, or share information.'
        : '🚨 उच्च स्पैम संभावना! यह संभवतः एक स्कैम है। जवाब न दें, लिंक न क्लिक करें।';
    } else if (riskScore >= 40) {
      verdict = 'SUSPICIOUS';
      message = lang === 'en'
        ? '⚠️ SUSPICIOUS content detected. Multiple red flags found. Verify sender through official channels before taking action.'
        : '⚠️ संदिग्ध सामग्री मिली। कोई कार्रवाई से पहले प्रेषक को सत्यापित करें।';
    } else {
      verdict = 'SAFE';
      message = lang === 'en'
        ? '✅ No major spam indicators detected. However, always verify sender identity and avoid clicking suspicious links.'
        : '✅ कोई बड़ा स्पैम संकेत नहीं मिला। हालांकि, हमेशा प्रेषक को सत्यापित करें।';
    }

    const actions = riskScore >= 70 ? [
      lang === 'en' ? '🚫 DO NOT respond to this email/message' : '🚫 इस ईमेल का जवाब न दें',
      lang === 'en' ? '🚫 DO NOT click any links' : '🚫 किसी भी लिंक पर क्लिक न करें',
      lang === 'en' ? '🚫 DO NOT share OTP, password, or banking details' : '🚫 OTP, पासवर्ड साझा न करें',
      lang === 'en' ? '📧 Mark as spam and delete immediately' : '📧 स्पैम के रूप में चिह्नित करें',
      lang === 'en' ? '📞 Report to 1930 (cybercrime helpline)' : '📞 1930 पर रिपोर्ट करें',
      lang === 'en' ? '⚠️ Warn others who received similar messages' : '⚠️ अन्य लोगों को चेतावनी दें'
    ] : riskScore >= 40 ? [
      lang === 'en' ? '🔍 Verify sender through official website/phone' : '🔍 आधिकारिक वेबसाइट से सत्यापित करें',
      lang === 'en' ? '🚫 Do not share sensitive information' : '🚫 संवेदनशील जानकारी साझा न करें',
      lang === 'en' ? '🔗 Check URLs carefully before clicking' : '🔗 क्लिक से पहले URL जांचें',
      lang === 'en' ? '📧 Contact organization directly if urgent' : '📧 संगठन से सीधे संपर्क करें',
      lang === 'en' ? '⏰ Ignore pressure tactics and urgency' : '⏰ दबाव रणनीति को अनदेखा करें'
    ] : [
      lang === 'en' ? '✓ Still verify sender for important requests' : '✓ महत्वपूर्ण अनुरोधों को सत्यापित करें',
      lang === 'en' ? '✓ Never share OTP or passwords via email/SMS' : '✓ कभी भी OTP या पासवर्ड साझा न करें',
      lang === 'en' ? '✓ Be cautious with links even from known senders' : '✓ ज्ञात प्रेषकों के लिंक से भी सावधान रहें'
    ];

    setResult({
      verdict,
      riskScore,
      message,
      type,
      indicators: {
        hasScamKeywords: foundKeywords.length > 0,
        hasPhoneNumber,
        hasLink,
        hasUrgency,
        hasMoney,
        hasLottery,
        hasSuspiciousSender,
        foundKeywords,
        foundUrls,
        suspiciousPatterns
      },
      actions,
      details: {
        subject,
        urlCount: foundUrls.length,
        urgencyLevel: riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'
      }
    });
    setIsChecking(false);
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'SAFE') return 'text-green-400 bg-green-500/20 border-green-500/50';
    if (verdict === 'SUSPICIOUS') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    return 'text-red-400 bg-red-500/20 border-red-500/50';
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === 'SAFE') return <CheckCircle className="w-12 h-12 text-green-400" />;
    if (verdict === 'SUSPICIOUS') return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
    return <XCircle className="w-12 h-12 text-red-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4">
          <Mail className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400 text-lg">{content.subtitle}</p>
      </div>

      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={content.phonePlaceholder}
          className="w-full h-64 bg-black/30 rounded-xl p-4 text-white placeholder-gray-500 border border-white/10 focus:border-cyan-400 focus:outline-none resize-none mb-4 font-mono text-sm"
        />

        <button
          onClick={handleCheck}
          disabled={isChecking || !input.trim()}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? content.checking : content.checkButton}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="bg-yellow-600/20 backdrop-blur rounded-xl border border-yellow-500/50 p-4">
            <p className="text-sm text-yellow-200">
              <span className="font-bold">⚠️</span> {content.disclaimer}
            </p>
          </div>

          <div className={`backdrop-blur rounded-2xl border-2 p-8 ${getVerdictColor(result.verdict)}`}>
            <div className="flex items-center gap-4 mb-4">
              {getVerdictIcon(result.verdict)}
              <div>
                <h3 className="text-3xl font-bold">{result.verdict}</h3>
                <p className="text-lg opacity-90">{content.riskScore}: {result.riskScore}%</p>
              </div>
            </div>
            <p className="text-xl">{result.message}</p>
          </div>

          {result.details && (
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
              <h4 className="text-xl font-bold mb-4">Analysis Details:</h4>
              <div className="space-y-2 text-gray-300">
                {result.details.subject && (
                  <p><span className="font-bold">Subject:</span> {result.details.subject}</p>
                )}
                <p><span className="font-bold">URLs Found:</span> {result.details.urlCount}</p>
                <p><span className="font-bold">Threat Level:</span> {result.details.urgencyLevel}</p>
              </div>
            </div>
          )}

          {result.indicators.suspiciousPatterns.length > 0 && (
            <div className="bg-red-600/20 backdrop-blur rounded-2xl border border-red-500/50 p-6">
              <h4 className="text-xl font-bold mb-4 text-red-400">{content.suspiciousPatterns}:</h4>
              <ul className="space-y-2">
                {result.indicators.suspiciousPatterns.map((pattern, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.indicators.foundUrls.length > 0 && (
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-6 h-6" />
                {content.foundUrls}:
              </h4>
              <div className="space-y-2">
                {result.indicators.foundUrls.map((url, i) => (
                  <div key={i} className="bg-black/30 rounded p-3 break-all text-sm text-cyan-300 font-mono">
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.indicators.foundKeywords.length > 0 && (
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
              <h4 className="text-xl font-bold mb-4">{content.indicators}:</h4>
              <div className="flex flex-wrap gap-2">
                {result.indicators.foundKeywords.slice(0, 20).map((keyword, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
                {result.indicators.foundKeywords.length > 20 && (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                    +{result.indicators.foundKeywords.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
            <h4 className="text-xl font-bold mb-4">{content.whatToDo}:</h4>
            <ul className="space-y-3">
              {result.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">{i + 1}.</span>
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => { setResult(null); setInput(''); }}
            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
          >
            {content.checkAnother}
          </button>
        </div>
      )}
    </div>
  );
}