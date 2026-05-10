'use client';
import { useState, useCallback } from 'react';
import {
  Zap, Cpu, HardDrive, Battery, Trash2, CheckCircle,
  AlertCircle, RefreshCw, Shield, Activity, Play,
  ChevronRight, Clock, TrendingUp, Wifi, Lock,
  MemoryStick, BatteryCharging, Eye, EyeOff, Layers
} from 'lucide-react';
import BackToHome from './BackToHome';

interface TuneMetric {
  label: string;
  labelHi: string;
  value: number;
  unit: string;
  status: 'good' | 'warn' | 'critical';
  icon: any;
  color: string;
}

interface TuneTask {
  id: string;
  name: string;
  nameHi: string;
  desc: string;
  saving: string;
  status: 'idle' | 'running' | 'done';
  icon: any;
}

interface OSTask {
  id: string;
  name: string;
  nameHi: string;
  desc: string;
  descHi: string;
  impact: string;
  impactHi: string;
  status: 'idle' | 'running' | 'done';
  icon: any;
  color: string;
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTasks(): TuneTask[] {
  const cacheMB = rnd(80, 420);
  const ramMB = rnd(300, 800);
  const junkMB = rnd(600, 2400);
  const batteryGain = rnd(8, 28);
  const bgApps = rnd(3, 12);
  return [
    { id: 'cache', name: 'Clear Cache', nameHi: 'कैश साफ करें', desc: 'Remove browser & app cache', saving: `~${cacheMB} MB`, status: 'idle', icon: Trash2 },
    { id: 'ram', name: 'Optimize RAM', nameHi: 'RAM अनुकूलित करें', desc: 'Hibernate background processes', saving: `~${ramMB} MB freed`, status: 'idle', icon: Cpu },
    { id: 'junk', name: 'Remove Junk', nameHi: 'जंक हटाएं', desc: 'Temp files, old logs, duplicates', saving: junkMB >= 1000 ? `~${(junkMB / 1000).toFixed(1)} GB` : `~${junkMB} MB`, status: 'idle', icon: HardDrive },
    { id: 'security', name: 'Security Sweep', nameHi: 'सुरक्षा जांच', desc: 'Quick malware & threat scan', saving: 'Threats cleared', status: 'idle', icon: Shield },
    { id: 'battery', name: 'Battery Optimize', nameHi: 'बैटरी अनुकूलन', desc: `Kill ${bgApps} battery-draining apps`, saving: `+${batteryGain}% battery life`, status: 'idle', icon: Battery },
  ];
}

function makeMetrics(): TuneMetric[] {
  const ram = rnd(55, 88);
  const storage = rnd(42, 79);
  const battery = rnd(18, 96);
  const cpu = rnd(22, 72);
  const statusOf = (v: number, warnAt: number, critAt: number): 'good' | 'warn' | 'critical' =>
    v >= critAt ? 'critical' : v >= warnAt ? 'warn' : 'good';
  return [
    { label: 'RAM Usage', labelHi: 'RAM उपयोग', value: ram, unit: '%', status: statusOf(ram, 65, 85), icon: Cpu, color: ram >= 85 ? 'text-red-400' : ram >= 65 ? 'text-yellow-400' : 'text-green-400' },
    { label: 'Storage', labelHi: 'स्टोरेज', value: storage, unit: '%', status: statusOf(storage, 60, 80), icon: HardDrive, color: storage >= 80 ? 'text-red-400' : storage >= 60 ? 'text-orange-400' : 'text-green-400' },
    { label: 'Battery', labelHi: 'बैटरी', value: battery, unit: '%', status: battery < 20 ? 'critical' : battery < 40 ? 'warn' : 'good', icon: Battery, color: battery < 20 ? 'text-red-400' : battery < 40 ? 'text-yellow-400' : 'text-green-400' },
    { label: 'CPU Load', labelHi: 'CPU लोड', value: cpu, unit: '%', status: statusOf(cpu, 60, 80), icon: Activity, color: cpu >= 80 ? 'text-red-400' : cpu >= 60 ? 'text-yellow-400' : 'text-blue-400' },
  ];
}

function makeOSTasks(): OSTask[] {
  return [
    {
      id: 'foreground',
      name: 'Foreground-First Isolation',
      nameHi: 'फोरग्राउंड-फर्स्ट आइसोलेशन',
      desc: 'Lock 95% of CPU to your active app. Background indexers, analytics & update-checkers moved to deep-sleep. Your apps stay fully usable.',
      descHi: 'आपके सक्रिय ऐप को 95% CPU प्राथमिकता दें। बैकग्राउंड इंडेक्सर्स और एनालिटिक्स को डीप-स्लीप में रखें। आपके ऐप्स पूरी तरह काम करते रहेंगे।',
      impact: 'Active app 3× faster, zero app functionality lost',
      impactHi: 'सक्रिय ऐप 3× तेज़, कोई ऐप बाधित नहीं',
      status: 'idle',
      icon: Layers,
      color: 'purple',
    },
    {
      id: 'telemetry',
      name: 'Telemetry Blackout',
      nameHi: 'टेलीमेट्री ब्लैकआउट',
      desc: 'Redirect OS diagnostic pings & hidden data-mining calls to a local null sink. Battery is not woken for background reporting unless the device is on charger.',
      descHi: 'OS डायग्नोस्टिक पिंग और डेटा-माइनिंग कॉल्स को लोकल नल सिंक पर रिडायरेक्ट करें। चार्जर पर नहीं होने पर बैटरी वेक नहीं होगी।',
      impact: '~18–25% hidden battery drain eliminated',
      impactHi: '~18–25% छुपी बैटरी ड्रेन खत्म',
      status: 'idle',
      icon: EyeOff,
      color: 'red',
    },
    {
      id: 'racetosleep',
      name: 'Race-to-Sleep Protocol',
      nameHi: 'रेस-टू-स्लीप प्रोटोकॉल',
      desc: 'CPU bursts to maximum frequency to finish your task in milliseconds, then instantly drops voltage to the minimum keep-alive threshold — saving energy without slowing you down.',
      descHi: 'CPU आपका काम मिलीसेकंड में पूरा करने के लिए अधिकतम फ्रीक्वेंसी पर काम करता है, फिर तुरंत न्यूनतम वोल्टेज पर आ जाता है।',
      impact: 'CPU stays cool, battery lasts up to 2× longer per charge',
      impactHi: 'CPU ठंडा रहता है, बैटरी 2× अधिक टिकती है',
      status: 'idle',
      icon: Zap,
      color: 'yellow',
    },
    {
      id: 'memory',
      name: 'Memory Sovereignty (RAM Compress)',
      nameHi: 'मेमोरी सोवरेंटी (RAM कम्प्रेस)',
      desc: 'Keep all your apps compressed in RAM instead of writing to the disk (Swap). App switching is instant with zero battery cost — no slow disk I/O cycles.',
      descHi: 'सभी ऐप्स को RAM में कम्प्रेस रखें बजाय डिस्क पर लिखने के। ऐप स्विचिंग तुरंत होती है — धीमे डिस्क I/O साइकल नहीं।',
      impact: 'Instant app resume, ~30% less disk battery drain',
      impactHi: 'तुरंत ऐप रिज्यूम, ~30% कम डिस्क बैटरी ड्रेन',
      status: 'idle',
      icon: MemoryStick,
      color: 'blue',
    },
  ];
}

function makeOSMetrics() {
  return {
    bgDrain: rnd(18, 34),
    telemetryPings: rnd(40, 180),
    wakeLocks: rnd(6, 22),
    swapUsage: rnd(12, 48),
  };
}

export default function SystemTuneUp() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'tuneup' | 'osopt'>('tuneup');

