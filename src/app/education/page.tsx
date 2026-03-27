'use client';
import { useState, useMemo } from 'react';
import {
  BookOpen, Play, Phone, Mail, Globe,
  Search, Shield, X, ChevronDown
} from 'lucide-react';
import BackToHome from '@/components/BackToHome';

// ─── All 48 videos ────────────────────────────────────────────────────────────
const VIDEOS = [
  // Reporting
  { id: '1',  title: 'How to Report Cybercrime in India - 1930',       titleHi: 'साइबर क्राइम रिपोर्ट करें - 1930',         youtubeId: 'qi1Kz3_cTBg', cat: 'reporting' },
  { id: '2',  title: 'Report Cybercrime Process Guide',                titleHi: 'रिपोर्ट प्रक्रिया गाइड',                   youtubeId: 'GOrBC-_hFRQ', cat: 'reporting' },
  // Digital Arrest
  { id: '3',  title: 'Digital Arrest Scam Awareness',                  titleHi: 'डिजिटल अरेस्ट स्कैम जागरूकता',            youtubeId: 'JGoVuPTtRgg', cat: 'digital-arrest' },
  { id: '4',  title: 'Digital Arrest - What You Need to Know',         titleHi: 'डिजिटल अरेस्ट - जानकारी',                  youtubeId: 'je6wqPapdo4', cat: 'digital-arrest' },
  { id: '5',  title: 'Digital Arrest Scam Full Explanation',           titleHi: 'डिजिटल अरेस्ट पूरी जानकारी',               youtubeId: 'gqCN7mAusDo', cat: 'digital-arrest' },
  { id: '6',  title: 'Digital Arrest Protection Tips',                 titleHi: 'डिजिटल अरेस्ट से बचाव',                    youtubeId: 'Gujj0LieaXQ', cat: 'digital-arrest' },
  // Fake Police Calls
  { id: '7',  title: 'Fake Police Call Scam Warning',                  titleHi: 'नकली पुलिस कॉल चेतावनी',                   youtubeId: 'rzENHbN7bys', cat: 'phone-scam' },
  { id: '8',  title: 'How Scammers Fake Police Calls',                 titleHi: 'नकली पुलिस कॉल कैसे',                       youtubeId: 'kPyxRhQdWMg', cat: 'phone-scam' },
  { id: '9',  title: 'Fake Police Call Detection',                     titleHi: 'नकली कॉल पहचान',                            youtubeId: 'hrD8TpPB1ww', cat: 'phone-scam' },
  { id: '10', title: 'Police Impersonation Scam Alert',                titleHi: 'पुलिस नकल स्कैम',                           youtubeId: 'CgWg63EICPg', cat: 'phone-scam' },
  // WhatsApp OTP
  { id: '11', title: 'WhatsApp OTP Scam Prevention',                   titleHi: 'WhatsApp OTP स्कैम',                        youtubeId: 'xKMTohHS1Cs', cat: 'whatsapp' },
  { id: '12', title: 'WhatsApp OTP Hijacking Warning',                 titleHi: 'WhatsApp OTP हाईजैक',                       youtubeId: 'qL7mcMtBrig', cat: 'whatsapp' },
  { id: '13', title: 'Protect Your WhatsApp OTP',                      titleHi: 'WhatsApp OTP बचाव',                         youtubeId: 'XHcmwdWJX6A', cat: 'whatsapp' },
  { id: '14', title: 'WhatsApp OTP Scam Complete Guide',               titleHi: 'WhatsApp OTP गाइड',                         youtubeId: 'zLrXmAdVnN8', cat: 'whatsapp' },
  // UPI Fraud
  { id: '15', title: 'UPI Fraud Detection and Prevention',             titleHi: 'UPI धोखाधड़ी रोकथाम',                       youtubeId: 'xDTwJfIS9VM', cat: 'upi' },
  { id: '16', title: 'UPI Payment Scam Alert',                         titleHi: 'UPI पेमेंट स्कैम',                          youtubeId: 'QwakLxuZT7Y', cat: 'upi' },
  { id: '17', title: 'UPI Fraud Types Explained',                      titleHi: 'UPI धोखाधड़ी प्रकार',                       youtubeId: 'pvcPieOxNzI', cat: 'upi' },
  { id: '18', title: 'Stay Safe from UPI Scams',                       titleHi: 'UPI स्कैम से बचें',                         youtubeId: 'AgUBW5Sp8A8', cat: 'upi' },
  // Fake KYC
  { id: '19', title: 'Fake KYC Update Scam Warning',                   titleHi: 'नकली KYC अपडेट',                            youtubeId: 'W2NlbEE7BmU', cat: 'kyc' },
  { id: '20', title: 'KYC Fraud Prevention Tips',                      titleHi: 'KYC धोखाधड़ी बचाव',                         youtubeId: 'sb3EA3muelY', cat: 'kyc' },
  { id: '21', title: 'Fake KYC SMS Alert',                             titleHi: 'नकली KYC SMS',                              youtubeId: 'iFhPTg0KwSg', cat: 'kyc' },
  { id: '22', title: 'KYC Scam Complete Guide',                        titleHi: 'KYC स्कैम गाइड',                            youtubeId: '9QyzUejcxzI', cat: 'kyc' },
  // Online Shopping
  { id: '23', title: 'Online Shopping Fraud Prevention',               titleHi: 'ऑनलाइन शॉपिंग धोखाधड़ी',                  youtubeId: 'ygH_BmJivg4', cat: 'shopping' },
  { id: '24', title: 'Shopping Scam Warning Signs',                    titleHi: 'शॉपिंग स्कैम संकेत',                        youtubeId: 'G2RnH7964dE', cat: 'shopping' },
  { id: '25', title: 'Fake Shopping Website Alert',                    titleHi: 'नकली शॉपिंग वेबसाइट',                       youtubeId: 'Gq7SfCrIAEI', cat: 'shopping' },
  { id: '26', title: 'Online Shopping Safety Tips',                    titleHi: 'शॉपिंग सुरक्षा टिप्स',                      youtubeId: '-ukzK8KtPs4', cat: 'shopping' },
  // Investment / Ponzi
  { id: '27', title: 'Investment and Ponzi Scheme Alert',              titleHi: 'निवेश पोंजी स्कीम चेतावनी',                youtubeId: 'zeBxZUE57yY', cat: 'investment' },
  { id: '28', title: 'Investment Scam Warning',                        titleHi: 'निवेश स्कैम चेतावनी',                       youtubeId: 'wOLTLyHvK7s', cat: 'investment' },
  { id: '29', title: 'Ponzi Scheme Detection',                         titleHi: 'पोंजी स्कीम पहचान',                         youtubeId: 's5hoqONxPiY', cat: 'investment' },
  { id: '30', title: 'Investment Fraud Prevention',                    titleHi: 'निवेश धोखाधड़ी बचाव',                       youtubeId: 'rCaH-nlzxYc', cat: 'investment' },
  // Senior Citizen
  { id: '31', title: 'Protecting Senior Citizens from Scams',          titleHi: 'बुजुर्गों की सुरक्षा',                      youtubeId: 'QiWcLQLvy5c', cat: 'seniors' },
  { id: '32', title: 'Senior Citizen Cyber Safety',                    titleHi: 'बुजुर्ग साइबर सुरक्षा',                     youtubeId: '4S1T8BBmack', cat: 'seniors' },
  { id: '33', title: 'Elder Scam Prevention Guide',                    titleHi: 'बुजुर्ग स्कैम बचाव',                        youtubeId: 'ltI7DXrNQCA', cat: 'seniors' },
  // Spam Calls
  { id: '34', title: 'How to Identify Spam Calls',                     titleHi: 'स्पैम कॉल पहचान',                           youtubeId: 'p8VRCoxKdhA', cat: 'phone-scam' },
  { id: '35', title: 'Spam Call Detection Tips',                       titleHi: 'स्पैम कॉल टिप्स',                           youtubeId: '8Gi2lu8u1FI', cat: 'phone-scam' },
  { id: '36', title: 'Block Spam Calls Effectively',                   titleHi: 'स्पैम कॉल ब्लॉक करें',                      youtubeId: 'Eu-SELVYLTA', cat: 'phone-scam' },
  { id: '37', title: 'Spam Call Prevention Guide',                     titleHi: 'स्पैम कॉल बचाव गाइड',                       youtubeId: 'NSAWEpSKM5M', cat: 'phone-scam' },
  // Parcel / Courier
  { id: '38', title: 'Fake Parcel Delivery Scam',                      titleHi: 'नकली पार्सल स्कैम',                         youtubeId: '5m5KLgyFcWk', cat: 'courier' },
  { id: '39', title: 'Parcel Delivery Fraud Alert',                    titleHi: 'पार्सल धोखाधड़ी',                           youtubeId: 'C4_hGgx7Cs4', cat: 'courier' },
  { id: '40', title: 'Fake Courier Scam Warning',                      titleHi: 'नकली कूरियर स्कैम',                         youtubeId: 'obQbHXJqL0Y', cat: 'courier' },
  { id: '41', title: 'Delivery Scam Prevention',                       titleHi: 'डिलीवरी स्कैम बचाव',                        youtubeId: '7JwgSmQj8TI', cat: 'courier' },
  // Romance / Dating
  { id: '42', title: 'Dating App and Romance Scams',                   titleHi: 'डेटिंग ऐप रोमांस स्कैम',                   youtubeId: 'hjm2BiK60Ic', cat: 'romance' },
  { id: '43', title: 'Online Romance Fraud Alert',                     titleHi: 'ऑनलाइन रोमांस धोखाधड़ी',                   youtubeId: 'iOZjnEEwP3Q', cat: 'romance' },
  { id: '44', title: 'Dating Scam Warning Signs',                      titleHi: 'डेटिंग स्कैम संकेत',                        youtubeId: 'ViGtdTXYFfE', cat: 'romance' },
  { id: '45', title: 'Romance Scam Prevention Guide',                  titleHi: 'रोमांस स्कैम बचाव',                         youtubeId: 'ZHYIXonplmA', cat: 'romance' },
  // Steganography / Image Malware
  { id: '46', title: 'Steganography Attack Warning',                   titleHi: 'स्टेगनोग्राफी हमला',                        youtubeId: 'ZNtt18NW7io', cat: 'advanced',  isNew: true },
  { id: '47', title: 'Hidden Malware in Images Alert',                 titleHi: 'छवियों में मैलवेयर',                        youtubeId: 'jjzp46Bj4II', cat: 'advanced',  isNew: true },
  { id: '48', title: 'Image-based Cyber Attacks',                      titleHi: 'छवि साइबर हमले',                            youtubeId: 'tY4sQehHlwM', cat: 'advanced',  isNew: true },
];

