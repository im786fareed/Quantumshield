'use client';

import { Brain, Cpu, Network, Shield } from 'lucide-react';

interface Props {
  lang: 'en' | 'hi';
}

const CONTENT = {
  en: {
    title: 'AI Technology Behind QuantumGuard',
    subtitle: 'How our machine learning algorithms protect you',
    mlTitle: 'Machine Learning Detection',
    mlDesc: 'Our AI models are trained on millions of real-world cyber fraud patterns from India and globally. The system continuously learns from new threats to improve accuracy.',
    algoTitle: 'Advanced Algorithms',
    algoDesc: 'Multi-layer analysis combining Natural Language Processing, image forensics, and behavioral pattern recognition to detect sophisticated scams.',
    realtimeTitle: 'Real-time Processing',
    realtimeDesc: 'Instant threat analysis powered by optimized neural networks that can process messages, URLs, and files in under 2 seconds.',
    privacyTitle: 'Privacy-First AI',
    privacyDesc: 'All AI processing happens locally or on secure servers. Your data is never stored, logged, or used for training. Complete privacy guaranteed.',
    features: 'AI Features',
    feature1: 'NLP-based text analysis for detecting social engineering patterns',
    feature2: 'Computer vision algorithms for steganography detection in images',
    feature3: 'Behavioral analysis to identify phishing and spam characteristics',
    feature4: 'Anomaly detection for unusual transaction patterns',
    feature5: 'Contextual analysis of Indian-specific scam tactics',
    accuracy: 'Detection Accuracy',
    accuracyText: 'Our AI achieves 94 percent accuracy on known scam patterns and continues improving through algorithmic updates.',
  },
  hi: {
    title: 'QuantumGuard के पीछे की AI तकनीक',
    subtitle: 'हमारी मशीन लर्निंग एल्गोरिदम आपकी कैसे रक्षा करती हैं',
    mlTitle: 'मशीन लर्निंग पहचान',
    mlDesc: 'हमारे AI मॉडल भारत और विश्व स्तर पर लाखों वास्तविक साइबर धोखाधड़ी पैटर्न पर प्रशिक्षित हैं।',
    algoTitle: 'उन्नत एल्गोरिदम',
    algoDesc: 'परिष्कृत स्कैम का पता लगाने के लिए मल्टी-लेयर विश्लेषण।',
    realtimeTitle: 'रियल-टाइम प्रोसेसिंग',
    realtimeDesc: 'तत्काल खतरा विश्लेषण जो 2 सेकंड से कम समय में प्रोसेस करता है।',
    privacyTitle: 'गोपनीयता-प्रथम AI',
    privacyDesc: 'सभी AI प्रोसेसिंग सुरक्षित है। आपका डेटा कभी स्टोर नहीं किया जाता।',
    features: 'AI सुविधाएं',
    feature1: 'NLP आधारित टेक्स्ट विश्लेषण',
    feature2: 'कंप्यूटर विजन एल्गोरिदम',
    feature3: 'व्यवहार विश्लेषण',
    feature4: 'विसंगति पहचान',
    feature5: 'भारतीय-विशिष्ट विश्लेषण',
    accuracy: 'पहचान सटीकता',
    accuracyText: 'हमारी AI 94 प्रतिशत सटीकता प्राप्त करती है।',
  }
};

export default function AboutAI({ lang }: Props) {
  const content = CONTENT[lang];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4">
          <Brain className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400 text-lg">{content.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold">{content.mlTitle}</h3>
          </div>
          <p className="text-gray-300">{content.mlDesc}</p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-8 h-8 text-purple-400" />
            <h3 className="text-2xl font-bold">{content.algoTitle}</h3>
          </div>
          <p className="text-gray-300">{content.algoDesc}</p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Network className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold">{content.realtimeTitle}</h3>
          </div>
          <p className="text-gray-300">{content.realtimeDesc}</p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold">{content.privacyTitle}</h3>
          </div>
          <p className="text-gray-300">{content.privacyDesc}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur rounded-2xl border border-cyan-400/30 p-8 mb-12">
        <h3 className="text-3xl font-bold mb-6">{content.features}</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-200 text-lg">{content.feature1}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-200 text-lg">{content.feature2}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-200 text-lg">{content.feature3}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-200 text-lg">{content.feature4}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-200 text-lg">{content.feature5}</span>
          </li>
        </ul>
      </div>

      <div className="bg-green-600/20 backdrop-blur rounded-2xl border border-green-500/50 p-8 text-center">
        <h3 className="text-3xl font-bold mb-4 text-green-400">{content.accuracy}</h3>
        <p className="text-xl text-gray-200">{content.accuracyText}</p>
      </div>
    </div>
  );
}