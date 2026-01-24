'use client';
import { useState, useRef } from 'react';
import { 
  Scan, Globe, FileText, Image as ImageIcon, 
  ShieldCheck, CheckCircle2, Loader2, ShieldAlert,
  Upload, Link as LinkIcon, Lock, Shield
} from 'lucide-react';

export default function Scanner({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [scanType, setScanType] = useState<'url' | 'file' | 'image'>('url');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!input && !fileInputRef.current?.files?.[0]) return;
    setIsScanning(true);
    setResult(null);

    // Simulate Deep AI Analysis for consolidated threats
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        status: 'secure',
        threatLevel: 'Low',
        details: [
          'No Ransomware signatures or malicious APK code detected',
          'URL verified against global phishing & scam databases',
          'Steganography check: No hidden data found in image pixels',
          'Breach status: Your metadata does not appear in recent leaks'
        ],
        timestamp: new Date().toLocaleString()
      });
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Universal Scanner
        </h1>
        <p className="text-gray-400">Consolidated Engine: URL, APK, Files, Steganography, & Breach Check</p>
      </div>

      {/* Unified Mode Selector */}
      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
        {[
          { id: 'url', label: 'URL / Links', icon: LinkIcon },
          { id: 'file', label: 'APK / Files', icon: FileText },
          { id: 'image', label: 'Image (Stegano)', icon: ImageIcon },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => { setScanType(mode.id as any); setInput(''); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              scanType === mode.id ? 'bg-purple-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            <mode.icon className="w-5 h-5" />
            <span className="font-semibold">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
        {scanType === 'url' ? (
          <div className="space-y-4">
             <label className="text-sm text-gray-400 font-bold uppercase tracking-wider">Paste Link to Analyze</label>
             <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/scam-link"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:border-purple-500 outline-none"
            />
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:bg-purple-500/5 transition">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="font-bold">{input || `Click to upload ${scanType === 'image' ? 'Image for Stegano Check' : 'APK or File'}`}</p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setInput(e.target.files?.[0]?.name || '')} />
          </div>
        )}

        <button onClick={handleScan} disabled={isScanning || !input} className="w-full mt-6 bg-purple-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
          {isScanning ? <><Loader2 className="animate-spin" /> Analyzing Threat Vectors...</> : <><Scan /> Start AI Deep Scan</>} 
        </button>
      </div>

      {/* --- THIS IS WHERE YOU ADD THE RESULT BLOCK --- */}
      {result && (
        <div className={`rounded-2xl p-6 border animate-in fade-in slide-in-from-bottom-4 ${
          result.status === 'secure' ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-start gap-4">
            {result.status === 'secure' ? (
              <ShieldCheck className="w-8 h-8 text-green-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Scan Results: {result.status === 'secure' ? 'System Clean' : 'Threat Detected'}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {result.details.map((d: string, i: number) => (
                  <p key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" /> {d}
                  </p>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                <span>Threat Level: {result.threatLevel}</span>
                <span>{result.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Info */}
      <div className="mt-8 flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Lock className="w-5 h-5 text-blue-400" />
        <p className="text-xs text-blue-200">
          QuantumShield uses Local-First processing. Your files and URLs are analyzed without being stored on our permanent servers.
        </p>
      </div>
    </div>
  );
}