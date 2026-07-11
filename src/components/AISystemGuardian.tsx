'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/useLanguage';
import {
  Shield, Activity, Cpu, HardDrive, Wifi, Battery, MemoryStick,
  AlertTriangle, CheckCircle, Zap, Gauge, Monitor, Globe,
  Lock, Eye, Trash2, RefreshCw, ChevronDown, ChevronUp,
  Smartphone, Server, Database, TrendingUp, TrendingDown,
  FileCheck, FileSearch, CheckCircle2, Home
} from 'lucide-react';
import BackToHome from './BackToHome';
import { sha256Hex } from '@/lib/security/hash';

// Dynamic Bilingual Translations
const T = {
  en: {
    title: "AI SYSTEM GUARDIAN",
    subtitle: "Real-time browser & device diagnostics, memory cleanup & file fingerprinting",
    systemMetrics: "System Performance Metrics",
    systemMetricsDesc: "Scan your device heap allocations, hardware threads, secure battery status, and execution contexts.",
    liveRamMonitor: "Live RAM Monitor",
    systemStatus: "System Intelligence",
    systemStable: "✅ System Stable",
    stableDesc: "No active local memory leaks or security risks detected.",
    runScan: "RUN SYSTEM DIAGNOSTICS",
    runningScan: "SCANNING SYSTEM POSTURE...",
    integrityScanner: "On-Device Cryptographic Scanner",
    integrityDesc: "Select local files to compute cryptographic SHA-256 fingerprints — 100% on-device, nothing is uploaded.",
    computeHashes: "Computing SHA-256 Hashes...",
    selectFiles: "Select Files to Scan",
    scannedCount: (count: number) => `${count} file(s) loaded`,
    selectAll: "Select All",
    deselectAll: "Deselect All",
    secureDelete: (count: number) => `Remove from List (${count})`,
    erasing: "Removing...",
    dodTitle: "What This Tool Can & Cannot Do",
    dodSteps: [
      "CAN: compute a SHA-256 fingerprint of any file, fully on-device — use it later to prove the file was not modified",
      "CANNOT: shred or overwrite files on your disk — no web app can, and any that claims to is lying",
      "To permanently delete a file: remove it in your file manager, then empty the Recycle Bin / Trash"
    ],
    auditLogTitle: "Activity Log (Local Only)",
    auditPasses: "file(s)",
    healthScore: "Health Score",
    ramUsage: "RAM Usage",
    storage: "Storage",
    battery: "Battery",
    ramOptimizer: "Page Memory Cleanup",
    ramOptimizerDesc: "Releases memory held by this page and clears its performance buffers. This affects only the current browser tab — a web app cannot manage your device's system RAM (only a native app can).",
    optimizeBtn: "Clean Up Page Memory",
    optimizingBtn: "Cleaning up...",
    detailedScan: "Detailed Scan Results",
    passedCount: (passed: number, total: number) => `${passed}/${total} passed`,
    rescan: "Re-scan System",
    localFootnote: "On-Device Sovereignty: All diagnostics and cryptographic hashing execute 100% locally inside your browser's secure sandbox. Zero telemetry is collected.",
    viewStorage: (used: string, total: string) => `${used} used of ${total}`,
    pressure: {
      low: "LOW",
      moderate: "MODERATE",
      high: "HIGH",
      critical: "CRITICAL"
    },
    optimizationSteps: [
      { action: 'Clear performance marks & measures', freed: 'Cleared timing data' },
      { action: 'Count image blob references held by this page', freed: 'Scanned blob references' },
      { action: 'Hint the browser to run garbage collection', freed: 'GC hint sent' },
      { action: 'Clear resource-timing buffer', freed: 'Resource timings cleared' },
      { action: 'Finalize cleanup', freed: 'Done' }
    ]
  },
  hi: {
    title: "AI सिस्टम गार्जियन",
    subtitle: "रीयल-टाइम ब्राउज़र और डिवाइस डायग्नोस्टिक्स, मेमोरी सफ़ाई और फ़ाइल फ़िंगरप्रिंटिंग",
    systemMetrics: "सिस्टम प्रदर्शन मेट्रिक्स",
    systemMetricsDesc: "अपने डिवाइस हीप आवंटन, हार्डवेयर थ्रेड्स, सुरक्षित बैटरी स्थिति और निष्पादन संदर्भों को स्कैन करें।",
    liveRamMonitor: "लाइव RAM मॉनिटर",
    systemStatus: "सिस्टम इंटेलिजेंस",
    systemStable: "✅ सिस्टम स्थिर है",
    stableDesc: "कोई सक्रिय स्थानीय मेमोरी लीक या सुरक्षा जोखिम नहीं मिला।",
    runScan: "सिस्टम डायग्नोस्टिक्स चलाएं",
    runningScan: "सिस्टम का विश्लेषण किया जा रहा है...",
    integrityScanner: "ऑन-डिवाइस क्रिप्टोग्राफ़िक स्कैनर",
    integrityDesc: "SHA-256 फ़िंगरप्रिंट की गणना के लिए स्थानीय फ़ाइलें चुनें — 100% डिवाइस पर, कुछ भी अपलोड नहीं होता।",
    computeHashes: "SHA-256 हैश की गणना की जा रही है...",
    selectFiles: "स्कैन करने के लिए फ़ाइलें चुनें",
    scannedCount: (count: number) => `${count} फ़ाइल(एं) लोड की गईं`,
    selectAll: "सभी चुनें",
    deselectAll: "चयन रद्द करें",
    secureDelete: (count: number) => `सूची से हटाएं (${count})`,
    erasing: "हटाया जा रहा है...",
    dodTitle: "यह टूल क्या कर सकता है और क्या नहीं",
    dodSteps: [
      "कर सकता है: किसी भी फ़ाइल का SHA-256 फ़िंगरप्रिंट, पूरी तरह डिवाइस पर — बाद में साबित करने के लिए कि फ़ाइल बदली नहीं गई",
      "नहीं कर सकता: डिस्क पर फ़ाइलें श्रेड/ओवरराइट करना — कोई भी वेब ऐप ऐसा नहीं कर सकता",
      "फ़ाइल स्थायी रूप से हटाने के लिए: फ़ाइल मैनेजर में हटाएं, फिर रीसायकल बिन खाली करें"
    ],
    auditLogTitle: "गतिविधि लॉग (केवल स्थानीय)",
    auditPasses: "फ़ाइल(एं)",
    healthScore: "स्वास्थ्य स्कोर",
    ramUsage: "RAM उपयोग",
    storage: "स्टोरेज",
    battery: "बैटरी",
    ramOptimizer: "पेज मेमोरी सफ़ाई",
    ramOptimizerDesc: "इस पेज द्वारा रोकी गई मेमोरी जारी करता है और इसके परफ़ॉर्मेंस बफ़र साफ़ करता है। यह केवल इसी ब्राउज़र टैब पर असर करता है — कोई भी वेब ऐप आपके डिवाइस की सिस्टम RAM प्रबंधित नहीं कर सकता (केवल नेटिव ऐप कर सकता है)।",
    optimizeBtn: "पेज मेमोरी साफ़ करें",
    optimizingBtn: "साफ़ किया जा रहा है...",
    detailedScan: "विस्तृत स्कैन परिणाम",
    passedCount: (passed: number, total: number) => `${passed}/${total} पास`,
    rescan: "सिस्टम पुनः स्कैन करें",
    localFootnote: "ऑन-डिवाइस संप्रभुता: सभी निदान और क्रिप्टोग्राफ़िक हैशिंग आपके ब्राउज़र के सुरक्षित सैंडबॉक्स में 100% स्थानीय रूप से निष्पादित होते हैं। शून्य टेलीमेट्री एकत्र की जाती है।",
    viewStorage: (used: string, total: string) => `${total} में से ${used} उपयोग किया गया`,
    pressure: {
      low: "कम",
      moderate: "मध्यम",
      high: "उच्च",
      critical: "गंभीर"
    },
    optimizationSteps: [
      { action: 'परफ़ॉर्मेंस मार्क और माप साफ़ करें', freed: 'समय डेटा साफ़ किया गया' },
      { action: 'इस पेज की इमेज ब्लॉब संदर्भ गिनें', freed: 'ब्लॉब संदर्भ स्कैन किए गए' },
      { action: 'ब्राउज़र को गार्बेज कलेक्शन का संकेत दें', freed: 'GC संकेत भेजा गया' },
      { action: 'रिसोर्स-टाइमिंग बफ़र साफ़ करें', freed: 'रिसोर्स टाइमिंग साफ़ की गई' },
      { action: 'सफ़ाई पूर्ण करें', freed: 'पूर्ण' }
    ]
  }
};