// ─── Category meta ────────────────────────────────────────────────────────────
const CATS = [
  { id: 'all',           labelEn: 'All 48 Videos',       labelHi: 'सभी 48 वीडियो',         color: 'bg-white/10  text-white'          },
  { id: 'digital-arrest',labelEn: 'Digital Arrest',      labelHi: 'डिजिटल अरेस्ट',          color: 'bg-red-500/20 text-red-300'      },
  { id: 'phone-scam',    labelEn: 'Phone Scams',         labelHi: 'फोन स्कैम',              color: 'bg-orange-500/20 text-orange-300'},
  { id: 'whatsapp',      labelEn: 'WhatsApp / OTP',      labelHi: 'WhatsApp / OTP',          color: 'bg-green-500/20 text-green-300'  },
  { id: 'upi',           labelEn: 'UPI / Payment',       labelHi: 'UPI / भुगतान',            color: 'bg-yellow-500/20 text-yellow-300'},
  { id: 'kyc',           labelEn: 'Fake KYC',            labelHi: 'नकली KYC',                color: 'bg-pink-500/20 text-pink-300'    },
  { id: 'shopping',      labelEn: 'Online Shopping',     labelHi: 'ऑनलाइन शॉपिंग',          color: 'bg-purple-500/20 text-purple-300'},
  { id: 'investment',    labelEn: 'Investment Fraud',    labelHi: 'निवेश धोखाधड़ी',          color: 'bg-teal-500/20 text-teal-300'    },
  { id: 'seniors',       labelEn: 'Senior Safety',       labelHi: 'बुजुर्ग सुरक्षा',         color: 'bg-blue-500/20 text-blue-300'    },
  { id: 'courier',       labelEn: 'Courier / Parcel',    labelHi: 'कूरियर / पार्सल',         color: 'bg-amber-500/20 text-amber-300'  },
  { id: 'romance',       labelEn: 'Romance Scam',        labelHi: 'रोमांस स्कैम',            color: 'bg-rose-500/20 text-rose-300'    },
  { id: 'advanced',      labelEn: 'Advanced Threats',    labelHi: 'उन्नत खतरे',              color: 'bg-violet-500/20 text-violet-300'},
  { id: 'reporting',     labelEn: 'How to Report',       labelHi: 'रिपोर्ट कैसे करें',       color: 'bg-cyan-500/20 text-cyan-300'    },
];

