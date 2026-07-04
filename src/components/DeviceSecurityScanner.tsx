'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Cpu, Lock, Activity, Wifi, Terminal, Globe, Info } from 'lucide-react';
import BackToHome from './BackToHome';
import { runRealChecks, SCAN_PHASES, delay, type ScanResult } from '@/lib/security/deviceChecks';
import { useLanguage } from '@/lib/useLanguage';

export default function DeviceSecurityScanner({ embedded = false }: { lang?: 'en' | 'hi'; embedded?: boolean }) {
  const { lang: currentLang, setLang: setCurrentLang } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [overallHealth, setOverallHealth] = useState<number | null>(null);

  const L = currentLang;

  const runScanner = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);
    setOverallHealth(null);

    const phases = SCAN_PHASES[L];
    const stepSize = 100 / phases.length;

    for (let i = 0; i < phases.length; i++) {
      setCurrentPhase(phases[i]);
      setScanProgress(Math.round((i + 1) * stepSize));
      await delay(420);
    }

    const { results, health } = await runRealChecks(L);
    setScanResults(results);
    setOverallHealth(health);
    setIsScanning(false);
    setCurrentPhase('');
  };

  const passCount = scanResults.filter(r => r.status === 'PASS').length;
  const failCount = scanResults.filter(r => r.status === 'FAIL').length;
  const warnCount = scanResults.filter(r => r.status === 'WARN').length;

  const healthColor = overallHealth === null ? 'text-slate-400'
    : overallHealth >= 80 ? 'text-cyan-400'
    : overallHealth >= 55 ? 'text-amber-400'
    : 'text-red-400';

  const healthLabel = overallHealth === null ? ''
    : L === 'en'
      ? overallHealth >= 80 ? 'Hardened' : overallHealth >= 55 ? 'Moderate Risk' : 'At Risk'
      : overallHealth >= 80 ? 'सुरक्षित' : overallHealth >= 55 ? 'मध्यम जोखिम' : 'जोखिम में';

  const statusIcon = (status: ScanResult['status']) => {
    if (status === 'PASS') return <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (status === 'WARN') return <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />;
    if (status === 'FAIL') return <ShieldX className="w-4 h-4 text-red-400 shrink-0" />;
    return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  const statusColor = (s: ScanResult['status']) =>
    s === 'PASS' ? 'border-emerald-500/20 bg-emerald-950/10' :
    s === 'WARN' ? 'border-amber-500/20 bg-amber-950/10' :
    s === 'FAIL' ? 'border-red-500/30 bg-red-950/20' :
    'border-slate-700 bg-slate-900/20';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-black/40 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-md">
      {!embedded && <BackToHome />}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Cpu className={`w-8 h-8 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                {L === 'en' ? 'QUANTUM SCANNER v5.0' : 'क्वांटम स्कैनर v5.0'}
              </h1>
              <button
                onClick={() => setCurrentLang(currentLang === 'en' ? 'hi' : 'en')}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 flex items-center gap-1 transition"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                {L === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">
              {isScanning
                ? (L === 'en' ? 'Live Security Analysis Running' : 'लाइव सुरक्षा विश्लेषण चल रहा है')
                : overallHealth !== null
                  ? (L === 'en' ? 'Scan Complete' : 'स्कैन पूरा हुआ')
                  : (L === 'en' ? 'System Ready' : 'सिस्टम तैयार है')}
            </p>
          </div>
        </div>

        {!isScanning && !overallHealth && (
          <button
            onClick={runScanner}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:scale-105"
          >
            {L === 'en' ? 'INITIALIZE REAL SCAN' : 'वास्तविक स्कैन शुरू करें'}
          </button>
        )}
      </div>

      {/* Scanning state */}
      {isScanning && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between text-xs font-mono text-cyan-400 mb-2">
            <span className="animate-pulse">{currentPhase}</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-600 font-mono">
            {L === 'en' ? '8 real browser security APIs being queried...' : '8 वास्तविक ब्राउज़र सुरक्षा API क्वेरी हो रही हैं...'}
          </p>
        </div>
      )}

      {/* Results state */}
      {overallHealth !== null && !isScanning && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          {/* Score ring */}
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800">
            <div className="relative shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * overallHealth) / 100}
                  className={overallHealth >= 80 ? 'text-cyan-500' : overallHealth >= 55 ? 'text-amber-500' : 'text-red-500'}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${healthColor}`}>{overallHealth}%</span>
                <span className="text-[8px] text-slate-500 uppercase">Health</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className={`text-xl font-black mb-1 ${healthColor}`}>{healthLabel}</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {L === 'en'
                  ? `${passCount} checks passed, ${warnCount} warnings, ${failCount} failed. Results reflect your actual browser and device state.`
                  : `${passCount} जांचें पास, ${warnCount} चेतावनियां, ${failCount} विफल। परिणाम आपकी वास्तविक डिवाइस स्थिति दर्शाते हैं।`}
              </p>
              <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                {passCount > 0 && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20">{passCount} PASSED</span>}
                {warnCount > 0 && <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20">{warnCount} WARNINGS</span>}
                {failCount > 0 && <span className="bg-red-500/10 text-red-400 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20">{failCount} FAILED</span>}
              </div>
            </div>
          </div>

          {/* Individual results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanResults.map((res, i) => (
              <div key={i} className={`p-4 rounded-xl border ${statusColor(res.status)}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {statusIcon(res.status)}
                  <span className="text-sm font-bold text-white">{L === 'en' ? res.check : res.checkHi}</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-500">{res.score}pts</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{L === 'en' ? res.detail : res.detailHi}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setOverallHealth(null); setScanResults([]); }}
              className="flex-1 py-3.5 text-slate-500 hover:text-cyan-400 text-xs font-black uppercase transition border border-slate-800 rounded-xl hover:border-cyan-500/30"
            >
              {L === 'en' ? '← Re-scan Device' : '← डिवाइस पुनः स्कैन करें'}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-700 font-mono">
            {L === 'en'
              ? 'Results based on 8 live browser security API reads — scores vary per device and browser.'
              : 'परिणाम 8 लाइव ब्राउज़र सुरक्षा API रीड पर आधारित हैं — स्कोर डिवाइस और ब्राउज़र के अनुसार भिन्न होते हैं।'}
          </p>
        </div>
      )}

      {/* Idle state */}
      {!isScanning && overallHealth === null && (
        <div className="py-20 text-center">
          <div className="inline-block p-6 bg-slate-900 rounded-full mb-6">
            <Lock className="w-12 h-12 text-slate-700 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-slate-300">
            {L === 'en' ? 'Real-Time Browser Security Audit' : 'रियल-टाइम ब्राउज़र सुरक्षा ऑडिट'}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
            {L === 'en'
              ? 'Checks 8 real browser security signals: HTTPS, browser version, network type, device memory, permissions, storage, WebRTC leak risk, and JS environment integrity.'
              : '8 वास्तविक ब्राउज़र सुरक्षा संकेतों की जांच: HTTPS, ब्राउज़र संस्करण, नेटवर्क, मेमोरी, अनुमतियां, स्टोरेज, WebRTC जोखिम, और JS अखंडता।'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap justify-center gap-6 opacity-40">
        <div className="flex items-center gap-2 text-[10px] font-mono text-white"><ShieldCheck className="w-3 h-3" /> {L === 'en' ? '8 Live API Checks' : '8 लाइव API जांचें'}</div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white"><Activity className="w-3 h-3" /> {L === 'en' ? 'Real Results Per Device' : 'प्रत्येक डिवाइस पर वास्तविक परिणाम'}</div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white"><Terminal className="w-3 h-3" /> {L === 'en' ? '100% On-Device' : '100% ऑन-डिवाइस'}</div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white"><Wifi className="w-3 h-3" /> {L === 'en' ? 'No Data Sent' : 'कोई डेटा नहीं भेजा'}</div>
      </div>
    </div>
  );
}
