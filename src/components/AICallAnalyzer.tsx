'use client';
// This enables the browser's hidden "ear" to start listening
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-IN'; // Optimized for Indian accents
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, Shield, Brain, FileText } from 'lucide-react';
import { analyzeThreat } from '@/lib/ai/threatEngine'; // Link to the file above

export default function AICallAnalyzer({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let transcriptText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcriptText += event.results[i][0].transcript;
        }
        
        // FIX: Update the text box in real-time
        setCurrentText(transcriptText);

        // Run analysis
        const result = analyzeThreat(transcriptText);
        setAnalysis(result);

        // If it's a dangerous Digital Arrest or Data Loss scam, alert immediately
        if (result.riskLevel === 'dangerous' && event.results[event.resultIndex].isFinal) {
           alert(result.message);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setCurrentText('');
      setAnalysis(null);
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-4">
        <Brain className="w-10 h-10 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold">AI Call Analyzer</h1>
          <p className="text-slate-400 text-sm">Self-help tool against Digital Arrest & Cyber Fraud</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Voice Button */}
        <button
          onClick={toggleListening}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition ${
            isListening ? 'bg-red-600 animate-pulse' : 'bg-cyan-600 hover:bg-cyan-500'
          }`}
        >
          {isListening ? <MicOff /> : <Mic />}
          {isListening ? 'STOP ANALYSIS' : 'START LIVE VOICE ANALYSIS'}
        </button>

        {/* Text Input Area */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-slate-300">
            <FileText className="w-4 h-4" /> Call Transcript (Auto-updating)
          </label>
          <textarea
            value={currentText}
            onChange={(e) => {
              setCurrentText(e.target.value);
              setAnalysis(analyzeThreat(e.target.value));
            }}
            placeholder="What is the caller saying? Speak or type here..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 h-40 focus:ring-2 focus:ring-cyan-500 outline-none text-cyan-50"
          />
        </div>

        {/* Result Area */}
        {analysis && (
          <div className={`p-6 rounded-xl border-2 transition-all ${
            analysis.riskLevel === 'dangerous' ? 'bg-red-950/30 border-red-500' :
            analysis.riskLevel === 'suspicious' ? 'bg-yellow-950/30 border-yellow-500' :
            'bg-green-950/30 border-green-500'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold flex items-center gap-2">
                <Shield className={analysis.riskLevel === 'dangerous' ? 'text-red-500' : 'text-green-500'} />
                Risk Score: {analysis.riskScore}%
              </span>
              <span className="uppercase text-xs font-black px-3 py-1 rounded bg-slate-800 tracking-widest">
                {analysis.riskLevel}
              </span>
            </div>
            <p className="text-lg leading-relaxed">{analysis.message}</p>
            {analysis.riskLevel === 'dangerous' && (
              <button 
                onClick={() => window.location.href = '/home'}
                className="mt-4 w-full py-2 bg-red-600 text-white font-black rounded-lg hover:bg-red-700"
              >
                DISCONNECT & EXIT
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-[10px] text-slate-500 text-center uppercase tracking-tighter">
        Privacy Protected: Analysis happens on your device. No login required.
      </p>
    </div>
  );
}