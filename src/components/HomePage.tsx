'use client';

import { Shield, Scan, MessageSquare, Download, Link as LinkIcon, Database, TrendingUp, ArrowRight, PlayCircle, AlertTriangle, Users, Clock, GraduationCap, BookOpen, Video, Phone, XCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onNavigate: (tab: string) => void;
  lang: 'en' | 'hi';
}

const CONTENT = {
  en: {
    tabs: {
      learn: 'Learn',
      protect: 'Protect'
    },
    hero: {
      title: "India's First AI Anti-APK Shield",
      subtitle: "Learn how scammers target you • Protect yourself instantly"
    },
    learn: {
      videos: {
        title: '🎓 Watch & Learn',
        subtitle: 'Understand cyber frauds in 5 minutes'
      },
      digitalArrest: {
        title: '🚨 Stop Digital Arrest Scams',
        subtitle: 'The #1 cyber fraud targeting Indians (₹120 crore stolen in 2024)',
        whatIs: 'What is Digital Arrest?',
        howProtects: 'How QuantumGuard Protects You',
        learnMore: 'Learn Complete Protection Guide'
      },
      protectionGuide: 'Quick Protection Tips',
      latestThreats: 'Active Threats Right Now',
      ctaButton: 'Start Protecting Yourself →'
    },
    protect: {
      tools: {
        title: '🛡️ Protection Tools',
        subtitle: 'Check suspicious links, files, and messages instantly'
      },
      stats: 'Live Protection Stats',
      howItWorks: 'How QuantumGuard Works',
      ctaButton: '← Watch Safety Videos First'
    }
  },
  hi: {
    tabs: {
      learn: 'सीखें',
      protect: 'सुरक्षा'
    },
    hero: {
      title: 'भारत की पहली AI एंटी-APK शील्ड',
      subtitle: 'जानें स्कैमर कैसे निशाना बनाते हैं • तुरंत अपनी रक्षा करें'
    },
    learn: {
      videos: {
        title: '🎓 देखें और सीखें',
        subtitle: '5 मिनट में साइबर धोखाधड़ी समझें'
      },
      digitalArrest: {
        title: '🚨 डिजिटल अरेस्ट स्कैम रोकें',
        subtitle: 'भारतीयों को निशाना बनाने वाला #1 साइबर धोखाधड़ी (2024 में ₹120 करोड़ चोरी)',
        whatIs: 'डिजिटल अरेस्ट क्या है?',
        howProtects: 'QuantumGuard कैसे सुरक्षा करता है',
        learnMore: 'पूर्ण सुरक्षा गाइड सीखें'
      },
      protectionGuide: 'त्वरित सुरक्षा सुझाव',
      latestThreats: 'अभी सक्रिय खतरे',
      ctaButton: 'अपनी सुरक्षा शुरू करें →'
    },
    protect: {
      tools: {
        title: '🛡️ सुरक्षा उपकरण',
        subtitle: 'संदिग्ध लिंक, फ़ाइलें और संदेशों की तुरंत जांच करें'
      },
      stats: 'लाइव सुरक्षा आँकड़े',
      howItWorks: 'QuantumGuard कैसे काम करता है',
      ctaButton: '← पहले सुरक्षा वीडियो देखें'
    }
  }
};

const EDUCATION_VIDEOS = {
  en: [
    {
      id: 1,
      title: 'Digital Arrest Scam',
      duration: '5 min',
      desc: 'Fake CBI/Police officers on video calls',
      thumbnail: '🎭',
      views: '2.4M'
    },
    {
      id: 2,
      title: 'APK Malware Threat',
      duration: '3 min',
      desc: 'Never install apps from WhatsApp',
      thumbnail: '📱',
      views: '1.8M'
    },
    {
      id: 3,
      title: 'UPI Cashback Frauds',
      duration: '4 min',
      desc: 'Fake cashback apps stealing money',
      thumbnail: '💰',
      views: '1.5M'
    },
    {
      id: 4,
      title: 'Aadhar Phishing',
      duration: '3 min',
      desc: 'Spot fake government websites',
      thumbnail: '🆔',
      views: '1.2M'
    }
  ],
  hi: [
    {
      id: 1,
      title: 'डिजिटल अरेस्ट स्कैम',
      duration: '5 मिनट',
      desc: 'वीडियो कॉल पर नकली CBI/पुलिस',
      thumbnail: '🎭',
      views: '24 लाख'
    },
    {
      id: 2,
      title: 'APK मैलवेयर खतरा',
      duration: '3 मिनट',
      desc: 'WhatsApp से ऐप इंस्टॉल न करें',
      thumbnail: '📱',
      views: '18 लाख'
    },
    {
      id: 3,
      title: 'UPI कैशबैक धोखाधड़ी',
      duration: '4 मिनट',
      desc: 'नकली कैशबैक ऐप पैसे चुरा रहे हैं',
      thumbnail: '💰',
      views: '15 लाख'
    },
    {
      id: 4,
      title: 'आधार फ़िशिंग',
      duration: '3 मिनट',
      desc: 'नकली सरकारी वेबसाइट पहचानें',
      thumbnail: '🆔',
      views: '12 लाख'
    }
  ]
};

