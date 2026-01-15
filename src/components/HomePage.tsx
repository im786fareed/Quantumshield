'use client';
import { useState } from 'react';
import { 
  Shield, AlertTriangle, Phone, FileText, Database, Mic, 
  Lock, Scan, MessageSquare, Download, 
  Smartphone, Globe, TrendingUp,
  Brain, BookOpen, Newspaper, Activity, Bell
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  icon: any;
  path: string;
  category: string;
}

export default function HomePage({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [language] = useState<'en' | 'hi'>(lang);

  const content = {
    en: {
      betaTitle: '⚠️ BETA VERSION',
      betaText: 'QuantumShield is currently in BETA testing. Some features are demonstrations.',
      betaDisclaimer: 'For actual cybercrime, always contact',
      reportIssues: 'Report Issues',
      sendFeedback: 'Send Feedback',
      joinCommunity: 'Join Community',
      title: '🛡️ QuantumShield',
      subtitle: 'AI-Powered Cyber Protection',
      tagline: 'Real-Time Scam Detection Platform',
      statsUsers: '10,000+',
      statsUsersLabel: 'Protected Users',
      statsThreats: '50,000+',
      statsThreatsLabel: 'Threats Blocked',
      statsSaved: '₹365Cr+',
      statsSavedLabel: 'Losses Prevented',
      emergencyTools: '🚨 Emergency Tools',
      emergencyDesc: 'Immediate action for active scams',
      protectionTools: '🛡️ Protection Tools',
      protectionDesc: 'Proactive security measures',
      topThreats: '⚠️ Top Threats in India',
      threatsDesc: 'Major scam types targeting Indians',
      allTools: '🔧 All Security Tools',
      allToolsDesc: 'Complete protection toolkit',
      catEmergency: '🚨 Emergency Tools',
      catProtection: '🛡️ Protection Tools',
      catScanners: '🔍 Scanners',
      catSecurity: '🔐 Security',
      catLearn: '📚 Learn & Discover'
    },
    hi: {
      betaTitle: '⚠️ बीटा संस्करण',
      betaText: 'QuantumShield वर्तमान में बीटा परीक्षण में है।',
      betaDisclaimer: 'वास्तविक साइबर अपराध के लिए संपर्क करें',
      reportIssues: 'समस्याएं रिपोर्ट करें',
      sendFeedback: 'प्रतिक्रिया भेजें',
      joinCommunity: 'समुदाय में शामिल',
      title: '🛡️ क्वांटमशील्ड',
      subtitle: 'AI-संचालित साइबर सुरक्षा',
      tagline: 'रीयल-टाइम घोटाला पहचान',
      statsUsers: '10,000+',
      statsUsersLabel: 'संरक्षित उपयोगकर्ता',
      statsThreats: '50,000+',
      statsThreatsLabel: 'खतरे अवरुद्ध',
      statsSaved: '₹365 करोड़+',
      statsSavedLabel: 'नुकसान रोके',
      emergencyTools: '🚨 आपातकालीन उपकरण',
      emergencyDesc: 'तत्काल कार्रवाई',
      protectionTools: '🛡️ सुरक्षा उपकरण',
      protectionDesc: 'सक्रिय सुरक्षा',
      topThreats: '⚠️ शीर्ष खतरे',
      threatsDesc: 'प्रमुख घोटाले',
      allTools: '🔧 सभी उपकरण',
      allToolsDesc: 'पूर्ण टूलकिट',
      catEmergency: '🚨 आपातकालीन',
      catProtection: '🛡️ सुरक्षा',
      catScanners: '🔍 स्कैनर',
      catSecurity: '🔐 सुरक्षा',
      catLearn: '📚 सीखें'
    }
  };

  const t = content[language];

  const allTools: Tool[] = [
    { id: 'evidence', name: 'Evidence Collector', nameHi: 'सबूत संग्राहक', description: 'Screenshots, recordings', descriptionHi: 'स्क्रीनशॉट, रिकॉर्डिंग', icon: FileText, path: '/evidence', category: 'emergency' },
    { id: 'reporter', name: 'Police Report', nameHi: 'पुलिस रिपोर्ट', description: 'FIR documents', descriptionHi: 'FIR दस्तावेज़', icon: FileText, path: '/reporter', category: 'emergency' },
    { id: 'emergency', name: 'Emergency Contacts', nameHi: 'आपातकालीन संपर्क', description: 'Quick 1930 access', descriptionHi: '1930 पहुंच', icon: Phone, path: '/emergency', category: 'emergency' },
    { id: 'scamdb', name: 'Scam Database', nameHi: 'घोटाला डेटाबेस', description: 'Search scam numbers', descriptionHi: 'घोटाले नंबर', icon: Database, path: '/scamdb', category: 'emergency' },
    { id: 'aianalyzer', name: 'AI Call Analyzer', nameHi: 'AI कॉल विश्लेषक', description: 'Real-time detection', descriptionHi: 'रीयल-टाइम पहचान', icon: Mic, path: '/aianalyzer', category: 'emergency' },
    { id: 'simprotection', name: 'SIM Protection', nameHi: 'SIM सुरक्षा', description: 'Detect SIM swap', descriptionHi: 'SIM स्वैप', icon: Smartphone, path: '/simprotection', category: 'protection' },
    { id: 'devicescan', name: 'Device Scanner', nameHi: 'डिवाइस स्कैनर', description: 'Malware scan', descriptionHi: 'मैलवेयर', icon: Scan, path: '/devicescan', category: 'protection' },
    { id: 'whatsapp', name: 'WhatsApp Safety', nameHi: 'व्हाट्सएप', description: 'Pairing detection', descriptionHi: 'पेयरिंग', icon: MessageSquare, path: '/whatsapp', category: 'protection' },
    { id: 'privacy', name: 'Privacy Shield', nameHi: 'गोपनीयता', description: 'App permissions', descriptionHi: 'ऐप अनुमति', icon: Lock, path: '/privacy', category: 'protection' },
    { id: 'scanner', name: 'AI Scanner', nameHi: 'AI स्कैनर', description: 'Image analysis', descriptionHi: 'छवि विश्लेषण', icon: Brain, path: '/scanner', category: 'scanners' },
    { id: 'apk', name: 'APK Guardian', nameHi: 'APK गार्जियन', description: 'Scan apps', descriptionHi: 'ऐप्स स्कैन', icon: Shield, path: '/apk', category: 'scanners' },
    { id: 'url', name: 'URL Checker', nameHi: 'URL चेकर', description: 'Website safety', descriptionHi: 'वेबसाइट', icon: Globe, path: '/url', category: 'scanners' },
    { id: 'spam', name: 'Spam AI', nameHi: 'स्पैम AI', description: 'Spam calls', descriptionHi: 'स्पैम कॉल', icon: Bell, path: '/spam', category: 'scanners' },
    { id: 'file', name: 'File Scanner', nameHi: 'फ़ाइल', description: 'Scan files', descriptionHi: 'फ़ाइलें', icon: FileText, path: '/file', category: 'scanners' },
    { id: 'sms', name: 'SMS Guardian', nameHi: 'SMS', description: 'Filter SMS', descriptionHi: 'SMS फ़िल्टर', icon: MessageSquare, path: '/sms', category: 'scanners' },
    { id: 'downloads', name: 'Downloads', nameHi: 'डाउनलोड', description: 'Track downloads', descriptionHi: 'ट्रैक', icon: Download, path: '/downloads', category: 'scanners' },
    { id: 'encryption', name: 'Encryption', nameHi: 'एन्क्रिप्शन', description: 'Encrypt files', descriptionHi: 'फ़ाइलें', icon: Lock, path: '/encryption', category: 'security' },
    { id: 'breach', name: 'Breach Checker', nameHi: 'ब्रीच', description: 'Check leaks', descriptionHi: 'लीक जांच', icon: AlertTriangle, path: '/breach', category: 'security' },
    { id: 'ransomware', name: 'Ransomware', nameHi: 'रैनसमवेयर', description: 'Protection', descriptionHi: 'सुरक्षा', icon: Shield, path: '/ransomware', category: 'security' },
    { id: 'device', name: 'Device Health', nameHi: 'डिवाइस', description: 'Security check', descriptionHi: 'जांच', icon: Activity, path: '/device', category: 'security' },
    { id: 'awareness', name: 'Scam Awareness', nameHi: 'जागरूकता', description: 'Latest alerts', descriptionHi: 'अलर्ट', icon: Newspaper, path: '/awareness', category: 'learn' },
    { id: 'education', name: 'Learn Safety', nameHi: 'सीखें', description: 'Videos', descriptionHi: 'वीडियो', icon: BookOpen, path: '/education', category: 'learn' },
    { id: 'news', name: 'Latest Alerts', nameHi: 'अलर्ट', description: 'Updates', descriptionHi: 'अपडेट', icon: Bell, path: '/news', category: 'learn' },
    { id: 'threats', name: 'Threat Intel', nameHi: 'खतरा', description: 'Trends', descriptionHi: 'रुझान', icon: TrendingUp, path: '/threats', category: 'learn' },
    { id: 'aboutai', name: 'AI Tech', nameHi: 'AI', description: 'How it works', descriptionHi: 'कैसे काम करता', icon: Brain, path: '/aboutai', category: 'learn' }
  ];

  const threats = [
    { id: 1, name: language === 'en' ? 'Digital Arrest' : 'डिजिटल अरेस्ट', amount: '₹120Cr', severity: 'critical', desc: language === 'en' ? 'Police impersonation' : 'पुलिस रूप' },
    { id: 2, name: language === 'en' ? 'UPI Fraud' : 'UPI धोखाधड़ी', amount: '₹95Cr', severity: 'high', desc: language === 'en' ? 'Fake QR codes' : 'नकली QR' },
    { id: 3, name: language === 'en' ? 'Job Scams' : 'नौकरी घोटाले', amount: '₹100Cr', severity: 'high', desc: language === 'en' ? 'Fake offers' : 'नकली पेशकश' },
    { id: 4, name: language === 'en' ? 'WhatsApp Hack' : 'व्हाट्सएप', amount: '₹50Cr', severity: 'medium', desc: language === 'en' ? 'Account takeover' : 'खाता' }
  ];

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return 'bg-red-600/20 border-red-500/50';
    if (s === 'high') return 'bg-orange-600/20 border-orange-500/50';
    if (s === 'medium') return 'bg-yellow-600/20 border-yellow-500/50';
    return 'bg-blue-600/20 border-blue-500/50';
  };

  const getByCat = (cat: string) => allTools.filter(t => t.category === cat);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border-b-2 border-yellow-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-100 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{t.betaTitle}</h3>
              <p className="text-yellow-100 text-sm mb-2">{t.betaText}</p>
              <p className="text-yellow-100 text-xs">
                {t.betaDisclaimer}{' '}
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                  cybercrime.gov.in
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:quantumshield4india@gmail.com?subject=Bug" className="text-sm bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-semibold">
              📧 {t.reportIssues}
            </a>
            <a href="mailto:quantumshield4india@gmail.com?subject=Feedback" className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold">
              💬 {t.sendFeedback}
            </a>
            <a href="mailto:quantumshield4india@gmail.com?subject=Join" className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold">
              💚 {t.joinCommunity}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-2xl font-bold text-gray-300 mb-2">{t.subtitle}</p>
          <p className="text-gray-400 mb-8">{t.tagline}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400">{t.statsUsers}</div>
              <div className="text-sm text-gray-400">{t.statsUsersLabel}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{t.statsThreats}</div>
              <div className="text-sm text-gray-400">{t.statsThreatsLabel}</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">{t.statsSaved}</div>
              <div className="text-sm text-gray-400">{t.statsSavedLabel}</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">{t.emergencyTools}</h2>
          <p className="text-gray-400 mb-6">{t.emergencyDesc}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getByCat('emergency').map(tool => {
              const Icon = tool.icon;
              return (
                <a key={tool.id} href={tool.path} className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/50 rounded-xl p-6 hover:border-red-400 transition group">
                  <Icon className="w-12 h-12 text-red-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-bold text-lg mb-2">{language === 'en' ? tool.name : tool.nameHi}</h3>
                  <p className="text-sm text-gray-400">{language === 'en' ? tool.description : tool.descriptionHi}</p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">{t.protectionTools}</h2>
          <p className="text-gray-400 mb-6">{t.protectionDesc}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getByCat('protection').map(tool => {
              const Icon = tool.icon;
              return (
                <a key={tool.id} href={tool.path} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-6 hover:border-blue-400 transition group">
                  <Icon className="w-12 h-12 text-blue-400 mb-3 group-hover:scale-110 transition" />
                  <h3 className="font-bold text-lg mb-2">{language === 'en' ? tool.name : tool.nameHi}</h3>
                  <p className="text-sm text-gray-400">{language === 'en' ? tool.description : tool.descriptionHi}</p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">{t.topThreats}</h2>
          <p className="text-gray-400 mb-6">{t.threatsDesc}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {threats.map(threat => (
              <div key={threat.id} className={`border rounded-xl p-4 ${getSeverityColor(threat.severity)}`}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg">{threat.name}</h3>
                  <span className="text-xl font-bold text-red-400">{threat.amount}</span>
                </div>
                <p className="text-sm text-gray-300">{threat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">{t.allTools}</h2>
          <p className="text-gray-400 mb-6">{t.allToolsDesc}</p>
          {['emergency', 'protection', 'scanners', 'security', 'learn'].map((cat, idx) => {
            const titles = [t.catEmergency, t.catProtection, t.catScanners, t.catSecurity, t.catLearn];
            return (
              <div key={cat} className="mb-8">
                <h3 className="text-2xl font-bold mb-4">{titles[idx]}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getByCat(cat).map(tool => {
                    const Icon = tool.icon;
                    return (
                      <a key={tool.id} href={tool.path} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition flex items-start gap-3">
                        <Icon className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">{language === 'en' ? tool.name : tool.nameHi}</h4>
                          <p className="text-xs text-gray-400">{language === 'en' ? tool.description : tool.descriptionHi}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}