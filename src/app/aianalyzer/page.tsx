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
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Use type assertion to avoid TypeScript error
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript((prev) => prev + ' ' + transcriptText);
        
        // Auto-analyze when transcript gets long
        if (transcriptText.length > 50) {
          analyzeCall(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setAnalysis(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript) {
        analyzeCall(transcript);
      }
    }
  };

  const analyzeCall = async (text: string) => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const scamKeywords = [
      'police', 'arrest', 'courier', 'drugs', 'account frozen',
      'transfer money', 'urgent', 'OTP', 'CVV', 'password',
      'bank details', 'CBI', 'officer', 'legal action', 'suspend'
    ];

    const detectedKeywords = scamKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword)
    );

    const riskScore = Math.min(detectedKeywords.length * 15, 100);
    const isScam = riskScore > 40;

    setAnalysis({
      riskScore,
      isScam,
      detectedKeywords,
      recommendation: isScam
        ? '⚠️ HIGH RISK - This appears to be a scam call. Hang up immediately!'
        : '✅ LOW RISK - Call appears normal, but stay vigilant.',
      warnings: isScam ? [
        'Multiple scam keywords detected',
        'Caller requesting sensitive information',
        'Creating urgency and pressure',
        'Do not share any personal details'
      ] : []
    });

    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🧠 AI Call Analyzer</h1>
        <p className="text-purple-100">Real-time scam detection during phone calls</p>
      </div>

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
      {isAnalyzing && (
        <div className="bg-white/5 rounded-xl p-6 mb-6 text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-3 text-blue-400" />
          <p className="text-gray-400">Analyzing call for scam patterns...</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
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

          {analysis.detectedKeywords.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="font-semibold mb-2">Detected Scam Keywords:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedKeywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="bg-red-600/30 text-red-300 px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

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
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p>Converts speech to text in real-time using browser API</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p>Analyzes transcript for scam keywords and patterns</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <p>Calculates risk score based on detected indicators</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <p>Provides instant alerts if scam detected</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Works best in Chrome/Edge browsers. Requires microphone permission.
            This is a demo using browser speech recognition. For production, integrate with advanced AI models.
          </p>
        </div>
      </div>
    </div>
  );
}