const DIGITAL_ARREST_INFO = {
  en: {
    what: [
      '📞 Scammer calls pretending to be CBI/Police officer',
      '⚠️ Claims arrest warrant issued in your name',
      '🎥 Forces you to stay on video call for hours ("digital arrest")',
      '💰 Demands ₹50,000-₹50 lakh to "clear charges"',
      '😰 Victim panics and transfers life savings'
    ],
    protection: [
      '🛡️ Threat Intelligence: Learns about scam patterns daily',
      '📱 SMS Guardian: Detects fake CBI/Police messages',
      '🔗 URL Checker: Blocks fake arrest warrant links',
      '🎓 Education: Teaches you the truth about digital arrest',
      '✅ Result: You recognize the scam and hang up immediately'
    ],
    facts: [
      '❌ Real CBI/Police NEVER call about arrests',
      '❌ No such thing as "digital arrest" in Indian law',
      '❌ Real agencies send PHYSICAL notices (by post)',
      '❌ No officer will ever ask for money over phone',
      '✅ If you get this call: HANG UP and report to 1930'
    ]
  },
  hi: {
    what: [
      '📞 स्कैमर CBI/पुलिस अधिकारी बनकर कॉल करता है',
      '⚠️ दावा करता है कि आपके नाम पर अरेस्ट वारंट जारी',
      '🎥 घंटों वीडियो कॉल पर रहने को मजबूर करता है ("डिजिटल अरेस्ट")',
      '💰 "आरोप साफ करने" के लिए ₹50,000-₹50 लाख मांगता है',
      '😰 पीड़ित घबरा कर जीवन भर की बचत ट्रांसफर कर देता है'
    ],
    protection: [
      '🛡️ खतरा खुफिया: रोज़ाना स्कैम पैटर्न सीखता है',
      '📱 SMS गार्डियन: नकली CBI/पुलिस संदेश पहचानता है',
      '🔗 URL चेकर: नकली अरेस्ट वारंट लिंक ब्लॉक करता है',
      '🎓 शिक्षा: डिजिटल अरेस्ट की सच्चाई सिखाता है',
      '✅ परिणाम: आप स्कैम पहचान लेते हैं और तुरंत फोन काट देते हैं'
    ],
    facts: [
      '❌ असली CBI/पुलिस अरेस्ट के बारे में कभी कॉल नहीं करते',
      '❌ भारतीय कानून में "डिजिटल अरेस्ट" जैसी कोई चीज़ नहीं',
      '❌ असली एजेंसियां फिजिकल नोटिस (डाक से) भेजती हैं',
      '❌ कोई अधिकारी फोन पर पैसे नहीं मांगेगा',
      '✅ अगर यह कॉल आए: तुरंत फोन काटें और 1930 पर रिपोर्ट करें'
    ]
  }
};

const PROTECTION_TIPS = {
  en: [
    '❌ Never install APKs from WhatsApp/Telegram',
    '❌ Don\'t share OTPs for money transfers',
    '✅ Only install apps from Play Store',
    '✅ Check URLs before clicking',
    '✅ Use QuantumGuard to verify suspicious content'
  ],
  hi: [
    '❌ WhatsApp/Telegram से APK इंस्टॉल न करें',
    '❌ पैसे ट्रांसफर के लिए OTP साझा न करें',
    '✅ केवल Play Store से ऐप इंस्टॉल करें',
    '✅ क्लिक करने से पहले URL जांचें',
    '✅ संदिग्ध सामग्री सत्यापित करने के लिए QuantumGuard उपयोग करें'
  ]
};