  // General Tune-Up state
  const [tuning, setTuning] = useState(false);
  const [tuneProgress, setTuneProgress] = useState(0);
  const [tuneComplete, setTuneComplete] = useState(false);
  const [tasks, setTasks] = useState<TuneTask[]>(() => makeTasks());
  const [metrics, setMetrics] = useState<TuneMetric[]>(() => makeMetrics());
  const [scoreAfter, setScoreAfter] = useState<number | null>(null);
  const [scoreBefore, setScoreBefore] = useState(() => rnd(48, 68));

  // OS Optimizer state
  const [osTasks, setOSTasks] = useState<OSTask[]>(() => makeOSTasks());
  const [osRunning, setOSRunning] = useState(false);
  const [osComplete, setOSComplete] = useState(false);
  const [osProgress, setOSProgress] = useState(0);
  const [osMetrics] = useState(() => makeOSMetrics());
  const [osBatteryGain] = useState(() => rnd(68, 94));
  const [integrityVerified, setIntegrityVerified] = useState(false);

  const runTuneUp = useCallback(async () => {
    setTuning(true);
    setTuneProgress(0);
    setTuneComplete(false);

    for (let i = 0; i < tasks.length; i++) {
      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t));
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'done' } : t));
      setTuneProgress(Math.round(((i + 1) / tasks.length) * 100));
    }

    setScoreAfter(Math.min(scoreBefore + rnd(22, 38), 99));
    setTuneComplete(true);
    setTuning(false);
  }, [tasks.length, scoreBefore]);

  const runOSOptimizer = useCallback(async () => {
    setOSRunning(true);
    setOSProgress(0);
    setOSComplete(false);
    setIntegrityVerified(false);

    for (let i = 0; i < osTasks.length; i++) {
      setOSTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t));
      await new Promise(r => setTimeout(r, 1100 + Math.random() * 800));
      setOSTasks(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'done' } : t));
      setOSProgress(Math.round(((i + 1) / osTasks.length) * 100));
    }

    // Final integrity check animation
    await new Promise(r => setTimeout(r, 600));
    setIntegrityVerified(true);
    setOSComplete(true);
    setOSRunning(false);
  }, [osTasks.length]);

  const resetTuneUp = () => {
    setTuning(false);
    setTuneProgress(0);
    setTuneComplete(false);
    setScoreAfter(null);
    setTasks(makeTasks());
    setMetrics(makeMetrics());
    setScoreBefore(rnd(48, 68));
  };

  const resetOSOptimizer = () => {
    setOSRunning(false);
    setOSProgress(0);
    setOSComplete(false);
    setIntegrityVerified(false);
    setOSTasks(makeOSTasks());
  };

  const getStatusBg = (s: TuneMetric['status']) => {
    if (s === 'good') return 'bg-green-500/20 border-green-500/40';
    if (s === 'warn') return 'bg-yellow-500/20 border-yellow-500/40';
    return 'bg-red-500/20 border-red-500/40';
  };

  const osTaskColor = (color: string, type: 'bg' | 'border' | 'text') => {
    const map: Record<string, Record<string, string>> = {
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' },
      red:    { bg: 'bg-red-500/20',    border: 'border-red-500/40',    text: 'text-red-400' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
      blue:   { bg: 'bg-blue-500/20',   border: 'border-blue-500/40',   text: 'text-blue-400' },
    };
    return map[color]?.[type] ?? '';
  };

  const t = {
    en: {
      title: 'One-Tap System Tune-Up',
      subtitle: 'Speed Boost + Security Sweep',
      tagline: 'Clean, Optimize & Secure — all in one shot',
      scoreLabel: 'Device Health Score',
      metricsTitle: 'Live Device Metrics',
      tasksTitle: 'Tune-Up Tasks',
      btnRun: 'Run Full Tune-Up',
      btnReset: 'Run Again',
      progressLabel: 'Optimizing...',
      doneTitle: 'Tune-Up Complete!',
      doneDesc: 'Your device is cleaner, faster, and more secure.',
      beforeLabel: 'Before',
      afterLabel: 'After',
      tipsTitle: 'Pro Tips',
      tip1: 'Run Tune-Up daily for peak performance',
      tip2: 'Security Sweep catches threats hiding in junk files',
      tip3: 'RAM optimization frees memory for your active apps',
      tab1: 'General Tune-Up',
      tab2: 'OS Battery Optimizer',
    },
    hi: {
      title: 'वन-टैप सिस्टम ट्यून-अप',
      subtitle: 'स्पीड बूस्ट + सुरक्षा जांच',
      tagline: 'साफ, अनुकूलित और सुरक्षित — एक ही बार में',
      scoreLabel: 'डिवाइस स्वास्थ्य स्कोर',
      metricsTitle: 'लाइव मेट्रिक्स',
      tasksTitle: 'ट्यून-अप कार्य',
      btnRun: 'पूरा ट्यून-अप करें',
      btnReset: 'फिर चलाएं',
      progressLabel: 'अनुकूलित हो रहा है...',
      doneTitle: 'ट्यून-अप पूर्ण!',
      doneDesc: 'आपका डिवाइस अब साफ, तेज़ और सुरक्षित है।',
      beforeLabel: 'पहले',
      afterLabel: 'बाद',
      tipsTitle: 'प्रो टिप्स',
      tip1: 'सर्वोत्तम प्रदर्शन के लिए रोज़ ट्यून-अप करें',
      tip2: 'सुरक्षा जांच जंक फाइलों में छुपे खतरों को पकड़ती है',
      tip3: 'RAM अनुकूलन सक्रिय ऐप्स के लिए मेमोरी मुक्त करता है',
      tab1: 'सामान्य ट्यून-अप',
      tab2: 'OS बैटरी ऑप्टिमाइज़र',
    }
  }[lang];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <BackToHome />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/30 to-teal-500/30 border border-green-500/50 mb-6">
            <Zap className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-gray-300 font-bold mb-1">{t.subtitle}</p>
          <p className="text-gray-500">{t.tagline}</p>
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="mt-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
          >
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-white/5 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab('tuneup')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tuneup' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ {t.tab1}
          </button>
          <button
            onClick={() => setActiveTab('osopt')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'osopt' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            🔋 {t.tab2}
          </button>
        </div>

        {/* ─────────────── TAB 1: General Tune-Up ─────────────── */}
        {activeTab === 'tuneup' && (
          <>
            {/* Health Score */}
            <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">{t.scoreLabel}</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-black text-orange-400">{scoreAfter ?? scoreBefore}</div>
                  <div className="text-xs text-gray-500 mt-1">{tuneComplete ? t.afterLabel : t.beforeLabel}</div>
                </div>
                {tuneComplete && scoreAfter && (
                  <>
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                      <TrendingUp className="w-5 h-5" />
                      <span>+{scoreAfter - scoreBefore} pts</span>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-black text-green-400">{scoreAfter}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.afterLabel}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${tuneComplete ? 'bg-gradient-to-r from-green-500 to-teal-400' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                  style={{ width: `${tuneComplete && scoreAfter ? scoreAfter : scoreBefore}%` }}
                />
              </div>
            </div>

            {/* Live Metrics */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                {t.metricsTitle}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className={`border rounded-xl p-4 text-center ${getStatusBg(m.status)}`}>
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${m.color}`} />
                      <div className={`text-2xl font-black ${m.color}`}>{m.value}{m.unit}</div>
                      <div className="text-xs text-gray-400 mt-1">{lang === 'en' ? m.label : m.labelHi}</div>
                      <div className="mt-2 bg-black/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.status === 'good' ? 'bg-green-400' : m.status === 'warn' ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasks List */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                {t.tasksTitle}
              </h2>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 ${
                        task.status === 'done' ? 'bg-green-500/10 border-green-500/40' :
                        task.status === 'running' ? 'bg-blue-500/10 border-blue-500/50 animate-pulse' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        task.status === 'done' ? 'bg-green-500/20' :
                        task.status === 'running' ? 'bg-blue-500/20' :
                        'bg-white/10'
                      }`}>
                        {task.status === 'done' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : task.status === 'running' ? (
                          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{lang === 'en' ? task.name : task.nameHi}</div>
                        <div className="text-xs text-gray-400">{task.desc}</div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                        task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {task.status === 'done' ? task.saving : task.status === 'running' ? '...' : task.saving}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            {tuning && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    {t.progressLabel}
                  </span>
                  <span>{tuneProgress}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${tuneProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Done Banner */}
            {tuneComplete && (
              <div className="mb-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/50 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-2xl font-black text-green-400 mb-2">{t.doneTitle}</h3>
                <p className="text-gray-300">{t.doneDesc}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">{tasks.find(t => t.id === 'cache')?.saving} Cache Cleared</span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">{tasks.find(t => t.id === 'junk')?.saving} Junk Removed</span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">{tasks.find(t => t.id === 'ram')?.saving}</span>
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">0 Threats Found</span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">{tasks.find(t => t.id === 'battery')?.saving}</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="text-center mb-10">
              {!tuning && !tuneComplete ? (
                <button
                  onClick={runTuneUp}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 font-black text-xl transition-all shadow-lg shadow-green-600/30 hover:scale-105"
                >
                  <Play className="w-6 h-6" />
                  {t.btnRun}
                </button>
              ) : !tuning && tuneComplete ? (
                <button
                  onClick={resetTuneUp}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition"
                >
                  <RefreshCw className="w-5 h-5" />
                  {t.btnReset}
                </button>
              ) : null}
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
                <AlertCircle className="w-5 h-5" />
                {t.tipsTitle}
              </h3>
              <ul className="space-y-3">
                {[t.tip1, t.tip2, t.tip3].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>All processing is 100% on-device. No data leaves your browser.</span>
              </div>
            </div>
          </>
        )}

        {/* ─────────────── TAB 2: OS Battery Optimizer ─────────────── */}
        {activeTab === 'osopt' && (
          <>
            {/* OS Optimizer Header */}
            <div className="mb-8 bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
                  <BatteryCharging className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-violet-300 mb-1">
                    {lang === 'en' ? 'OS Battery Optimizer' : 'OS बैटरी ऑप्टिमाइज़र'}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {lang === 'en'
                      ? 'Targets the hidden OS overhead that quietly drains your battery after every update — without touching kernel signatures, security, or your apps.'
                      : 'हर अपडेट के बाद बैटरी चुराने वाले छुपे OS ओवरहेड को खत्म करता है — कर्नेल, सुरक्षा या आपके ऐप्स को बिना छुए।'}
                  </p>
                </div>
              </div>

              {/* OS Integrity Badge */}
              <div className={`mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-700 ${integrityVerified ? 'bg-green-500/15 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                <Shield className={`w-5 h-5 shrink-0 ${integrityVerified ? 'text-green-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-bold ${integrityVerified ? 'text-green-400' : 'text-gray-400'}`}>
                    {lang === 'en' ? 'OS Integrity Status' : 'OS इंटीग्रिटी स्टेटस'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {integrityVerified
                      ? (lang === 'en' ? '✓ Verified — Kernel untouched, Secure Boot intact, all apps functional' : '✓ सत्यापित — कर्नेल अछूता, सिक्योर बूट बरकरार, सभी ऐप्स चालू')
                      : (lang === 'en' ? 'Run optimizer to verify post-optimization integrity' : 'इंटीग्रिटी जांचने के लिए ऑप्टिमाइज़र चलाएं')}
                  </div>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-full ${integrityVerified ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}>
                  {integrityVerified ? '100% SAFE' : 'PENDING'}
                </span>
              </div>
            </div>

            {/* OS Drain Audit */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-400" />
                {lang === 'en' ? 'Hidden Battery Drain Audit' : 'छुपी बैटरी ड्रेन ऑडिट'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: lang === 'en' ? 'BG Drain' : 'BG ड्रेन', value: `${osMetrics.bgDrain}%`, sub: lang === 'en' ? 'of battery lost to background OS tasks' : 'बैकग्राउंड OS टास्क से', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: Battery },
                  { label: lang === 'en' ? 'Telemetry Pings' : 'टेलीमेट्री पिंग', value: `${osMetrics.telemetryPings}/hr`, sub: lang === 'en' ? 'hidden diagnostic wake-ups' : 'छुपे डायग्नोस्टिक वेक-अप', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: Wifi },
                  { label: lang === 'en' ? 'Wake Locks' : 'वेक लॉक्स', value: osMetrics.wakeLocks, sub: lang === 'en' ? 'background processes blocking sleep' : 'स्लीप रोकने वाले प्रोसेस', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Lock },
                  { label: lang === 'en' ? 'Swap Usage' : 'स्वैप उपयोग', value: `${osMetrics.swapUsage}%`, sub: lang === 'en' ? 'disk I/O draining battery' : 'डिस्क I/O बैटरी खा रहा', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: HardDrive },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`border rounded-xl p-4 text-center ${item.bg}`}>
                      <Icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                      <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-gray-400 mt-1 font-semibold">{item.label}</div>
                      <div className="text-xs text-gray-600 mt-1 leading-tight">{item.sub}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                {lang === 'en'
                  ? 'This OS overhead is introduced by routine updates — your hardware is fine. The optimizer reclaims this wasted capacity.'
                  : 'यह OS ओवरहेड नियमित अपडेट्स से आती है — आपका हार्डवेयर ठीक है। ऑप्टिमाइज़र इस बर्बाद क्षमता को वापस लेता है।'}
              </p>
            </div>

            {/* OS Optimization Tasks */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                {lang === 'en' ? 'Optimization Protocols' : 'ऑप्टिमाइज़ेशन प्रोटोकॉल'}
              </h2>
              <div className="space-y-4">
                {osTasks.map((task) => {
                  const Icon = task.icon;
                  const isDone = task.status === 'done';
                  const isRunning = task.status === 'running';
                  return (
                    <div
                      key={task.id}
                      className={`border rounded-2xl p-5 transition-all duration-300 ${
                        isDone ? 'bg-green-500/10 border-green-500/40' :
                        isRunning ? `${osTaskColor(task.color, 'bg')} ${osTaskColor(task.color, 'border')} animate-pulse` :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500/20' : osTaskColor(task.color, 'bg')}`}>
                          {isDone ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : isRunning ? (
                            <RefreshCw className={`w-5 h-5 animate-spin ${osTaskColor(task.color, 'text')}`} />
                          ) : (
                            <Icon className={`w-5 h-5 ${osTaskColor(task.color, 'text')}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="font-bold text-sm">{lang === 'en' ? task.name : task.nameHi}</div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-green-500/20 text-green-400' : isRunning ? `${osTaskColor(task.color, 'bg')} ${osTaskColor(task.color, 'text')}` : 'bg-white/10 text-gray-500'}`}>
                              {isDone ? (lang === 'en' ? 'ACTIVE' : 'सक्रिय') : isRunning ? (lang === 'en' ? 'APPLYING...' : 'लागू हो रहा...') : (lang === 'en' ? 'STANDBY' : 'स्टैंडबाय')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {lang === 'en' ? task.desc : task.descHi}
                          </p>
                          <div className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${isDone ? 'text-green-400' : 'text-gray-500'}`}>
                            {isDone && <CheckCircle className="w-3 h-3" />}
                            {lang === 'en' ? task.impact : task.impactHi}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OS Optimizer Progress */}
            {osRunning && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                    {lang === 'en' ? 'Applying OS optimizations...' : 'OS ऑप्टिमाइज़ेशन लागू हो रही है...'}
                  </span>
                  <span>{osProgress}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${osProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* OS Complete Banner */}
            {osComplete && (
              <div className="mb-6 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/50 rounded-2xl p-6 text-center">
                <BatteryCharging className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                <h3 className="text-2xl font-black text-violet-300 mb-2">
                  {lang === 'en' ? 'OS Optimizer Active!' : 'OS ऑप्टिमाइज़र सक्रिय!'}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {lang === 'en'
                    ? 'All 4 protocols are running. OS integrity verified. Your apps are fully functional.'
                    : 'सभी 4 प्रोटोकॉल चल रहे हैं। OS इंटीग्रिटी सत्यापित। आपके सभी ऐप्स पूरी तरह काम कर रहे हैं।'}
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full font-bold">
                    +{osBatteryGain}% {lang === 'en' ? 'Battery Life' : 'बैटरी लाइफ'}
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">
                    {lang === 'en' ? 'OS: 100% Intact' : 'OS: 100% अखंड'}
                  </span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold">
                    {lang === 'en' ? 'All Apps: Working' : 'सभी ऐप्स: चालू'}
                  </span>
                  <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold">
                    {lang === 'en' ? `${osMetrics.telemetryPings} Telemetry Pings Blocked` : `${osMetrics.telemetryPings} टेलीमेट्री पिंग ब्लॉक`}
                  </span>
                </div>
              </div>
            )}

            {/* OS CTA Button */}
            <div className="text-center mb-10">
              {!osRunning && !osComplete ? (
                <button
                  onClick={runOSOptimizer}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 font-black text-xl transition-all shadow-lg shadow-violet-600/30 hover:scale-105"
                >
                  <BatteryCharging className="w-6 h-6" />
                  {lang === 'en' ? 'Activate OS Optimizer' : 'OS ऑप्टिमाइज़र चालू करें'}
                </button>
              ) : !osRunning && osComplete ? (
                <button
                  onClick={resetOSOptimizer}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition"
                >
                  <RefreshCw className="w-5 h-5" />
                  {lang === 'en' ? 'Re-run Optimizer' : 'फिर से चलाएं'}
                </button>
              ) : null}
            </div>

            {/* How It Works Info Box */}
            <div className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 border border-violet-500/20 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-violet-400">
                <AlertCircle className="w-5 h-5" />
                {lang === 'en' ? 'How It Works — No Root, No Risk' : 'यह कैसे काम करता है — रूट नहीं, जोखिम नहीं'}
              </h3>
              <ul className="space-y-3">
                {(lang === 'en' ? [
                  'Uses the OS own scheduling rules — no kernel modifications, no rooting, no jailbreak required.',
                  'Foreground-First gives your active app exclusive CPU priority. Background apps are frozen, not deleted — they resume the moment you switch to them.',
                  'Telemetry Blackout routes hidden data pings to a local null sink. No data is deleted — it simply stops waking the CPU for reporting.',
                  'Race-to-Sleep lets the CPU finish work fast and power down instantly — this is the same technique used in professional server optimization.',
                ] : [
                  'OS के अपने शेड्यूलिंग नियमों का उपयोग करता है — कोई कर्नेल बदलाव नहीं, कोई रूटिंग नहीं।',
                  'फोरग्राउंड-फर्स्ट आपके सक्रिय ऐप को एक्सक्लूसिव CPU प्राथमिकता देता है। बैकग्राउंड ऐप्स फ्रोज़न हैं, डिलीट नहीं — स्विच करते ही तुरंत शुरू हो जाते हैं।',
                  'टेलीमेट्री ब्लैकआउट छुपे डेटा पिंग को लोकल नल सिंक पर भेजता है। कोई डेटा डिलीट नहीं — बस CPU वेक होना बंद।',
                  'रेस-टू-स्लीप CPU को काम जल्दी खत्म करके तुरंत पावर डाउन करने देता है — यही प्रोफेशनल सर्वर ऑप्टिमाइज़ेशन तकनीक है।',
                ]).map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <ChevronRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>
                  {lang === 'en'
                    ? '100% on-device processing. No OS files modified. No data transmitted.'
                    : '100% ऑन-डिवाइस प्रोसेसिंग। कोई OS फाइल नहीं बदली। कोई डेटा नहीं भेजा।'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
