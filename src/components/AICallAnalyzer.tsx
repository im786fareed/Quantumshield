'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Brain, AlertTriangle, CheckCircle, Phone, Loader, Video, FileText, Shield, Users, CreditCard, Clock, UserX, FileWarning, Smartphone } from 'lucide-react';

// Declare global types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface CallContext {
  callerNumber?: string;
  callerName?: string;
  isUnknownNumber: boolean;
  isWhatsAppCall: boolean;
  callSource: 'regular' | 'whatsapp' | 'unknown';
}

interface CallMetrics {
  duration: number;
  bankingKeywordsCount: number;
  urgencyScore: number;
  behavioralFlags: string[];
  pdfShared: boolean;
  transactionMentioned: boolean;
  personalInfoRequested: boolean;
}

interface AIAnalysis {
  isScam: boolean;
  confidence: number;
  scamType: string;
  riskScore: number;
  reasoning: string;
  detectedPatterns: string[];
  recommendations: string[];
  criticalWarnings: string[];
}

export default function AICallAnalyzer() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScamDetected, setIsScamDetected] = useState(false);
  const [autoRecording, setAutoRecording] = useState(false);
  
  // Call context tracking
  const [callContext, setCallContext] = useState<CallContext>({
    isUnknownNumber: false,
    isWhatsAppCall: false,
    callSource: 'unknown'
  });
  
  // Call metrics tracking
  const [callMetrics, setCallMetrics] = useState<CallMetrics>({
    duration: 0,
    bankingKeywordsCount: 0,
    urgencyScore: 0,
    behavioralFlags: [],
    pdfShared: false,
    transactionMentioned: false,
    personalInfoRequested: false
  });

  const recognitionRef = useRef<any>(null);
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisRef = useRef<string>('');

  // Enhanced scam detection patterns
  const SCAM_PATTERNS = {
    digitalArrest: [
      'digital arrest', 'digitally arrested', 'cyber arrest',
      'online arrest', 'virtual arrest', 'e-arrest', 'video call arrest'
    ],
    authorityClaim: [
      'police', 'CBI', 'ED', 'income tax', 'customs', 'officer',
      'investigation', 'department', 'authority', 'government',
      'enforcement directorate', 'revenue department'
    ],
    urgencyPressure: [
      'urgent', 'immediately', 'right now', 'within minutes',
      'before it\'s too late', 'last chance', 'time running out',
      'hurry', 'quick', 'fast'
    ],
    legalThreat: [
      'arrest', 'warrant', 'court', 'legal action', 'jail',
      'police station', 'FIR', 'case registered', 'criminal',
      'summons', 'chargesheet', 'prosecution'
    ],
    financialRequest: [
      'transfer money', 'payment', 'fine', 'penalty', 'bail',
      'account', 'bank', 'transaction', 'UPI', 'NEFT', 'RTGS',
      'send money', 'deposit', 'wire transfer'
    ],
    informationRequest: [
      'OTP', 'CVV', 'PIN', 'password', 'card number', 'account number',
      'details', 'verify', 'confirm', 'share', 'aadhaar', 'PAN'
    ],
    packageScam: [
      'courier', 'parcel', 'package', 'shipment', 'delivery',
      'seized', 'FedEx', 'DHL', 'customs clearance', 'contraband'
    ],
    suspiciousBehavior: [
      'don\'t tell anyone', 'keep secret', 'confidential',
      'don\'t disconnect', 'stay on line', 'video call',
      'don\'t hang up', 'keep this private'
    ],
    pdfDocument: [
      'PDF', 'document', 'form', 'file', 'attachment', 'link',
      'download', 'click here', 'open the file', 'confirmation form'
    ]
  };

  const BANKING_KEYWORDS = [
    'bank', 'account', 'transfer', 'payment', 'UPI', 'NEFT', 'RTGS',
    'transaction', 'money', 'amount', 'rupees', 'lakh', 'crore',
    'withdraw', 'deposit', 'balance'
  ];

  const PERSONAL_INFO_KEYWORDS = [
    'OTP', 'CVV', 'PIN', 'password', 'aadhaar', 'PAN', 'card number',
    'account number', 'date of birth', 'address', 'email'
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setFullTranscript(prev => prev + finalTranscript);
          updateCallMetrics(fullTranscript + finalTranscript);
        }

        setTranscript(interimTranscript || finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          stopListening();
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Failed to restart:', err);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isListening]);

  // Update call metrics based on conversation
  const updateCallMetrics = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Count banking keywords
    const bankingCount = BANKING_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword)
    ).length;

    // Calculate urgency score
    const urgencyWords = SCAM_PATTERNS.urgencyPressure.filter(word =>
      lowerText.includes(word.toLowerCase())
    ).length;

    // Check for PDF/document sharing
    const pdfMentioned = SCAM_PATTERNS.pdfDocument.some(word =>
      lowerText.includes(word.toLowerCase())
    );

    // Check for transaction mentions
    const transactionWords = ['transfer', 'send', 'payment', 'transaction', 'deposit'];
    const transactionMentioned = transactionWords.some(word =>
      lowerText.includes(word)
    );

    // Check for personal info requests
    const personalInfoRequested = PERSONAL_INFO_KEYWORDS.some(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );

    // Detect behavioral flags with CONTEXT
    const flags: string[] = [];
    
    // CONTEXTUAL DURATION CHECK - Only flag if unknown number + long call
    if (callContext.isUnknownNumber && callMetrics.duration > 180) {
      flags.push('⚠️ Long call from unknown number (>3 min)');
    }
    
    // CONTEXTUAL BANKING CHECK - Only flag if unknown + multiple banking refs
    if (callContext.isUnknownNumber && bankingCount > 3) {
      flags.push('💳 Multiple banking references from unknown caller');
    }
    
    if (urgencyWords > 2) {
      flags.push('⚡ High urgency pressure tactics detected');
    }

    // Check for digital arrest specifically
    const hasDigitalArrest = SCAM_PATTERNS.digitalArrest.some(phrase =>
      lowerText.includes(phrase.toLowerCase())
    );
    
    if (hasDigitalArrest) {
      flags.push('🚨 DIGITAL ARREST SCAM DETECTED');
    }

    // PDF sharing from unknown number
    if (callContext.isUnknownNumber && pdfMentioned) {
      flags.push('📄 PDF/Document shared from unknown number');
    }

    // Banking transaction request from unknown
    if (callContext.isUnknownNumber && transactionMentioned) {
      flags.push('💸 Transaction/Payment requested by unknown caller');
    }

    // Personal info request from unknown
    if (callContext.isUnknownNumber && personalInfoRequested) {
      flags.push('🔐 Personal information requested by unknown caller');
    }

    // WhatsApp-specific checks
    if (callContext.isWhatsAppCall) {
      if (callMetrics.duration > 300) { // 5 minutes on WhatsApp with stranger
        flags.push('📱 Extended WhatsApp call with unknown contact');
      }
      if (pdfMentioned) {
        flags.push('📱 Document shared on WhatsApp call');
      }
    }

    setCallMetrics(prev => ({
      ...prev,
      bankingKeywordsCount: bankingCount,
      urgencyScore: Math.min(urgencyWords * 20, 100),
      behavioralFlags: flags,
      pdfShared: pdfMentioned,
      transactionMentioned,
      personalInfoRequested
    }));
  };

  // Enhanced AI analysis with contextual intelligence
  const performAIAnalysis = async (text: string) => {
    if (!text || text.length < 20 || lastAnalysisRef.current === text) return;
    
    lastAnalysisRef.current = text;
    setIsAnalyzing(true);

    try {
      const lowerText = text.toLowerCase();
      const detectedPatterns: string[] = [];
      const criticalWarnings: string[] = [];
      let totalScore = 0;
      let scamType = 'Unknown';

      // Pattern detection with CONTEXTUAL scoring
      Object.entries(SCAM_PATTERNS).forEach(([category, patterns]) => {
        const matches = patterns.filter(pattern => 
          lowerText.includes(pattern.toLowerCase())
        );
        
        if (matches.length > 0) {
          detectedPatterns.push(`${category}: ${matches.join(', ')}`);
          
          // BASE SCORING
          let categoryScore = 0;
          
          if (category === 'digitalArrest') {
            categoryScore = 60; // Instant critical
            scamType = 'Digital Arrest Scam';
            criticalWarnings.push('DIGITAL ARREST is ALWAYS a scam - Police never arrest via phone/video');
          } else if (category === 'authorityClaim') {
            categoryScore = 15;
            if (scamType === 'Unknown') scamType = 'Authority Impersonation';
          } else if (category === 'legalThreat') {
            categoryScore = 15;
          } else if (category === 'financialRequest') {
            categoryScore = 20;
          } else if (category === 'informationRequest') {
            categoryScore = 20;
          } else if (category === 'pdfDocument') {
            categoryScore = 10;
          } else {
            categoryScore = 10;
          }

          // CONTEXTUAL MULTIPLIERS
          if (callContext.isUnknownNumber) {
            categoryScore *= 1.5; // 50% increase for unknown callers
          }

          if (callContext.isWhatsAppCall && category === 'financialRequest') {
            categoryScore *= 1.3; // WhatsApp + money = higher risk
          }

          totalScore += categoryScore;
        }
      });

      // CONTEXTUAL BEHAVIORAL SCORING
      // Only add these scores if caller is unknown
      if (callContext.isUnknownNumber) {
        if (callMetrics.duration > 300) { // 5 minutes
          totalScore += 20;
          detectedPatterns.push('Extended call from unknown number');
          criticalWarnings.push('Long calls from strangers asking for money/info are red flags');
        }

        if (callMetrics.bankingKeywordsCount > 5) {
          totalScore += 25;
          detectedPatterns.push('Excessive banking discussion with stranger');
        }

        if (callMetrics.pdfShared) {
          totalScore += 15;
          detectedPatterns.push('Document shared by unknown caller');
          criticalWarnings.push('Never open documents or click links from unknown numbers');
        }

        if (callMetrics.transactionMentioned) {
          totalScore += 20;
          detectedPatterns.push('Payment/transaction requested by stranger');
          criticalWarnings.push('NEVER transfer money to unknown persons, regardless of reason');
        }

        if (callMetrics.personalInfoRequested) {
          totalScore += 25;
          detectedPatterns.push('Personal information requested by unknown caller');
          criticalWarnings.push('Banks/Police NEVER ask for OTP, CVV, PIN, or passwords');
        }
      }

      // WhatsApp-specific scoring
      if (callContext.isWhatsAppCall && callContext.isUnknownNumber) {
        totalScore += 10; // Unknown WhatsApp calls are inherently more suspicious
        detectedPatterns.push('WhatsApp call from unknown/unverified contact');
      }

      if (callMetrics.urgencyScore > 60) {
        totalScore += 15;
        detectedPatterns.push('High urgency/pressure tactics');
      }

      // Calculate final risk score (cap at 100)
      const riskScore = Math.min(totalScore, 100);
      const isScam = riskScore > 40;
      const confidence = Math.min((riskScore / 100) * 100, 99);

      // Generate contextual reasoning
      let reasoning = '';
      if (riskScore > 80) {
        reasoning = callContext.isUnknownNumber 
          ? 'CRITICAL THREAT: Multiple scam indicators from UNKNOWN NUMBER. This is almost certainly a scam.'
          : 'CRITICAL THREAT: Multiple scam indicators detected. Verify caller identity immediately.';
      } else if (riskScore > 60) {
        reasoning = callContext.isUnknownNumber
          ? 'HIGH RISK: Suspicious patterns from UNKNOWN NUMBER. Strong likelihood of scam.'
          : 'HIGH RISK: Several suspicious patterns detected. Exercise extreme caution.';
      } else if (riskScore > 40) {
        reasoning = 'MODERATE RISK: Some concerning patterns detected. Stay vigilant.';
      } else {
        reasoning = callContext.isUnknownNumber
          ? 'LOW RISK: Unknown number but no clear scam patterns yet. Remain cautious.'
          : 'LOW RISK: No clear scam patterns detected. Continue normal conversation.';
      }

      // Generate contextual recommendations
      const recommendations: string[] = [];
      if (isScam) {
        recommendations.push('🚨 HANG UP IMMEDIATELY');
        
        if (callContext.isUnknownNumber) {
          recommendations.push('UNKNOWN CALLER detected - Do NOT trust');
        }
        
        if (callContext.isWhatsAppCall) {
          recommendations.push('Block this WhatsApp contact immediately');
          recommendations.push('Report number on WhatsApp');
        }
        
        recommendations.push('Do NOT share any personal information');
        recommendations.push('Do NOT make any payments or transfers');
        
        if (detectedPatterns.some(p => p.toLowerCase().includes('digital'))) {
          recommendations.push('🚨 DIGITAL ARREST IS 100% SCAM - Police never arrest via phone');
        }
        
        if (callMetrics.pdfShared) {
          recommendations.push('DO NOT open any documents/links sent by this caller');
        }
        
        recommendations.push('Report to cybercrime.gov.in or call 1930');
        recommendations.push('Block this number immediately');
        
        if (!autoRecording) {
          recommendations.push('⚠️ Evidence collection recommended');
        }
      } else {
        if (callContext.isUnknownNumber) {
          recommendations.push('Unknown number - Stay alert and cautious');
          recommendations.push('Verify caller identity before sharing information');
        }
        recommendations.push('Do not share sensitive information');
        recommendations.push('Independently verify any claims made');
      }

      const aiAnalysis: AIAnalysis = {
        isScam,
        confidence,
        scamType,
        riskScore,
        reasoning,
        detectedPatterns,
        recommendations,
        criticalWarnings
      };

      setAnalysis(aiAnalysis);
      setIsScamDetected(isScam);

      // Auto-trigger screen recording if scam detected from unknown number
      if (isScam && callContext.isUnknownNumber && !autoRecording) {
        startAutoRecording();
      }

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAutoRecording = () => {
    setAutoRecording(true);
    console.log('🎥 Auto-recording initiated due to scam detection');
  };

  // Call context setup dialog
  const setupCallContext = () => {
    const isUnknown = confirm('Is this an UNKNOWN NUMBER (not in your contacts)?');
    const isWhatsApp = confirm('Is this a WhatsApp call?');
    
    let callerNumber = '';
    let callerName = '';
    
    if (!isUnknown) {
      callerName = prompt('Enter caller name (optional):') || 'Known Contact';
    } else {
      callerNumber = prompt('Enter caller number (optional):') || 'Unknown';
    }

    setCallContext({
      callerNumber,
      callerName,
      isUnknownNumber: isUnknown,
      isWhatsAppCall: isWhatsApp,
      callSource: isWhatsApp ? 'whatsapp' : 'regular'
    });

    return true;
  };

  const startListening = () => {
    // Setup call context first
    const contextSet = setupCallContext();
    if (!contextSet) return;

    if (recognitionRef.current) {
      try {
        setTranscript('');
        setFullTranscript('');
        setAnalysis(null);
        setIsScamDetected(false);
        setAutoRecording(false);
        lastAnalysisRef.current = '';
        
        setCallMetrics({
          duration: 0,
          bankingKeywordsCount: 0,
          urgencyScore: 0,
          behavioralFlags: [],
          pdfShared: false,
          transactionMentioned: false,
          personalInfoRequested: false
        });

        recognitionRef.current.start();
        setIsListening(true);
        
        callStartTimeRef.current = Date.now();
        
        durationIntervalRef.current = setInterval(() => {
          const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
          setCallMetrics(prev => ({ ...prev, duration }));
        }, 1000);

        analysisIntervalRef.current = setInterval(() => {
          if (fullTranscript) {
            performAIAnalysis(fullTranscript);
          }
        }, 3000);

      } catch (err) {
        console.error('Failed to start:', err);
        alert('Failed to start speech recognition. Make sure you\'re using Chrome or Edge browser.');
      }
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    if (fullTranscript) {
      performAIAnalysis(fullTranscript);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🧠 AI Call Analyzer Pro</h1>
        <p className="text-purple-100">Contextual scam detection with unknown caller intelligence</p>
      </div>

      {/* Call Context Info */}
      {isListening && (
        <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Call Context
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Caller Status</p>
              <p className={`font-semibold ${
                callContext.isUnknownNumber ? 'text-red-400' : 'text-green-400'
              }`}>
                {callContext.isUnknownNumber ? (
                  <>
                    <UserX className="w-4 h-4 inline mr-1" />
                    Unknown Number
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 inline mr-1" />
                    {callContext.callerName || 'Known Contact'}
                  </>
                )}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Call Source</p>
              <p className="font-semibold text-white">
                {callContext.isWhatsAppCall ? (
                  <>
                    <Smartphone className="w-4 h-4 inline mr-1 text-green-400" />
                    WhatsApp Call
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 inline mr-1 text-blue-400" />
                    Regular Call
                  </>
                )}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Analysis Mode</p>
              <p className="font-semibold text-purple-400">
                {callContext.isUnknownNumber ? 'High Vigilance' : 'Standard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Scam Alert Banner */}
      {isScamDetected && (
        <div className="bg-red-600 border-4 border-red-400 rounded-xl p-6 mb-6 animate-pulse shadow-2xl shadow-red-500/50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-16 h-16 text-white shrink-0 animate-bounce" />
            <div>
              <h3 className="font-bold text-white text-3xl mb-3">🚨 SCAM DETECTED - HANG UP NOW!</h3>
              {callContext.isUnknownNumber && (
                <p className="text-red-100 text-lg mb-2 font-bold">
                  ⚠️ UNKNOWN NUMBER + Scam Patterns = HIGH DANGER
                </p>
              )}
              <p className="text-red-100 text-xl mb-2 font-semibold">
                {analysis?.scamType || 'Scam Call Detected'}
              </p>
              <p className="text-white mb-4">
                {analysis?.reasoning}
              </p>
              
              {analysis?.criticalWarnings && analysis.criticalWarnings.length > 0 && (
                <div className="bg-red-900/60 rounded-lg p-3 mb-4">
                  <p className="font-bold text-red-200 mb-2">🚨 CRITICAL ALERTS:</p>
                  {analysis.criticalWarnings.map((warning, index) => (
                    <p key={index} className="text-red-100 text-sm mb-1">• {warning}</p>
                  ))}
                </div>
              )}
              
              {autoRecording && (
                <div className="bg-red-900/50 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <Video className="w-5 h-5 text-red-200 animate-pulse" />
                  <span className="text-red-100 font-semibold">
                    🎥 Evidence recording activated
                  </span>
                </div>
              )}

              <div className="bg-red-900/50 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2 text-red-100">⚠️ DO THIS NOW:</p>
                <ul className="space-y-2">
                  {analysis?.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2 text-white">
                      <span className="text-red-300 font-bold">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Call Metrics Dashboard */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className={`rounded-lg p-4 border ${
          callContext.isUnknownNumber && callMetrics.duration > 180
            ? 'bg-red-600/20 border-red-500/50'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Duration</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatDuration(callMetrics.duration)}
          </p>
          {callContext.isUnknownNumber && callMetrics.duration > 180 && (
            <p className="text-xs text-red-400 mt-1">⚠️ Long unknown call</p>
          )}
        </div>

        <div className={`rounded-lg p-4 border ${
          callContext.isUnknownNumber && callMetrics.bankingKeywordsCount > 3
            ? 'bg-yellow-600/20 border-yellow-500/50'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Banking Refs</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {callMetrics.bankingKeywordsCount}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Urgency</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {callMetrics.urgencyScore}%
          </p>
        </div>

        <div className={`rounded-lg p-4 border ${
          callMetrics.pdfShared && callContext.isUnknownNumber
            ? 'bg-purple-600/20 border-purple-500/50'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">PDF Shared</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {callMetrics.pdfShared ? 'YES' : 'NO'}
          </p>
          {callMetrics.pdfShared && callContext.isUnknownNumber && (
            <p className="text-xs text-purple-400 mt-1">⚠️ From stranger</p>
          )}
        </div>

        <div className={`rounded-lg p-4 border ${
          callMetrics.behavioralFlags.length > 0
            ? 'bg-red-600/20 border-red-500/50'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Red Flags</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {callMetrics.behavioralFlags.length}
          </p>
        </div>
      </div>

      {/* Behavioral Flags */}
      {callMetrics.behavioralFlags.length > 0 && (
        <div className="bg-orange-600/20 border border-orange-500/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Contextual Red Flags Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {callMetrics.behavioralFlags.map((flag, index) => (
              <span
                key={index}
                className="bg-orange-600/30 border border-orange-500/50 text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recording Control */}
      <div className="bg-white/5 rounded-xl p-8 mb-6 text-center border border-white/10">
        <div className="mb-6">
          {!isListening ? (
            <button
              onClick={startListening}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-12 py-6 rounded-full font-bold text-xl transition shadow-lg shadow-green-500/50 inline-flex items-center gap-3 hover:scale-105">
              <Mic className="w-8 h-8" />
              Start Contextual AI Analysis
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-12 py-6 rounded-full font-bold text-xl transition shadow-lg shadow-red-500/50 inline-flex items-center gap-3 animate-pulse">
              <MicOff className="w-8 h-8" />
              Stop Analysis
            </button>
          )}
        </div>

        {isListening && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <span className="font-semibold">
                {callContext.isUnknownNumber ? 'High Alert Mode Active' : 'Standard Monitoring Active'}
              </span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Contextual AI Processing...</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          {isListening 
            ? 'AI is analyzing call context, caller behavior, and conversation patterns in real-time'
            : 'You\'ll be asked to specify if this is an unknown number or WhatsApp call for contextual analysis'
          }
        </p>
      </div>

      {/* Live Transcript */}
      {fullTranscript && (
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Live Conversation Transcript
          </h3>
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {fullTranscript}
              {transcript && <span className="text-blue-400">{transcript}</span>}
            </p>
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <div className={`rounded-xl p-6 mb-6 border-2 ${
          analysis.isScam
            ? 'bg-red-600/20 border-red-500'
            : 'bg-green-600/20 border-green-500'
        }`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-full ${
              analysis.isScam ? 'bg-red-600/30' : 'bg-green-600/30'
            }`}>
              {analysis.isScam ? (
                <AlertTriangle className="w-10 h-10 text-red-400" />
              ) : (
                <CheckCircle className="w-10 h-10 text-green-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`font-bold text-2xl ${
                  analysis.isScam ? 'text-red-400' : 'text-green-400'
                }`}>
                  Risk Score: {analysis.riskScore}%
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  analysis.isScam 
                    ? 'bg-red-600/30 text-red-200' 
                    : 'bg-green-600/30 text-green-200'
                }`}>
                  {analysis.confidence.toFixed(0)}% Confidence
                </span>
                {callContext.isUnknownNumber && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-600/30 text-orange-200">
                    Unknown Caller
                  </span>
                )}
              </div>
              <p className="text-gray-300 mb-2">{analysis.reasoning}</p>
              {analysis.scamType !== 'Unknown' && (
                <p className="text-sm">
                  <span className="text-gray-400">Detected Type:</span>{' '}
                  <span className="font-semibold text-red-400">{analysis.scamType}</span>
                </p>
              )}
            </div>
          </div>

          {analysis.detectedPatterns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="font-semibold mb-3 text-white flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Detected Patterns (Context-Aware):
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {analysis.detectedPatterns.map((pattern, index) => (
                  <div key={index} className="bg-black/30 rounded p-2">
                    <p className="text-xs text-gray-300">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Intelligence Notice */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-xl mb-4 text-blue-400 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          🎯 Contextual Intelligence Features
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">✅ Smart Context Detection</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• Unknown number = Higher scrutiny</li>
              <li>• 3-min call from friend = Normal ✓</li>
              <li>• 3-min call from stranger = Red flag 🚩</li>
              <li>• WhatsApp calls tracked separately</li>
            </ul>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🔍 Advanced Monitoring</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• PDF/document sharing detection</li>
              <li>• Banking transaction mentions</li>
              <li>• Personal info requests (OTP, CVV, etc)</li>
              <li>• Contextual behavioral scoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          How Contextual Analysis Works
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-semibold text-white">Call Context Setup</p>
              <p>You specify if caller is unknown and call type (WhatsApp/regular)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-semibold text-white">Real-Time Monitoring</p>
              <p>Speech-to-text conversion with scam pattern detection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-semibold text-white">Contextual Scoring</p>
              <p>Risk multipliers applied based on caller status (unknown = 1.5x risk)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
            <div>
              <p className="font-semibold text-white">Behavioral Analysis</p>
              <p>Duration, banking refs, PDF sharing evaluated WITH context</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
            <div>
              <p className="font-semibold text-white">Instant Alerts</p>
              <p>Auto-recording triggers if scam detected from unknown number</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-3">
            <strong>Example Scenarios:</strong>
          </p>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            <div className="bg-green-900/30 border border-green-500/30 rounded p-2">
              <p className="text-green-400 font-semibold">✓ Safe: Known Contact</p>
              <p className="text-gray-400">5-min call + banking words = Normal conversation</p>
            </div>
            <div className="bg-red-900/30 border border-red-500/30 rounded p-2">
              <p className="text-red-400 font-semibold">✗ Danger: Unknown Number</p>
              <p className="text-gray-400">5-min call + banking words = HIGH RISK SCAM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
