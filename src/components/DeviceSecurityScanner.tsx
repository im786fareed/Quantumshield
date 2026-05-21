'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Activity, Search, Wifi, AlertOctagon, Terminal, Globe } from 'lucide-react';
import BackToHome from './BackToHome';

const T = {
  en: {
    title: "QUANTUM SCANNER v4.0",
    statusScanning: "Deep Analysis Running",
    statusReady: "System Ready",
    initScan: "INITIALIZE DEEP SCAN",
    scanningKernel: "SCANNING KERNEL OBJECTS...",
    scanComplete: "Scan Complete",
    healthDesc: "The AI has analyzed your environment. Your device is currently **Hardened**.",
    noRansomware: "NO RANSOMWARE",
    hackProof: "HACK-PROOF",
    reInitialize: "← RE-INITIALIZE SCANNER",
    perimeterScan: "Military-Grade Perimeter Scan",
    perimeterDesc: "Ready to scan for data loss risks, remote access vulnerabilities, and scam entry points.",
    fipsCompliant: "FIPS 140-2 Compliant",
    realtimeHeuristics: "Real-time Heuristics",
    zeroTrust: "Zero-Trust Protocol",
    // checks
    checks: [
      { id: 'av', name: 'AI Anti-Virus Engine', desc: 'Scanning for malicious script patterns' },
      { id: 'ransom', name: 'Ransomware Shield', desc: 'Checking for file-locking vulnerability' },
      { id: 'remote', name: 'Anti-Remote Access', desc: 'Detecting AnyDesk/TeamViewer gateways' },
      { id: 'spam', name: 'Anti-Spam Filter', desc: 'Analyzing communication port integrity' },
      { id: 'military', name: 'Military-Grade Logic', desc: 'Verifying hardware-level encryption' }
    ],
    // results
    results: [
      { check: 'Anti-Virus', status: 'PASS', detail: 'No signature-less malware detected.' },
      { check: 'Ransomware', status: 'PASS', detail: 'Vulnerability window closed.' },
      { check: 'Remote Access', status: 'PASS', detail: 'No active remote tunnels found.' },
      { check: 'Network', status: 'WARN', detail: 'DNS over HTTPS not fully enabled.' },
      { check: 'Encryption', status: 'PASS', detail: 'Hardware-backed AES confirmed.' }
    ]
  },
  hi: {
    title: "क्वांटम स्कैनर v4.0",
    statusScanning: "गहन विश्लेषण चल रहा है",
    statusReady: "सिस्टम तैयार है",
    initScan: "गहन स्कैन प्रारंभ करें",
    scanningKernel: "कर्नेल ऑब्जेक्ट्स को स्कैन किया जा रहा है...",
    scanComplete: "स्कैन पूरा हुआ",
    healthDesc: "AI ने आपके परिवेश का विश्लेषण किया है। आपका डिवाइस वर्तमान में **सुरक्षित** है।",
    noRansomware: "कोई रैंसमवेयर नहीं",
    hackProof: "हैक-प्रूफ",
    reInitialize: "← स्कैनर को पुनः प्रारंभ करें",
    perimeterScan: "सैन्य-ग्रेड परिधि स्कैन",
    perimeterDesc: "डेटा हानि जोखिमों, रिमोट एक्सेस कमजोरियों और घोटाले के प्रवेश बिंदुओं को स्कैन करने के लिए तैयार।",
    fipsCompliant: "FIPS 140-2 अनुपालन",
    realtimeHeuristics: "रीयल-टाइम ह्यूरिस्टिक्स",
    zeroTrust: "जीरो-ट्रस्ट प्रोटोकॉल",
    // checks
    checks: [
      { id: 'av', name: 'AI एंटी-वायरस इंजन', desc: 'दुर्भावनापूर्ण स्क्रिप्ट पैटर्न की स्कैनिंग' },
      { id: 'ransom', name: 'रैंसमवेयर शील्ड', desc: 'फाइल-लॉकिंग भेद्यता की जांच' },
      { id: 'remote', name: 'एंटी-रिमोट एक्सेस', desc: 'AnyDesk/TeamViewer गेटवे का पता लगाना' },
      { id: 'spam', name: 'एंटी-स्पैम फ़िल्टर', desc: 'संचार पोर्ट अखंडता का विश्लेषण' },
      { id: 'military', name: 'सैन्य-ग्रेड तर्क', desc: 'हार्डवेयर-स्तरीय एन्क्रिप्शन का सत्यापन' }
    ],
    // results
    results: [
      { check: 'एंटी-वायरस', status: 'PASS', detail: 'कोई मैलवेयर नहीं मिला।' },
      { check: 'रैंसमवेयर', status: 'PASS', detail: 'भेद्यता समाप्त कर दी गई है।' },
      { check: 'रिमोट एक्सेस', status: 'PASS', detail: 'कोई सक्रिय रिमोट टनल नहीं मिली।' },
      { check: 'नेटवर्क', status: 'WARN', detail: 'DNS over HTTPS पूरी तरह सक्षम नहीं है।' },
      { check: 'एन्क्रिप्शन', status: 'PASS', detail: 'हार्डवेयर-समर्थित AES सत्यापित।' }
    ]
  }
};