export default function EducationPage() {
  const [lang, setLang]         = useState<'en' | 'hi'>('en');
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch]     = useState('');
  const [playing, setPlaying]   = useState<typeof VIDEOS[0] | null>(null);

  const filtered = useMemo(() => {
    let v = activeCat === 'all' ? VIDEOS : VIDEOS.filter(v => v.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      v = v.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.titleHi.includes(q) ||
        v.cat.includes(q)
      );
    }
    return v;
  }, [activeCat, search]);

  const catLabel = (id: string) => {
    const c = CATS.find(c => c.id === id);
    return lang === 'en' ? c?.labelEn : c?.labelHi;
  };

  const catColor = (id: string) => CATS.find(c => c.id === id)?.color ?? '';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <BackToHome />

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 mb-4">
            <BookOpen className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {lang === 'en' ? 'Cyber Safety Education' : 'साइबर सुरक्षा शिक्षा'}
          </h1>
          <p className="text-gray-400">
            {lang === 'en'
              ? '48 expert videos covering every type of digital fraud in India'
              : 'भारत में हर प्रकार के डिजिटल फ्रॉड पर 48 विशेषज्ञ वीडियो'}
          </p>

          {/* Lang toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="mt-3 text-xs bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition"
          >
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>
        </div>

        {/* ── 1930 Banner ── */}
        <div className="mb-6 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400 shrink-0" />
            <span className="font-bold text-red-300">
              {lang === 'en' ? 'Cyber Crime? Report immediately at 1930 or cybercrime.gov.in' : 'साइबर अपराध? 1930 पर तुरंत रिपोर्ट करें'}
            </span>
          </div>
          <a href="tel:1930" className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-black px-5 py-2 rounded-xl text-sm transition">
            📞 Call 1930
          </a>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search videos… e.g. UPI, Digital Arrest, KYC' : 'वीडियो खोजें… जैसे UPI, डिजिटल अरेस्ट'}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm focus:border-cyan-500 focus:outline-none placeholder-gray-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Category filters ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                activeCat === c.id
                  ? c.color + ' border-current scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? c.labelEn : c.labelHi}
              {c.id !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({VIDEOS.filter(v => v.cat === c.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {lang === 'en'
              ? `Showing ${filtered.length} of ${VIDEOS.length} videos`
              : `${VIDEOS.length} में से ${filtered.length} वीडियो दिखाए जा रहे हैं`}
          </p>
          {filtered.some(v => v.isNew) && (
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 rounded-full px-3 py-1 font-bold animate-pulse">
              🆕 New videos added
            </span>
          )}
        </div>

        {/* ── Video grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{lang === 'en' ? 'No videos match your search.' : 'कोई वीडियो नहीं मिला।'}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {filtered.map(video => (
              <div
                key={video.id}
                onClick={() => setPlaying(video)}
                className="group cursor-pointer bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 relative"
              >
                {/* NEW badge */}
                {video.isNew && (
                  <div className="absolute top-2 right-2 z-10 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    NEW
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={lang === 'en' ? video.title : video.titleHi}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`; }}
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                  </div>
                  {/* Video number */}
                  <div className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-gray-400 rounded px-1.5">
                    #{video.id}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  {/* Category badge */}
                  <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 mb-2 ${catColor(video.cat)}`}>
                    {catLabel(video.cat)}
                  </span>
                  <h4 className="text-sm font-bold leading-snug line-clamp-2">
                    {lang === 'en' ? video.title : video.titleHi}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Share CTA ── */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 text-center mb-6">
          <h3 className="text-xl font-black mb-2">
            {lang === 'en' ? '🛡️ Share & Protect Your Family' : '🛡️ परिवार को सुरक्षित रखें'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {lang === 'en'
              ? 'Forward these videos to parents and elders — they are the most targeted.'
              : 'इन वीडियो को माता-पिता और बुजुर्गों को भेजें — वे सबसे ज़्यादा निशाने पर हैं।'}
          </p>
          <button
            onClick={() => {
              const msg = lang === 'en'
                ? 'QuantumShield – 48 Free Cyber Safety Videos for Indians. Learn to spot Digital Arrest, UPI scams & more: https://quantumshield.in/education'
                : 'QuantumShield – 48 मुफ्त साइबर सुरक्षा वीडियो: https://quantumshield.in/education';
              if (navigator.share) navigator.share({ text: msg });
              else { navigator.clipboard.writeText(msg); alert('Link copied!'); }
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-black text-sm hover:scale-105 transition"
          >
            {lang === 'en' ? 'Share These Videos' : 'वीडियो शेयर करें'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          Educational videos from YouTube for public awareness. All content belongs to respective creators. QuantumShield does not claim ownership.
        </p>
      </div>

      {/* ══ Video Modal ══ */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div
            className="bg-gray-950 border border-white/10 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div>
                <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 mr-2 ${catColor(playing.cat)}`}>
                  {catLabel(playing.cat)}
                </span>
                <span className="font-bold text-sm">
                  {lang === 'en' ? playing.title : playing.titleHi}
                </span>
              </div>
              <button
                onClick={() => setPlaying(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded player */}
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={playing.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Modal footer nav */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${playing.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                Watch on YouTube →
              </a>
              <div className="flex gap-2">
                {/* Prev */}
                <button
                  onClick={() => {
                    const idx = filtered.findIndex(v => v.id === playing.id);
                    if (idx > 0) setPlaying(filtered[idx - 1]);
                  }}
                  disabled={filtered.findIndex(v => v.id === playing.id) === 0}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition font-bold"
                >
                  ← Prev
                </button>
                {/* Next */}
                <button
                  onClick={() => {
                    const idx = filtered.findIndex(v => v.id === playing.id);
                    if (idx < filtered.length - 1) setPlaying(filtered[idx + 1]);
                  }}
                  disabled={filtered.findIndex(v => v.id === playing.id) === filtered.length - 1}
                  className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 transition font-bold"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
