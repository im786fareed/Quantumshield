'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Brain, AlertTriangle, CheckCircle,
  Phone, Shield, Users, CreditCard, Clock,
  UserX, Smartphone, Activity, Zap, Volume2, FileText
} from 'lucide-react';
import BackToHome from './BackToHome';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TranscriptLine {
  id: number;
  text: string;
  ts: number;           // seconds from call start
  isFinal: boolean;
  lang?: string;
}

interface AIAnalysis {
  isScam: boolean;
  confidence: number;
  scamType: string;
  riskScore: number;
  reasoning: string;
  detectedPatterns: string[];
  recommendations: string[];
  criticalWarnings: string[];
}

// ─── MTI-Aware Pattern Library ────────────────────────────────────────────────
// Covers: pure English · Hinglish phonetics · Hindi Romanised
// Each entry is lowercased for matching
const PATTERNS = {
  digitalArrest: [
    'digital arrest','digitally arrested','cyber arrest','online arrest',
    'virtual arrest','video call arrest','digital giraftari',
    'aapko digitally arrest kar rahe','aap arrested hain','aapki giraftari',
  ],
  authorityClaim: [
    'police','cbi','ed','income tax','customs','officer','ips','ias',
    'investigation','authority','government','enforcement directorate',
    'revenue department','cyber cell','narcotics','cbdt','sebi',
    // Hindi romanised
    'sarkar','adhikari','vibhag','jaanch','kedriya','puchh taach',
  ],
  urgencyPressure: [
    'urgent','immediately','right now','within minutes','last chance',
    'time running out','hurry','quick','abhi','turant','jaldi',
    'warna','nahi to','baad mein mushkil','ek ghante mein',
    'before it\'s too late','do not waste time','act now','deadline',
  ],
  legalThreat: [
    'arrest','warrant','court','legal action','jail','police station',
    'fir','case registered','criminal','summons','chargesheet',
    'prosecution','judicial','magistrate',
    // Hinglish
    'giraftari','muqadma','case darz','pakad lenge','hawalat',
    'qanooni kaaryavahi','kaid','jail bhejenge',
  ],
  financialRequest: [
    'transfer money','payment','fine','penalty','bail','transaction',
    'upi','neft','rtgs','send money','deposit','wire transfer','imps',
    'google pay','phonepe','paytm','bank account','routing',
    // Hinglish
    'paise bhejo','paise transfer karo','amount bhejo','paisa do',
    'rupaye','lakh','crore','ek hajar','das hajar',
    'account mein daalo','turant transfer',
  ],
  informationRequest: [
    'otp','cvv','pin','password','card number','account number',
    'aadhaar','pan card','date of birth','verify','share your',
    'tell me your','confirm your','mother\'s maiden',
    // Hinglish
    'otp batao','pin batao','number share karo','number dijiye',
    'aadhaar number','aadhaar batao','pan batao','verify karo',
    'apna number do','mobile number do','details do',
  ],
  packageScam: [
    'courier','parcel','package','shipment','delivery','seized',
    'fedex','dhl','customs clearance','contraband','drug','narcotics',
    'illegal item','foreign parcel',
    // Hinglish
    'parsel','dabba','courier pakda gaya','customs mein roka',
  ],
  silenceControl: [
    'don\'t tell anyone','keep secret','confidential','don\'t disconnect',
    'stay on line','don\'t hang up','keep this private','tell no one',
    'remain on call','do not leave','record kar rahe','sab sun rahe',
    // Hinglish
    'kisi ko mat batana','line mat kato','phone rakhna mat',
    'chup rehna','secret rakho','abhi mat jaana',
  ],
  kashmirBiharMTI: [
    // Common MTI misrecognised forms that ASR might produce
    'i am from cyber department','from cyber','from cbi','from it department',
    'ek minute','do minute','teen minute','char minute',
    'mera naam','meri id','mera number','main officer',
    'hamare pass information','aapke against case','case file hua',
    'notice send hua','notice bheja','court se notice',
  ],
};