const LATEST_THREATS = {
  en: [
    {
      title: 'Digital Arrest CBI Calls',
      time: '2h ago',
      stolen: '₹120 crore in 2024'
    },
    {
      title: 'Fake UPI Cashback APK',
      time: '5h ago',
      stolen: '₹45 crore this month'
    },
    {
      title: 'Aadhar Blocking SMS',
      time: '1d ago',
      stolen: '2.3L victims'
    }
  ],
  hi: [
    {
      title: 'डिजिटल अरेस्ट CBI कॉल',
      time: '2 घंटे पहले',
      stolen: '2024 में ₹120 करोड़'
    },
    {
      title: 'नकली UPI कैशबैक APK',
      time: '5 घंटे पहले',
      stolen: 'इस महीने ₹45 करोड़'
    },
    {
      title: 'आधार ब्लॉकिंग SMS',
      time: '1 दिन पहले',
      stolen: '2.3 लाख पीड़ित'
    }
  ]
};

const FEATURE_CARDS = {
  en: [
    { id: 'apk', icon: Shield, title: 'APK Guardian', desc: 'Block malicious apps', color: 'from-red-500 to-orange-500' },
    { id: 'sms', icon: MessageSquare, title: 'SMS Guardian', desc: 'Detect fraud OTPs', color: 'from-blue-500 to-cyan-500' },
    { id: 'url', icon: LinkIcon, title: 'URL Checker', desc: 'Identify phishing links', color: 'from-purple-500 to-pink-500' },
    { id: 'downloads', icon: Download, title: 'Download Scanner', desc: 'Scan for malware', color: 'from-green-500 to-emerald-500' },
    { id: 'breach', icon: Database, title: 'Breach Check', desc: 'Monitor data leaks', color: 'from-yellow-500 to-orange-500' },
    { id: 'threats', icon: TrendingUp, title: 'Threat Intel', desc: 'Live threat updates', color: 'from-indigo-500 to-purple-500' }
  ],
  hi: [
    { id: 'apk', icon: Shield, title: 'APK गार्डियन', desc: 'दुर्भावनापूर्ण ऐप ब्लॉक करें', color: 'from-red-500 to-orange-500' },
    { id: 'sms', icon: MessageSquare, title: 'SMS गार्डियन', desc: 'धोखाधड़ी OTP पहचानें', color: 'from-blue-500 to-cyan-500' },
    { id: 'url', icon: LinkIcon, title: 'URL चेकर', desc: 'फ़िशिंग लिंक पहचानें', color: 'from-purple-500 to-pink-500' },
    { id: 'downloads', icon: Download, title: 'डाउनलोड स्कैनर', desc: 'मैलवेयर स्कैन करें', color: 'from-green-500 to-emerald-500' },
    { id: 'breach', icon: Database, title: 'ब्रीच चेक', desc: 'डेटा लीक की निगरानी', color: 'from-yellow-500 to-orange-500' },
    { id: 'threats', icon: TrendingUp, title: 'खतरा इंटेल', desc: 'लाइव खतरा अपडेट', color: 'from-indigo-500 to-purple-500' }
  ]
};

