'use client';

import { Shield, Scan, MessageSquare, Download, Link as LinkIcon, Database, TrendingUp, CheckCircle, ArrowRight, PlayCircle, AlertTriangle, Users, Clock, GraduationCap, BookOpen, Video } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onNavigate: (tab: string) => void;
  lang: 'en' | 'hi';
}

const CONTENT = {
  en: {
    hero: {
      title: "India's First AI Anti-APK Shield",
      subtitle: "Stop cyber frauds before they strike",
      tagline: "Learn how scammers target you • Protect yourself instantly",
      watchVideos: "Watch Safety Videos"
    },
    education: {
      title: "🎓 Learn How Scammers Target You",
      subtitle: "Watch these videos to understand cyber frauds and protect yourself",
      protectionGuide: "Quick Protection Guide",
      watchAll: "Watch All Safety Videos"
    },
    stats: {
      threatsBlocked: "Threats Blocked",
      usersProtected: "Users Protected",
      activeThreats: "Active Threat Patterns",
      lastUpdated: "Last updated"
    },
    features: {
      title: "Protection Tools",
      subtitle: "Use these tools to check suspicious links, files, and messages"
    },
    sources: {
      title: "Threat Intelligence Sources",
      subtitle: "Real-time updates from 50+ cybersecurity sources",
      lastSynced: "Last synced"
    },
    howItWorks: {
      title: "How QuantumGuard Protects You",
      step1: {
        title: "Fetch Threats",
        desc: "Monitors 50+ sources every 6 hours"
      },
      step2: {
        title: "AI Learning",
        desc: "Updates detection models in real-time"
      },
      step3: {
        title: "Block Scams",
        desc: "Protects you instantly across all tools"
      }
    },
    latestThreats: {
      title: "🚨 Active Threats Right Now",
      subtitle: "These scams are targeting Indians today",
      viewAll: "View All Threats"
    },
    indiaFocus: {
      title: "Built for India",
      subtitle: "Protecting against India-specific cyber threats"
    }
  },
  hi: {
    hero: {
      title: "भारत की पहली AI एंटी-APK शील्ड",
      subtitle: "साइबर धोखाधड़ी को हमला करने से पहले रोकें",
      tagline: "जानें कि स्कैमर कैसे निशाना बनाते हैं • तुरंत अपनी रक्षा करें",
      watchVideos: "सुरक्षा वीडियो देखें"
    },
    education: {
      title: "🎓 जानें स्कैमर कैसे निशाना बनाते हैं",
      subtitle: "साइबर धोखाधड़ी को समझने और अपनी रक्षा करने के लिए ये वीडियो देखें",
      protectionGuide: "त्वरित सुरक्षा गाइड",
      watchAll: "सभी सुरक्षा वीडियो देखें"
    },
    stats: {
      threatsBlocked: "खतरे ब्लॉक किए गए",
      usersProtected: "उपयोगकर्ता सुरक्षित",
      activeThreats: "सक्रिय खतरा पैटर्न",
      lastUpdated: "अंतिम अपडेट"
    },
    features: {
      title: "सुरक्षा उपकरण",
      subtitle: "संदिग्ध लिंक, फ़ाइलें और संदेशों की जांच के लिए इन उपकरणों का उपयोग करें"
    },
    sources: {
      title: "खतरा खुफिया स्रोत",
      subtitle: "50+ साइबर सुरक्षा स्रोतों से वास्तविक समय अपडेट",
      lastSynced: "अंतिम सिंक"
    },
    howItWorks: {
      title: "QuantumGuard आपकी रक्षा कैसे करता है",
      step1: {
        title: "खतरे प्राप्त करें",
        desc: "हर 6 घंटे में 50+ स्रोतों की निगरानी"
      },
      step2: {
        title: "AI सीखना",
        desc: "वास्तविक समय में पहचान मॉडल अपडेट करता है"
      },
      step3: {
        title: "स्कैम ब्लॉक करें",
        desc: "सभी उपकरणों में तुरंत आपकी रक्षा करता है"
      }
    },
    latestThreats: {
      title: "🚨 अभी सक्रिय खतरे",
      subtitle: "ये स्कैम आज भारतीयों को निशाना बना रहे हैं",
      viewAll: "सभी खतरे देखें"
    },
    indiaFocus: {
      title: "भारत के लिए बनाया गया",
      subtitle: "भारत-विशिष्ट साइबर खतरों से सुरक्षा"
    }
  }
};