// Banking keywords for metric counting
const BANKING_KW = [
  'bank','account','transfer','payment','upi','neft','rtgs','transaction',
  'money','amount','rupees','lakh','crore','withdraw','deposit','balance',
  'paisa','paise','rupay','bhejo','daalo','amount','fund',
];

// ─── Scoring weights ───────────────────────────────────────────────────────────
const WEIGHTS: Record<string, number> = {
  digitalArrest: 70,
  authorityClaim: 18,
  urgencyPressure: 15,
  legalThreat: 18,
  financialRequest: 25,
  informationRequest: 25,
  packageScam: 20,
  silenceControl: 20,
  kashmirBiharMTI: 12,
};

// ─── Language rotation for MTI resilience ─────────────────────────────────────
// Rotates between en-IN and hi-IN so Hinglish is captured by both engines
const LANG_ROTATION = ['en-IN', 'hi-IN', 'en-IN', 'en-IN'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AICallAnalyzer() {
  // ── UI state ──
  const [phase, setPhase] = useState<'setup' | 'listening' | 'done'>('setup');
  const [callerType, setCallerType] = useState<'unknown' | 'known'>('unknown');
  const [callSource, setCallSource] = useState<'regular' | 'whatsapp'>('regular');
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [liveText, setLiveText] = useState('');          // interim text shown live
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [micStatus, setMicStatus] = useState<'off'|'on'|'error'>('off');

  // ── Stable refs (no stale closures) ──
  const recognitionRef   = useRef<any>(null);
  const isListeningRef   = useRef(false);          // THE fix: ref never goes stale
  const fullTextRef      = useRef('');             // THE fix: always current transcript
  const callStartRef     = useRef(0);
  const lineIdRef        = useRef(0);
  const langIdxRef       = useRef(0);
  const analysisTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef    = useRef<HTMLDivElement>(null);

  // ── Auto-scroll transcript ──
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcriptLines]);

  // ── Core: score the full text ──────────────────────────────────────────────
  const scoreText = useCallback((text: string): AIAnalysis => {
    const lower = text.toLowerCase();
    const detected: string[] = [];
    const warnings: string[] = [];
    let total = 0;
    let scamType = 'Suspicious Call';
    const isUnknown = callerType === 'unknown';

    Object.entries(PATTERNS).forEach(([cat, phrases]) => {
      const hits = phrases.filter(p => lower.includes(p));
      if (!hits.length) return;

      detected.push(`${cat}: "${hits.slice(0, 3).join('", "')}"`);
      let w = (WEIGHTS[cat] ?? 10) * hits.length;

      if (cat === 'digitalArrest') {
        scamType = 'Digital Arrest Scam';
        warnings.push('DIGITAL ARREST does NOT exist in Indian law — 100% scam');
        w = 70;
      }
      if (cat === 'authorityClaim' && lower.includes('cbi')) {
        warnings.push('CBI never contacts via phone for arrests — verify physically');
      }
      if (cat === 'informationRequest') {
        warnings.push('Banks & Police NEVER ask OTP / PIN / Aadhaar over call');
      }
      if (cat === 'financialRequest') {
        warnings.push('NEVER transfer money to resolve a "legal case" via call');
        if (scamType === 'Suspicious Call') scamType = 'Financial Fraud Call';
      }
      if (cat === 'silenceControl') {
        warnings.push('Scammers demand secrecy to prevent victims from seeking help');
      }

      // Unknown caller multiplier
      if (isUnknown) w = Math.round(w * 1.5);
      // WhatsApp + money = extra risk
      if (callSource === 'whatsapp' && cat === 'financialRequest') w = Math.round(w * 1.3);

      total += w;
    });

    // Banking density bonus
    const bankHits = BANKING_KW.filter(k => lower.includes(k)).length;
    if (isUnknown && bankHits > 4) { total += 20; detected.push('High banking keyword density'); }

    const rs   = Math.min(total, 100);
    const isScam = rs > 38;
    const conf = Math.min(rs + 5, 99);

    const recs: string[] = [];
    if (isScam) {
      recs.push('🚨 HANG UP IMMEDIATELY');
      recs.push('Do NOT share any personal information or OTP');
      recs.push('Do NOT make any payment or transfer');
      recs.push('Call back the official number to verify (find it independently)');
      recs.push('Report at cybercrime.gov.in or call 1930');
      if (callSource === 'whatsapp') recs.push('Block & report this WhatsApp contact');
    } else {
      recs.push(isUnknown ? 'Unknown number — stay alert, verify identity' : 'No immediate scam patterns');
      recs.push('Never share OTP, PIN, Aadhaar, or bank details over phone');
      recs.push('Verify any official claim by calling the organisation directly');
    }

    let reasoning = '';
    if (rs > 80) reasoning = 'CRITICAL — Multiple high-confidence scam indicators. End call immediately.';
    else if (rs > 55) reasoning = 'HIGH RISK — Scam patterns detected. Do NOT comply with demands.';
    else if (rs > 38) reasoning = 'MODERATE RISK — Suspicious patterns. Stay cautious.';
    else if (isUnknown) reasoning = 'LOW RISK — No clear scam patterns yet. Remain alert.';
    else reasoning = 'No scam patterns detected in conversation so far.';

    return { isScam, confidence: conf, scamType, riskScore: rs, reasoning, detectedPatterns: detected, recommendations: recs, criticalWarnings: [...new Set(warnings)] };
  }, [callerType, callSource]);

  // ── Build recognition instance ──────────────────────────────────────────────
  const buildRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const r = new SR();
    r.continuous      = true;
    r.interimResults  = true;
    r.maxAlternatives = 3;   // pick best of 3 for MTI
    r.lang            = LANG_ROTATION[langIdxRef.current % LANG_ROTATION.length];

    r.onstart = () => setMicStatus('on');

    r.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        // Pick the best alternative (highest confidence)
        let bestText = e.results[i][0].transcript;
        let bestConf = e.results[i][0].confidence || 0;
        for (let a = 1; a < e.results[i].length; a++) {
          if ((e.results[i][a].confidence || 0) > bestConf) {
            bestConf = e.results[i][a].confidence;
            bestText = e.results[i][a].transcript;
          }
        }

        if (e.results[i].isFinal) {
          // Append to the stable ref IMMEDIATELY (no stale closure)
          fullTextRef.current += bestText + ' ';
          setWordCount(fullTextRef.current.split(/\s+/).filter(Boolean).length);

          const elapsed = Math.floor((Date.now() - callStartRef.current) / 1000);
          const line: TranscriptLine = {
            id:      ++lineIdRef.current,
            text:    bestText.trim(),
            ts:      elapsed,
            isFinal: true,
            lang:    r.lang,
          };
          setTranscriptLines(prev => [...prev, line]);
          setLiveText('');
        } else {
          interim += bestText;
        }
      }
      if (interim) setLiveText(interim);
    };

    r.onerror = (e: any) => {
      // 'no-speech' is not fatal — just means silence, keep going
      if (e.error === 'no-speech' || e.error === 'audio-capture') return;
      if (e.error === 'not-allowed') {
        setMicStatus('error');
        stopEverything();
      }
    };

    // ── THE KEY FIX: use ref, not closure ──────────────────────────────────
    r.onend = () => {
      if (!isListeningRef.current) return;   // intentional stop
      // Rotate language for next session (MTI resilience)
      langIdxRef.current = (langIdxRef.current + 1) % LANG_ROTATION.length;
      // Restart immediately
      try {
        const next = buildRecognition();
        if (next) {
          recognitionRef.current = next;
          next.start();
        }
      } catch (_) {
        /* ignore AbortError if already starting */
      }
    };

    return r;
  }, []);    // no deps — uses only refs and stable callbacks

  // ── Analysis loop — uses ref, never stale ──────────────────────────────────
  const runAnalysis = useCallback(() => {
    const text = fullTextRef.current.trim();
    if (text.length < 15) return;           // too short to analyse
    setIsAnalyzing(true);
    const result = scoreText(text);
    setAnalysis(result);
    setRiskScore(result.riskScore);
    setIsAnalyzing(false);
  }, [scoreText]);

  // ── Start / Stop ───────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const rec = buildRecognition();
    if (!rec) {
      alert('Speech recognition is not supported. Please use Chrome or Edge on desktop.');
      return;
    }
    // Reset all state
    fullTextRef.current      = '';
    isListeningRef.current   = true;
    langIdxRef.current       = 0;
    lineIdRef.current        = 0;
    callStartRef.current     = Date.now();
    setTranscriptLines([]);
    setLiveText('');
    setAnalysis(null);
    setRiskScore(0);
    setWordCount(0);
    setElapsedSec(0);
    setPhase('listening');

    recognitionRef.current = rec;
    rec.start();

    // Clock
    clockTimerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - callStartRef.current) / 1000));
    }, 1000);

    // Analysis — reads ref, never stale
    analysisTimerRef.current = setInterval(runAnalysis, 2500);
  }, [buildRecognition, runAnalysis]);

  const stopEverything = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    if (clockTimerRef.current)    clearInterval(clockTimerRef.current);
    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    setMicStatus('off');
    setLiveText('');
    setPhase('done');
    // Final analysis on full text
    const text = fullTextRef.current.trim();
    if (text.length > 10) {
      const result = scoreText(text);
      setAnalysis(result);
      setRiskScore(result.riskScore);
    }
  }, [scoreText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      if (clockTimerRef.current)    clearInterval(clockTimerRef.current);
      if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const riskColor = riskScore > 70 ? 'text-red-400' :
                    riskScore > 45 ? 'text-orange-400' :
                    riskScore > 20 ? 'text-yellow-400' : 'text-green-400';

  const riskBg    = riskScore > 70 ? 'bg-red-500' :
                    riskScore > 45 ? 'bg-orange-500' :
                    riskScore > 20 ? 'bg-yellow-500' : 'bg-green-500';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <BackToHome />

        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/50 mb-4">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            AI Call Analyzer
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time scam detection · Hinglish + English · MTI-resilient · Continuous transcription
          </p>
        </div>

        {/* ══════════ PHASE: SETUP ══════════ */}
        {phase === 'setup' && (
          <div className="space-y-5">
            {/* Caller type */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
                <UserX className="w-4 h-4" /> Caller Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(['unknown','known'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setCallerType(t)}
                    className={`p-4 rounded-xl border-2 transition font-bold capitalize ${
                      callerType === t
                        ? t === 'unknown' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-green-500/20 border-green-500 text-green-300'
                        : 'border-white/10 hover:border-white/30 text-gray-400'
                    }`}
                  >
                    {t === 'unknown' ? '🔴 Unknown Number' : '🟢 Known Contact'}
                  </button>
                ))}
              </div>
              {callerType === 'unknown' && (
                <p className="mt-3 text-xs text-orange-300 bg-orange-500/10 rounded-lg px-3 py-2">
                  ⚠️ High-vigilance mode — scoring multipliers active for unknown callers
                </p>
              )}
            </div>

            {/* Call source */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
                <Phone className="w-4 h-4" /> Call Source
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(['regular','whatsapp'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setCallSource(s)}
                    className={`p-4 rounded-xl border-2 transition font-bold ${
                      callSource === s
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'border-white/10 hover:border-white/30 text-gray-400'
                    }`}
                  >
                    {s === 'regular' ? '📞 Regular Call' : '💬 WhatsApp Call'}
                  </button>
                ))}
              </div>
            </div>

            {/* What this detects */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-5">
              <h3 className="font-bold mb-3 text-purple-300 flex items-center gap-2">
                <Shield className="w-4 h-4" /> What This Analyzes
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                {[
                  'Digital Arrest scam scripts','Authority impersonation (CBI/ED/Police)',
                  'Urgency pressure tactics','Legal threat keywords',
                  'Financial demand signals','OTP/Aadhaar/PIN requests',
                  'Courier/parcel scam phrases','Hinglish & MTI speech patterns',
                  'Silence/secrecy pressure','Courier parcel scam',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {micStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm">
                🎤 Microphone access denied. Please allow microphone permissions and reload.
              </div>
            )}

            <button
              onClick={startListening}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-black text-xl flex items-center justify-center gap-3 transition shadow-lg shadow-purple-600/30 hover:scale-[1.02]"
            >
              <Mic className="w-7 h-7" />
              Start Analyzing Call
            </button>
            <p className="text-center text-xs text-gray-600">
              Mic listens to your side + any audio near the device. Place near speaker for best results.
            </p>
          </div>
        )}

        {/* ══════════ PHASE: LISTENING ══════════ */}
        {phase === 'listening' && (
          <div className="space-y-5">
            {/* Live status bar */}
            <div className={`rounded-2xl p-4 border-2 flex items-center justify-between flex-wrap gap-3 transition-all ${
              analysis?.isScam
                ? 'bg-red-600/20 border-red-500 animate-pulse'
                : 'bg-purple-600/10 border-purple-500/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-lg">
                  {analysis?.isScam ? '🚨 SCAM DETECTED' : '🎙 Analyzing...'}
                </span>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" /> {fmt(elapsedSec)}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <FileText className="w-4 h-4" /> {wordCount} words
                </span>
                <span className={`font-black text-xl ${riskColor}`}>
                  {riskScore}<span className="text-sm font-normal text-gray-500">/100</span>
                </span>
              </div>
            </div>

            {/* Risk bar */}
            <div className="bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${riskBg}`}
                style={{ width: `${Math.max(riskScore, 2)}%` }}
              />
            </div>

            {/* Scam alert */}
            {analysis?.isScam && (
              <div className="bg-red-600 border-4 border-red-400 rounded-2xl p-5 shadow-2xl shadow-red-500/40">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-12 h-12 text-white shrink-0 animate-bounce" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-1">🚨 SCAM — HANG UP NOW</h3>
                    <p className="font-bold text-red-100 mb-1">{analysis.scamType}</p>
                    <p className="text-sm text-red-200 mb-3">{analysis.reasoning}</p>
                    {analysis.criticalWarnings.length > 0 && (
                      <div className="bg-red-900/50 rounded-xl p-3 mb-3 space-y-1">
                        {analysis.criticalWarnings.map((w, i) => (
                          <p key={i} className="text-sm text-red-100">⚠️ {w}</p>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1">
                      {analysis.recommendations.map((r, i) => (
                        <p key={i} className="text-sm text-white">→ {r}</p>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <a href="tel:1930" className="bg-white text-red-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-100 transition">
                        📞 Call 1930
                      </a>
                      <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                         className="bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-800 transition">
                        Report Online
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live transcript feed */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-bold flex items-center gap-2 text-gray-300">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  Live Transcript
                  <span className="text-xs text-gray-600 font-normal">(EN + HI · MTI mode)</span>
                </span>
                {isAnalyzing && (
                  <span className="text-xs text-purple-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" /> Analyzing…
                  </span>
                )}
              </div>
              <div
                ref={transcriptRef}
                className="h-52 overflow-y-auto px-4 py-3 space-y-2 font-mono text-sm"
              >
                {transcriptLines.length === 0 && !liveText && (
                  <p className="text-gray-600 animate-pulse">Listening… speak near the microphone</p>
                )}
                {transcriptLines.map(line => (
                  <div key={line.id} className="flex gap-3 items-start">
                    <span className="text-gray-600 text-xs shrink-0 mt-0.5 w-10 text-right">{fmt(line.ts)}</span>
                    <span className="text-gray-200 leading-relaxed">{line.text}</span>
                  </div>
                ))}
                {liveText && (
                  <div className="flex gap-3 items-start opacity-60">
                    <span className="text-gray-600 text-xs shrink-0 mt-0.5 w-10 text-right">…</span>
                    <span className="text-blue-300 italic">{liveText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Detected patterns (live) */}
            {analysis && analysis.detectedPatterns.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-widest">Detected Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedPatterns.map((p, i) => (
                    <span key={i} className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-3 py-1">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stop button */}
            <button
              onClick={stopEverything}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-black text-lg flex items-center justify-center gap-3 transition"
            >
              <MicOff className="w-6 h-6" />
              Stop & Get Final Report
            </button>
          </div>
        )}

        {/* ══════════ PHASE: DONE ══════════ */}
        {phase === 'done' && (
          <div className="space-y-5">
            {/* Final verdict card */}
            <div className={`rounded-2xl p-6 border-2 ${
              analysis?.isScam
                ? 'bg-red-600/10 border-red-500'
                : 'bg-green-600/10 border-green-500'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                {analysis?.isScam
                  ? <AlertTriangle className="w-12 h-12 text-red-400" />
                  : <CheckCircle className="w-12 h-12 text-green-400" />
                }
                <div>
                  <h2 className="text-2xl font-black">
                    {analysis?.isScam ? '🚨 SCAM CONFIRMED' : '✅ No Major Threats Detected'}
                  </h2>
                  <p className="text-gray-300">{analysis?.scamType}</p>
                </div>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Risk Score</span>
                  <span className={`font-black ${riskColor}`}>{riskScore}/100</span>
                </div>
                <div className="bg-black/40 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${riskBg}`}
                    style={{ width: `${Math.max(riskScore, 2)}%` }}
                  />
                </div>
              </div>

              <p className="text-gray-300 mb-4">{analysis?.reasoning}</p>

              {/* Critical warnings */}
              {(analysis?.criticalWarnings?.length ?? 0) > 0 && (
                <div className="bg-red-900/30 rounded-xl p-3 mb-4 space-y-1">
                  {analysis!.criticalWarnings.map((w, i) => (
                    <p key={i} className="text-sm text-red-200">⚠️ {w}</p>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-1 mb-5">
                {analysis?.recommendations.map((r, i) => (
                  <p key={i} className="text-sm">→ {r}</p>
                ))}
              </div>

              {/* Call stats */}
              <div className="grid grid-cols-3 gap-3 text-center border-t border-white/10 pt-4">
                <div>
                  <div className="text-xl font-black text-blue-400">{fmt(elapsedSec)}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div>
                  <div className="text-xl font-black text-purple-400">{wordCount}</div>
                  <div className="text-xs text-gray-500">Words captured</div>
                </div>
                <div>
                  <div className={`text-xl font-black ${riskColor}`}>{analysis?.confidence ?? 0}%</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>
            </div>

            {/* Full transcript review */}
            {transcriptLines.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-bold text-gray-300">Full Transcript</span>
                </div>
                <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2 font-mono text-sm">
                  {transcriptLines.map(line => (
                    <div key={line.id} className="flex gap-3 items-start">
                      <span className="text-gray-600 text-xs shrink-0 mt-0.5 w-10 text-right">{fmt(line.ts)}</span>
                      <span className="text-gray-200">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected patterns summary */}
            {(analysis?.detectedPatterns?.length ?? 0) > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-widest">Scam Indicators Found</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis!.detectedPatterns.map((p, i) => (
                    <span key={i} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-3 py-1">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {analysis?.isScam && (
                <>
                  <a href="tel:1930" className="flex-1 text-center bg-red-600 hover:bg-red-500 font-black py-3 rounded-xl transition">
                    📞 Call 1930
                  </a>
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                     className="flex-1 text-center bg-orange-600 hover:bg-orange-500 font-black py-3 rounded-xl transition">
                    File Report
                  </a>
                </>
              )}
              <button
                onClick={() => { setPhase('setup'); setAnalysis(null); setRiskScore(0); setTranscriptLines([]); setElapsedSec(0); setWordCount(0); }}
                className="flex-1 bg-white/10 hover:bg-white/20 font-bold py-3 rounded-xl transition"
              >
                Analyze Another Call
              </button>
            </div>
          </div>
        )}

        {/* Info footer */}
        <p className="mt-8 text-center text-xs text-gray-700">
          All processing is 100% on-device · No audio or transcript is ever uploaded · Chrome/Edge recommended
        </p>
      </div>
    </div>
  );
}
