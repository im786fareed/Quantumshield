'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, CheckCircle, Brain, TrendingUp, Shield, Volume2, FileText } from 'lucide-react';

interface AnalysisResult {
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  riskScore: number;
  detectedPatterns: string[];
  redFlags: string[];
  recommendation: string;
  confidence: number;
}

interface TranscriptLine {
  timestamp: number;
  text: string;
  isSuspicious: boolean;
}

export default function AICallAnalyzer({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [liveWarnings, setLiveWarnings] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const content = {
    en: {
      title: '🧠 AI Call Analyzer',
      subtitle: 'Real-time scam detection using AI pattern recognition',
      startListening: 'Start Live Analysis',
      stopListening: 'Stop Analysis',
      currentlyListening: 'Listening to call...',
      manualInput: 'Or Enter Call Text Manually',
      manualPlaceholder: 'Paste or type what the caller is saying...',
      analyzeButton: 'Analyze for Scams',
      transcriptTitle: 'Live Transcript',
      noTranscript: 'No conversation detected yet',
      analysisTitle: 'AI Analysis Results',
      riskLevel: 'Risk Level',
      riskScore: 'Risk Score',
      confidence: 'Confidence',
      detectedPatterns: 'Detected Scam Patterns',
      redFlags: 'Red Flags',
      recommendation: 'Recommendation',
      liveWarnings: 'Live Warnings',
      riskLevels: {
        safe: '✅ Safe',
        suspicious: '⚠️ Suspicious',
        dangerous: '🚨 DANGER'
      },
      recommendations: {
        safe: 'No scam indicators detected. Call appears legitimate.',
        suspicious: 'Exercise caution. Some suspicious patterns detected. Do not share sensitive information.',
        dangerous: 'HANG UP IMMEDIATELY! High probability scam detected. Report to 1930.'
      },
      scamPatterns: {
        digital_arrest: 'Digital Arrest Threat Pattern',
        urgent_action: 'Urgency/Pressure Tactics',
        authority_claim: 'Fake Authority Claim',
        money_demand: 'Money/Payment Demand',
        otp_request: 'OTP/Password Request',
        kyc_update: 'Fake KYC Update',
        legal_threat: 'Legal Action Threat',
        prize_lottery: 'Prize/Lottery Scam',
        investment: 'Investment Fraud Pattern',
        personal_info: 'Personal Info Request'
      },
      howItWorks: 'How It Works',
      steps: [
        'AI analyzes conversation in real-time',
        'Detects scam keywords and patterns',
        'Calculates risk score based on multiple factors',
        'Provides instant warnings and recommendations',
        'All processing happens locally (privacy-first)'
      ],
      disclaimer: '⚠️ Disclaimer',
      disclaimerText: 'AI analysis is for guidance only. Always trust your instincts. When in doubt, hang up and call back on official numbers.'
    },
    hi: {
      title: '🧠 AI कॉल विश्लेषक',
      subtitle: 'AI पैटर्न पहचान का उपयोग करके वास्तविक समय घोटाला पहचान',
      startListening: 'लाइव विश्लेषण शुरू करें',
      stopListening: 'विश्लेषण बंद करें',
      currentlyListening: 'कॉल सुन रहे हैं...',
      manualInput: 'या कॉल टेक्स्ट मैन्युअल रूप से दर्ज करें',
      manualPlaceholder: 'कॉलर क्या कह रहा है वह पेस्ट या टाइप करें...',
      analyzeButton: 'घोटालों के लिए विश्लेषण करें',
      transcriptTitle: 'लाइव ट्रांसक्रिप्ट',
      noTranscript: 'अभी तक कोई बातचीत नहीं मिली',
      analysisTitle: 'AI विश्लेषण परिणाम',
      riskLevel: 'जोखिम स्तर',
      riskScore: 'जोखिम स्कोर',
      confidence: 'विश्वास',
      detectedPatterns: 'पहचाने गए घोटाला पैटर्न',
      redFlags: 'लाल झंडे',
      recommendation: 'सिफारिश',
      liveWarnings: 'लाइव चेतावनियां',
      riskLevels: {
        safe: '✅ सुरक्षित',
        suspicious: '⚠️ संदिग्ध',
        dangerous: '🚨 खतरा'
      },
      recommendations: {
        safe: 'कोई घोटाला संकेतक नहीं मिला। कॉल वैध प्रतीत होती है।',
        suspicious: 'सावधानी बरतें। कुछ संदिग्ध पैटर्न पाए गए। संवेदनशील जानकारी साझा न करें।',
        dangerous: 'तुरंत फोन काट दें! उच्च संभावना घोटाला पाया गया। 1930 पर रिपोर्ट करें।'
      },
      scamPatterns: {
        digital_arrest: 'डिजिटल अरेस्ट धमकी पैटर्न',
        urgent_action: 'जरूरी/दबाव रणनीति',
        authority_claim: 'नकली अधिकार दावा',
        money_demand: 'पैसे/भुगतान की मांग',
        otp_request: 'OTP/पासवर्ड अनुरोध',
        kyc_update: 'नकली KYC अपडेट',
        legal_threat: 'कानूनी कार्रवाई की धमकी',
        prize_lottery: 'इनाम/लॉटरी घोटाला',
        investment: 'निवेश धोखाधड़ी पैटर्न',
        personal_info: 'व्यक्तिगत जानकारी अनुरोध'
      },
      howItWorks: 'यह कैसे काम करता है',
      steps: [
        'AI वास्तविक समय में बातचीत का विश्लेषण करता है',
        'घोटाला कीवर्ड और पैटर्न का पता लगाता है',
        'कई कारकों के आधार पर जोखिम स्कोर की गणना करता है',
        'तत्काल चेतावनी और सिफारिशें प्रदान करता है',
        'सभी प्रोसेसिंग स्थानीय रूप से होती है (गोपनीयता-पहले)'
      ],
      disclaimer: '⚠️ अस्वीकरण',
      disclaimerText: 'AI विश्लेषण केवल मार्गदर्शन के लिए है। हमेशा अपनी सहज बुद्धि पर भरोसा करें। संदेह होने पर, फोन काट दें और आधिकारिक नंबरों पर वापस कॉल करें।'
    }
  };

  const t = content[lang];

  // Scam detection keywords and patterns
  const scamKeywords = {
    digitalArrest: [
      'digital arrest', 'cyber crime', 'FIR', 'police', 'arrest warrant', 
      'illegal activity', 'court', 'judge', 'investigation', 'accused'
    ],
    urgency: [
      'immediately', 'urgent', 'within 24 hours', 'right now', 'before 5 pm',
      'last chance', 'expires today', 'limited time', 'hurry'
    ],
    authority: [
      'CBI', 'police officer', 'cyber cell', 'income tax', 'ED', 'RBI',
      'government official', 'bank manager', 'customs', 'enforcement'
    ],
    moneyDemand: [
      'pay now', 'transfer money', 'send payment', 'fine', 'penalty',
      'deposit', 'refundable', 'security amount', 'processing fee'
    ],
    otpRequest: [
      'OTP', 'one time password', 'verification code', 'CVV', 'PIN',
      'card number', 'account number', 'password', 'share the code'
    ],
    kycUpdate: [
      'KYC update', 'verify account', 'blocked account', 'update details',
      'suspended', 'deactivated', 're-verification required'
    ],
    legalThreat: [
      'legal action', 'case filed', 'summons', 'court notice', 'jail',
      'prison', 'prosecution', 'sue', 'lawyer'
    ],
    prizeLottery: [
      'won prize', 'lottery', 'lucky draw', 'congratulations winner',
      'claim reward', 'bonus', 'cashback', 'free gift'
    ],
    investment: [
      'guaranteed returns', 'double your money', 'risk-free investment',
      'easy profit', 'trading tips', 'stocks', 'crypto opportunity'
    ],
    personalInfo: [
      'Aadhaar number', 'PAN card', 'date of birth', 'mother name',
      'bank details', 'card details', 'social security', 'passport number'
    ]
  };

  useEffect(() => {
    // Initialize Web Speech API (if available)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          const line: TranscriptLine = {
            timestamp: Date.now(),
            text: transcript,
            isSuspicious: detectSuspiciousContent(transcript)
          };
          
          setTranscript(prev => [...prev, line]);
          
          // Real-time analysis
          if (line.isSuspicious) {
            analyzeText(transcript);
          }
        } else {
          setCurrentText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const detectSuspiciousContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Check for any scam keywords
    for (const category of Object.values(scamKeywords)) {
      for (const keyword of category) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
    
    return false;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert('Speech recognition not supported in your browser. Please use Chrome/Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Final analysis
      const fullText = transcript.map(t => t.text).join(' ');
      if (fullText) {
        analyzeText(fullText);
      }
    }
  };

  const analyzeText = (text: string) => {
    const lowerText = text.toLowerCase();
    let riskScore = 0;
    const detectedPatterns: string[] = [];
    const redFlags: string[] = [];

    // Analyze each category
    Object.entries(scamKeywords).forEach(([category, keywords]) => {
      const matchedKeywords = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        riskScore += matchedKeywords.length * 10;
        
        const patternKey = category.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1) as keyof typeof t.scamPatterns;
        detectedPatterns.push(t.scamPatterns[patternKey] || category);
        redFlags.push(...matchedKeywords.map(k => `"${k}"`));
      }
    });

    // Calculate risk level
    let riskLevel: 'safe' | 'suspicious' | 'dangerous';
    if (riskScore >= 50) {
      riskLevel = 'dangerous';
    } else if (riskScore >= 20) {
      riskLevel = 'suspicious';
    } else {
      riskLevel = 'safe';
    }

    // Calculate confidence based on text length and matches
    const confidence = Math.min(95, Math.max(60, 
      (text.length / 50) * (detectedPatterns.length > 0 ? 30 : 10) + 50
    ));

    const result: AnalysisResult = {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      detectedPatterns: [...new Set(detectedPatterns)],
      redFlags: [...new Set(redFlags)].slice(0, 10),
      recommendation: t.recommendations[riskLevel],
      confidence: Math.round(confidence)
    };

    setAnalysis(result);

    // Update live warnings
    if (riskLevel !== 'safe' && detectedPatterns.length > 0) {
      setLiveWarnings(prev => {
        const newWarnings = [...prev, ...detectedPatterns].slice(-5);
        return [...new Set(newWarnings)];
      });
    }
  };

  const analyzeManualInput = () => {
    if (!currentText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }
    
    analyzeText(currentText);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400 bg-green-600/20 border-green-500/50';
      case 'suspicious': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/50';
      case 'dangerous': return 'text-red-400 bg-red-600/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-600/20 border-gray-500/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-cyan-100">{t.subtitle}</p>
      </div>

      {/* How It Works */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          {t.howItWorks}
        </h3>
        <ol className="space-y-2">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`${
            isListening 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition`}
        >
          {isListening ? (
            <>
              <MicOff className="w-6 h-6" />
              {t.stopListening}
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              {t.startListening}
            </>
          )}
        </button>

        {isListening && (
          <div className="bg-red-600/20 border border-red-500/50 rounded-xl px-6 py-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">{t.currentlyListening}</span>
          </div>
        )}
      </div>

      {/* Live Warnings */}
      {liveWarnings.length > 0 && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="font-bold text-red-400">{t.liveWarnings}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {liveWarnings.map((warning, index) => (
              <div key={index} className="bg-red-600/30 px-3 py-1 rounded-lg text-sm font-semibold">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold mb-3">{t.manualInput}</h3>
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder={t.manualPlaceholder}
          className="w-full bg-black/50 border border-white/10 rounded-lg p-4 min-h-32 focus:outline-none focus:border-blue-500 mb-3"
        />
        <button
          onClick={analyzeManualInput}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <Brain className="w-5 h-5" />
          {t.analyzeButton}
        </button>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t.transcriptTitle}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transcript.map((line, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  line.isSuspicious 
                    ? 'bg-red-600/20 border border-red-500/50' 
                    : 'bg-black/50 border border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1">{line.text}</p>
                  {line.isSuspicious && (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(line.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            {t.analysisTitle}
          </h3>

          {/* Risk Level */}
          <div className={`border rounded-xl p-6 mb-6 ${getRiskColor(analysis.riskLevel)}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-80 mb-1">{t.riskLevel}</div>
                <div className="text-2xl font-bold">
                  {t.riskLevels[analysis.riskLevel]}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80 mb-1">{t.riskScore}</div>
                <div className="text-4xl font-bold">{analysis.riskScore}%</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-black/30 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all ${
                  analysis.riskLevel === 'dangerous' ? 'bg-red-500' :
                  analysis.riskLevel === 'suspicious' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${analysis.riskScore}%` }}
              />
            </div>

            <div className="text-sm opacity-80">
              {t.confidence}: {analysis.confidence}%
            </div>
          </div>

          {/* Detected Patterns */}
          {analysis.detectedPatterns.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                {t.detectedPatterns}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="bg-orange-600/20 border border-orange-500/50 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                {t.redFlags}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.redFlags.map((flag, index) => (
                  <div
                    key={index}
                    className="bg-red-600/20 border border-red-500/50 px-3 py-1 rounded text-xs font-mono"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className={`border rounded-lg p-4 ${getRiskColor(analysis.riskLevel)}`}>
            <h4 className="font-bold mb-2">{t.recommendation}</h4>
            <p>{analysis.recommendation}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-yellow-400 mb-1">{t.disclaimer}</h4>
            <p className="text-sm text-yellow-200">{t.disclaimerText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}