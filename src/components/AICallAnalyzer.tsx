'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Brain, AlertTriangle, CheckCircle, Phone, Loader } from 'lucide-react';

// Declare global types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AICallAnalyzer() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [isScamDetected, setIsScamDetected] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Scam keywords to detect
  const SCAM_KEYWORDS = [
    'police', 'arrest', 'courier', 'drugs', 'account frozen',
    'transfer money', 'urgent', 'OTP', 'CVV', 'password',
    'bank details', 'CBI', 'officer', 'legal action', 'suspend',
    'blocked', 'warrant', 'investigation', 'customs', 'parcel',
    'money laundering', 'tax evasion', 'court', 'bail',
    'FedEx', 'DHL', 'seized', 'illegal', 'crime'
  ];

  useEffect(() => {
    // Use type assertion to avoid TypeScript error
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // English - India

recognitionRef.current.onresult = (event: any) => {
  // Get only the LATEST result to avoid repetition
  const current = event.resultIndex;
  const transcript = event.results[current][0].transcript;
  
  // Append to existing transcript
  setTranscript(prev => prev + ' ' + transcript);
  
  // Analyze the full transcript
  const fullTranscript = transcript;
  analyzeText(fullTranscript);
};

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
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
    };
  }, [isListening]);

  const analyzeText = (text: string) => {
    const found = SCAM_KEYWORDS.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    setDetectedKeywords(found);
    setIsScamDetected(found.length > 0);

    if (found.length > 0) {
      // Calculate risk score
      const riskScore = Math.min(found.length * 15, 100);
      setAnalysis({
        riskScore,
        isScam: riskScore > 40,
        detectedKeywords: found,
        recommendation: riskScore > 40
          ? '⚠️ HIGH RISK - This appears to be a scam call. Hang up immediately!'
          : '✅ LOW RISK - Call appears normal, but stay vigilant.',
        warnings: riskScore > 40 ? [
          'Multiple scam keywords detected',
          'Caller requesting sensitive information',
          'Creating urgency and pressure',
          'Do not share any personal details'
        ] : []
      });
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setTranscript('');
        setDetectedKeywords([]);
        setIsScamDetected(false);
        setAnalysis(null);
        recognitionRef.current.start();
        setIsListening(true);
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🧠 AI Call Analyzer</h1>
        <p className="text-purple-100">Real-time scam detection during phone calls</p>
      </div>

      {/* Scam Alert Banner */}
      {isScamDetected && (
        <div className="bg-red-600/20 border-2 border-red-500 rounded-xl p-6 mb-6 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-12 h-12 text-red-400 shrink-0" />
            <div>
              <h3 className="font-bold text-red-400 text-2xl mb-2">⚠️ SCAM WARNING DETECTED!</h3>
              <p className="text-red-200 mb-3">
                This caller is likely attempting a scam. Hang up immediately and do not share any information.
              </p>
              <div className="bg-red-900/30 rounded-lg p-3">
                <p className="font-semibold text-sm mb-2">Detected Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-red-600/50 text-red-100 px-3 py-1 rounded-full text-xs font-semibold">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recording Control */}
      <div className="bg-white/5 rounded-xl p-8 mb-6 text-center">
        <div className="mb-6">
          {!isListening ? (
            <button
              onClick={startListening}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-12 py-6 rounded-full font-bold text-xl transition shadow-lg shadow-green-500/50 inline-flex items-center gap-3">
              <Mic className="w-8 h-8" />
              Start Analyzing Call
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-12 py-6 rounded-full font-bold text-xl transition shadow-lg shadow-red-500/50 inline-flex items-center gap-3 animate-pulse">
              <MicOff className="w-8 h-8" />
              Stop Analyzing
            </button>
          )}
        </div>

        {isListening && (
          <div className="flex items-center justify-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <span className="font-semibold">Listening & Analyzing...</span>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          {isListening 
            ? 'Put your phone on speaker near your device microphone'
            : 'Click to start monitoring the call for scam patterns'
          }
        </p>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Live Transcript
          </h3>
          <div className="bg-black/50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-gray-300 whitespace-pre-wrap">{transcript}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className={`rounded-xl p-6 mb-6 border-2 ${
          analysis.isScam
            ? 'bg-red-600/20 border-red-500'
            : 'bg-green-600/20 border-green-500'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {analysis.isScam ? (
              <AlertTriangle className="w-12 h-12 text-red-400" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-400" />
            )}
            <div>
              <h3 className={`font-bold text-2xl ${
                analysis.isScam ? 'text-red-400' : 'text-green-400'
              }`}>
                Risk Score: {analysis.riskScore}%
              </h3>
              <p className="text-gray-300 mt-1">{analysis.recommendation}</p>
            </div>
          </div>

          {analysis.warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="font-semibold mb-2 text-red-400">⚠️ Warnings:</p>
              <ul className="space-y-1">
                {analysis.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* How it Works */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          How AI Analysis Works
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <p>Converts speech to text in real-time using browser API</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <p>Analyzes transcript for scam keywords and patterns</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <p>Calculates risk score based on detected indicators</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
            <p>Provides instant alerts if scam detected</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Works best in Chrome/Edge browsers. Requires microphone permission.
            Analysis happens locally on your device - no data is sent to servers.
          </p>
        </div>

        {/* Detected Keywords Reference */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2 font-semibold">Common Scam Keywords We Monitor:</p>
          <div className="flex flex-wrap gap-2">
            {SCAM_KEYWORDS.slice(0, 12).map((keyword, index) => (
              <span
                key={index}
                className="bg-gray-700/50 text-gray-400 px-2 py-1 rounded text-xs">
                {keyword}
              </span>
            ))}
            <span className="text-xs text-gray-500 px-2 py-1">
              + {SCAM_KEYWORDS.length - 12} more...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}