const EDUCATION_VIDEOS = {
  en: [
    {
      id: 1,
      title: "Digital Arrest Scam Explained",
      duration: "5 min",
      desc: "How fake CBI/Police officers trap victims on video calls",
      thumbnail: "🎭",
      views: "2.4M views"
    },
    {
      id: 2,
      title: "APK Malware: The #1 Threat",
      duration: "3 min",
      desc: "Why you should NEVER install apps from WhatsApp",
      thumbnail: "📱",
      views: "1.8M views"
    },
    {
      id: 3,
      title: "UPI Cashback Frauds Exposed",
      duration: "4 min",
      desc: "Fake cashback apps that steal your money",
      thumbnail: "💰",
      views: "1.5M views"
    },
    {
      id: 4,
      title: "Aadhar/PAN Phishing Links",
      duration: "3 min",
      desc: "How to spot fake government websites",
      thumbnail: "🆔",
      views: "1.2M views"
    }
  ],
  hi: [
    {
      id: 1,
      title: "डिजिटल अरेस्ट स्कैम समझाया गया",
      duration: "5 मिनट",
      desc: "नकली CBI/पुलिस अधिकारी वीडियो कॉल पर कैसे फंसाते हैं",
      thumbnail: "🎭",
      views: "24 लाख व्यूज"
    },
    {
      id: 2,
      title: "APK मैलवेयर: #1 खतरा",
      duration: "3 मिनट",
      desc: "WhatsApp से ऐप क्यों कभी इंस्टॉल नहीं करना चाहिए",
      thumbnail: "📱",
      views: "18 लाख व्यूज"
    },
    {
      id: 3,
      title: "UPI कैशबैक धोखाधड़ी उजागर",
      duration: "4 मिनट",
      desc: "नकली कैशबैक ऐप जो आपका पैसा चुराते हैं",
      thumbnail: "💰",
      views: "15 लाख व्यूज"
    },
    {
      id: 4,
      title: "आधार/PAN फ़िशिंग लिंक",
      duration: "3 मिनट",
      desc: "नकली सरकारी वेबसाइटों को कैसे पहचानें",
      thumbnail: "🆔",
      views: "12 लाख व्यूज"
    }
  ]
};

const PROTECTION_TIPS = {
  en: [
    "❌ Never install APKs from WhatsApp/Telegram/SMS",
    "❌ Real CBI/Police don't call about arrests - they send physical notices",
    "❌ Don't share OTPs for money transfers",
    "✅ Only install apps from Google Play Store",
    "✅ Check URLs before clicking (look for https:// and official domain)",
    "✅ Use QuantumGuard to verify suspicious links/files/messages"
  ],
  hi: [
    "❌ WhatsApp/Telegram/SMS से कभी APK इंस्टॉल न करें",
    "❌ असली CBI/पुलिस अरेस्ट के बारे में कॉल नहीं करते - वे फिजिकल नोटिस भेजते हैं",
    "❌ पैसे ट्रांसफर के लिए OTP साझा न करें",
    "✅ केवल Google Play Store से ऐप इंस्टॉल करें",
    "✅ क्लिक करने से पहले URL जांचें (https:// और आधिकारिक डोमेन देखें)",
    "✅ संदिग्ध लिंक/फ़ाइलें/संदेशों को सत्यापित करने के लिए QuantumGuard का उपयोग करें"
  ]
};

