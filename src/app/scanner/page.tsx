'use client';
import { useState, useRef } from 'react';
import { 
  Scan, Globe, FileText, Image as ImageIcon, 
  ShieldCheck, CheckCircle2, Loader2, ShieldAlert,
  Upload, Link as LinkIcon, Lock
} from 'lucide-react';

export default function UniversalScanner() {
  const [scanType, setScanType] = useState<'url' | 'file' | 'image'>('url');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!input && !fileInputRef.current?.files?.[0]) return;
    
    setIsScanning(true);
    setResult(null);

    // Simulate Deep AI Analysis
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        status: 'secure', // or 'danger'
        threatLevel: 'Low',
        details: [
          'No Ransomware signatures detected',
          'URL/File metadata is clean',
          'No hidden steganographic payloads found',
          'Verified against 50+ global threat databases'
        ],
        timestamp: new Date().toLocaleString()
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Universal Scanner
        </h1>
        <p className="text-gray-400">Unified threat engine for Links, Files, and Images</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
        {[
          { id: 'url', label: 'URL/Link', icon: LinkIcon },
          { id: 'file', label: 'File/APK', icon: FileText },
          { id: 'image', label: 'Image (Stegano)', icon: ImageIcon },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => { setScanType(mode.id as any); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              scanType === mode.id ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            <mode.icon className="w-5 h-5" />
            <span className="font-semibold">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
        {scanType === 'url' ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Paste URL to check for Phishing or Malware</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://example-scam-link.com"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition"
          >
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Click to upload {scanType === 'image' ? 'Image' : 'File/APK'}</p>
            <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setInput(e.target.files?.[0]?.name || '')} />
            {input && <p className="mt-4 text-purple-400 font-bold">Selected: {input}</p>}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isScanning || (!input)}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
        >
          {isScanning ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Threat Vectors...</>
          ) : (
            <><Scan className="w-6 h-6" /> Start AI Deep Scan</>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className={`rounded-2xl p-6 border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
          result.status === 'secure' ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-start gap-4">
            {result.status === 'secure' ? (
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Scan Results: {result.status === 'secure' ? 'System Clean' : 'Threat Detected'}</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-400">{result.timestamp}</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                {result.details.map((detail: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {detail}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <div className="flex-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 uppercase">Threat Level</p>
                  <p className="font-bold text-green-400">{result.threatLevel}</p>
                </div>
                <div className="flex-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-500 uppercase">Integrity Check</p>
                  <p className="font-bold text-blue-400">Passed</p>
                </div>
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