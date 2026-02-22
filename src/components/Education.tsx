'use client';

import { BookOpen, Shield, Play } from 'lucide-react';
import { useState } from 'react';
import VideoCard, { VideoItem } from './VideoCard';
import VideoModal from './VideoModal';

interface Props {
  lang: 'en' | 'hi';
}

const VIDEOS: VideoItem[] = [
  { id: '1', title: 'How to Report Cybercrime in India - 1930', titleHi: 'साइबर क्राइम रिपोर्ट करें - 1930', youtubeId: 'qi1Kz3_cTBg', category: 'browsing' },
  { id: '2', title: 'Report Cybercrime Process Guide', titleHi: 'रिपोर्ट प्रक्रिया', youtubeId: 'GOrBC-_hFRQ', category: 'browsing' },
  { id: '3', title: 'Digital Arrest Scam Awareness', titleHi: 'डिजिटल अरेस्ट स्कैम', youtubeId: 'JGoVuPTtRgg', category: 'phone' },
  { id: '4', title: 'Digital Arrest - What You Need to Know', titleHi: 'डिजिटल अरेस्ट - जानकारी', youtubeId: 'je6wqPapdo4', category: 'phone' },
  { id: '5', title: 'Digital Arrest Scam Full Explanation', titleHi: 'डिजिटल अरेस्ट पूरी जानकारी', youtubeId: 'gqCN7mAusDo', category: 'phone' },
  { id: '6', title: 'Digital Arrest Protection Tips', titleHi: 'डिजिटल अरेस्ट से बचाव', youtubeId: 'Gujj0LieaXQ', category: 'phone' },
  { id: '7', title: 'Fake Police Call Scam Warning', titleHi: 'नकली पुलिस कॉल', youtubeId: 'rzENHbN7bys', category: 'phone' },
  { id: '8', title: 'How Scammers Fake Police Calls', titleHi: 'नकली पुलिस कॉल कैसे', youtubeId: 'kPyxRhQdWMg', category: 'phone' },
  { id: '9', title: 'Fake Police Call Detection', titleHi: 'नकली कॉल पहचान', youtubeId: 'hrD8TpPB1ww', category: 'phone' },
  { id: '10', title: 'Police Impersonation Scam Alert', titleHi: 'पुलिस नकल स्कैम', youtubeId: 'CgWg63EICPg', category: 'phone' },
  { id: '11', title: 'WhatsApp OTP Scam Prevention', titleHi: 'WhatsApp OTP स्कैम', youtubeId: 'xKMTohHS1Cs', category: 'message' },
  { id: '12', title: 'WhatsApp OTP Hijacking Warning', titleHi: 'WhatsApp OTP हाईजैक', youtubeId: 'qL7mcMtBrig', category: 'message' },
  { id: '13', title: 'Protect Your WhatsApp OTP', titleHi: 'WhatsApp OTP बचाव', youtubeId: 'XHcmwdWJX6A', category: 'message' },
  { id: '14', title: 'WhatsApp OTP Scam Complete Guide', titleHi: 'WhatsApp OTP गाइड', youtubeId: 'zLrXmAdVnN8', category: 'message' },
  { id: '15', title: 'UPI Fraud Detection and Prevention', titleHi: 'UPI धोखाधड़ी', youtubeId: 'xDTwJfIS9VM', category: 'browsing' },
  { id: '16', title: 'UPI Payment Scam Alert', titleHi: 'UPI पेमेंट स्कैम', youtubeId: 'QwakLxuZT7Y', category: 'browsing' },
  { id: '17', title: 'UPI Fraud Types Explained', titleHi: 'UPI धोखाधड़ी प्रकार', youtubeId: 'pvcPieOxNzI', category: 'browsing' },
  { id: '18', title: 'Stay Safe from UPI Scams', titleHi: 'UPI स्कैम से बचें', youtubeId: 'AgUBW5Sp8A8', category: 'browsing' },
  { id: '19', title: 'Fake KYC Update Scam Warning', titleHi: 'नकली KYC अपडेट', youtubeId: 'W2NlbEE7BmU', category: 'message' },
  { id: '20', title: 'KYC Fraud Prevention Tips', titleHi: 'KYC धोखाधड़ी बचाव', youtubeId: 'sb3EA3muelY', category: 'message' },
  { id: '21', title: 'Fake KYC SMS Alert', titleHi: 'नकली KYC SMS', youtubeId: 'iFhPTg0KwSg', category: 'message' },
  { id: '22', title: 'KYC Scam Complete Guide', titleHi: 'KYC स्कैम गाइड', youtubeId: '9QyzUejcxzI', category: 'message' },
  { id: '23', title: 'Online Shopping Fraud Prevention', titleHi: 'ऑनलाइन शॉपिंग धोखाधड़ी', youtubeId: 'ygH_BmJivg4', category: 'browsing' },
  { id: '24', title: 'Shopping Scam Warning Signs', titleHi: 'शॉपिंग स्कैम संकेत', youtubeId: 'G2RnH7964dE', category: 'browsing' },
  { id: '25', title: 'Fake Shopping Website Alert', titleHi: 'नकली शॉपिंग वेबसाइट', youtubeId: 'Gq7SfCrIAEI', category: 'browsing' },
  { id: '26', title: 'Online Shopping Safety Tips', titleHi: 'शॉपिंग सुरक्षा टिप्स', youtubeId: '-ukzK8KtPs4', category: 'browsing' },
  { id: '27', title: 'Investment and Ponzi Scheme Alert', titleHi: 'निवेश स्कीम', youtubeId: 'zeBxZUE57yY', category: 'browsing' },
  { id: '28', title: 'Investment Scam Warning', titleHi: 'निवेश स्कैम चेतावनी', youtubeId: 'wOLTLyHvK7s', category: 'browsing' },
  { id: '29', title: 'Ponzi Scheme Detection', titleHi: 'पोंजी स्कीम पहचान', youtubeId: 's5hoqONxPiY', category: 'browsing' },
  { id: '30', title: 'Investment Fraud Prevention', titleHi: 'निवेश धोखाधड़ी बचाव', youtubeId: 'rCaH-nlzxYc', category: 'browsing' },
  { id: '31', title: 'Protecting Senior Citizens from Scams', titleHi: 'बुजुर्गों की सुरक्षा', youtubeId: 'QiWcLQLvy5c', category: 'phone' },
  { id: '32', title: 'Senior Citizen Cyber Safety', titleHi: 'बुजुर्ग साइबर सुरक्षा', youtubeId: '4S1T8BBmack', category: 'phone' },
  { id: '33', title: 'Elder Scam Prevention Guide', titleHi: 'बुजुर्ग स्कैम बचाव', youtubeId: 'ltI7DXrNQCA', category: 'phone' },
  { id: '34', title: 'How to Identify Spam Calls', titleHi: 'स्पैम कॉल पहचान', youtubeId: 'p8VRCoxKdhA', category: 'phone' },
  { id: '35', title: 'Spam Call Detection Tips', titleHi: 'स्पैम कॉल टिप्स', youtubeId: '8Gi2lu8u1FI', category: 'phone' },
  { id: '36', title: 'Block Spam Calls Effectively', titleHi: 'स्पैम कॉल ब्लॉक करें', youtubeId: 'Eu-SELVYLTA', category: 'phone' },
  { id: '37', title: 'Spam Call Prevention Guide', titleHi: 'स्पैम कॉल बचाव गाइड', youtubeId: 'NSAWEpSKM5M', category: 'phone' },
  { id: '38', title: 'Fake Parcel Delivery Scam', titleHi: 'नकली पार्सल स्कैम', youtubeId: '5m5KLgyFcWk', category: 'message' },
  { id: '39', title: 'Parcel Delivery Fraud Alert', titleHi: 'पार्सल धोखाधड़ी', youtubeId: 'C4_hGgx7Cs4', category: 'message' },
  { id: '40', title: 'Fake Courier Scam Warning', titleHi: 'नकली कूरियर स्कैम', youtubeId: 'obQbHXJqL0Y', category: 'message' },
  { id: '41', title: 'Delivery Scam Prevention', titleHi: 'डिलीवरी स्कैम बचाव', youtubeId: '7JwgSmQj8TI', category: 'message' },
  { id: '42', title: 'Dating App and Romance Scams', titleHi: 'डेटिंग स्कैम', youtubeId: 'hjm2BiK60Ic', category: 'message' },
  { id: '43', title: 'Online Romance Fraud Alert', titleHi: 'रोमांस धोखाधड़ी', youtubeId: 'iOZjnEEwP3Q', category: 'message' },
  { id: '44', title: 'Dating Scam Warning Signs', titleHi: 'डेटिंग स्कैम संकेत', youtubeId: 'ViGtdTXYFfE', category: 'message' },
  { id: '45', title: 'Romance Scam Prevention Guide', titleHi: 'रोमांस स्कैम बचाव', youtubeId: 'ZHYIXonplmA', category: 'message' },
  { id: '46', title: 'Steganography Attack Warning', titleHi: 'स्टेगनोग्राफी हमला', youtubeId: 'ZNtt18NW7io', category: 'message', isNew: true },
  { id: '47', title: 'Hidden Malware in Images Alert', titleHi: 'छवियों में मैलवेयर', youtubeId: 'jjzp46Bj4II', category: 'message', isNew: true },
  { id: '48', title: 'Image-based Cyber Attacks', titleHi: 'छवि साइबर हमले', youtubeId: 'tY4sQehHlwM', category: 'message', isNew: true }
];