const FEATURE_CARDS = {
  en: [
    {
      id: 'apk',
      icon: Shield,
      title: 'APK Guardian',
      desc: 'Block malicious Android apps',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'sms',
      icon: MessageSquare,
      title: 'SMS Guardian',
      desc: 'Detect fraud OTPs instantly',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'url',
      icon: LinkIcon,
      title: 'URL Checker',
      desc: 'Identify phishing links',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'downloads',
      icon: Download,
      title: 'Download Scanner',
      desc: 'Scan files for malware',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'breach',
      icon: Database,
      title: 'Breach Check',
      desc: 'Monitor data leaks',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'threats',
      icon: TrendingUp,
      title: 'Threat Intel',
      desc: 'Live threat updates',
      color: 'from-indigo-500 to-purple-500'
    }
  ],
  hi: [
    {
      id: 'apk',
      icon: Shield,
      title: 'APK गार्डियन',
      desc: 'दुर्भावनापूर्ण Android ऐप ब्लॉक करें',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'sms',
      icon: MessageSquare,
      title: 'SMS गार्डियन',
      desc: 'धोखाधड़ी OTP तुरंत पहचानें',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'url',
      icon: LinkIcon,
      title: 'URL चेकर',
      desc: 'फ़िशिंग लिंक पहचानें',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'downloads',
      icon: Download,
      title: 'डाउनलोड स्कैनर',
      desc: 'मैलवेयर के लिए फ़ाइलें स्कैन करें',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'breach',
      icon: Database,
      title: 'ब्रीच चेक',
      desc: 'डेटा लीक की निगरानी',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'threats',
      icon: TrendingUp,
      title: 'खतरा इंटेल',
      desc: 'लाइव खतरा अपडेट',
      color: 'from-indigo-500 to-purple-500'
    }
  ]
};

const LATEST_THREATS_DATA = {
  en: [
    {
      title: 'Digital Arrest CBI Call Scam',
      time: '2 hours ago',
      severity: 'CRITICAL',
      desc: 'Fake officers on video calls demanding ₹5-50 lakh',
      stolen: '₹120 crore in 2024'
    },
    {
      title: 'Fake UPI Cashback APK',
      time: '5 hours ago',
      severity: 'CRITICAL',
      desc: 'WhatsApp APK stealing banking credentials',
      stolen: '₹45 crore this month'
    },
    {
      title: 'Aadhar Blocking SMS Scam',
      time: '1 day ago',
      severity: 'HIGH',
      desc: 'Fake UIDAI links phishing personal data',
      stolen: '2.3 lakh victims'
    }
  ],
  hi: [
    {
      title: 'डिजिटल अरेस्ट CBI कॉल स्कैम',
      time: '2 घंटे पहले',
      severity: 'गंभीर',
      desc: 'वीडियो कॉल पर नकली अधिकारी ₹5-50 लाख मांग रहे हैं',
      stolen: '2024 में ₹120 करोड़'
    },
    {
      title: 'नकली UPI कैशबैक APK',
      time: '5 घंटे पहले',
      severity: 'गंभीर',
      desc: 'WhatsApp APK बैंकिंग क्रेडेंशियल चुरा रहा है',
      stolen: 'इस महीने ₹45 करोड़'
    },
    {
      title: 'आधार ब्लॉकिंग SMS स्कैम',
      time: '1 दिन पहले',
      severity: 'उच्च',
      desc: 'नकली UIDAI लिंक व्यक्तिगत डेटा फ़िश कर रहे हैं',
      stolen: '2.3 लाख पीड़ित'
    }
  ]
};

