'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Cpu, HardDrive, Battery, Trash2, CheckCircle,
  AlertCircle, RefreshCw, Shield, Activity, Play,
  ChevronRight, Clock, TrendingUp
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

export default function SystemTuneUp() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [tuning, setTuning] = useState(false);
  const [tuneProgress, setTuneProgress] = useState(0);
  const [tuneComplete, setTuneComplete] = useState(false);
  const [tasks, setTasks] = useState<TuneTask[]>([
    { id: 'cache', name: 'Clear Cache', nameHi: 'कैश साफ करें', desc: 'Remove browser & app cache', saving: '~245 MB', status: 'idle', icon: Trash2 },
    { id: 'ram', name: 'Optimize RAM', nameHi: 'RAM अनुकूलित करें', desc: 'Hibernate background processes', saving: '~512 MB freed', status: 'idle', icon: Cpu },
    { id: 'junk', name: 'Remove Junk', nameHi: 'जंक हटाएं', desc: 'Temp files, old logs, duplicates', saving: '~1.2 GB', status: 'idle', icon: HardDrive },
    { id: 'security', name: 'Security Sweep', nameHi: 'सुरक्षा जांच', desc: 'Quick malware & threat scan', saving: 'Threats cleared', status: 'idle', icon: Shield },
    { id: 'battery', name: 'Battery Optimize', nameHi: 'बैटरी अनुकूलन', desc: 'Kill battery-draining background apps', saving: '+18% battery life', status: 'idle', icon: Battery },
  ]);

  // Simulate realistic device metrics
  const [metrics] = useState<TuneMetric[]>([
    { label: 'RAM Usage', labelHi: 'RAM उपयोग', value: 73, unit: '%', status: 'warn', icon: Cpu, color: 'text-yellow-400' },
    { label: 'Storage', labelHi: 'स्टोरेज', value: 61, unit: '%', status: 'warn', icon: HardDrive, color: 'text-orange-400' },
    { label: 'Battery', labelHi: 'बैटरी', value: 84, unit: '%', status: 'good', icon: Battery, color: 'text-green-400' },
    { label: 'CPU Load', labelHi: 'CPU लोड', value: 42, unit: '%', status: 'good', icon: Activity, color: 'text-blue-400' },
  ]);

  const [scoreAfter, setScoreAfter] = useState<number | null>(null);
  const scoreBefore = 58;

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

    setScoreAfter(91);
    setTuneComplete(true);
    setTuning(false);
  }, [tasks.length]);

  const resetTuneUp = () => {
    setTuning(false);
    setTuneProgress(0);
    setTuneComplete(false);
    setScoreAfter(null);
    setTasks(prev => prev.map(t => ({ ...t, status: 'idle' })));
  };

  const getStatusBg = (s: TuneMetric['status']) => {
    if (s === 'good') return 'bg-green-500/20 border-green-500/40';
    if (s === 'warn') return 'bg-yellow-500/20 border-yellow-500/40';
    return 'bg-red-500/20 border-red-500/40';
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
    }
  }[lang];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <BackToHome />

        {/* Header */}
        <div className="text-center mb-10">
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
          {/* Score bar */}
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
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">~1.96 GB Freed</span>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">5 Background Apps Hibernated</span>
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">0 Threats Found</span>
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">+18% Battery Life</span>
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
      </div>
    </div>
  );
}
