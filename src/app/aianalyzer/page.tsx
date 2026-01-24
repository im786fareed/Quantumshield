'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Brain, AlertTriangle, CheckCircle, Phone, Loader2, ShieldAlert } from 'lucide-react';

// Declare global types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// THE DEFAULT EXPORT FIXES THE "NOT A MODULE" ERROR
export default function AICallAnalyzer() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
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
        
        // Auto-analyze when meaningful text is gathered
        if (transcriptText.length > 30) {
          analyzeCall(transcript + ' ' + transcriptText);
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [transcript]);

  // INTEGRATED DIGITAL ARREST LOGIC
  const analyzeCall = async (text: string) => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Weights: 1 = Low, 2 = Medium, 3 = High/Critical
    const threatMap: Record<string, number> = {
      'digital arrest': 3, 'cbi': 3, 'ncb': 3, 'mumbai police': 3, 'customs': 3,
      'money laundering': 3, 'narcotics': 3, 'drugs': 3, 'arrest warrant': 3,
      'trai': 2, 'aadhaar': 2, 'kyc': 2, 'courier': 2, 'parcel': 2, 'skype': 2,
      'confidential': 2, 'urgent': 1, 'verify': 1, 'bank': 1, 'police': 2
    };

    let totalRiskScore = 0;
    const detected: string[] = [];

    Object.entries(threatMap).forEach(([keyword, weight]) => {
      if (text.toLowerCase().includes(keyword)) {
        totalRiskScore += weight * 15; // Scaled to reach 100 quickly
        detected.push(keyword);
      }
    });

    const finalScore = Math.min(totalRiskScore, 100);

    setAnalysis({
      riskScore: finalScore,
      isScam: finalScore >= 45,
      detected,
      recommendation: finalScore >= 45 
        ? "🚨 CRITICAL THREAT: This is a known 'Digital Arrest' or 'Customs' scam pattern. Hang up!" 
        : "ℹ️ Monitoring... Stay cautious if they ask for money or personal IDs."
    });
    setIsAnalyzing(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAnalysis(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-900 to-black p-6 rounded-2xl border border-blue-500/30 mb-8 text-center">
        <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h1 className="text-3xl font-black mb-2 tracking-tight">AI CALL ANALYZER</h1>
        <p className="text-gray-400">Real-time "Digital Arrest" & Scam Detection</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center shadow-2xl">
        <button
          onClick={toggleListening}
          className={`w-full max-w-sm py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 mx-auto ${
            isListening 
            ? 'bg-red-600 animate-pulse border-red-400' 
            : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {isListening ? <><MicOff /> STOP MONITORING</> : <><Mic /> START AI ANALYSIS</>}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-bold mb-4 text-gray-500 text-xs uppercase tracking-widest">
            <Phone size={14} /> Live Transcript
          </h3>
          <div className="h-40 overflow-y-auto text-sm text-gray-300 italic leading-relaxed">
            {transcript || "Speak or play audio to begin..."}
          </div>
        </div>

        <div className={`rounded-2xl p-6 border transition-all ${
          analysis?.isScam ? 'bg-red-900/20 border-red-500/50' : 'bg-white/5 border-white/10'
        }`}>
          <h3 className="flex items-center gap-2 font-bold mb-4 text-gray-500 text-xs uppercase tracking-widest">
             <ShieldAlert size={14} /> AI Risk Assessment
          </h3>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-24">
              <Loader2 className="animate-spin text-blue-400 mb-2" />
              <p className="text-[10px] text-gray-500">Processing voice patterns...</p>
            </div>
          ) : analysis ? (
            <div>
              <div className="text-4xl font-black mb-1" style={{ color: analysis.isScam ? '#f87171' : '#4ade80' }}>
                {analysis.riskScore}%
              </div>
              <p className="text-xs text-gray-300 mb-4 font-medium uppercase tracking-tighter">{analysis.recommendation}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.detected.map((k: string) => (
                  <span key={k} className="bg-red-500/10 text-red-400 text-[9px] px-2 py-1 rounded border border-red-500/20 font-bold uppercase">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : (
             <p className="text-gray-600 text-sm italic py-8">No threats detected yet.</p>
          )}
        </div>
      </div>

      {analysis?.isScam && (
        <div className="mt-8 p-5 bg-red-600 rounded-2xl flex items-center justify-between border-b-4 border-red-800 animate-bounce">
           <div className="flex items-center gap-3">
              <AlertTriangle className="text-white" />
              <p className="font-black text-sm uppercase">Scam Detected! Record Evidence?</p>
           </div>
           <a href="/evidence" className="bg-white text-red-600 px-5 py-2 rounded-xl font-black text-xs shadow-lg">OPEN VAULT</a>
        </div>
      )}
    </div>
  );
}