export default function HomePage({ onNavigate, lang }: Props) {
  const [activeTab, setActiveTab] = useState<'learn' | 'protect'>('learn');
  const [stats] = useState({
    threatsBlocked: 2847391,
    usersProtected: 124583,
    activeThreats: 847
  });

  const content = CONTENT[lang];
  const videos = EDUCATION_VIDEOS[lang];
  const digitalArrest = DIGITAL_ARREST_INFO[lang];
  const tips = PROTECTION_TIPS[lang];
  const threats = LATEST_THREATS[lang];
  const features = FEATURE_CARDS[lang];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* COMPACT HERO */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-block p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl">
          <Shield className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {content.hero.title}
        </h1>
        <p className="text-lg text-gray-300">{content.hero.subtitle}</p>
      </section>

      {/* TWO TABS */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setActiveTab('learn')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${
            activeTab === 'learn'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          📚 {content.tabs.learn}
        </button>
        <button
          onClick={() => setActiveTab('protect')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${
            activeTab === 'protect'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          🛡️ {content.tabs.protect}
        </button>
      </div>

      {/* LEARN TAB CONTENT */}
      {activeTab === 'learn' && (
        <div className="space-y-12">
          {/* Education Videos */}
          <section>
            <h2 className="text-3xl font-bold mb-2 text-center">{content.learn.videos.title}</h2>
            <p className="text-gray-400 text-center mb-6">{content.learn.videos.subtitle}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => onNavigate('education')}
                  className="group bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 hover:border-purple-500 hover:scale-105 transition text-left"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{video.thumbnail}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">{video.desc}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>⏱️ {video.duration}</span>
                        <span>👁️ {video.views}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500 transition">
                    <PlayCircle className="w-5 h-5" />
                    <span className="font-bold">{lang === 'en' ? 'Watch Now' : 'अभी देखें'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Digital Arrest Protection - FEATURED */}
          <section className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur rounded-3xl border-2 border-red-500 p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">{content.learn.digitalArrest.title}</h2>
              <p className="text-gray-300 text-lg">{content.learn.digitalArrest.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* What is Digital Arrest */}
              <div className="bg-black/40 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  {content.learn.digitalArrest.whatIs}
                </h3>
                <ul className="space-y-2">
                  {digitalArrest.what.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>

              {/* How QuantumGuard Protects */}
              <div className="bg-black/40 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  {content.learn.digitalArrest.howProtects}
                </h3>
                <ul className="space-y-2">
                  {digitalArrest.protection.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Key Facts */}
              <div className="bg-black/40 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                  {lang === 'en' ? 'Key Facts' : 'मुख्य तथ्य'}
                </h3>
                <ul className="space-y-2">
                  {digitalArrest.facts.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => onNavigate('education')}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg"
              >
                {content.learn.digitalArrest.learnMore} →
              </button>
            </div>
          </section>

          {/* Quick Protection Guide */}
          <section className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{content.learn.protectionGuide}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-black/30 rounded-lg p-4">
                  <span className="text-xl">{tip.startsWith('✅') ? '✅' : '❌'}</span>
                  <span className="text-gray-200">{tip.substring(2)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Latest Threats */}
          <section className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{content.learn.latestThreats}</h2>
            <div className="space-y-4">
              {threats.map((threat, i) => (
                <div key={i} className="bg-red-900/20 rounded-xl border-l-4 border-red-500 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white mb-1">{threat.title}</h3>
                      <p className="text-sm text-red-400">💰 {threat.stolen}</p>
                    </div>
                    <span className="text-xs text-gray-400">{threat.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA to Protect Tab */}
          <div className="text-center">
            <button
              onClick={() => setActiveTab('protect')}
              className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-xl hover:scale-105 transition shadow-lg"
            >
              {content.learn.ctaButton}
            </button>
          </div>
        </div>
      )}

      {/* PROTECT TAB CONTENT */}
      {activeTab === 'protect' && (
        <div className="space-y-12">
          {/* Feature Cards */}
          <section>
            <h2 className="text-3xl font-bold mb-2 text-center">{content.protect.tools.title}</h2>
            <p className="text-gray-400 text-center mb-6">{content.protect.tools.subtitle}</p>
            
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
                    <span>{lang === 'en' ? 'Use Now' : 'अभी उपयोग करें'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Live Stats */}
          <section className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur rounded-3xl border-2 border-green-500 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{content.protect.stats}</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold text-green-400 mb-2">
                  {stats.threatsBlocked.toLocaleString()}
                </p>
                <p className="text-sm text-gray-300">{lang === 'en' ? 'Threats Blocked' : 'खतरे ब्लॉक किए गए'}</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-cyan-400 mb-2">
                  {stats.usersProtected.toLocaleString()}
                </p>
                <p className="text-sm text-gray-300">{lang === 'en' ? 'Users Protected' : 'उपयोगकर्ता सुरक्षित'}</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-orange-400 mb-2">
                  {stats.activeThreats}
                </p>
                <p className="text-sm text-gray-300">{lang === 'en' ? 'Active Threats' : 'सक्रिय खतरे'}</p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{content.protect.howItWorks}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-block p-6 bg-blue-500/20 rounded-full mb-4">
                  <Database className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{lang === 'en' ? '1. Fetch Threats' : '1. खतरे प्राप्त करें'}</h3>
                <p className="text-sm text-gray-400">{lang === 'en' ? 'Updates from 50+ sources every 6 hours' : 'हर 6 घंटे में 50+ स्रोतों से अपडेट'}</p>
              </div>
              <div className="text-center">
                <div className="inline-block p-6 bg-purple-500/20 rounded-full mb-4">
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{lang === 'en' ? '2. AI Learning' : '2. AI सीखना'}</h3>
                <p className="text-sm text-gray-400">{lang === 'en' ? 'Real-time detection updates' : 'वास्तविक समय पहचान अपडेट'}</p>
              </div>
              <div className="text-center">
                <div className="inline-block p-6 bg-green-500/20 rounded-full mb-4">
                  <Shield className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{lang === 'en' ? '3. Protect You' : '3. आपकी रक्षा'}</h3>
                <p className="text-sm text-gray-400">{lang === 'en' ? 'Blocks scams instantly' : 'तुरंत स्कैम ब्लॉक करता है'}</p>
              </div>
            </div>
          </section>

          {/* CTA back to Learn Tab */}
          <div className="text-center">
            <button
              onClick={() => setActiveTab('learn')}
              className="px-12 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-xl hover:scale-105 transition shadow-lg"
            >
              {content.protect.ctaButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}