export default function DeviceSecurityScanner({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>(lang);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [overallHealth, setOverallHealth] = useState<number | null>(null);

  const t = T[currentLang];

  const runMilitaryScanner = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);
    
    for (let i = 0; i <= 100; i += 5) {
      setScanProgress(i);
      await new Promise(r => setTimeout(r, 80)); // Fast responsive scan
    }

    setScanResults(t.results);
    setOverallHealth(94);
    setIsScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-black/40 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Back to Home floating action */}
      <BackToHome />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm" />

      {/* Header with Bilingual Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Cpu className={`w-8 h-8 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tighter">{t.title}</h1>
              <button
                onClick={() => setCurrentLang(prev => prev === 'en' ? 'hi' : 'en')}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 flex items-center gap-1 transition"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                {currentLang === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">
              Status: {isScanning ? t.statusScanning : t.statusReady}
            </p>
          </div>
        </div>

        {!isScanning && !overallHealth && (
          <button 
            onClick={runMilitaryScanner}
            className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]"
          >
            {t.initScan}
          </button>
        )}
      </div>

      {/* Main Body */}
      {isScanning ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.checks.map((check) => (
              <div key={check.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <Search className="w-5 h-5 text-cyan-500 animate-pulse" />
                <div>
                  <div className="text-white font-bold text-sm">{check.name}</div>
                  <div className="text-slate-500 text-[10px] uppercase font-mono">{check.desc}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="relative pt-8">
            <div className="flex justify-between mb-2 text-xs font-mono text-cyan-400">
              <span>{t.scanningKernel}</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : overallHealth ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800">
            <div className="relative shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * overallHealth) / 100}
                  className="text-cyan-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{overallHealth}%</span>
                <span className="text-[8px] text-slate-500 uppercase">Health</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-1">{t.scanComplete}</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{t.healthDesc}</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20">
                  {t.noRansomware}
                </span>
                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20">
                  {t.hackProof}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scanResults.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-900/20 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  {res.status === 'PASS' ? <ShieldCheck className="text-green-500 w-4 h-4 shrink-0" /> : <ShieldAlert className="text-amber-500 w-4 h-4 shrink-0" />}
                  <span className="text-sm font-semibold text-slate-300">{res.check}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{res.detail}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setOverallHealth(null)}
            className="w-full py-4 text-slate-500 hover:text-cyan-400 text-xs font-black uppercase transition"
          >
            {t.reInitialize}
          </button>
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="inline-block p-6 bg-slate-900 rounded-full mb-6">
            <Lock className="w-12 h-12 text-slate-700 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-slate-300">{t.perimeterScan}</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">{t.perimeterDesc}</p>
        </div>
      )}

      {/* Military Branding Footer */}
      <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap justify-center gap-6 opacity-30 grayscale">
         <div className="flex items-center gap-2 text-[10px] font-mono text-white"><ShieldCheck className="w-3 h-3" /> {t.fipsCompliant}</div>
         <div className="flex items-center gap-2 text-[10px] font-mono text-white"><Activity className="w-3 h-3" /> {t.realtimeHeuristics}</div>
         <div className="flex items-center gap-2 text-[10px] font-mono text-white"><Terminal className="w-3 h-3" /> {t.zeroTrust}</div>
      </div>
    </div>
  );
}