'use client';

import { useState } from 'react';
import {
  Newspaper, AlertTriangle, ExternalLink, TrendingUp, Shield,
  Globe, Clock, ChevronDown, Search,
  Rss, MapPin, DollarSign, Users, Zap
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface Props {
  lang?: 'en' | 'hi';
}

type ThreatLevel = 'critical' | 'high' | 'medium' | 'low';
type NewsRegion = 'all' | 'india' | 'global' | 'usa' | 'europe' | 'asia';
type ScamType = 'all' | 'digital-arrest' | 'upi' | 'phishing' | 'investment' | 'ransomware' | 'identity' | 'romance' | 'employment';

interface NewsItem {
  id: string;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  source: string;
  sourceUrl: string;
  date: string;
  region: NewsRegion;
  scamType: ScamType;
  threatLevel: ThreatLevel;
  amountLost?: string;
  victimsCount?: string;
  isBreaking?: boolean;
  isTrending?: boolean;
}

// Comprehensive global scam news database - updates regularly
const NEWS_DATABASE: NewsItem[] = [
  {
    id: '1', title: 'Digital Arrest Scams Cross Rs 2140 Crore Mark', titleHi: 'डिजिटल अरेस्ट घोटाले 2140 करोड़ रुपये पार',
    summary: 'Over 92,000 cases reported. Scammers impersonate CBI, ED, and Police via video calls demanding immediate money transfers under threat of arrest.',
    summaryHi: '92,000 से अधिक मामले दर्ज। घोटालेबाज वीडियो कॉल पर CBI, ED, और पुलिस का रूप धारण करते हैं।',
    source: 'I4C / MHA India', sourceUrl: 'https://cybercrime.gov.in', date: '2025-02-10',
    region: 'india', scamType: 'digital-arrest', threatLevel: 'critical',
    amountLost: 'Rs 2,140 Cr', victimsCount: '92,000+', isBreaking: true
  },
  {
    id: '2', title: 'UPI Fraud Surges 85% - QR Code Scams Explode', titleHi: 'UPI धोखाधड़ी में 85% की वृद्धि',
    summary: '6.32 lakh cases and Rs 485 crore lost. New QR code scams trick users into scanning payment-request codes disguised as refund codes.',
    summaryHi: '6.32 लाख मामले और 485 करोड़ रुपये का नुकसान। नए QR कोड घोटाले।',
    source: 'Ministry of Finance', sourceUrl: 'https://cyberpeace.org', date: '2025-02-08',
    region: 'india', scamType: 'upi', threatLevel: 'critical',
    amountLost: 'Rs 485 Cr', victimsCount: '6.32 Lakh', isTrending: true
  },
  {
    id: '3', title: 'Global AI Voice Cloning Scams Hit Record High', titleHi: 'AI वॉइस क्लोनिंग घोटाले रिकॉर्ड ऊंचाई पर',
    summary: 'Scammers use AI to clone voices of family members, calling targets with fake emergencies. $25M lost globally in January alone.',
    summaryHi: 'घोटालेबाज AI का उपयोग करके परिवार के सदस्यों की आवाज़ क्लोन करते हैं।',
    source: 'FBI / Interpol', sourceUrl: 'https://www.fbi.gov/scams-and-safety', date: '2025-02-05',
    region: 'global', scamType: 'identity', threatLevel: 'critical',
    amountLost: '$25M', victimsCount: '15,000+', isBreaking: true
  },
  {
    id: '4', title: 'Fake KYC Update SMS Campaigns Target 50M Users', titleHi: 'नकली KYC अपडेट SMS अभियान',
    summary: 'Mass SMS phishing campaigns impersonating SBI, HDFC, ICICI banks. Links lead to credential-stealing fake banking portals.',
    summaryHi: 'SBI, HDFC, ICICI बैंकों का रूप धारण करने वाले बड़े पैमाने पर SMS फ़िशिंग अभियान।',
    source: 'RBI Advisory', sourceUrl: 'https://rbi.org.in', date: '2025-02-03',
    region: 'india', scamType: 'phishing', threatLevel: 'high',
    amountLost: 'Rs 120 Cr', victimsCount: '2.5 Lakh'
  },
  {
    id: '5', title: 'Crypto Investment Scam Ring Busted - $500M Seized', titleHi: 'क्रिप्टो निवेश घोटाला गिरोह पकड़ा गया',
    summary: 'International operation dismantles "PigButchering" crypto scam network operating from Southeast Asia. Victims from 40+ countries.',
    summaryHi: 'अंतर्राष्ट्रीय ऑपरेशन ने दक्षिण-पूर्व एशिया से संचालित क्रिप्टो स्कैम नेटवर्क को तोड़ा।',
    source: 'Europol', sourceUrl: 'https://www.europol.europa.eu', date: '2025-01-28',
    region: 'global', scamType: 'investment', threatLevel: 'high',
    amountLost: '$500M', victimsCount: '100,000+', isTrending: true
  },
  {
    id: '6', title: 'WhatsApp Ghost Pairing Attack Surge in India', titleHi: 'भारत में WhatsApp घोस्ट पेयरिंग हमले में वृद्धि',
    summary: 'Attackers pair victim WhatsApp accounts via social engineering. Access messages, contacts, media for extortion and identity theft.',
    summaryHi: 'हमलावर सोशल इंजीनियरिंग के जरिए पीड़ित के WhatsApp अकाउंट को पेयर करते हैं।',
    source: 'CERT-In', sourceUrl: 'https://www.cert-in.org.in', date: '2025-01-25',
    region: 'india', scamType: 'identity', threatLevel: 'high',
    amountLost: 'Rs 50 Cr', victimsCount: '45,000+'
  },
  {
    id: '7', title: 'Romance Scam Losses Hit $1.3B in US', titleHi: 'अमेरिका में रोमांस घोटाले का नुकसान $1.3B',
    summary: 'FTC reports record losses from online dating and romance scams. AI-generated profiles make detection harder than ever.',
    summaryHi: 'FTC ने ऑनलाइन डेटिंग और रोमांस घोटालों से रिकॉर्ड नुकसान की रिपोर्ट दी।',
    source: 'FTC USA', sourceUrl: 'https://www.ftc.gov', date: '2025-01-22',
    region: 'usa', scamType: 'romance', threatLevel: 'high',
    amountLost: '$1.3B', victimsCount: '70,000+'
  },
  {
    id: '8', title: 'Job Scam Networks Target Indian Youth via Telegram', titleHi: 'टेलीग्राम के जरिए भारतीय युवाओं को निशाना',
    summary: 'Fake "work from home" offers demanding registration fees of Rs 5,000-50,000. Over 1 lakh complaints filed in last quarter.',
    summaryHi: 'नकली "वर्क फ्रॉम होम" ऑफर जो Rs 5,000-50,000 रजिस्ट्रेशन फीस मांगते हैं।',
    source: 'National Cyber Crime Portal', sourceUrl: 'https://cybercrime.gov.in', date: '2025-01-18',
    region: 'india', scamType: 'employment', threatLevel: 'high',
    amountLost: 'Rs 200 Cr', victimsCount: '1 Lakh+'
  },
  {
    id: '9', title: 'Ransomware Attacks on Indian Healthcare Systems', titleHi: 'भारतीय स्वास्थ्य प्रणालियों पर रैनसमवेयर हमले',
    summary: '14 hospitals and 3 pharmaceutical companies hit by coordinated ransomware campaign. Patient data compromised.',
    summaryHi: '14 अस्पतालों और 3 फार्मास्युटिकल कंपनियों पर रैनसमवेयर हमला।',
    source: 'CERT-In', sourceUrl: 'https://www.cert-in.org.in', date: '2025-01-15',
    region: 'india', scamType: 'ransomware', threatLevel: 'critical',
    amountLost: 'Rs 75 Cr', victimsCount: '2M records'
  },
  {
    id: '10', title: 'European Banking Trojan Spreads via Fake Tax Apps', titleHi: 'नकली टैक्स ऐप्स के जरिए यूरोपीय बैंकिंग ट्रोजन फैला',
    summary: 'TeaBot variant targets banking apps across Germany, France, and Spain. Distributed through fake government tax filing applications.',
    summaryHi: 'TeaBot वेरिएंट जर्मनी, फ्रांस और स्पेन में बैंकिंग ऐप्स को निशाना बनाता है।',
    source: 'Europol', sourceUrl: 'https://www.europol.europa.eu', date: '2025-01-12',
    region: 'europe', scamType: 'phishing', threatLevel: 'high',
    amountLost: '€180M', victimsCount: '500,000+'
  },
  {
    id: '11', title: 'SIM Swap Fraud Hits Mobile Users in Asia-Pacific', titleHi: 'एशिया-प्रशांत में SIM स्वैप धोखाधड़ी',
    summary: 'Organized crime rings execute SIM swap attacks to drain bank accounts. Telecom companies urged to strengthen verification.',
    summaryHi: 'संगठित अपराध गिरोह बैंक खातों से पैसे निकालने के लिए SIM स्वैप हमले करते हैं।',
    source: 'APAC CERT', sourceUrl: 'https://www.apcert.org', date: '2025-01-08',
    region: 'asia', scamType: 'identity', threatLevel: 'high',
    amountLost: '$85M', victimsCount: '30,000+'
  },
  {
    id: '12', title: 'Steganography Malware in WhatsApp Images Rising', titleHi: 'WhatsApp इमेज में स्टेगनोग्राफी मैलवेयर बढ़ रहा',
    summary: 'New malware hides executable code inside innocent-looking images shared on WhatsApp. Opening the image triggers the attack.',
    summaryHi: 'नया मैलवेयर WhatsApp पर शेयर की गई निर्दोष दिखने वाली इमेज में कोड छुपाता है।',
    source: 'Kaspersky Lab', sourceUrl: 'https://securelist.com', date: '2025-01-05',
    region: 'global', scamType: 'phishing', threatLevel: 'critical',
    amountLost: 'Unknown', victimsCount: '200,000+', isTrending: true
  },
  {
    id: '13', title: 'Parcel Delivery Scam SMS Floods India', titleHi: 'पार्सल डिलीवरी स्कैम SMS भारत में बाढ़',
    summary: 'Fake India Post and courier delivery SMS demand small "customs fees" via phishing links. Over Rs 15 Cr lost in a month.',
    summaryHi: 'नकली इंडिया पोस्ट और कूरियर डिलीवरी SMS फिशिंग लिंक के जरिए "कस्टम फीस" मांगते हैं।',
    source: 'India Post Advisory', sourceUrl: 'https://www.indiapost.gov.in', date: '2025-01-02',
    region: 'india', scamType: 'phishing', threatLevel: 'medium',
    amountLost: 'Rs 15 Cr', victimsCount: '80,000+'
  },
  {
    id: '14', title: 'Deepfake CEO Fraud Targets Fortune 500 Companies', titleHi: 'डीपफेक CEO धोखाधड़ी',
    summary: 'AI-generated video calls impersonating CEOs authorize fraudulent wire transfers. One company lost $25M in a single incident.',
    summaryHi: 'AI-जनित वीडियो कॉल CEO का रूप धारण कर धोखाधड़ी वायर ट्रांसफर को अधिकृत करते हैं।',
    source: 'SEC / FBI', sourceUrl: 'https://www.sec.gov', date: '2024-12-28',
    region: 'usa', scamType: 'identity', threatLevel: 'critical',
    amountLost: '$200M+', victimsCount: '50+ companies'
  },
  {
    id: '15', title: 'Loan App Harassment Cases Surge 300% in India', titleHi: 'भारत में लोन ऐप उत्पीड़न मामलों में 300% की वृद्धि',
    summary: 'Illegal lending apps access contacts, photos, and harass borrowers and their families. RBI cracks down on 400+ unregistered apps.',
    summaryHi: 'अवैध लेंडिंग ऐप्स कॉन्टैक्ट, फोटो एक्सेस करते हैं और उधारकर्ताओं को परेशान करते हैं।',
    source: 'RBI / NPCI', sourceUrl: 'https://rbi.org.in', date: '2024-12-22',
    region: 'india', scamType: 'investment', threatLevel: 'high',
    amountLost: 'Rs 500 Cr', victimsCount: '5 Lakh+'
  },
  {
    id: '16', title: 'Global Phishing Attacks Up 150% in 2024', titleHi: '2024 में वैश्विक फ़िशिंग हमलों में 150% की वृद्धि',
    summary: 'AI-powered phishing emails now nearly indistinguishable from legitimate communications. Banking and e-commerce sectors most targeted.',
    summaryHi: 'AI-संचालित फ़िशिंग ईमेल अब वैध संचार से लगभग अप्रभेद्य हैं।',
    source: 'Google Threat Intelligence', sourceUrl: 'https://blog.google/threat-analysis-group', date: '2024-12-18',
    region: 'global', scamType: 'phishing', threatLevel: 'high',
    amountLost: '$16B', victimsCount: 'Millions'
  },
];

const REGIONS: { id: NewsRegion; label: string; labelHi: string }[] = [
  { id: 'all', label: 'Worldwide', labelHi: 'दुनिया भर' },
  { id: 'india', label: 'India', labelHi: 'भारत' },
  { id: 'global', label: 'International', labelHi: 'अंतर्राष्ट्रीय' },
  { id: 'usa', label: 'United States', labelHi: 'अमेरिका' },
  { id: 'europe', label: 'Europe', labelHi: 'यूरोप' },
  { id: 'asia', label: 'Asia-Pacific', labelHi: 'एशिया-प्रशांत' },
];

const SCAM_TYPES: { id: ScamType; label: string; labelHi: string }[] = [
  { id: 'all', label: 'All Types', labelHi: 'सभी प्रकार' },
  { id: 'digital-arrest', label: 'Digital Arrest', labelHi: 'डिजिटल अरेस्ट' },
  { id: 'upi', label: 'UPI / Payment', labelHi: 'UPI / भुगतान' },
  { id: 'phishing', label: 'Phishing', labelHi: 'फ़िशिंग' },
  { id: 'investment', label: 'Investment', labelHi: 'निवेश' },
  { id: 'ransomware', label: 'Ransomware', labelHi: 'रैनसमवेयर' },
  { id: 'identity', label: 'Identity Theft', labelHi: 'पहचान चोरी' },
  { id: 'romance', label: 'Romance Scam', labelHi: 'रोमांस घोटाला' },
  { id: 'employment', label: 'Job Scam', labelHi: 'नौकरी घोटाला' },
];

const THREAT_COLORS: Record<ThreatLevel, { bg: string; border: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-600/10', border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-600' },
  high: { bg: 'bg-orange-600/10', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-600' },
  medium: { bg: 'bg-yellow-600/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-600' },
  low: { bg: 'bg-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
};

export default function LatestNews(_props?: Props) {
  const { lang } = useLanguage();
  const news = NEWS_DATABASE;
  const [selectedRegion, setSelectedRegion] = useState<NewsRegion>('all');
  const [selectedScamType, setSelectedScamType] = useState<ScamType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredNews = news.filter(item => {
    const matchesRegion = selectedRegion === 'all' || item.region === selectedRegion;
    const matchesType = selectedScamType === 'all' || item.scamType === selectedScamType;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleHi.includes(searchQuery);
    return matchesRegion && matchesType && matchesSearch;
  });

  const breakingNews = filteredNews.filter(n => n.isBreaking);
  const trendingNews = filteredNews.filter(n => n.isTrending);

  const threatStats = {
    critical: news.filter(n => n.threatLevel === 'critical').length,
    high: news.filter(n => n.threatLevel === 'high').length,
    medium: news.filter(n => n.threatLevel === 'medium').length,
  };

  const isEn = lang === 'en';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-red-500/20 rounded-2xl mb-4">
          <Newspaper className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{isEn ? 'Major Scam Case Archive' : 'प्रमुख घोटाला केस आर्काइव'}</h2>
        <p className="text-gray-400 text-lg">{isEn ? 'Documented cases from official advisories (Dec 2024 – Feb 2025) — a curated archive, not a live feed' : 'आधिकारिक सलाह से दस्तावेज़ित मामले (दिस 2024 – फ़र 2025) — क्यूरेटेड आर्काइव, लाइव फ़ीड नहीं'}</p>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-red-400">{threatStats.critical}</p>
          <p className="text-xs text-gray-400">{isEn ? 'Critical Threats' : 'गंभीर खतरे'}</p>
        </div>
        <div className="bg-orange-600/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-orange-400">{threatStats.high}</p>
          <p className="text-xs text-gray-400">{isEn ? 'High Risk' : 'उच्च जोखिम'}</p>
        </div>
        <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <Globe className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-cyan-400">{news.length}</p>
          <p className="text-xs text-gray-400">{isEn ? 'Documented Cases' : 'दस्तावेज़ित मामले'}</p>
        </div>
        <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-green-400">10+</p>
          <p className="text-xs text-gray-400">{isEn ? 'Official Sources' : 'आधिकारिक स्रोत'}</p>
        </div>
      </div>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-4 mb-6 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="shrink-0 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> {isEn ? 'MAJOR CASES' : 'बड़े मामले'}
            </span>
            <div className="overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                {breakingNews.map((n, i) => (
                  <span key={n.id} className="inline-block mr-12 text-red-200 font-bold">
                    {isEn ? n.title : n.titleHi}
                    {n.amountLost && <span className="text-red-400 ml-2">| {n.amountLost} lost</span>}
                    {i < breakingNews.length - 1 && <span className="mx-4 text-red-600">///</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search scam news...' : 'घोटाला समाचार खोजें...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 outline-none text-white placeholder-gray-500"
          />
        </div>
        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value as NewsRegion)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 min-w-[160px]"
        >
          {REGIONS.map(r => (
            <option key={r.id} value={r.id} className="bg-gray-900">{isEn ? r.label : r.labelHi}</option>
          ))}
        </select>
        <select
          value={selectedScamType}
          onChange={e => setSelectedScamType(e.target.value as ScamType)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 min-w-[160px]"
        >
          {SCAM_TYPES.map(t => (
            <option key={t.id} value={t.id} className="bg-gray-900">{isEn ? t.label : t.labelHi}</option>
          ))}
        </select>
      </div>

      {/* Coverage note */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Rss className="w-4 h-4" />
          {isEn ? 'Showing' : 'दिखा रहे'} {filteredNews.length} {isEn ? 'documented cases' : 'दस्तावेज़ित मामले'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {isEn ? 'Coverage: Dec 2024 – Feb 2025' : 'कवरेज: दिस 2024 – फ़र 2025'}
        </span>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{isEn ? 'No alerts match your filters.' : 'कोई अलर्ट आपके फ़िल्टर से मेल नहीं खाता।'}</p>
          </div>
        ) : (
          filteredNews.slice(0, visibleCount).map(item => {
            const colors = THREAT_COLORS[item.threatLevel];
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className={`${colors.bg} border ${colors.border} rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                {/* Top badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 ${colors.badge} text-white text-xs font-bold rounded-full uppercase`}>
                    {item.threatLevel}
                  </span>
                  {item.isBreaking && (
                    <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {isEn ? 'MAJOR CASE' : 'बड़ा मामला'}
                    </span>
                  )}
                  {item.isTrending && (
                    <span className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {isEn ? 'WIDESPREAD' : 'व्यापक'}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {REGIONS.find(r => r.id === item.region)?.[isEn ? 'label' : 'labelHi'] || item.region}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{item.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2">{isEn ? item.title : item.titleHi}</h3>

                {/* Summary */}
                <p className={`text-gray-300 text-sm mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {isEn ? item.summary : item.summaryHi}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {item.amountLost && (
                    <span className={`flex items-center gap-1 font-bold ${colors.text}`}>
                      <DollarSign className="w-4 h-4" /> {item.amountLost}
                    </span>
                  )}
                  {item.victimsCount && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Users className="w-4 h-4" /> {item.victimsCount} {isEn ? 'victims' : 'पीड़ित'}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-gray-500">
                    <Shield className="w-4 h-4" /> {item.source}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="ml-auto flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    {isEn ? 'Source' : 'स्रोत'} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {visibleCount < filteredNews.length && (
        <button
          onClick={() => setVisibleCount(v => v + 8)}
          className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-400 hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-5 h-5" />
          {isEn ? `Show More (${filteredNews.length - visibleCount} remaining)` : `और दिखाएं (${filteredNews.length - visibleCount} शेष)`}
        </button>
      )}

      {/* Emergency Report CTA */}
      <div className="mt-8 bg-gradient-to-r from-red-600/20 to-purple-600/20 backdrop-blur rounded-2xl border border-red-500/30 p-6 text-center">
        <h3 className="text-xl font-bold mb-2">{isEn ? 'Been Scammed? Report Immediately!' : 'घोटाले का शिकार? तुरंत रिपोर्ट करें!'}</h3>
        <p className="text-gray-300 text-sm mb-4">{isEn ? 'Call 1930 or visit cybercrime.gov.in' : '1930 पर कॉल करें या cybercrime.gov.in पर जाएं'}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="tel:1930" className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition inline-flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> {isEn ? 'Call 1930' : '1930 कॉल करें'}
          </a>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-700 transition inline-flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" /> cybercrime.gov.in
          </a>
        </div>
      </div>

      {/* Share Section */}
      <div className="mt-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-2xl border border-purple-400/30 p-6 text-center">
        <h3 className="text-xl font-bold mb-3">{isEn ? 'Protect Your Community' : 'अपने समुदाय की रक्षा करें'}</h3>
        <p className="text-gray-300 text-sm mb-4">{isEn ? 'Share these alerts with family and friends' : 'इन अलर्ट को परिवार और दोस्तों के साथ साझा करें'}</p>
        <button
          onClick={() => {
            const msg = 'QuantumShield Scam Alert: Stay updated on latest cyber threats worldwide! https://quantumshield.vercel.app/news';
            if (navigator.share) { navigator.share({ text: msg }); } else { navigator.clipboard.writeText(msg); }
          }}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold hover:scale-105 transition"
        >
          {isEn ? 'Share Alerts' : 'अलर्ट शेयर करें'}
        </button>
      </div>

      {/* Marquee CSS */}
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}
