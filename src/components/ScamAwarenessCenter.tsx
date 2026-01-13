'use client';
import { useState } from 'react';
import { AlertTriangle, TrendingUp, Shield, ExternalLink, PlayCircle, Newspaper, Phone } from 'lucide-react';

interface ScamAlert {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium';
  amount: string;
  description: string;
  date: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
}

// Props interface - FIX FOR BUILD ERROR
interface ScamAwarenessCenterProps {
  lang?: 'en' | 'hi';
}

export default function ScamAwarenessCenter({ lang = 'en' }: ScamAwarenessCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const content = {
    en: {
      title: '📰 Scam Awareness Center',
      subtitle: 'Stay updated on latest scam threats and learn how to protect yourself',
      
      latestAlerts: 'Latest Scam Alerts',
      viewAll: 'View All Alerts',
      
      recentScams: [
        {
          id: '1',
          title: 'Digital Arrest Scam Surge',
          type: 'Digital Arrest',
          severity: 'critical' as const,
          amount: '₹120 Crores lost',
          description: 'Scammers impersonate police/CBI officials, claim victim involved in crime, demand immediate money transfer.',
          date: 'Dec 2024'
        },
        {
          id: '2',
          title: 'WhatsApp Ghost Pairing Attack',
          type: 'Account Takeover',
          severity: 'high' as const,
          amount: '₹50 Crores lost',
          description: 'Attackers pair victim\'s WhatsApp with their device, access messages, contacts, and extort money.',
          date: 'Nov 2024'
        },
        {
          id: '3',
          title: 'UPI Fraud via QR Codes',
          type: 'Payment Fraud',
          severity: 'high' as const,
          amount: '₹95 Crores lost',
          description: 'Fake QR codes sent via SMS/WhatsApp claiming refunds, actually requesting payment instead.',
          date: 'Dec 2024'
        },
        {
          id: '4',
          title: 'Job Offer Scams',
          type: 'Employment Fraud',
          severity: 'medium' as const,
          amount: '₹100 Crores lost',
          description: 'Fake job offers from "international companies" demand upfront fees for processing, training, or equipment.',
          date: 'Nov 2024'
        }
      ],
      
      educationalVideos: 'Educational Videos',
      videosDescription: 'Learn from experts how to identify and avoid scams',
      
      videos: [
        {
          id: '1',
          title: 'Digital Arrest Alert - Expert Debate',
          description: 'Comprehensive discussion on digital arrest scams by cybersecurity experts',
          videoId: 'GWLkfkMnU70',
          duration: '45:30'
        },
        {
          id: '2',
          title: 'Financial Safety Training - Official NCERT & I4C',
          description: 'Government-approved training on protecting yourself from financial fraud',
          videoId: '7at69Ttn4jc',
          duration: '32:15'
        },
        {
          id: '3',
          title: 'Scam Trends 2026 - Rising Fraud Cases',
          description: 'Latest scam patterns and fraud trends emerging in India',
          videoId: '3VgukEZ24mY',
          duration: '28:45'
        }
      ],
      
      scamTypes: 'Common Scam Types in India',
      categories: {
        all: 'All Scams',
        digital: 'Digital Arrest',
        banking: 'Banking Fraud',
        investment: 'Investment Scams',
        employment: 'Job Scams'
      },
      
      preventionTips: 'Prevention Tips',
      tips: [
        'Never share OTP, CVV, or passwords with anyone - even "bank officials"',
        'Police/CBI never arrest people over phone calls',
        'Verify caller identity by calling official numbers from website',
        'Enable 2-factor authentication on all accounts',
        'Don\'t click links in unsolicited SMS/emails',
        'Report suspicious numbers to 1930 immediately',
        'Use strong, unique passwords for each account',
        'Keep your phone\'s OS and apps updated'
      ],
      
      reportScam: 'Report a Scam',
      reportDescription: 'Help protect others by reporting scams',
      reportButton: 'Report to Authorities',
      
      resources: 'Helpful Resources',
      resourceLinks: [
        { name: 'National Cybercrime Portal', url: 'https://cybercrime.gov.in' },
        { name: 'Reserve Bank of India - Fraud Alerts', url: 'https://rbi.org.in' },
        { name: 'TRAI - DND Services', url: 'https://www.trai.gov.in' },
        { name: 'Cyber Helpline - 1930', url: 'tel:1930' }
      ]
    },
    hi: {
      title: '📰 घोटाला जागरूकता केंद्र',
      subtitle: 'नवीनतम घोटाला खतरों पर अपडेट रहें और अपनी सुरक्षा करना सीखें',
      
      latestAlerts: 'नवीनतम घोटाला अलर्ट',
      viewAll: 'सभी अलर्ट देखें',
      
      recentScams: [
        {
          id: '1',
          title: 'डिजिटल अरेस्ट घोटाला में वृद्धि',
          type: 'डिजिटल अरेस्ट',
          severity: 'critical' as const,
          amount: '₹120 करोड़ का नुकसान',
          description: 'घोटालेबाज पुलिस/CBI अधिकारियों का रूप धारण करते हैं, दावा करते हैं कि पीड़ित अपराध में शामिल है।',
          date: 'दिसंबर 2024'
        },
        {
          id: '2',
          title: 'व्हाट्सएप घोस्ट पेयरिंग हमला',
          type: 'खाता अधिग्रहण',
          severity: 'high' as const,
          amount: '₹50 करोड़ का नुकसान',
          description: 'हमलावर पीड़ित के व्हाट्सएप को अपने डिवाइस से पेयर करते हैं।',
          date: 'नवंबर 2024'
        },
        {
          id: '3',
          title: 'QR कोड के माध्यम से UPI धोखाधड़ी',
          type: 'भुगतान धोखाधड़ी',
          severity: 'high' as const,
          amount: '₹95 करोड़ का नुकसान',
          description: 'नकली QR कोड SMS/व्हाट्सएप के माध्यम से भेजे जाते हैं।',
          date: 'दिसंबर 2024'
        },
        {
          id: '4',
          title: 'नौकरी की पेशकश घोटाला',
          type: 'रोजगार धोखाधड़ी',
          severity: 'medium' as const,
          amount: '₹100 करोड़ का नुकसान',
          description: 'नकली नौकरी की पेशकश अग्रिम शुल्क की मांग करती हैं।',
          date: 'नवंबर 2024'
        }
      ],
      
      educationalVideos: 'शैक्षिक वीडियो',
      videosDescription: 'विशेषज्ञों से सीखें कि घोटालों की पहचान कैसे करें',
      
      videos: [
        {
          id: '1',
          title: 'डिजिटल अरेस्ट अलर्ट - विशेषज्ञ बहस',
          description: 'साइबर सुरक्षा विशेषज्ञों द्वारा डिजिटल अरेस्ट घोटाले पर व्यापक चर्चा',
          videoId: 'GWLkfkMnU70',
          duration: '45:30'
        },
        {
          id: '2',
          title: 'वित्तीय सुरक्षा प्रशिक्षण - आधिकारिक NCERT और I4C',
          description: 'वित्तीय धोखाधड़ी से खुद को बचाने के लिए सरकार द्वारा अनुमोदित प्रशिक्षण',
          videoId: '7at69Ttn4jc',
          duration: '32:15'
        },
        {
          id: '3',
          title: 'घोटाला रुझान 2026 - बढ़ते धोखाधड़ी मामले',
          description: 'भारत में उभरते नवीनतम घोटाला पैटर्न और धोखाधड़ी रुझान',
          videoId: '3VgukEZ24mY',
          duration: '28:45'
        }
      ],
      
      scamTypes: 'भारत में सामान्य घोटाले के प्रकार',
      
      preventionTips: 'रोकथाम टिप्स',
      tips: [
        'OTP, CVV, या पासवर्ड किसी के साथ साझा न करें',
        'पुलिस/CBI कभी भी फोन कॉल पर लोगों को गिरफ्तार नहीं करते',
        'वेबसाइट से आधिकारिक नंबरों पर कॉल करके सत्यापित करें',
        'सभी खातों पर 2-कारक प्रमाणीकरण सक्षम करें',
        'अवांछित SMS/ईमेल में लिंक पर क्लिक न करें',
        'संदिग्ध नंबरों को तुरंत 1930 पर रिपोर्ट करें',
        'मजबूत, अद्वितीय पासवर्ड का उपयोग करें',
        'अपने फोन के OS और ऐप्स को अपडेट रखें'
      ],
      
      reportScam: 'घोटाला रिपोर्ट करें',
      reportDescription: 'घोटालों की रिपोर्ट करके दूसरों की सुरक्षा में मदद करें',
      reportButton: 'अधिकारियों को रिपोर्ट करें',
      
      resources: 'उपयोगी संसाधन'
    }
  };

  const t = content[lang];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/20 border-red-500/50 text-red-400';
      case 'high': return 'bg-orange-600/20 border-orange-500/50 text-orange-400';
      case 'medium': return 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400';
      default: return 'bg-blue-600/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100">{t.subtitle}</p>
      </div>

      {/* Latest Scam Alerts */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-2xl flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            {t.latestAlerts}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {t.recentScams.map((scam) => (
            <div
              key={scam.id}
              className={`border rounded-xl p-4 ${getSeverityColor(scam.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{scam.title}</h3>
                  <p className="text-sm opacity-80">{scam.type}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-black/30">
                  {scam.date}
                </span>
              </div>
              
              <p className="text-sm mb-3 text-gray-300">{scam.description}</p>
              
              <div className="flex items-center gap-2 text-sm font-bold">
                <TrendingUp className="w-4 h-4" />
                {scam.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Videos - EMBEDDED YOUTUBE */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-2xl mb-2 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-blue-400" />
          {t.educationalVideos}
        </h2>
        <p className="text-gray-400 mb-4">{t.videosDescription}</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {t.videos.map((video) => (
            <div key={video.id} className="bg-black/50 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition">
              {/* Embedded YouTube Video */}
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
                  className="w-full h-full"
                  allowFullScreen
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-bold mb-1">{video.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{video.duration}</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Watch on YouTube
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Backup: If no videos, show placeholder */}
        {t.videos.length === 0 && (
          <div className="text-center py-8">
            <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Educational videos coming soon!</p>
          </div>
        )}
      </div>

      {/* Prevention Tips */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" />
          {t.preventionTips}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-3">
          {t.tips.map((tip, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-3 flex items-start gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Scam CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-center">
        <h3 className="font-bold text-2xl mb-3">{t.reportScam}</h3>
        <p className="text-gray-200 mb-4">{t.reportDescription}</p>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition">
          <Phone className="w-5 h-5" />
          {t.reportButton}
        </a>
      </div>
    </div>
  );
}