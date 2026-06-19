'use client';

import { BookOpen, Shield, Phone, Link2, Mail, Play, Search, CheckCircle, X, ChevronDown, Award, Eye, Clock, Filter, Smartphone, CreditCard, ShoppingCart, Briefcase, Heart, Package, Image as ImageIcon, Users, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface Props {
  lang: 'en' | 'hi';
}

type VideoCategory =
  | 'reporting' | 'digital-arrest' | 'fake-police'
  | 'whatsapp-otp' | 'upi-fraud' | 'kyc-scam'
  | 'shopping-fraud' | 'investment-scam' | 'elder-safety'
  | 'spam-calls' | 'parcel-scam' | 'romance-scam' | 'steganography';

interface Video {
  id: string;
  title: string;
  titleHi: string;
  youtubeId: string;
  category: VideoCategory;
  isNew?: boolean;
}

interface CategoryInfo {
  id: VideoCategory;
  label: string;
  labelHi: string;
  icon: typeof Phone;
  color: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'reporting', label: 'How to Report', labelHi: 'रिपोर्ट कैसे करें', icon: Phone, color: 'text-red-400 bg-red-500/20' },
  { id: 'digital-arrest', label: 'Digital Arrest', labelHi: 'डिजिटल अरेस्ट', icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/20' },
  { id: 'fake-police', label: 'Fake Police Calls', labelHi: 'नकली पुलिस कॉल', icon: Phone, color: 'text-yellow-400 bg-yellow-500/20' },
  { id: 'whatsapp-otp', label: 'WhatsApp/OTP Scam', labelHi: 'WhatsApp/OTP स्कैम', icon: Smartphone, color: 'text-green-400 bg-green-500/20' },
  { id: 'upi-fraud', label: 'UPI Fraud', labelHi: 'UPI धोखाधड़ी', icon: CreditCard, color: 'text-blue-400 bg-blue-500/20' },
  { id: 'kyc-scam', label: 'KYC Scam', labelHi: 'KYC स्कैम', icon: Mail, color: 'text-purple-400 bg-purple-500/20' },
  { id: 'shopping-fraud', label: 'Shopping Fraud', labelHi: 'शॉपिंग धोखाधड़ी', icon: ShoppingCart, color: 'text-pink-400 bg-pink-500/20' },
  { id: 'investment-scam', label: 'Investment Scam', labelHi: 'निवेश स्कैम', icon: Briefcase, color: 'text-emerald-400 bg-emerald-500/20' },
  { id: 'elder-safety', label: 'Elder Safety', labelHi: 'बुजुर्ग सुरक्षा', icon: Users, color: 'text-teal-400 bg-teal-500/20' },
  { id: 'spam-calls', label: 'Spam Calls', labelHi: 'स्पैम कॉल', icon: Phone, color: 'text-indigo-400 bg-indigo-500/20' },
  { id: 'parcel-scam', label: 'Parcel/Courier Scam', labelHi: 'पार्सल स्कैम', icon: Package, color: 'text-amber-400 bg-amber-500/20' },
  { id: 'romance-scam', label: 'Romance Scam', labelHi: 'रोमांस स्कैम', icon: Heart, color: 'text-rose-400 bg-rose-500/20' },
  { id: 'steganography', label: 'Image Attacks', labelHi: 'छवि हमले', icon: ImageIcon, color: 'text-cyan-400 bg-cyan-500/20' },
];

const VIDEOS: Video[] = [
  { id: '1', title: 'How to Report Cybercrime in India - 1930', titleHi: 'साइबर क्राइम रिपोर्ट करें - 1930', youtubeId: 'qi1Kz3_cTBg', category: 'reporting' },
  { id: '2', title: 'Report Cybercrime Process Guide', titleHi: 'रिपोर्ट प्रक्रिया', youtubeId: 'GOrBC-_hFRQ', category: 'reporting' },
  { id: '3', title: 'Digital Arrest Scam Awareness', titleHi: 'डिजिटल अरेस्ट स्कैम', youtubeId: 'JGoVuPTtRgg', category: 'digital-arrest' },
  { id: '4', title: 'Digital Arrest - What You Need to Know', titleHi: 'डिजिटल अरेस्ट - जानकारी', youtubeId: 'je6wqPapdo4', category: 'digital-arrest' },
  { id: '5', title: 'Digital Arrest Scam Full Explanation', titleHi: 'डिजिटल अरेस्ट पूरी जानकारी', youtubeId: 'gqCN7mAusDo', category: 'digital-arrest' },
  { id: '6', title: 'Digital Arrest Protection Tips', titleHi: 'डिजिटल अरेस्ट से बचाव', youtubeId: 'Gujj0LieaXQ', category: 'digital-arrest' },
  { id: '7', title: 'Fake Police Call Scam Warning', titleHi: 'नकली पुलिस कॉल', youtubeId: 'rzENHbN7bys', category: 'fake-police' },
  { id: '8', title: 'How Scammers Fake Police Calls', titleHi: 'नकली पुलिस कॉल कैसे', youtubeId: 'kPyxRhQdWMg', category: 'fake-police' },
  { id: '9', title: 'Fake Police Call Detection', titleHi: 'नकली कॉल पहचान', youtubeId: 'hrD8TpPB1ww', category: 'fake-police' },
  { id: '10', title: 'Police Impersonation Scam Alert', titleHi: 'पुलिस नकल स्कैम', youtubeId: 'CgWg63EICPg', category: 'fake-police' },
  { id: '11', title: 'WhatsApp OTP Scam Prevention', titleHi: 'WhatsApp OTP स्कैम', youtubeId: 'xKMTohHS1Cs', category: 'whatsapp-otp' },
  { id: '12', title: 'WhatsApp OTP Hijacking Warning', titleHi: 'WhatsApp OTP हाईजैक', youtubeId: 'qL7mcMtBrig', category: 'whatsapp-otp' },
  { id: '13', title: 'Protect Your WhatsApp OTP', titleHi: 'WhatsApp OTP बचाव', youtubeId: 'XHcmwdWJX6A', category: 'whatsapp-otp' },
  { id: '14', title: 'WhatsApp OTP Scam Complete Guide', titleHi: 'WhatsApp OTP गाइड', youtubeId: 'zLrXmAdVnN8', category: 'whatsapp-otp' },
  { id: '15', title: 'UPI Fraud Detection and Prevention', titleHi: 'UPI धोखाधड़ी', youtubeId: 'xDTwJfIS9VM', category: 'upi-fraud' },
  { id: '16', title: 'UPI Payment Scam Alert', titleHi: 'UPI पेमेंट स्कैम', youtubeId: 'QwakLxuZT7Y', category: 'upi-fraud' },
  { id: '17', title: 'UPI Fraud Types Explained', titleHi: 'UPI धोखाधड़ी प्रकार', youtubeId: 'pvcPieOxNzI', category: 'upi-fraud' },
  { id: '18', title: 'Stay Safe from UPI Scams', titleHi: 'UPI स्कैम से बचें', youtubeId: 'AgUBW5Sp8A8', category: 'upi-fraud' },
  { id: '19', title: 'Fake KYC Update Scam Warning', titleHi: 'नकली KYC अपडेट', youtubeId: 'W2NlbEE7BmU', category: 'kyc-scam' },
  { id: '20', title: 'KYC Fraud Prevention Tips', titleHi: 'KYC धोखाधड़ी बचाव', youtubeId: 'sb3EA3muelY', category: 'kyc-scam' },
  { id: '21', title: 'Fake KYC SMS Alert', titleHi: 'नकली KYC SMS', youtubeId: 'iFhPTg0KwSg', category: 'kyc-scam' },
  { id: '22', title: 'KYC Scam Complete Guide', titleHi: 'KYC स्कैम गाइड', youtubeId: '9QyzUejcxzI', category: 'kyc-scam' },
  { id: '23', title: 'Online Shopping Fraud Prevention', titleHi: 'ऑनलाइन शॉपिंग धोखाधड़ी', youtubeId: 'ygH_BmJivg4', category: 'shopping-fraud' },
  { id: '24', title: 'Shopping Scam Warning Signs', titleHi: 'शॉपिंग स्कैम संकेत', youtubeId: 'G2RnH7964dE', category: 'shopping-fraud' },
  { id: '25', title: 'Fake Shopping Website Alert', titleHi: 'नकली शॉपिंग वेबसाइट', youtubeId: 'Gq7SfCrIAEI', category: 'shopping-fraud' },
  { id: '26', title: 'Online Shopping Safety Tips', titleHi: 'शॉपिंग सुरक्षा टिप्स', youtubeId: '-ukzK8KtPs4', category: 'shopping-fraud' },
  { id: '27', title: 'Investment and Ponzi Scheme Alert', titleHi: 'निवेश स्कीम', youtubeId: 'zeBxZUE57yY', category: 'investment-scam' },
  { id: '28', title: 'Investment Scam Warning', titleHi: 'निवेश स्कैम चेतावनी', youtubeId: 'wOLTLyHvK7s', category: 'investment-scam' },
  { id: '29', title: 'Ponzi Scheme Detection', titleHi: 'पोंजी स्कीम पहचान', youtubeId: 's5hoqONxPiY', category: 'investment-scam' },
  { id: '30', title: 'Investment Fraud Prevention', titleHi: 'निवेश धोखाधड़ी बचाव', youtubeId: 'rCaH-nlzxYc', category: 'investment-scam' },
  { id: '31', title: 'Protecting Senior Citizens from Scams', titleHi: 'बुजुर्गों की सुरक्षा', youtubeId: 'QiWcLQLvy5c', category: 'elder-safety' },
  { id: '32', title: 'Senior Citizen Cyber Safety', titleHi: 'बुजुर्ग साइबर सुरक्षा', youtubeId: '4S1T8BBmack', category: 'elder-safety' },
  { id: '33', title: 'Elder Scam Prevention Guide', titleHi: 'बुजुर्ग स्कैम बचाव', youtubeId: 'ltI7DXrNQCA', category: 'elder-safety' },
  { id: '34', title: 'How to Identify Spam Calls', titleHi: 'स्पैम कॉल पहचान', youtubeId: 'p8VRCoxKdhA', category: 'spam-calls' },
  { id: '35', title: 'Spam Call Detection Tips', titleHi: 'स्पैम कॉल टिप्स', youtubeId: '8Gi2lu8u1FI', category: 'spam-calls' },
  { id: '36', title: 'Block Spam Calls Effectively', titleHi: 'स्पैम कॉल ब्लॉक करें', youtubeId: 'Eu-SELVYLTA', category: 'spam-calls' },
  { id: '37', title: 'Spam Call Prevention Guide', titleHi: 'स्पैम कॉल बचाव गाइड', youtubeId: 'NSAWEpSKM5M', category: 'spam-calls' },
  { id: '38', title: 'Fake Parcel Delivery Scam', titleHi: 'नकली पार्सल स्कैम', youtubeId: '5m5KLgyFcWk', category: 'parcel-scam' },
  { id: '39', title: 'Parcel Delivery Fraud Alert', titleHi: 'पार्सल धोखाधड़ी', youtubeId: 'C4_hGgx7Cs4', category: 'parcel-scam' },
  { id: '40', title: 'Fake Courier Scam Warning', titleHi: 'नकली कूरियर स्कैम', youtubeId: 'obQbHXJqL0Y', category: 'parcel-scam' },
  { id: '41', title: 'Delivery Scam Prevention', titleHi: 'डिलीवरी स्कैम बचाव', youtubeId: '7JwgSmQj8TI', category: 'parcel-scam' },
  { id: '42', title: 'Dating App and Romance Scams', titleHi: 'डेटिंग स्कैम', youtubeId: 'hjm2BiK60Ic', category: 'romance-scam' },
  { id: '43', title: 'Online Romance Fraud Alert', titleHi: 'रोमांस धोखाधड़ी', youtubeId: 'iOZjnEEwP3Q', category: 'romance-scam' },
  { id: '44', title: 'Dating Scam Warning Signs', titleHi: 'डेटिंग स्कैम संकेत', youtubeId: 'ViGtdTXYFfE', category: 'romance-scam' },
  { id: '45', title: 'Romance Scam Prevention Guide', titleHi: 'रोमांस स्कैम बचाव', youtubeId: 'ZHYIXonplmA', category: 'romance-scam' },
  { id: '46', title: 'Steganography Attack Warning', titleHi: 'स्टेगनोग्राफी हमला', youtubeId: 'ZNtt18NW7io', category: 'steganography', isNew: true },
  { id: '47', title: 'Hidden Malware in Images Alert', titleHi: 'छवियों में मैलवेयर', youtubeId: 'jjzp46Bj4II', category: 'steganography', isNew: true },
  { id: '48', title: 'Image-based Cyber Attacks', titleHi: 'छवि साइबर हमले', youtubeId: 'tY4sQehHlwM', category: 'steganography', isNew: true },
];

const CONTENT = {
  en: {
    title: 'Cyber Safety Academy',
    subtitle: '48 Expert Videos to Keep You & Your Family Safe',
    quickTips: 'Quick Safety Tips',
    videos: 'Educational Videos',
    watchNow: 'Watch Now',
    newBadge: 'NEW',
    reportFirst: 'IMPORTANT: Call 1930 to report cybercrime',
    search: 'Search videos...',
    allCategories: 'All Categories',
    watched: 'Watched',
    markWatched: 'Mark as Watched',
    progress: 'Your Progress',
    videosWatched: 'videos watched',
    filterBy: 'Filter by Topic',
    showing: 'Showing',
    of: 'of',
    shareKnowledge: 'Share Knowledge',
    shareMsg: 'Help your family stay safe',
    shareBtn: 'Share App',
    tips: [
      'Never share OTP codes with anyone',
      'Banks never ask passwords on call',
      'Check for HTTPS before entering data',
      'Verify urgent messages through official channels',
      'Never download images from unknown numbers',
      'Scan images for hidden malware before opening'
    ]
  },
  hi: {
    title: 'साइबर सुरक्षा अकादमी',
    subtitle: 'आप और आपके परिवार को सुरक्षित रखने के लिए 48 विशेषज्ञ वीडियो',
    quickTips: 'सुरक्षा टिप्स',
    videos: 'वीडियो',
    watchNow: 'देखें',
    newBadge: 'नया',
    reportFirst: 'महत्वपूर्ण: साइबर क्राइम रिपोर्ट के लिए 1930 कॉल करें',
    search: 'वीडियो खोजें...',
    allCategories: 'सभी श्रेणियां',
    watched: 'देखा',
    markWatched: 'देखा के रूप में चिह्नित करें',
    progress: 'आपकी प्रगति',
    videosWatched: 'वीडियो देखे',
    filterBy: 'विषय के अनुसार फ़िल्टर करें',
    showing: 'दिखा रहे',
    of: 'में से',
    shareKnowledge: 'ज्ञान साझा करें',
    shareMsg: 'परिवार को सुरक्षित रखें',
    shareBtn: 'ऐप शेयर करें',
    tips: [
      'OTP किसी के साथ शेयर न करें',
      'बैंक कभी कॉल पर पासवर्ड नहीं मांगते',
      'डेटा दर्ज करने से पहले HTTPS जांचें',
      'आधिकारिक चैनलों से संदेश सत्यापित करें',
      'अज्ञात नंबरों से इमेज डाउनलोड न करें',
      'इमेज खोलने से पहले मैलवेयर स्कैन करें'
    ]
  }
};

const WATCHED_KEY = 'qs_education_watched';

export default function Education({ lang }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<VideoCategory | 'all'>('all');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const content = CONTENT[lang];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHED_KEY);
      if (stored) setWatchedIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const saveWatched = (ids: Set<string>) => {
    setWatchedIds(ids);
    try { localStorage.setItem(WATCHED_KEY, JSON.stringify([...ids])); } catch {}
  };

  const toggleWatched = (videoId: string) => {
    const next = new Set(watchedIds);
    if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
    saveWatched(next);
  };

  const filteredVideos = useMemo(() => {
    return VIDEOS.filter(v => {
      const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
      const matchesSearch = !searchQuery ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.titleHi.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const progressPercent = Math.round((watchedIds.size / VIDEOS.length) * 100);

  const getCategoryInfo = (categoryId: VideoCategory): CategoryInfo => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4">
          <BookOpen className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400 text-lg">{content.subtitle}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{content.progress}</span>
          </div>
          <span className="text-sm text-gray-400">
            {watchedIds.size}/{VIDEOS.length} {content.videosWatched} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className="text-green-400 text-sm mt-2 font-bold text-center">
            {lang === 'en' ? 'Congratulations! You completed all 48 videos!' : 'बधाई! आपने सभी 48 वीडियो पूरे कर लिए!'}
          </p>
        )}
      </div>

      {/* Emergency Report Banner */}
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur rounded-2xl border border-red-500/50 p-5 mb-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-1">{content.reportFirst}</h3>
        <p className="text-gray-300 text-sm">
          {lang === 'en'
            ? 'First 2 videos show you how to report cybercrime in India. Watch them first!'
            : 'पहले 2 वीडियो बताते हैं कि साइबर क्राइम कैसे रिपोर्ट करें।'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={content.search}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 outline-none text-white placeholder-gray-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-cyan-500/50 transition min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">
                {activeCategory === 'all'
                  ? content.allCategories
                  : (lang === 'en' ? getCategoryInfo(activeCategory as VideoCategory).label : getCategoryInfo(activeCategory as VideoCategory).labelHi)}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryDropdown && (
            <div className="absolute top-full mt-1 left-0 right-0 md:w-72 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-30 max-h-80 overflow-y-auto">
              <button
                onClick={() => { setActiveCategory('all'); setShowCategoryDropdown(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition flex items-center gap-2 ${activeCategory === 'all' ? 'bg-cyan-500/20 text-cyan-400' : ''}`}
              >
                <Shield className="w-4 h-4" />
                {content.allCategories} ({VIDEOS.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = VIDEOS.filter(v => v.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition flex items-center gap-2 ${activeCategory === cat.id ? 'bg-cyan-500/20 text-cyan-400' : ''}`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {lang === 'en' ? cat.label : cat.labelHi} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Pills (horizontal scroll) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${
            activeCategory === 'all' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {content.allCategories}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-1.5 ${
              activeCategory === cat.id ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {lang === 'en' ? cat.label : cat.labelHi}
          </button>
        ))}
      </div>

      {/* Quick Safety Tips (collapsible) */}
      <details className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5 mb-8 group">
        <summary className="text-xl font-bold flex items-center gap-3 cursor-pointer list-none">
          <Shield className="w-6 h-6 text-cyan-400" />
          {content.quickTips}
          <ChevronDown className="w-5 h-5 ml-auto group-open:rotate-180 transition" />
        </summary>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {content.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-black/30 rounded-xl p-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </details>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/20 max-w-4xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold">{lang === 'en' ? selectedVideo.title : selectedVideo.titleHi}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {(() => { const cat = getCategoryInfo(selectedVideo.category); return (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
                      {lang === 'en' ? cat.label : cat.labelHi}
                    </span>
                  ); })()}
                  {watchedIds.has(selectedVideo.id) && (
                    <span className="text-xs text-green-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {content.watched}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWatched(selectedVideo.id); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    watchedIds.has(selectedVideo.id)
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400'
                  }`}
                >
                  {watchedIds.has(selectedVideo.id) ? content.watched : content.markWatched}
                </button>
                <button onClick={() => setSelectedVideo(null)} className="text-3xl hover:text-red-400 transition leading-none">&times;</button>
              </div>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Counter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Play className="w-5 h-5 text-cyan-400" />
          {content.showing} {filteredVideos.length} {content.of} {VIDEOS.length} {content.videos}
        </h3>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {lang === 'en' ? 'No videos found. Try a different search.' : 'कोई वीडियो नहीं मिला। अलग खोज करें।'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map(video => {
            const catInfo = getCategoryInfo(video.category);
            const isWatched = watchedIds.has(video.id);
            return (
              <div
                key={video.id}
                className={`bg-white/5 backdrop-blur rounded-2xl border overflow-hidden hover:border-cyan-400/50 transition-all group cursor-pointer relative ${
                  isWatched ? 'border-green-500/30' : 'border-white/10'
                }`}
                onClick={() => setSelectedVideo(video)}
              >
                {video.isNew && (
                  <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">{content.newBadge}</div>
                )}
                {isWatched && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-green-600/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {content.watched}
                  </div>
                )}
                <div className="relative aspect-video bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    className={`w-full h-full object-cover ${isWatched ? 'opacity-70' : ''}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                      <Play className="w-7 h-7 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${catInfo.color}`}>
                      {lang === 'en' ? catInfo.label : catInfo.labelHi}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mb-3 line-clamp-2">{lang === 'en' ? video.title : video.titleHi}</h4>
                  <div className="flex items-center justify-between">
                    <button className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      {content.watchNow}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWatched(video.id); }}
                      className={`ml-2 p-2 rounded-xl transition ${isWatched ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500 hover:text-cyan-400'}`}
                      title={isWatched ? content.watched : content.markWatched}
                    >
                      {isWatched ? <CheckCircle className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Section */}
      <div className="mt-10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-2xl border border-purple-400/30 p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">{content.shareKnowledge}</h3>
        <p className="text-gray-300 mb-5">{content.shareMsg}</p>
        <button
          onClick={() => {
            const msg = 'QuantumShield - 48 Cyber Safety Videos. Stay Protected! https://quantumshield.vercel.app/education';
            if (navigator.share) { navigator.share({ text: msg }); } else { navigator.clipboard.writeText(msg); }
          }}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold text-lg hover:scale-105 transition"
        >
          {content.shareBtn}
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500 italic border-t border-white/10 pt-4">
        Educational videos from YouTube for public awareness. All content belongs to respective creators.
      </div>
    </div>
  );
}
