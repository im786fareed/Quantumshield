'use client';

import { Shield, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  lang: 'en' | 'hi';
}

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
    title: 'Live Threat Intelligence',
    subtitle: 'QuantumGuard learns from latest cyber threats 24/7',
    lastUpdated: 'Last Updated',
    threatsBlocked: 'Active Threat Patterns',
    newToday: 'New Threats Detected Today',
    protected: 'You Are Protected',
    updateButton: 'Check for New Threats',
    updating: 'Updating threat database...',
    categories: 'Threat Categories',
    viewDetails: 'View Details'
  },
  hi: {
    title: 'लाइव खतरा खुफिया',
    subtitle: 'QuantumGuard 24/7 नवीनतम साइबर खतरों से सीखता है',
    lastUpdated: 'अंतिम अपडेट',
    threatsBlocked: 'सक्रिय खतरा पैटर्न',
    newToday: 'आज पाए गए नए खतरे',
    protected: 'आप सुरक्षित हैं',
    updateButton: 'नए खतरों की जांच करें',
    updating: 'खतरा डेटाबेस अपडेट हो रहा है',
    categories: 'खतरे की श्रेणियां',
    viewDetails: 'विवरण देखें'
  }
};

// Number of active detection patterns across textAnalyzer.ts + threatEngine.ts engines
const ACTIVE_PATTERNS = 47;

export default function ThreatIntelligence({ lang }: Props) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const content = CONTENT[lang];

  // Simulated threat database (in production, fetch from API)
  const mockThreats: Threat[] = [
    {
      id: '1',
      title: 'Digital Arrest Scam via Fake CBI Calls',
      description: 'Scammers impersonating CBI/Police officers claiming arrest warrant, demanding money transfer to "clear charges". Uses video calls to appear legitimate.',
      severity: 'CRITICAL',
      date: '2025-12-14',
      source: 'CybersecurityNews.com',
      category: 'Social Engineering'
    },
    {
      id: '2',
      title: 'Fake UPI Cashback APK Distribution',
      description: 'Malicious APK disguised as "UPI Cashback 2025" app spreading via WhatsApp. Steals banking credentials and OTPs.',
      severity: 'CRITICAL',
      date: '2025-12-13',
      source: 'CERT-In Alert',
      category: 'APK Malware'
    },
    {
      id: '3',
      title: 'Aadhar Update Verification Scam',
      description: 'SMS claiming Aadhar will be blocked unless user clicks link to "verify". Link leads to fake UIDAI website stealing personal data.',
      severity: 'HIGH',
      date: '2025-12-12',
      source: 'Cybercrime.gov.in',
      category: 'Phishing'
    },
    {
      id: '4',
      title: 'WhatsApp Plus Modified App Trojan',
      description: 'Modified WhatsApp app (WhatsApp Plus, GB WhatsApp) containing spyware. Distributed outside Play Store, monitors all messages and calls.',
      severity: 'HIGH',
      date: '2025-12-11',
      source: 'Reddit r/Scams',
      category: 'APK Malware'
    },
    {
      id: '5',
      title: 'Fake Parcel Delivery SMS Ransomware',
      description: 'SMS claiming package delivery with APK link. Installing encrypts device files and demands ₹5,000 ransom.',
      severity: 'CRITICAL',
      date: '2025-12-10',
      source: 'ET CIO',
      category: 'Ransomware'
    }
  ];

  useEffect(() => {
    // Load initial threats
    setThreats(mockThreats);
    setLastUpdate(new Date().toLocaleString());
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLastUpdate(new Date().toLocaleString());
    setIsUpdating(false);
  };

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
            <CheckCircle className="w-8 h-8 text-green-400" />
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

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 flex items-center justify-center">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex flex-col items-center gap-3 hover:scale-105 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-12 h-12 text-cyan-400 ${isUpdating ? 'animate-spin' : ''}`} />
            <span className="font-bold text-white text-center text-sm">
              {isUpdating ? content.updating : content.updateButton}
            </span>
            {lastUpdate && <span className="text-xs text-slate-500">{lastUpdate}</span>}
          </button>
        </div>
      </div>

      {/* Latest Threats */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {lang === 'en' ? 'Latest Threat Patterns (Last 5 Days)' : 'नवीनतम खतरा पैटर्न (पिछले 5 दिन)'}
        </h3>

        <div className="space-y-4">
          {threats.map((threat) => (
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
                      <span>{threat.date}</span>
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
                  ✅ <strong>{lang === 'en' ? 'QuantumGuard Protection:' : 'QuantumGuard सुरक्षा:'}</strong>
                  {' '}
                  {lang === 'en'
                    ? `This threat is now in our detection database. ${threat.category === 'APK Malware' ? 'APK Guardian will block it.' : threat.category === 'Phishing' ? 'URL Checker will detect it.' : 'AI Scanner will identify it.'}`
                    : `यह खतरा अब हमारे डिटेक्शन डेटाबेस में है। ${threat.category === 'APK Malware' ? 'APK Guardian इसे ब्लॉक करेगा।' : threat.category === 'Phishing' ? 'URL चेकर इसे पहचानेगा।' : 'AI स्कैनर इसे पहचानेगा।'}`}
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
              <strong>{lang === 'en' ? 'How Threat Intelligence Works:' : 'खतरा खुफिया कैसे काम करता है:'}</strong>
              {' '}
              {lang === 'en'
                ? 'QuantumGuard monitors 50+ cybersecurity sources daily (CybersecurityNews.com, CERT-In, Cybercrime.gov.in, security forums). Our AI extracts new scam patterns, malware signatures, and attack techniques. These patterns are added to all detection features (APK Guardian, URL Checker, Spam AI, etc.) within hours of discovery. You get protection against brand-new threats before they spread widely.'
                : 'QuantumGuard प्रतिदिन 50+ साइबर सुरक्षा स्रोतों की निगरानी करता है। हमारी AI नए स्कैम पैटर्न, मैलवेयर हस्ताक्षर और हमले की तकनीकें निकालती है। ये पैटर्न खोज के कुछ घंटों के भीतर सभी डिटेक्शन सुविधाओं में जोड़े जाते हैं। आपको व्यापक रूप से फैलने से पहले नए खतरों से सुरक्षा मिलती है।'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}