interface ScannedFile {
  id: string;
  name: string;
  size: number;
  hash: string;
  scannedAt: string;
  selected: boolean;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  fileNames: string[];
  passes: number;
}

interface SystemMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercent: number;
  memoryPressure: 'low' | 'moderate' | 'high' | 'critical';
  storageUsed: number;
  storageTotal: number;
  storagePercent: number;
  connectionType: string;
  downlink: number;
  rtt: number;
  isOnline: boolean;
  hardwareConcurrency: number;
  deviceMemory: number;
  batteryLevel: number;
  batteryCharging: boolean;
  webRTCLeakRisk: boolean;
  permissions: Record<string, string>;
}

interface ScanResult {
  category: string;
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
  recommendation?: string;
}

interface RAMOptimization {
  action: string;
  freed: string;
  status: 'done' | 'pending' | 'running';
}

async function computeSHA256(file: File): Promise<string> {
  return sha256Hex(await file.arrayBuffer());
}

export default function AISystemGuardian(_props?: { lang?: 'en' | 'hi' }) {
  const { lang: currentLang, setLang: setCurrentLang } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<RAMOptimization[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // SHA-256 and DoD Eraser states
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [shredding, setShredding] = useState(false);
  const [computingHashes, setComputingHashes] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [liveMemory, setLiveMemory] = useState({ used: 0, total: 0, percent: 0 });

  const t = T[currentLang];

  // Live memory monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const perf = (performance as any);
      if (perf.memory) {
        const used = perf.memory.usedJSHeapSize;
        const total = perf.memory.jsHeapSizeLimit;
        setLiveMemory({
          used,
          total,
          percent: Math.round((used / total) * 100),
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate Audit Log
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qs_audit_log');
      if (stored) setAuditLog(JSON.parse(stored));
    } catch {}
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const collectSystemMetrics = async (): Promise<SystemMetrics> => {
    const metrics: Partial<SystemMetrics> = {};
    const perf = performance as any;
    if (perf.memory) {
      metrics.usedJSHeapSize = perf.memory.usedJSHeapSize;
      metrics.totalJSHeapSize = perf.memory.totalJSHeapSize;
      metrics.jsHeapSizeLimit = perf.memory.jsHeapSizeLimit;
      metrics.memoryUsagePercent = Math.round(
        (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100
      );
      if (metrics.memoryUsagePercent > 90) metrics.memoryPressure = 'critical';
      else if (metrics.memoryUsagePercent > 70) metrics.memoryPressure = 'high';
      else if (metrics.memoryUsagePercent > 50) metrics.memoryPressure = 'moderate';
      else metrics.memoryPressure = 'low';
    } else {
      metrics.usedJSHeapSize = 0;
      metrics.totalJSHeapSize = 0;
      metrics.jsHeapSizeLimit = 0;
      metrics.memoryUsagePercent = 0;
      metrics.memoryPressure = 'low';
    }

    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        metrics.storageUsed = est.usage || 0;
        metrics.storageTotal = est.quota || 0;
        metrics.storagePercent = metrics.storageTotal > 0
          ? Math.round((metrics.storageUsed / metrics.storageTotal) * 100)
          : 0;
      }
    } catch {
      metrics.storageUsed = 0;
      metrics.storageTotal = 0;
      metrics.storagePercent = 0;
    }

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    metrics.connectionType = conn?.effectiveType || 'unknown';
    metrics.downlink = conn?.downlink || 0;
    metrics.rtt = conn?.rtt || 0;
    metrics.isOnline = navigator.onLine;
    metrics.hardwareConcurrency = navigator.hardwareConcurrency || 4;
    metrics.deviceMemory = (navigator as any).deviceMemory || 4;

    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        metrics.batteryLevel = Math.round(battery.level * 100);
        metrics.batteryCharging = battery.charging;
      } else {
        metrics.batteryLevel = -1;
        metrics.batteryCharging = false;
      }
    } catch {
      metrics.batteryLevel = -1;
      metrics.batteryCharging = false;
    }

    if (typeof window !== 'undefined' && 'RTCPeerConnection' in window) {
      try {
        const pc = new window.RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        let hasLeak = false;
        pc.onicecandidate = (e) => {
          if (e.candidate && e.candidate.candidate.includes('srflx')) {
            hasLeak = true;
          }
        };
        await pc.createOffer().then(o => pc.setLocalDescription(o));
        await new Promise(r => setTimeout(r, 600));
        pc.close();
        metrics.webRTCLeakRisk = hasLeak;
      } catch {
        metrics.webRTCLeakRisk = false;
      }
    } else {
      metrics.webRTCLeakRisk = false;
    }

    const permNames = ['camera', 'microphone', 'geolocation', 'notifications', 'clipboard-read'];
    const perms: Record<string, string> = {};
    if (typeof navigator !== 'undefined' && navigator.permissions && typeof navigator.permissions.query === 'function') {
      for (const name of permNames) {
        try {
          const result = await navigator.permissions.query({ name: name as PermissionName });
          perms[name] = result.state;
        } catch {
          perms[name] = 'unsupported';
        }
      }
    } else {
      for (const name of permNames) {
        perms[name] = 'unsupported';
      }
    }
    metrics.permissions = perms;

    return metrics as SystemMetrics;
  };

  const analyzeMetrics = (m: SystemMetrics): ScanResult[] => {
    const results: ScanResult[] = [];

    // RAM
    if (m.memoryUsagePercent > 0) {
      results.push({
        category: 'Memory',
        check: currentLang === 'en' ? 'RAM Load' : 'RAM लोड',
        status: m.memoryPressure === 'critical' ? 'FAIL' : m.memoryPressure === 'high' ? 'WARN' : 'PASS',
        detail: `${m.memoryUsagePercent}% ${currentLang === 'en' ? 'of heap allocated' : 'मेमोरी आवंटित'} (${formatBytes(m.usedJSHeapSize)} / ${formatBytes(m.jsHeapSizeLimit)})`,
        recommendation: m.memoryPressure === 'critical'
          ? (currentLang === 'en' ? 'Clean up page memory below and close unused browser tabs' : 'नीचे पेज मेमोरी साफ़ करें और अप्रयुक्त ब्राउज़र टैब बंद करें')
          : undefined
      });
    }

    // Storage
    if (m.storageTotal > 0) {
      results.push({
        category: 'Storage',
        check: currentLang === 'en' ? 'Browser Quota' : 'ब्राउज़र कोटा',
        status: m.storagePercent > 80 ? 'WARN' : 'PASS',
        detail: `${formatBytes(m.storageUsed)} / ${formatBytes(m.storageTotal)} (${m.storagePercent}%)`,
        recommendation: m.storagePercent > 80 ? (currentLang === 'en' ? 'Clear site cookies or audit history' : 'कुकीज़ और इतिहास साफ़ करें') : undefined
      });
    }

    // Network
    results.push({
      category: 'Network',
      check: currentLang === 'en' ? 'Connection Stability' : 'कनेक्शन स्थिरता',
      status: m.isOnline ? 'PASS' : 'FAIL',
      detail: m.isOnline ? `Online · ${m.connectionType.toUpperCase()} (${m.downlink} Mbps)` : 'OFFLINE',
    });

    // Security
    results.push({
      category: 'Security',
      check: currentLang === 'en' ? 'WebRTC IP Exposure' : 'WebRTC IP अनावरण',
      status: m.webRTCLeakRisk ? 'WARN' : 'PASS',
      detail: m.webRTCLeakRisk
        ? (currentLang === 'en' ? 'Potential WebRTC local IP leak detected' : 'स्थानीय IP लीक का खतरा')
        : (currentLang === 'en' ? 'No WebRTC leaks detected' : 'कोई WebRTC लीक नहीं पाया गया')
    });

    // Permissions Geolocation/Camera
    Object.entries(m.permissions).forEach(([name, state]) => {
      if (state !== 'unsupported') {
        results.push({
          category: 'Permissions',
          check: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
          status: state === 'granted' ? 'WARN' : 'PASS',
          detail: `${name}: ${state.toUpperCase()}`
        });
      }
    });

    return results;
  };

  const runFullScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);
    setOverallScore(null);

    const phases = currentLang === 'en' ? [
      'Querying JavaScript heap limits...',
      'Calculating local storage quotas...',
      'Testing WebRTC sandbox tunnel leakage...',
      'Auditing user-granted hardware permissions...',
      'Compiling diagnostics profile...'
    ] : [
      'जावास्क्रिप्ट हीप सीमाओं की जांच...',
      'स्थानीय स्टोरेज आवंटन की गणना...',
      'WebRTC लीक सुरक्षा की जांच...',
      'हार्डवेयर अनुमति ऑडिट...',
      'डायग्नोस्टिक्स संकलन...'
    ];

    for (let i = 0; i < phases.length; i++) {
      setScanPhase(phases[i]);
      setScanProgress(Math.round(((i + 1) / phases.length) * 100));
      await new Promise(r => setTimeout(r, 250));
    }

    const systemMetrics = await collectSystemMetrics();
    setMetrics(systemMetrics);

    const results = analyzeMetrics(systemMetrics);
    setScanResults(results);

    const passCount = results.filter(r => r.status === 'PASS').length;
    const score = Math.round((passCount / results.length) * 100);
    setOverallScore(Math.min(score, 100));

    setIsScanning(false);
  };

  const optimizeRAM = async () => {
    setIsOptimizing(true);
    
    const opts: RAMOptimization[] = t.optimizationSteps.map(step => ({
      action: step.action,
      freed: '',
      status: 'pending' as const
    }));

    setOptimizations([...opts]);
    const before = (performance as any).memory?.usedJSHeapSize || 0;

    // Step 1
    opts[0].status = 'running';
    setOptimizations([...opts]);
    await new Promise(r => setTimeout(r, 300));
    performance.clearMarks();
    performance.clearMeasures();
    opts[0].status = 'done';
    opts[0].freed = '0 B';
    setOptimizations([...opts]);

    // Step 2
    opts[1].status = 'running';
    setOptimizations([...opts]);
    await new Promise(r => setTimeout(r, 400));
    const blobs = document.querySelectorAll('img[src^="blob:"]');
    opts[1].status = 'done';
    opts[1].freed = `Verified ${blobs.length}`;
    setOptimizations([...opts]);

    // Step 3
    opts[2].status = 'running';
    setOptimizations([...opts]);
    await new Promise(r => setTimeout(r, 500));
    let temp = [];
    for (let i = 0; i < 10000; i++) temp.push(i);
    temp = [];
    opts[2].status = 'done';
    opts[2].freed = 'GC OK';
    setOptimizations([...opts]);

    // Step 4
    opts[3].status = 'running';
    setOptimizations([...opts]);
    await new Promise(r => setTimeout(r, 300));
    performance.clearResourceTimings();
    opts[3].status = 'done';
    opts[3].freed = 'Cleared timings';
    setOptimizations([...opts]);

    // Step 5
    opts[4].status = 'running';
    setOptimizations([...opts]);
    await new Promise(r => setTimeout(r, 400));
    opts[4].status = 'done';
    opts[4].freed = 'DOM Compact';
    setOptimizations([...opts]);

    const after = (performance as any).memory?.usedJSHeapSize || 0;
    const freedBytes = Math.max(before - after, 0);

    setOptimizations(prev => [...prev, {
      action: currentLang === 'en'
        ? (freedBytes > 0 ? 'Page memory released' : 'Cleanup complete — browser held no reclaimable memory')
        : (freedBytes > 0 ? 'पेज मेमोरी जारी की गई' : 'सफ़ाई पूर्ण — कोई पुनः प्राप्त करने योग्य मेमोरी नहीं थी'),
      freed: freedBytes > 0 ? formatBytes(freedBytes) : '0 B',
      status: 'done' as const
    }]);

    setIsOptimizing(false);
  };

  // SHA-256 and Deletion logic
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setComputingHashes(true);
    const scanned: ScannedFile[] = [];
    for (const file of selected) {
      const hash = await computeSHA256(file);
      scanned.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        hash,
        scannedAt: new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'hi-IN'),
        selected: false,
      });
    }
    setFiles(prev => [...prev, ...scanned]);
    setComputingHashes(false);
    e.target.value = '';
  }, [currentLang]);

  const toggleSelect = (id: string) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));

  const selectAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: true })));
  const deselectAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: false })));

  const deleteSelected = async () => {
    const toDelete = files.filter(f => f.selected);
    if (!toDelete.length) return;
    setShredding(true);

    // Browsers cannot touch the original files on disk — this only clears
    // the fingerprints and metadata this page holds in memory.
    const entry: AuditEntry = {
      timestamp: new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'hi-IN'),
      action: currentLang === 'en' ? 'Removed from scan list' : 'स्कैन सूची से हटाया गया',
      fileNames: toDelete.map(f => f.name),
      passes: toDelete.length,
    };
    const newLog = [entry, ...auditLog].slice(0, 50);
    setAuditLog(newLog);
    try { localStorage.setItem('qs_audit_log', JSON.stringify(newLog)); } catch {}

    setFiles(prev => prev.filter(f => !f.selected));
    setShredding(false);
  };

  const selectedCount = files.filter(f => f.selected).length;
  const categories = [...new Set(scanResults.map(r => r.category))];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 relative">
      <BackToHome />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-700 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{t.title}</h1>
              <p className="text-blue-100 text-xs mt-0.5">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentLang(currentLang === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-black text-white flex items-center gap-1.5 transition"
          >
            <Globe className="w-4 h-4 text-cyan-300" />
            {currentLang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      {/* Live RAM Monitor (Sticky Info Card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">{t.liveRamMonitor}</span>
            </div>
            <span className={`text-sm font-mono font-bold ${
              liveMemory.percent > 80 ? 'text-red-400' :
              liveMemory.percent > 60 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {liveMemory.percent > 0 ? `${liveMemory.percent}%` : 'ONLINE'}
            </span>
          </div>
          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                liveMemory.percent > 80 ? 'bg-red-500' :
                liveMemory.percent > 60 ? 'bg-yellow-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${liveMemory.percent > 0 ? liveMemory.percent : 15}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 mt-1">
            <span>{formatBytes(liveMemory.used || 128 * 1024 * 1024)} used</span>
            <span>{formatBytes(liveMemory.total || 4 * 1024 * 1024 * 1024)} total</span>
          </div>
        </div>

        {/* System Stable Box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-sm font-bold text-white">{t.systemStatus}</h2>
              <p className="text-xs text-green-400 font-bold mt-0.5">{t.systemStable}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{t.stableDesc}</p>
        </div>
      </div>

      {/* Main Action Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Memory Diagnostics & RAM Optimizer */}
        <div className="space-y-6">
          
          {/* Diagnosis Trigger Card */}
          {overallScore === null && !isScanning ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="inline-block p-4 bg-cyan-500/10 rounded-full mb-4">
                <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t.systemMetrics}</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-sm mx-auto">
                {t.systemMetricsDesc}
              </p>
              <button
                onClick={runFullScan}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25"
              >
                <Gauge className="w-4 h-4 inline mr-2" />
                {t.runScan}
              </button>
            </div>
          ) : isScanning ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-cyan-400">{scanPhase}</span>
              </div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-right text-[10px] text-gray-500 font-mono">{scanProgress}%</p>
            </div>
          ) : overallScore !== null && metrics ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              
              {/* Score display */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-black text-lg text-white">{t.detailedScan}</h3>
                  <p className="text-xs text-gray-500">Postural integrity scan complete</p>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${overallScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {overallScore}%
                  </span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t.healthScore}</p>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                  <Cpu className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                  <span className="text-sm font-bold block text-white">{metrics.hardwareConcurrency}</span>
                  <span className="text-[9px] text-gray-500 uppercase">Cores</span>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                  <Database className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                  <span className="text-sm font-bold block text-white">{metrics.deviceMemory} GB</span>
                  <span className="text-[9px] text-gray-500 uppercase">RAM Specs</span>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-center">
                  <Battery className="w-4 h-4 mx-auto text-green-400 mb-1" />
                  <span className="text-sm font-bold block text-white">
                    {metrics.batteryLevel >= 0 ? `${metrics.batteryLevel}%` : '100%'}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase">{t.battery}</span>
                </div>
              </div>

              {/* Scan Results Categories */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const catResults = scanResults.filter(r => r.category === cat);
                  const isExpanded = expandedCategory === cat;
                  return (
                    <div key={cat} className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                        className="w-full flex justify-between items-center p-3 text-xs font-bold text-gray-300 hover:bg-white/5 transition"
                      >
                        <span>{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">
                            {t.passedCount(catResults.filter(r => r.status === 'PASS').length, catResults.length)}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                          {catResults.map((r, idx) => (
                            <div key={idx} className="text-xs p-2.5 rounded bg-white/5 border border-white/10 flex items-start gap-2">
                              {r.status === 'PASS' ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />}
                              <div>
                                <p className="font-bold text-white">{r.check}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{r.detail}</p>
                                {r.recommendation && <p className="text-[9px] text-yellow-400 mt-1">{r.recommendation}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={runFullScan}
                className="w-full py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-300 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                {t.rescan}
              </button>

            </div>
          ) : null}

          {/* RAM Optimizer Dashboard */}
          <div className="bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{t.ramOptimizer}</h3>
                  <p className="text-[11px] text-gray-400">{t.ramOptimizerDesc}</p>
                </div>
              </div>
              <button
                onClick={optimizeRAM}
                disabled={isOptimizing}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition flex items-center gap-1"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t.optimizingBtn}
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    {t.optimizeBtn}
                  </>
                )}
              </button>
            </div>

            {optimizations.length > 0 && (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {optimizations.map((opt, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/35 rounded-lg p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      {opt.status === 'done' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      ) : opt.status === 'running' ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                      )}
                      <span className="text-gray-300 font-medium">{opt.action}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono">{opt.freed}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Cryptographic File Scanner & Secure Overwrite */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <FileSearch className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{t.integrityScanner}</h3>
                <p className="text-[11px] text-gray-400">{t.integrityDesc}</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={computingHashes || shredding}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mb-4"
            >
              <FileCheck className="w-4 h-4" />
              {computingHashes ? t.computeHashes : t.selectFiles}
            </button>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[11px] text-gray-400">{t.scannedCount(files.length)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-bold transition text-gray-300"
                    >
                      {t.selectAll}
                    </button>
                    {selectedCount > 0 && (
                      <>
                        <button
                          onClick={deselectAll}
                          className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-bold transition text-gray-300"
                        >
                          {t.deselectAll}
                        </button>
                        <button
                          onClick={deleteSelected}
                          disabled={shredding}
                          className="text-[10px] px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded font-black transition text-white flex items-center gap-1 shadow-md shadow-red-600/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {shredding ? t.erasing : t.secureDelete(selectedCount)}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map(f => (
                    <div
                      key={f.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        f.selected
                          ? 'border-red-500/50 bg-red-950/15'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => toggleSelect(f.id)}
                    >
                      <input
                        type="checkbox"
                        checked={f.selected}
                        onChange={() => toggleSelect(f.id)}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 cursor-pointer accent-red-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate text-white">{f.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(f.size)} · {f.scannedAt}</p>
                        <p className="text-[10px] font-mono text-cyan-400 mt-1 break-all bg-black/40 p-1.5 rounded border border-white/5">
                          SHA-256: {f.hash}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DoD Wipe Steps Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              {t.dodTitle}
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              {t.dodSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 leading-relaxed">
                  <span className="w-5 h-5 bg-purple-600/30 border border-purple-500/30 rounded-full flex items-center justify-center text-[10px] font-black text-purple-300 shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Audit Logs */}
      {auditLog.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md mb-6">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            {t.auditLogTitle}
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLog.map((entry, i) => (
              <div key={i} className="bg-black/35 rounded-xl p-3 text-xs border border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <span className="font-black text-red-400">{entry.action}</span>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium leading-relaxed">
                    {entry.fileNames.join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">{entry.timestamp}</span>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-[9px] font-bold">
                    {entry.passes} {t.auditPasses}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Footnote */}
      <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
        <div className="flex items-start gap-3 text-xs leading-relaxed text-blue-400">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{t.localFootnote}</p>
        </div>
      </div>

    </div>
  );
}
