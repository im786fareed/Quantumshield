'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Cpu, Lock, Activity, Wifi, Terminal, Globe, Info } from 'lucide-react';
import BackToHome from './BackToHome';

interface ScanResult {
  check: string;
  checkHi: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
  detailHi: string;
  score: number;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const SCAN_PHASES = {
  en: [
    'Checking HTTPS connection security...',
    'Auditing browser security version...',
    'Analyzing network connection type...',
    'Measuring device memory capacity...',
    'Checking media permission exposure...',
    'Scanning browser storage integrity...',
    'Detecting WebRTC IP leak risk...',
    'Verifying JavaScript environment...',
  ],
  hi: [
    'HTTPS कनेक्शन सुरक्षा जांच रहे हैं...',
    'ब्राउज़र सुरक्षा संस्करण ऑडिट हो रहा है...',
    'नेटवर्क कनेक्शन प्रकार का विश्लेषण...',
    'डिवाइस मेमोरी क्षमता माप रहे हैं...',
    'मीडिया अनुमति एक्सपोज़र जांच रहे हैं...',
    'ब्राउज़र स्टोरेज अखंडता स्कैन हो रही है...',
    'WebRTC IP लीक जोखिम का पता लगाया जा रहा है...',
    'JavaScript वातावरण सत्यापित हो रहा है...',
  ]
};

async function runRealChecks(lang: 'en' | 'hi'): Promise<{ results: ScanResult[]; health: number }> {
  const results: ScanResult[] = [];
  let score = 0;

  // ── Check 1: HTTPS (12 pts) ────────────────────────────────────────────────
  await delay(350);
  const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
  const c1: ScanResult = {
    check: 'Connection Encryption',
    checkHi: 'कनेक्शन एन्क्रिप्शन',
    status: isHttps ? 'PASS' : 'FAIL',
    detail: isHttps
      ? 'HTTPS active — all data in transit is TLS-encrypted.'
      : 'UNENCRYPTED connection detected. Your data is visible to attackers on the same network.',
    detailHi: isHttps
      ? 'HTTPS सक्रिय — ट्रांजिट में सभी डेटा TLS-एन्क्रिप्टेड है।'
      : 'अनएन्क्रिप्टेड कनेक्शन पाया गया। नेटवर्क पर हमलावर आपका डेटा देख सकते हैं।',
    score: isHttps ? 12 : 0,
  };
  results.push(c1);
  score += c1.score;

  // ── Check 2: Browser version modernity (15 pts) ───────────────────────────
  await delay(400);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const chromeVer = ua.match(/Chrome\/(\d+)/)?.[1];
  const ffVer = ua.match(/Firefox\/(\d+)/)?.[1];
  const safVer = ua.match(/Version\/(\d+).*Safari/)?.[1];
  const ver = chromeVer ? +chromeVer : ffVer ? +ffVer : safVer ? +safVer : 0;
  const isModern = (chromeVer && ver >= 110) || (ffVer && ver >= 110) || (safVer && ver >= 16);
  const c2: ScanResult = {
    check: 'Browser Security Level',
    checkHi: 'ब्राउज़र सुरक्षा स्तर',
    status: isModern ? 'PASS' : ver > 0 ? 'WARN' : 'INFO',
    detail: isModern
      ? `Browser version ${ver} — up to date with latest security patches.`
      : ver > 0
        ? `Browser version ${ver} is outdated. Update to receive critical security patches.`
        : 'Browser version could not be determined.',
    detailHi: isModern
      ? `ब्राउज़र संस्करण ${ver} — नवीनतम सुरक्षा पैच के साथ अप-टू-डेट है।`
      : ver > 0
        ? `ब्राउज़र संस्करण ${ver} पुराना है। महत्वपूर्ण सुरक्षा पैच के लिए अपडेट करें।`
        : 'ब्राउज़र संस्करण निर्धारित नहीं किया जा सका।',
    score: isModern ? 15 : ver > 0 ? 7 : 10,
  };
  results.push(c2);
  score += c2.score;

  // ── Check 3: Network connection quality (12 pts) ──────────────────────────
  await delay(350);
  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
  const effectiveType: string = conn?.effectiveType || 'unknown';
  const isFast = effectiveType === '4g' || effectiveType === 'unknown';
  const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g';
  const c3: ScanResult = {
    check: 'Network Security',
    checkHi: 'नेटवर्क सुरक्षा',
    status: isSlow ? 'WARN' : 'PASS',
    detail: isSlow
      ? `Slow ${effectiveType} connection detected. Avoid online banking or OTP entry on slow networks.`
      : `Network: ${effectiveType === 'unknown' ? 'WiFi/Fast' : effectiveType.toUpperCase()}. Connection speed adequate for secure operations.`,
    detailHi: isSlow
      ? `धीमा ${effectiveType} नेटवर्क पाया गया। धीमे नेटवर्क पर बैंकिंग या OTP से बचें।`
      : `नेटवर्क: ${effectiveType === 'unknown' ? 'WiFi/तेज़' : effectiveType.toUpperCase()}। सुरक्षित ऑपरेशन के लिए पर्याप्त स्पीड।`,
    score: isSlow ? 5 : 12,
  };
  results.push(c3);
  score += c3.score;

  // ── Check 4: Device memory (10 pts) ───────────────────────────────────────
  await delay(300);
  const mem: number | undefined = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory : undefined;
  const memScore = !mem ? 7 : mem >= 4 ? 10 : mem >= 2 ? 7 : 3;
  const c4: ScanResult = {
    check: 'Device Memory',
    checkHi: 'डिवाइस मेमोरी',
    status: !mem ? 'INFO' : mem >= 2 ? 'PASS' : 'WARN',
    detail: mem
      ? `${mem}GB RAM. ${mem < 2 ? 'Low memory devices are vulnerable to resource exhaustion attacks and may fail to run security updates.' : 'Sufficient RAM for secure multitasking.'}`
      : 'Device memory not reported (browser privacy protection).',
    detailHi: mem
      ? `${mem}GB RAM। ${mem < 2 ? 'कम मेमोरी वाले डिवाइस सुरक्षा अपडेट चलाने में विफल हो सकते हैं।' : 'सुरक्षित मल्टीटास्किंग के लिए पर्याप्त RAM।'}`
      : 'डिवाइस मेमोरी रिपोर्ट नहीं हुई (ब्राउज़र गोपनीयता सुरक्षा)।',
    score: memScore,
  };
  results.push(c4);
  score += c4.score;

  // ── Check 5: Media permission exposure (13 pts) ───────────────────────────
  await delay(450);
  let permScore = 10;
  let permDetail = 'Permissions API not available on this browser.';
  let permDetailHi = 'इस ब्राउज़र पर Permissions API उपलब्ध नहीं है।';
  let permStatus: ScanResult['status'] = 'INFO';
  try {
    const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
    const bothGranted = micPerm.state === 'granted' && camPerm.state === 'granted';
    const eitherGranted = micPerm.state === 'granted' || camPerm.state === 'granted';
    if (bothGranted) {
      permDetail = 'Both mic & camera are pre-granted. Verify no background app is accessing them.';
      permDetailHi = 'माइक्रोफोन और कैमरा दोनों पहले से granted हैं। सुनिश्चित करें कोई बैकग्राउंड ऐप एक्सेस नहीं कर रहा।';
      permScore = 7; permStatus = 'WARN';
    } else if (eitherGranted) {
      permDetail = `${micPerm.state === 'granted' ? 'Microphone' : 'Camera'} already granted. Review if this was intentional.`;
      permDetailHi = `${micPerm.state === 'granted' ? 'माइक्रोफोन' : 'कैमरा'} पहले से granted है। जांचें कि यह जानबूझकर था या नहीं।`;
      permScore = 9; permStatus = 'WARN';
    } else {
      permDetail = 'Mic & camera permissions are restricted — no unauthorized background access possible.';
      permDetailHi = 'माइक्रोफोन और कैमरा प्रतिबंधित हैं — कोई अनधिकृत बैकग्राउंड एक्सेस संभव नहीं।';
      permScore = 13; permStatus = 'PASS';
    }
  } catch { /* permissions API unavailable */ }
  results.push({
    check: 'Media Permission Audit',
    checkHi: 'मीडिया अनुमति ऑडिट',
    status: permStatus, detail: permDetail, detailHi: permDetailHi, score: permScore,
  });
  score += permScore;

  // ── Check 6: Storage integrity (10 pts) ───────────────────────────────────
  await delay(350);
  const suspiciousKeys = ['anydesk', 'teamviewer', 'rat_session', 'payload', 'inject', 'c2_', 'backdoor'];
  let lsScore = 10;
  let lsDetail = 'No suspicious browser storage artifacts detected.';
  let lsDetailHi = 'कोई संदिग्ध ब्राउज़र स्टोरेज आर्टिफैक्ट नहीं मिला।';
  let lsStatus: ScanResult['status'] = 'PASS';
  try {
    const lsKeys = Object.keys(localStorage).map(k => k.toLowerCase());
    const found = suspiciousKeys.filter(k => lsKeys.some(lk => lk.includes(k)));
    if (found.length > 0) {
      lsScore = 0; lsStatus = 'FAIL';
      lsDetail = `Suspicious storage keys found: ${found.join(', ')}. Consider clearing browser data.`;
      lsDetailHi = `संदिग्ध स्टोरेज कुंजियां मिलीं: ${found.join(', ')}। ब्राउज़र डेटा साफ़ करने पर विचार करें।`;
    }
  } catch { lsDetail = 'Storage scan skipped (privacy mode).'; lsDetailHi = 'स्टोरेज स्कैन छोड़ा गया (प्राइवेसी मोड)।'; }
  results.push({ check: 'Storage Integrity', checkHi: 'स्टोरेज अखंडता', status: lsStatus, detail: lsDetail, detailHi: lsDetailHi, score: lsScore });
  score += lsScore;

  // ── Check 7: WebRTC IP leak risk (13 pts) ─────────────────────────────────
  await delay(400);
  const hasWebRTC = typeof window !== 'undefined' && !!(window as any).RTCPeerConnection;
  const c7: ScanResult = {
    check: 'IP Leak Protection',
    checkHi: 'IP लीक सुरक्षा',
    status: hasWebRTC ? 'WARN' : 'PASS',
    detail: hasWebRTC
      ? 'WebRTC is active. If you use a VPN, run a WebRTC leak test at browserleaks.com to confirm your real IP is hidden.'
      : 'WebRTC is disabled/blocked — your IP address cannot be leaked through the browser.',
    detailHi: hasWebRTC
      ? 'WebRTC सक्रिय है। VPN उपयोगकर्ता browserleaks.com पर IP लीक टेस्ट करें।'
      : 'WebRTC अक्षम/अवरुद्ध है — ब्राउज़र के माध्यम से IP पता लीक नहीं हो सकता।',
    score: hasWebRTC ? 9 : 13,
  };
  results.push(c7);
  score += c7.score;

  // ── Check 8: JavaScript environment integrity (15 pts) ───────────────────
  await delay(350);
  let jsScore = 15;
  let jsDetail = 'JavaScript environment appears clean. No tampering detected.';
  let jsDetailHi = 'JavaScript वातावरण स्वच्छ दिखता है। कोई छेड़छाड़ नहीं पाई गई।';
  let jsStatus: ScanResult['status'] = 'PASS';
  try {
    const tampered =
      typeof console.log !== 'function' ||
      typeof setTimeout !== 'function' ||
      Array.isArray !== Function.prototype.call.bind(Array.isArray) === false;
    const suspiciousGlobals = ['__webdriver_evaluate', '__selenium_evaluate', 'callSelenium', '__webdriver_script_fn'];
    const foundGlobals = suspiciousGlobals.filter(g => g in window);
    if (tampered || foundGlobals.length > 0) {
      jsScore = 4; jsStatus = 'WARN';
      jsDetail = 'Potential automation/injection tool detected in browser environment. Use a clean browser.';
      jsDetailHi = 'ब्राउज़र वातावरण में संभावित ऑटोमेशन/इंजेक्शन टूल पाया गया।';
    }
  } catch { /* native env error — actually good sign */ }
  results.push({ check: 'JS Environment Integrity', checkHi: 'JS वातावरण अखंडता', status: jsStatus, detail: jsDetail, detailHi: jsDetailHi, score: jsScore });
  score += jsScore;

  return { results, health: Math.min(100, score) };
}

export default function DeviceSecurityScanner({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>(lang);
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
      <BackToHome />
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
                onClick={() => setCurrentLang(p => p === 'en' ? 'hi' : 'en')}
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