const CONTENT = {
  en: {
    title: 'Cyber Safety Education',
    subtitle: 'Learn Stay Safe',
    quickTips: 'Quick Safety Tips',
    videos: 'Educational Videos',
    watchNow: 'Watch Now',
    newBadge: 'NEW',
    reportFirst: 'IMPORTANT: Call 1930 to report cybercrime',
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
    title: 'Cyber Safety',
    subtitle: 'Learn Stay Safe',
    quickTips: 'Safety Tips',
    videos: 'Videos',
    watchNow: 'Watch',
    newBadge: 'NEW',
    reportFirst: 'महत्वपूर्ण: साइबर क्राइम रिपोर्ट के लिए 1930 कॉल करें',
    tips: [
      'OTP share na karein',
      'Bank call par password nahi maangte',
      'HTTPS check karein',
      'Message verify karein',
      'Unknown numbers se image download na karein',
      'Image scan karein malware ke liye'
    ]
  }
};

export default function Education({ lang }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const content = CONTENT[lang];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4">
          <BookOpen className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400 text-lg">{content.subtitle}</p>
      </div>

      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur rounded-2xl border border-red-500/50 p-6 mb-12 text-center">
        <h3 className="text-2xl font-bold text-red-400 mb-2">🚨 {content.reportFirst}</h3>
        <p className="text-gray-200">
          {lang === 'en' 
            ? 'First 2 videos show you how to report cybercrime in India. Watch them first!' 
            : 'पहले 2 वीडियो बताते हैं कि साइबर क्राइम कैसे रिपोर्ट करें। पहले इन्हें देखें!'}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 mb-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          {content.quickTips}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {content.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-black/30 rounded-xl p-4">
              <div className="text-2xl">✅</div>
              <p className="text-gray-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <VideoModal video={selectedVideo} lang={lang} onClose={() => setSelectedVideo(null)} />

      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Play className="w-6 h-6 text-cyan-400" />
          {content.videos} ({VIDEOS.length} videos)
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              lang={lang}
              onPlay={setSelectedVideo}
              watchNow={content.watchNow}
              newBadge={content.newBadge}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-2xl border border-purple-400/30 p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Share Knowledge</h3>
        <p className="text-gray-300 mb-6">{lang === 'en' ? 'Help your family stay safe' : 'Family ko safe rakhein'}</p>
        <button onClick={() => { const msg = 'QuantumGuard - 48 Free Cyber Safety Videos. Stay Protected!'; if (navigator.share) { navigator.share({ text: msg }); } else { navigator.clipboard.writeText(msg); alert('Copied'); } }} className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold text-lg hover:scale-105 transition">
          Share App
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400 italic border-t border-white/10 pt-6">
        📹 Educational videos from YouTube for public awareness. All content belongs to respective creators. QuantumGuard does not claim ownership.
      </div>
    </div>
  );
}