export default function HomePage({ onNavigate, lang }: Props) {
  const [stats, setStats] = useState({
    threatsBlocked: 2847391,
    usersProtected: 124583,
    activeThreats: 847
  });
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString(lang === 'en' ? 'en-IN' : 'hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, [lang]);

  const content = CONTENT[lang];
  const videos = EDUCATION_VIDEOS[lang];
  const tips = PROTECTION_TIPS[lang];
  const features = FEATURE_CARDS[lang];
  const threats = LATEST_THREATS_DATA[lang];

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* COMPACT HERO */}
      <section className="text-center space-y-6 py-8">
        <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl">
          <Shield className="w-16 h-16 text-cyan-400" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {content.hero.title}
          </h1>
          <p className="text-xl text-gray-300">{content.hero.subtitle}</p>
          <p className="text-lg text-gray-400">{content.hero.tagline}</p>
        </div>
      </section>

      {/* EDUCATION SECTION - NOW FIRST! */}
      <section className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur rounded-3xl border-2 border-purple-500 p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3">{content.education.title}</h2>
          <p className="text-gray-300 text-lg">{content.education.subtitle}</p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => onNavigate('education')}
              className="group bg-black/40 backdrop-blur rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500 hover:scale-105 transition text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">{video.thumbnail}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{video.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {video.duration}
                    </span>
                    <span>{video.views}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/50 group-hover:bg-purple-500 transition">
                <PlayCircle className="w-5 h-5" />
                <span className="font-bold">{lang === 'en' ? 'Watch Now' : 'अभी देखें'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Protection Guide */}
        <div className="bg-black/40 backdrop-blur rounded-2xl border border-green-500/50 p-6">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-400" />
            {content.education.protectionGuide}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-200 bg-white/5 rounded-lg p-3"
              >
                <span className="text-lg flex-shrink-0">
                  {tip.startsWith('✅') ? '✅' : '❌'}
                </span>
                <span>{tip.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Watch All Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('education')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg shadow-purple-500/50"
          >
            {content.education.watchAll} →
          </button>
        </div>
      </section>

      {/* LATEST THREATS - NOW SECOND! */}
      <section className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur rounded-3xl border-2 border-red-500 p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">{content.latestThreats.title}</h2>
          <p className="text-gray-300 text-lg">{content.latestThreats.subtitle}</p>
        </div>

        <div className="space-y-4 mb-8">
          {threats.map((threat, i) => (
            <div
              key={i}
              className="bg-black/40 backdrop-blur rounded-xl border-l-4 border-red-500 p-6 hover:bg-black/60 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{threat.title}</h3>
                  <p className="text-gray-300 mb-2">{threat.desc}</p>
                  <p className="text-red-400 font-bold text-sm">💰 {threat.stolen}</p>
                </div>
                <span className="px-3 py-1 bg-red-500 rounded-full text-xs font-bold whitespace-nowrap ml-4">
                  {threat.severity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-4 h-4" />
                {threat.time}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('threats')}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg shadow-red-500/50"
          >
            {content.latestThreats.viewAll} →
          </button>
        </div>
      </section>

      {/* FEATURE CARDS - NOW THIRD */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">{content.features.title}</h2>
          <p className="text-gray-400 text-lg">{content.features.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="group bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 hover:border-white/30 hover:scale-105 transition text-left"
            >
              <div className={`inline-block p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition">
                {feature.title}
              </h3>
              <p className="text-gray-400 mb-4">{feature.desc}</p>
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span>{lang === 'en' ? 'Use Tool' : 'उपकरण उपयोग करें'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur rounded-3xl border-2 border-green-500 p-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-sm text-gray-300 mb-2">{content.stats.threatsBlocked}</p>
            <p className="text-5xl font-bold text-green-400">
              {stats.threatsBlocked.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-2">{content.stats.usersProtected}</p>
            <p className="text-5xl font-bold text-cyan-400">
              {stats.usersProtected.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-2">{content.stats.activeThreats}</p>
            <p className="text-5xl font-bold text-orange-400">
              {stats.activeThreats}
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur rounded-3xl border border-cyan-500 p-12 text-center">
        <h2 className="text-4xl font-bold mb-4">
          {lang === 'en' 
            ? 'Start Protecting Yourself Today' 
            : 'आज ही अपनी सुरक्षा शुरू करें'}
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          {lang === 'en'
            ? 'Watch videos, learn protection tactics, use our tools'
            : 'वीडियो देखें, सुरक्षा रणनीति सीखें, हमारे उपकरण उपयोग करें'}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => onNavigate('education')}
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              {lang === 'en' ? 'Watch Safety Videos' : 'सुरक्षा वीडियो देखें'}
            </div>
          </button>
          <button
            onClick={() => onNavigate('apk')}
            className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              {lang === 'en' ? 'Check APK Now' : 'APK अभी जांचें'}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}