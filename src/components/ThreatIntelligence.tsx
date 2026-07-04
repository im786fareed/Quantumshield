'use client';

import { Shield, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface Threat {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  date: string;
  source: string;
  category: string;
}

const CONTENT = {
  en: {
    title: 'Threat Pattern Library',
    subtitle: 'The documented scam patterns QuantumShield checks every scan against',
    protected: 'Detection Patterns',
    howTitle: 'How this library works:',
    how: 'These patterns are built into QuantumShield\'s detection engines — the rule engine that runs on every scan, and the AI engine (when configured) that reads messages the way a fraud investigator would. The library is curated from public advisories (CERT-In, I4C, cybercrime.gov.in) and ships with app updates — it is not a live feed.',
    listTitle: 'Documented Major Scam Patterns',
    documented: 'Documented',
    protection: 'QuantumShield Protection:',
  },
  hi: {
    title: 'खतरा पैटर्न लाइब्रेरी',
    subtitle: 'दस्तावेज़ित स्कैम पैटर्न जिनसे QuantumShield हर स्कैन की जांच करता है',
    protected: 'डिटेक्शन पैटर्न',
    howTitle: 'यह लाइब्रेरी कैसे काम करती है:',
    how: 'ये पैटर्न QuantumShield के डिटेक्शन इंजन में बने हैं — नियम इंजन जो हर स्कैन पर चलता है, और AI इंजन (कॉन्फ़िगर होने पर)। लाइब्रेरी सार्वजनिक सलाह (CERT-In, I4C, cybercrime.gov.in) से बनाई गई है और ऐप अपडेट के साथ आती है — यह लाइव फ़ीड नहीं है।',
    listTitle: 'दस्तावेज़ित प्रमुख स्कैम पैटर्न',
    documented: 'दस्तावेज़ित',
    protection: 'QuantumShield सुरक्षा:',
  }
};

// Number of active detection patterns across textAnalyzer.ts + threatEngine.ts engines
const ACTIVE_PATTERNS = 47;

// Curated from public advisories; shipped with app updates (not a live feed).
const DOCUMENTED_THREATS: Threat[] = [
  {
    id: '1',
    title: 'Digital Arrest Scam via Fake CBI Calls',
    description: 'Scammers impersonating CBI/Police officers claiming arrest warrant, demanding money transfer to "clear charges". Uses video calls to appear legitimate.',
    severity: 'CRITICAL',
    date: '2025-12',
    source: 'I4C / cybercrime.gov.in',
    category: 'Social Engineering'
  },
  {
    id: '2',
    title: 'Fake UPI Cashback APK Distribution',
    description: 'Malicious APK disguised as "UPI Cashback" app spreading via WhatsApp. Steals banking credentials and OTPs.',
    severity: 'CRITICAL',
    date: '2025-12',
    source: 'CERT-In Alert',
    category: 'APK Malware'
  },
  {
    id: '3',
    title: 'Aadhaar Update Verification Scam',
    description: 'SMS claiming Aadhaar will be blocked unless user clicks link to "verify". Link leads to fake UIDAI website stealing personal data.',
    severity: 'HIGH',
    date: '2025-12',
    source: 'Cybercrime.gov.in',
    category: 'Phishing'
  },
  {
    id: '4',
    title: 'Modified WhatsApp App Trojan (GB/Plus)',
    description: 'Modified WhatsApp apps (WhatsApp Plus, GB WhatsApp) containing spyware. Distributed outside Play Store, monitors all messages and calls.',
    severity: 'HIGH',
    date: '2025-12',
    source: 'Public security advisories',
    category: 'APK Malware'
  },
  {
    id: '5',
    title: 'Fake Parcel Delivery SMS Ransomware',
    description: 'SMS claiming package delivery with APK link. Installing encrypts device files and demands ransom.',
    severity: 'CRITICAL',
    date: '2025-12',
    source: 'Public security advisories',
    category: 'Ransomware'
  }
];

export default function ThreatIntelligence(_props?: { lang?: 'en' | 'hi' }) {
  const { lang } = useLanguage();
  const content = CONTENT[lang];

  const getSeverityColor = (severity: string) => {
    if (severity === 'CRITICAL') return 'bg-red-500/20 border-red-500 text-red-400';
    if (severity === 'HIGH') return 'bg-orange-500/20 border-orange-500 text-orange-400';
    return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'APK Malware') return '📱';
    if (category === 'Phishing') return '🎣';
    if (category === 'Social Engineering') return '🎭';
    if (category === 'Ransomware') return '🔒';
    return '⚠️';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-green-500/20 rounded-2xl mb-4">
          <Shield className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400 text-lg">{content.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-900/40 backdrop-blur rounded-2xl border-2 border-green-500 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-green-400" />
            <h3 className="text-lg font-bold text-white">{content.protected}</h3>
          </div>
          <p className="text-5xl font-bold text-green-400 mb-2">{ACTIVE_PATTERNS}</p>
          <p className="text-sm text-gray-300">
            {lang === 'en' ? 'Active detection patterns in engine' : 'इंजन में सक्रिय पहचान पैटर्न'}
          </p>
        </div>

        <div className="bg-red-900/40 backdrop-blur rounded-2xl border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-red-400" />
            <h3 className="text-lg font-bold text-white">
              {lang === 'en' ? 'India 2025–26' : 'भारत 2025–26'}
            </h3>
          </div>
          <p className="text-4xl font-bold text-red-400 mb-2">₹22,495 Cr</p>
          <p className="text-sm text-gray-300">
            {lang === 'en' ? 'Lost to cyber fraud (I4C / MHA)' : 'साइबर धोखाधड़ी में नुकसान (I4C/MHA)'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              {lang === 'en' ? 'Curated Library' : 'क्यूरेटेड लाइब्रेरी'}
            </h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {lang === 'en'
              ? 'Compiled from CERT-In, I4C and cybercrime.gov.in advisories. Updated with app releases — not a live feed.'
              : 'CERT-In, I4C और cybercrime.gov.in की सलाह से संकलित। ऐप रिलीज़ के साथ अपडेट — लाइव फ़ीड नहीं।'}
          </p>
        </div>
      </div>

      {/* Documented Threat Patterns */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {content.listTitle}
        </h3>

        <div className="space-y-4">
          {DOCUMENTED_THREATS.map((threat) => (
            <div
              key={threat.id}
              className={`rounded-xl border-2 p-6 ${getSeverityColor(threat.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{getCategoryIcon(threat.category)}</span>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{threat.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <span>{content.documented}: {threat.date}</span>
                      <span>•</span>
                      <span>{threat.source}</span>
                      <span>•</span>
                      <span className="font-bold">{threat.category}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm ${getSeverityColor(threat.severity)}`}>
                  {threat.severity}
                </div>
              </div>

              <p className="text-gray-200 mb-4">{threat.description}</p>

              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-sm text-green-300">
                  ✅ <strong>{content.protection}</strong>
                  {' '}
                  {lang === 'en'
                    ? `This pattern is in the detection database. ${threat.category === 'APK Malware' ? 'APK Guardian checks for it.' : threat.category === 'Phishing' ? 'URL Checker checks for it.' : 'The message/call analyzers check for it.'}`
                    : `यह पैटर्न डिटेक्शन डेटाबेस में है। ${threat.category === 'APK Malware' ? 'APK Guardian इसकी जांच करता है।' : threat.category === 'Phishing' ? 'URL चेकर इसकी जांच करता है।' : 'मैसेज/कॉल एनालाइज़र इसकी जांच करते हैं।'}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-8 bg-cyan-600/20 backdrop-blur rounded-xl border border-cyan-500/50 p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-cyan-200">
              <strong>{content.howTitle}</strong>
              {' '}
              {content.how}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
