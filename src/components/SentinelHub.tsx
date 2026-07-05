'use client';

import Link from 'next/link';

/* =========================================================
   QuantumShield Sentinel — Privacy & Surveillance Inspection
   Honest, on-device privacy sweep. Every functional module uses
   a REAL capability of the phone/browser:
     • AI Room Inspector  → Gemini vision: ~10 s video sweep
       (frames sampled on-device) + close-up photo follow-up
     • EMF Scan           → real Magnetometer sensor (µT)
     • Lens Sweep         → real camera as a guided visual aid
     • Playbooks          → real expert inspection guidance
     • Full Sweep         → guided wizard chaining the above
   Hardware-only modules (RF / thermal / mic-RF / Wi-Fi-BLE) are
   shown as a clearly-labelled roadmap — never faked.
   Bilingual: English + हिन्दी (local toggle, persisted).
   ========================================================= */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Camera, Radar, Flashlight, BookOpen, Cpu,
  AlertTriangle, CheckCircle2, Loader2, X, ArrowLeft, ArrowRight,
  Lock, Eye, Hotel, Home, DoorClosed, Car, Building2, Bath,
  Activity, FileText, Info, Lightbulb, PlayCircle, Globe,
} from 'lucide-react';
import { apiUrl } from '@/lib/apiBase';
import { useLanguage, type Lang } from '@/lib/useLanguage';

type ModuleId = 'overview' | 'sweep' | 'inspect' | 'emf' | 'lens' | 'playbooks' | 'hardware';

/* ── shared colour helpers ── */
const levelStyle: Record<string, string> = {
  safe: 'text-green-400 border-green-500/40 bg-green-500/10',
  low: 'text-green-400 border-green-500/40 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  high: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  critical: 'text-red-400 border-red-500/40 bg-red-500/10',
};
const concernStyle: Record<string, string> = {
  none: 'text-green-400 bg-green-500/10 border-green-500/30',
  low: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
};

/* ── pick helper: tiny inline bilingual value ── */
const L = (lang: Lang, en: string, hi: string) => (lang === 'en' ? en : hi);

/* ═══════════════════════════════════════════════════════════
   AI ROOM INSPECTOR
   ═══════════════════════════════════════════════════════════ */
type InspectedObject = {
  name: string; location: string; concern: string; reason: string; recommendation: string;
};
type Inspection = {
  summary: string; riskScore: number; riskLevel: string;
  objects: InspectedObject[]; recommendations: string[];
};

/* Shared result card — renders one AI inspection (room sweep or
   close-up). onCloseup, when given, adds a "Check up close" button
   to flagged objects. */
function InspectionResultView({ result, lang, onCloseup }: {
  result: Inspection; lang: Lang; onCloseup?: (o: InspectedObject) => void;
}) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${levelStyle[result.riskLevel] || levelStyle.medium}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest">{L(lang, 'Inspection result', 'जांच परिणाम')}</span>
          <span className="text-2xl font-black">{result.riskScore}<span className="text-sm font-bold opacity-70">/100</span></span>
        </div>
        <p className="text-sm mt-1.5 text-white/90 leading-relaxed">{result.summary}</p>
        <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider opacity-80">
          {result.riskLevel} · {L(lang, 'worth-a-look score', 'जांच-योग्य स्कोर')}
        </span>
      </div>

      {result.objects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{L(lang, 'What the AI saw', 'AI ने क्या देखा')}</h4>
          {result.objects.map((o, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm">{o.name}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${concernStyle[o.concern] || concernStyle.low}`}>
                  {o.concern === 'none' ? L(lang, 'looks normal', 'सामान्य लगता है') : `${o.concern} ${L(lang, 'concern', 'चिंता')}`}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">{o.location}</p>
              <p className="text-[13px] text-gray-300 mt-1.5 leading-relaxed">{o.reason}</p>
              <p className="text-[13px] text-blue-300 mt-1.5 flex gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {o.recommendation}
              </p>
              {onCloseup && (o.concern === 'medium' || o.concern === 'high') && (
                <button
                  onClick={() => onCloseup(o)}
                  className="mt-2 w-full bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-200 rounded-lg py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {L(lang, 'Check up close — photo from 15–20 cm', 'नज़दीक से जांचें — 15–20 सेमी से फ़ोटो')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{L(lang, 'Next steps', 'अगले कदम')}</h4>
          <ul className="space-y-1.5">
            {result.recommendations.map((r, i) => (
              <li key={i} className="text-[13px] text-gray-300 flex gap-2"><span className="text-blue-400">•</span> {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Video sweep tuning: ~10 s pan, one frame ≈ every 1.15 s,
   9 frames max. Frames are downscaled JPEGs; the video itself
   never leaves the phone. */
const SCAN_MS = 10_000;
const FRAME_EVERY_MS = 1_150;
const MAX_SWEEP_FRAMES = 9;
const FRAME_MAX_PX = 960;

function RoomInspector({ lang }: { lang: Lang }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Video sweep
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const framesRef = useRef<string[]>([]);
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);

  // Single-photo fallback
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close-up follow-up on a flagged object
  const closeupFileRef = useRef<HTMLInputElement>(null);
  const closeupTargetRef = useRef('');
  const [closeup, setCloseup] = useState<{
    name: string; loading: boolean; preview: string | null;
    result: Inspection | null; error: string | null;
  } | null>(null);

  const stopCamera = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
    setRecording(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const fileToJpeg = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const max = 1280;
        let { width, height } = img;
        if (width > max || height > max) {
          const r = Math.min(max / width, max / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const c = document.createElement('canvas');
        c.width = width; c.height = height;
        const ctx = c.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
      img.src = url;
    });

  const startCamera = async () => {
    setError(null); setResult(null); setCloseup(null); setPreview(null);
    framesRef.current = []; setFrames([]); setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => { /* autoplay guard */ });
      }
      setCamOn(true);
    } catch (e: any) {
      setError(e?.name === 'NotAllowedError'
        ? L(lang, 'Camera permission was denied. Allow camera access for this site, or upload a photo instead.', 'कैमरा अनुमति अस्वीकृत है। इस साइट के लिए कैमरा एक्सेस दें, या इसके बजाय फ़ोटो अपलोड करें।')
        : L(lang, 'Could not open the camera on this device. You can upload a photo instead.', 'इस डिवाइस पर कैमरा नहीं खुल सका। इसके बजाय आप फ़ोटो अपलोड कर सकते हैं।'));
    }
  };

  const grabFrame = (): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const r = Math.min(1, FRAME_MAX_PX / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * r);
    c.height = Math.round(v.videoHeight * r);
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.72);
  };

  const startScan = () => {
    framesRef.current = []; setFrames([]);
    setRecording(true); setProgress(0);
    const grab = () => {
      if (framesRef.current.length >= MAX_SWEEP_FRAMES) return;
      const f = grabFrame();
      if (f) {
        framesRef.current.push(f);
        setFrames([...framesRef.current]);
      }
    };
    grab();
    const started = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - started;
      setProgress(Math.min(100, (elapsed / SCAN_MS) * 100));
      grab();
      if (elapsed >= SCAN_MS || framesRef.current.length >= MAX_SWEEP_FRAMES) {
        stopCamera();
        setProgress(100);
      }
    }, FRAME_EVERY_MS);
  };

  const callInspectApi = async (body: object): Promise<Inspection | { error: string }> => {
    try {
      const res = await fetch(apiUrl('/api/inspect-room'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { error: data.error || L(lang, 'Analysis failed. Please try again.', 'विश्लेषण विफल। कृपया फिर से प्रयास करें।') };
      }
      return data as Inspection;
    } catch {
      return { error: L(lang, 'Network error. Check your connection and try again.', 'नेटवर्क त्रुटि। कनेक्शन जांचें और फिर प्रयास करें।') };
    }
  };

  const analyzeSweep = async () => {
    const fr = framesRef.current;
    if (fr.length < 2) {
      setError(L(lang, 'The sweep was too short. Please pan again for the full 10 seconds.', 'स्वीप बहुत छोटा रहा। कृपया पूरे 10 सेकंड फिर से घुमाएं।'));
      return;
    }
    setLoading(true); setError(null); setResult(null);
    const r = await callInspectApi({ frames: fr, mimeType: 'image/jpeg', note, mode: 'video' });
    if ('error' in r) setError(r.error); else setResult(r);
    setLoading(false);
  };

  const analyzePhoto = async () => {
    if (!preview) return;
    setLoading(true); setError(null); setResult(null);
    const r = await callInspectApi({ image: preview, mimeType: 'image/jpeg', note, mode: 'wide' });
    if ('error' in r) setError(r.error); else setResult(r);
    setLoading(false);
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    stopCamera();
    framesRef.current = []; setFrames([]);
    setResult(null); setError(null); setCloseup(null);
    try {
      setPreview(await fileToJpeg(file));
    } catch {
      setError(L(lang, 'Could not read that image. Try another photo.', 'यह इमेज पढ़ी नहीं जा सकी। दूसरी फ़ोटो लें।'));
    }
  };

  const startCloseup = (o: InspectedObject) => {
    closeupTargetRef.current = `${o.name} — ${o.location}. ${o.reason}`;
    setCloseup({ name: o.name, loading: false, preview: null, result: null, error: null });
    closeupFileRef.current?.click();
  };

  const onPickCloseup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let dataUrl: string;
    try {
      dataUrl = await fileToJpeg(file);
    } catch {
      setCloseup((c) => c && ({ ...c, error: L(lang, 'Could not read that photo. Try again.', 'यह फ़ोटो पढ़ी नहीं जा सकी। फिर प्रयास करें।') }));
      return;
    }
    setCloseup((c) => c && ({ ...c, preview: dataUrl, loading: true, error: null, result: null }));
    const r = await callInspectApi({
      image: dataUrl, mimeType: 'image/jpeg', mode: 'closeup', target: closeupTargetRef.current,
    });
    setCloseup((c) => {
      if (!c) return c;
      return 'error' in r
        ? { ...c, loading: false, error: r.error }
        : { ...c, loading: false, result: r };
    });
  };

  const reset = () => {
    stopCamera();
    framesRef.current = [];
    setFrames([]); setPreview(null); setResult(null);
    setError(null); setNote(''); setCloseup(null); setProgress(0);
  };

  const sweepReady = !camOn && frames.length >= 2 && !result;
  const idle = !camOn && frames.length === 0 && !preview && !result;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300 leading-relaxed">
        {L(lang,
          'Slowly pan your phone around the room for about 10 seconds. The app samples still frames from the video and the AI inspects the whole sweep — reflections that blink or move between angles are exactly how hidden lenses give themselves away. It flags what to check by hand, and explains why.',
          'लगभग 10 सेकंड तक फ़ोन को कमरे में धीरे-धीरे घुमाएं। ऐप वीडियो से कुछ फ़्रेम लेता है और AI पूरे स्वीप की जांच करता है — कोणों के बीच चमकती या हिलती परछाइयाँ ही छुपे लेंस की पहचान होती हैं। यह बताता है कि किन चीज़ों को हाथ से जांचें — और क्यों।')}
      </p>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 flex gap-2 text-[12px] text-blue-200/90">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{L(lang,
          'The AI can never confirm a hidden camera — it only points you to objects to check by hand. Only a few still frames from your pan are sent for this one analysis; the video itself never leaves your phone, and nothing is stored on our servers.',
          'AI छुपा कैमरा कभी पक्का साबित नहीं कर सकता — यह सिर्फ़ बताता है कि किन चीज़ों को हाथ से जांचें। आपके स्वीप के सिर्फ़ कुछ फ़्रेम इस एक विश्लेषण के लिए भेजे जाते हैं; वीडियो कभी आपके फ़ोन से बाहर नहीं जाता, और हमारे सर्वर पर कुछ भी सेव नहीं होता।')}</span>
      </div>

      {idle && (
        <div className="space-y-2">
          <button onClick={startCamera} className="w-full border-2 border-dashed border-white/20 hover:border-blue-400/60 rounded-xl py-10 flex flex-col items-center gap-2 transition">
            <PlayCircle className="w-9 h-9 text-blue-400" />
            <span className="font-bold">{L(lang, 'Start video sweep', 'वीडियो स्वीप शुरू करें')}</span>
            <span className="text-xs text-gray-500">{L(lang, '≈10 seconds · slow pan around the room', '≈10 सेकंड · कमरे में धीमा पैन')}</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="w-full text-[13px] text-gray-400 hover:text-white py-2 transition flex items-center justify-center gap-1.5">
            <Camera className="w-4 h-4" /> {L(lang, 'No camera here? Upload a single room photo instead', 'कैमरा नहीं? इसके बजाय कमरे की एक फ़ोटो अपलोड करें')}
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
      <input ref={closeupFileRef} type="file" accept="image/*" capture="environment" onChange={onPickCloseup} className="hidden" />

      {camOn && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
            <video ref={videoRef} playsInline muted className="w-full max-h-[60vh] object-contain" />
            {recording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1 text-[11px] font-bold text-red-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {L(lang, 'Scanning…', 'स्कैन जारी…')} {frames.length}/{MAX_SWEEP_FRAMES}
              </div>
            )}
          </div>
          {recording ? (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[13px] text-gray-400 text-center">{L(lang,
                'Pan slowly — cover the ceiling, corners, mirrors, sockets and anything facing the bed.',
                'धीरे-धीरे घुमाएं — छत, कोने, शीशे, सॉकेट और बेड की ओर लगी चीज़ें कवर करें।')}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={startScan} className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition">
                <PlayCircle className="w-5 h-5" /> {L(lang, 'Start 10-second scan', '10 सेकंड का स्कैन शुरू करें')}
              </button>
              <button onClick={stopCamera} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 font-bold text-sm transition">
                {L(lang, 'Cancel', 'रद्द करें')}
              </button>
            </div>
          )}
        </div>
      )}

      {sweepReady && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              {L(lang, 'Sweep captured', 'स्वीप कैप्चर हुआ')} · {frames.length} {L(lang, 'frames', 'फ़्रेम')}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {frames.map((f, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={f} alt={`Frame ${i + 1}`} className="h-16 rounded-md border border-white/10 shrink-0" />
              ))}
            </div>
          </div>
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={L(lang, 'Optional note — e.g. "check the smoke detector above the bed"', 'वैकल्पिक नोट — जैसे "बेड के ऊपर वाला स्मोक डिटेक्टर जांचें"')}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-400/60"
          />
          <div className="flex gap-2">
            <button onClick={analyzeSweep} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> {L(lang, 'Inspecting sweep…', 'स्वीप की जांच हो रही है…')}</>
                : <><Eye className="w-5 h-5" /> {L(lang, 'Inspect this sweep', 'इस स्वीप की जांच करें')}</>}
            </button>
            <button onClick={startCamera} disabled={loading} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 font-bold text-sm transition">
              {L(lang, 'Redo', 'दोबारा')}
            </button>
          </div>
        </div>
      )}

      {preview && !result && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Room to inspect" className="w-full max-h-80 object-contain bg-black" />
            <button onClick={reset} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5" aria-label="Remove photo">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={L(lang, 'Optional note — e.g. "check the smoke detector above the bed"', 'वैकल्पिक नोट — जैसे "बेड के ऊपर वाला स्मोक डिटेक्टर जांचें"')}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-400/60"
          />
          <button onClick={analyzePhoto} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> {L(lang, 'Inspecting…', 'जांच हो रही है…')}</>
              : <><Eye className="w-5 h-5" /> {L(lang, 'Inspect this scene', 'इस दृश्य की जांच करें')}</>}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <InspectionResultView result={result} lang={lang} onCloseup={startCloseup} />

          {closeup && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300">
                {L(lang, 'Close-up check', 'नज़दीकी जांच')}: {closeup.name}
              </h4>
              {!closeup.preview && !closeup.loading && (
                <div className="space-y-2">
                  <p className="text-[13px] text-gray-300 leading-relaxed">{L(lang,
                    'Hold your phone 15–20 cm from the object, fill the frame, keep it steady (turn on the torch if it is dark), and take the photo.',
                    'फ़ोन को वस्तु से 15–20 सेमी दूर रखें, फ्रेम भरें, स्थिर रखें (अंधेरा हो तो टॉर्च जलाएं), और फ़ोटो लें।')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => closeupFileRef.current?.click()} className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 transition">
                      <Camera className="w-4 h-4" /> {L(lang, 'Take close-up photo', 'नज़दीकी फ़ोटो लें')}
                    </button>
                    <button onClick={() => setCloseup(null)} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 px-4 font-bold text-sm transition">
                      {L(lang, 'Cancel', 'रद्द करें')}
                    </button>
                  </div>
                </div>
              )}
              {closeup.preview && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={closeup.preview} alt="Close-up to inspect" className="w-full max-h-60 object-contain rounded-lg bg-black border border-white/10" />
              )}
              {closeup.loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> {L(lang, 'Inspecting close-up…', 'नज़दीकी जांच हो रही है…')}
                </div>
              )}
              {closeup.error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-[13px] text-red-300 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {closeup.error}
                </div>
              )}
              {closeup.result && <InspectionResultView result={closeup.result} lang={lang} />}
              {(closeup.result || closeup.error) && (
                <button onClick={() => closeupFileRef.current?.click()} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
                  {L(lang, 'Retake close-up', 'नज़दीकी फ़ोटो दोबारा लें')}
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reset} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
              {L(lang, 'Inspect another', 'दूसरी जांच')}
            </button>
            <Link href="/evidence" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm text-center transition flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4" /> {L(lang, 'Save evidence', 'सबूत सेव करें')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMF / MAGNETOMETER SCAN  (real Magnetometer sensor)
   ═══════════════════════════════════════════════════════════ */
function EmfScan({ lang }: { lang: Lang }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [magnitude, setMagnitude] = useState(0);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [peak, setPeak] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const sensorRef = useRef<any>(null);
  const calibRef = useRef<{ samples: number[]; until: number } | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'Magnetometer' in window);
    return () => { try { sensorRef.current?.stop(); } catch { /* noop */ } };
  }, []);

  const stop = useCallback(() => {
    try { sensorRef.current?.stop(); } catch { /* noop */ }
    sensorRef.current = null;
    setRunning(false);
  }, []);

  const start = async () => {
    setErr(null); setBaseline(null); setPeak(0); setMagnitude(0);
    try {
      if (navigator.permissions) {
        try {
          const p = await navigator.permissions.query({ name: 'magnetometer' as PermissionName });
          if (p.state === 'denied') {
            setErr(L(lang,
              'Magnetometer permission was denied. Enable motion-sensor access for this site in your browser settings.',
              'मैग्नेटोमीटर अनुमति अस्वीकृत है। ब्राउज़र सेटिंग्स में इस साइट के लिए मोशन-सेंसर एक्सेस चालू करें।'));
            return;
          }
        } catch { /* permission not listed — try anyway */ }
      }
      const Magnetometer = (window as any).Magnetometer;
      const sensor = new Magnetometer({ frequency: 10 });
      calibRef.current = { samples: [], until: Date.now() + 3000 };

      sensor.addEventListener('reading', () => {
        const m = Math.sqrt(sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2);
        if (!isFinite(m)) return;
        setMagnitude(m);
        const calib = calibRef.current;
        if (calib && Date.now() < calib.until) {
          calib.samples.push(m);
        } else if (calib && calib.samples.length) {
          setBaseline(calib.samples.reduce((a, b) => a + b, 0) / calib.samples.length);
          calibRef.current = null;
        } else {
          setPeak((prev) => Math.max(prev, m));
        }
      });
      sensor.addEventListener('error', (e: any) => {
        setErr(e?.error?.message || L(lang, 'The magnetometer could not be started on this device.', 'इस डिवाइस पर मैग्नेटोमीटर शुरू नहीं हो सका।'));
        stop();
      });
      sensor.start();
      sensorRef.current = sensor;
      setRunning(true);
    } catch (e: any) {
      setErr(e?.message || L(lang, 'The magnetometer is not available on this device.', 'इस डिवाइस पर मैग्नेटोमीटर उपलब्ध नहीं है।'));
    }
  };

  const deviation = baseline != null ? Math.abs(magnitude - baseline) : 0;
  const band = baseline == null ? 'calibrating' : deviation > 60 ? 'high' : deviation > 25 ? 'medium' : 'low';
  const bandColor = band === 'high' ? 'text-red-400' : band === 'medium' ? 'text-yellow-400' : 'text-green-400';

  if (supported === false) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200/90 flex gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">{L(lang, 'Magnetometer not available on this device', 'इस डिवाइस पर मैग्नेटोमीटर उपलब्ध नहीं')}</p>
            <p className="text-[13px] leading-relaxed">{L(lang,
              "This phone or browser doesn't expose a magnetic-field sensor (common on iPhones in Safari and on most desktops). We won't show a fake reading. On a supported Android phone in Chrome, the live EMF scan will appear here.",
              'यह फ़ोन या ब्राउज़र मैग्नेटिक-फ़ील्ड सेंसर नहीं देता (Safari में iPhone और ज़्यादातर डेस्कटॉप पर आम)। हम नकली रीडिंग नहीं दिखाएंगे। समर्थित Android फ़ोन में Chrome पर लाइव EMF स्कैन यहीं दिखेगा।')}</p>
          </div>
        </div>
        <ManualMagnetTip lang={lang} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300 leading-relaxed">{L(lang,
        "Hidden electronics distort the local magnetic field. This uses your phone's real magnetometer: hold still for 3 seconds to calibrate, then slowly move the top of your phone over smoke detectors, sockets, mirrors, vents and decor. Watch for a sustained jump above the baseline.",
        'छुपे इलेक्ट्रॉनिक्स स्थानीय मैग्नेटिक फ़ील्ड को बदल देते हैं। यह आपके फ़ोन के असली मैग्नेटोमीटर का उपयोग करता है: 3 सेकंड स्थिर रहें (कैलिब्रेशन), फिर फ़ोन के ऊपरी हिस्से को स्मोक डिटेक्टर, सॉकेट, शीशे, वेंट और सजावट के ऊपर धीरे-धीरे घुमाएं। बेसलाइन से लगातार बढ़ोतरी पर ध्यान दें।')}</p>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 text-[12px] text-blue-200/90 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{L(lang,
          'Magnets, metal frames, speakers and wiring also move the needle — a spike means "look closer here," not "camera found."',
          'चुंबक, धातु के फ्रेम, स्पीकर और तार भी रीडिंग बदलते हैं — उछाल का मतलब "यहाँ ध्यान से देखें" है, "कैमरा मिल गया" नहीं।')}</span>
      </div>

      {!running ? (
        <button onClick={start} className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition">
          <Radar className="w-5 h-5" /> {L(lang, 'Start EMF scan', 'EMF स्कैन शुरू करें')}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            {baseline == null ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <span className="text-sm text-gray-400">{L(lang, 'Calibrating — hold still…', 'कैलिब्रेशन — स्थिर रहें…')}</span>
              </div>
            ) : (
              <>
                <div className={`text-5xl font-black ${bandColor}`}>{deviation.toFixed(0)}<span className="text-xl"> µT</span></div>
                <div className="text-xs text-gray-500 mt-1">
                  {L(lang, 'change vs baseline', 'बेसलाइन से बदलाव')} ({baseline.toFixed(0)} µT) · {L(lang, 'now', 'अभी')} {magnitude.toFixed(0)} µT
                </div>
                <div className={`mt-3 inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${band === 'high' ? 'border-red-500/40 bg-red-500/10 text-red-400' : band === 'medium' ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' : 'border-green-500/40 bg-green-500/10 text-green-400'}`}>
                  {band === 'high' ? L(lang, 'Strong change — inspect here', 'तेज़ बदलाव — यहाँ जांचें') : band === 'medium' ? L(lang, 'Moderate change', 'मध्यम बदलाव') : L(lang, 'Normal', 'सामान्य')}
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all" style={{ width: `${Math.min(100, deviation)}%` }} />
                </div>
                <div className="text-[11px] text-gray-500 mt-2">
                  {L(lang, 'peak this scan', 'इस स्कैन का शिखर')}: {peak ? Math.abs(peak - (baseline || 0)).toFixed(0) : 0} µT
                </div>
              </>
            )}
          </div>
          <button onClick={stop} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
            {L(lang, 'Stop scan', 'स्कैन रोकें')}
          </button>
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {err}
        </div>
      )}
    </div>
  );
}

function ManualMagnetTip({ lang }: { lang: Lang }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h4 className="font-bold text-sm flex items-center gap-2 mb-1"><Lightbulb className="w-4 h-4 text-yellow-400" /> {L(lang, 'No sensor? Do it by hand', 'सेंसर नहीं? हाथ से करें')}</h4>
      <p className="text-[13px] text-gray-400 leading-relaxed">{L(lang,
        "Use a flashlight to scan for lens glints (the Lens Sweep tab), physically check smoke detectors / sockets / mirrors, and unplug or cover any device you can't account for. The Playbooks tab has a checklist per place.",
        'टॉर्च से लेंस की चमक खोजें (लेंस स्वीप टैब), स्मोक डिटेक्टर / सॉकेट / शीशे हाथ से जांचें, और जिस डिवाइस का हिसाब न हो उसे अनप्लग या ढक दें। प्लेबुक्स टैब में हर जगह की चेकलिस्ट है।')}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LENS SWEEP  (real camera as a guided visual aid)
   ═══════════════════════════════════════════════════════════ */
function LensSweep({ lang }: { lang: Lang }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [boost, setBoost] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRunning(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => { /* autoplay guard */ });
      }
      setRunning(true);
    } catch (e: any) {
      setErr(e?.name === 'NotAllowedError'
        ? L(lang, 'Camera permission was denied. Allow camera access for this site and try again.', 'कैमरा अनुमति अस्वीकृत है। इस साइट के लिए कैमरा एक्सेस दें और फिर प्रयास करें।')
        : L(lang, 'Could not open the camera on this device.', 'इस डिवाइस पर कैमरा नहीं खुल सका।'));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300 leading-relaxed">{L(lang,
        'Camera lenses bounce light straight back as a tiny bright dot. In a dimmed room, turn on a flashlight, hold it next to your eyes, and slowly sweep this magnified view across vents, smoke detectors, mirrors, clocks, sockets and decor. A pinpoint reflection that follows your light is worth inspecting by hand.',
        'कैमरा लेंस रोशनी को एक छोटे चमकीले बिंदु के रूप में सीधे वापस भेजते हैं। कमरे की रोशनी कम करके टॉर्च जलाएं, उसे आँखों के पास रखें, और इस बड़े किए गए दृश्य को वेंट, स्मोक डिटेक्टर, शीशे, घड़ी, सॉकेट और सजावट पर धीरे-धीरे घुमाएं। आपकी रोशनी के साथ चलने वाली बिंदु-जैसी चमक को हाथ से जांचें।')}</p>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 text-[12px] text-blue-200/90 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{L(lang,
          "This is a manual visual aid — it doesn't auto-detect cameras, it helps your eyes spot reflections. No video is recorded or uploaded.",
          'यह एक मैनुअल विज़ुअल सहायता है — यह अपने-आप कैमरा नहीं पकड़ता, यह आपकी आँखों को चमक पहचानने में मदद करता है। कोई वीडियो रिकॉर्ड या अपलोड नहीं होता।')}</span>
      </div>

      {!running ? (
        <button onClick={start} className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition">
          <Flashlight className="w-5 h-5" /> {L(lang, 'Open camera sweep', 'कैमरा स्वीप खोलें')}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
            <video ref={videoRef} playsInline muted className="w-full max-h-[60vh] object-contain" style={{ filter: boost ? 'brightness(1.6) contrast(1.5) saturate(0.6)' : 'none' }} />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-cyan-400/70 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBoost((b) => !b)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
              {boost ? L(lang, 'Boost: ON', 'बूस्ट: चालू') : L(lang, 'Boost: OFF', 'बूस्ट: बंद')}
            </button>
            <button onClick={stop} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
              {L(lang, 'Stop', 'रोकें')}
            </button>
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {err}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAYBOOKS  (real expert inspection checklists)
   ═══════════════════════════════════════════════════════════ */
const PLAYBOOKS: { icon: any; title: [string, string]; steps: [string, string][] }[] = [
  {
    icon: Hotel, title: ['Hotel room', 'होटल का कमरा'],
    steps: [
      ['On arrival, switch off the lights and slowly scan for tiny LED glows or lens reflections with a flashlight.', 'पहुँचते ही लाइट बंद करें और टॉर्च से छोटे LED ग्लो या लेंस की चमक धीरे-धीरे खोजें।'],
      ['Check the smoke detector, alarm clock and TV directly facing the bed — the most common camera spots.', 'बेड के सामने वाले स्मोक डिटेक्टर, अलार्म घड़ी और TV जांचें — कैमरे की सबसे आम जगहें।'],
      ['Inspect air vents, decorative items, tissue boxes and wall sockets near the bed and bathroom.', 'बेड और बाथरूम के पास वेंट, सजावट, टिशू बॉक्स और दीवार के सॉकेट जांचें।'],
      ['Do the mirror fingernail test: touch the glass — a gap between fingertip and reflection means a normal mirror.', 'शीशे का नाखून टेस्ट करें: काँच को छुएं — उँगली और उसकी छाया के बीच गैप = सामान्य शीशा।'],
      ['Run the EMF scan over suspicious objects and the lens sweep across the room before you settle in.', 'बसने से पहले संदिग्ध चीज़ों पर EMF स्कैन और कमरे में लेंस स्वीप चलाएं।'],
    ],
  },
  {
    icon: Home, title: ['Airbnb / rental', 'Airbnb / किराये का घर'],
    steps: [
      ['Hosts must disclose cameras — undisclosed indoor cameras are banned. Check the listing first.', 'होस्ट को कैमरे बताना ज़रूरी है — बिना बताए लगे इनडोर कैमरे प्रतिबंधित हैं। पहले लिस्टिंग जांचें।'],
      ['Pay special attention to bedrooms and bathrooms, where any camera is illegal.', 'बेडरूम और बाथरूम पर विशेष ध्यान दें, जहाँ कोई भी कैमरा अवैध है।'],
      ['Look at routers, smart speakers, phone chargers and USB hubs left plugged in facing living spaces.', 'रहने की जगह की ओर लगे राउटर, स्मार्ट स्पीकर, चार्जर और USB हब जांचें।'],
      ['Unplug or cover any device you cannot account for, and photograph it for evidence.', 'जिस डिवाइस का हिसाब न हो उसे अनप्लग या ढक दें, और सबूत के लिए फ़ोटो लें।'],
    ],
  },
  {
    icon: DoorClosed, title: ['Changing room / trial room', 'चेंजिंग रूम / ट्रायल रूम'],
    steps: [
      ['Scan hooks, vents, mirrors, smoke detectors and any wall holes before undressing.', 'कपड़े बदलने से पहले हुक, वेंट, शीशे, स्मोक डिटेक्टर और दीवार के छेद जांचें।'],
      ['Do the mirror finger-gap test on every mirror.', 'हर शीशे पर उँगली-गैप टेस्ट करें।'],
      ['Use the lens sweep with the lights dimmed to catch reflective pinholes.', 'रोशनी कम करके लेंस स्वीप से चमकीले पिनहोल पकड़ें।'],
      ['If you find anything, do not touch it further — photograph it and call the police (112) and 1930.', 'कुछ मिले तो उसे और न छुएं — फ़ोटो लें और पुलिस (112) तथा 1930 पर कॉल करें।'],
    ],
  },
  {
    icon: Bath, title: ['Public restroom', 'सार्वजनिक शौचालय'],
    steps: [
      ['Check toilet-roll holders, hooks, vents, and gaps in partitions and ceilings.', 'टॉयलेट-रोल होल्डर, हुक, वेंट, और पार्टीशन व छत के गैप जांचें।'],
      ['Look for small holes or out-of-place objects aimed at the stall.', 'स्टॉल की ओर लगे छोटे छेद या बेमेल चीज़ें खोजें।'],
      ['Use the flashlight lens sweep on suspect spots.', 'संदिग्ध जगहों पर टॉर्च लेंस स्वीप करें।'],
    ],
  },
  {
    icon: Car, title: ['Vehicle (tracker check)', 'वाहन (ट्रैकर जांच)'],
    steps: [
      ['Look under bumpers, in wheel wells, and inside the OBD-II port under the dashboard for unfamiliar devices.', 'बंपर के नीचे, व्हील वेल में, और डैशबोर्ड के नीचे OBD-II पोर्ट में अनजान डिवाइस खोजें।'],
      ['Check the boot, under seats and the glovebox for small boxes with magnets or wires.', 'डिक्की, सीटों के नीचे और ग्लवबॉक्स में चुंबक या तार वाले छोटे बॉक्स जांचें।'],
      ['Run the EMF scan slowly along the chassis and under seats — trackers often sit on metal with a magnet.', 'चेसिस और सीटों के नीचे धीरे-धीरे EMF स्कैन चलाएं — ट्रैकर अक्सर चुंबक से धातु पर लगे होते हैं।'],
      ["BLE trackers (AirTag-type) often trigger an 'unknown tracker' alert on your phone — don't ignore it.", "BLE ट्रैकर (AirTag-जैसे) अक्सर फ़ोन पर 'अनजान ट्रैकर' अलर्ट देते हैं — इसे नज़रअंदाज़ न करें।"],
    ],
  },
  {
    icon: Building2, title: ['Office / meeting room', 'ऑफ़िस / मीटिंग रूम'],
    steps: [
      ['Before a sensitive meeting, inspect smoke detectors, clocks, power strips and AV equipment.', 'संवेदनशील मीटिंग से पहले स्मोक डिटेक्टर, घड़ी, पावर स्ट्रिप और AV उपकरण जांचें।'],
      ['Check for unfamiliar USB devices, dongles or chargers plugged into walls or laptops.', 'दीवार या लैपटॉप में लगे अनजान USB डिवाइस, डोंगल या चार्जर जांचें।'],
      ['Use the EMF scan near the conference table and the lens sweep across the walls.', 'कॉन्फ्रेंस टेबल के पास EMF स्कैन और दीवारों पर लेंस स्वीप करें।'],
    ],
  },
];

function Playbooks({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(0);
  const idx = lang === 'en' ? 0 : 1;
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300 leading-relaxed">{L(lang,
        'Step-by-step inspection checklists for the places privacy is most at risk. Tap to expand.',
        'जहाँ निजता को सबसे ज़्यादा खतरा है, उन जगहों की चरण-दर-चरण जांच चेकलिस्ट। खोलने के लिए टैप करें।')}</p>
      {PLAYBOOKS.map((pb, i) => {
        const Icon = pb.icon;
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/5 transition">
              <Icon className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="font-bold text-sm flex-1">{pb.title[idx]}</span>
              <span className="text-gray-500 text-lg leading-none">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <ol className="px-4 pb-4 space-y-2">
                {pb.steps.map((s, j) => (
                  <li key={j} className="flex gap-2.5 text-[13px] text-gray-300 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-black flex items-center justify-center mt-0.5">{j + 1}</span>
                    {s[idx]}
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HARDWARE ROADMAP  (honest "coming with hardware" — never faked)
   ═══════════════════════════════════════════════════════════ */
const HARDWARE: { title: [string, string]; desc: [string, string] }[] = [
  { title: ['RF spectrum analysis', 'RF स्पेक्ट्रम विश्लेषण'], desc: ['Detect analog/digital, GSM, 4G/5G, LoRa and 433/868/915 MHz transmitters with a plug-in SDR.', 'प्लग-इन SDR से एनालॉग/डिजिटल, GSM, 4G/5G, LoRa और 433/868/915 MHz ट्रांसमीटर पहचानें।'] },
  { title: ['Thermal imaging', 'थर्मल इमेजिंग'], desc: ['Spot warm electronics hidden in walls, furniture, vehicles and luggage with a thermal camera attachment.', 'थर्मल कैमरा अटैचमेंट से दीवारों, फर्नीचर, वाहनों और सामान में छुपे गर्म इलेक्ट्रॉनिक्स खोजें।'] },
  { title: ['Hidden-microphone RF', 'छुपा-माइक RF'], desc: ['Identify covert microphones by their continuous transmission signature (needs an RF probe).', 'लगातार ट्रांसमिशन सिग्नेचर से छुपे माइक पहचानें (RF प्रोब ज़रूरी)।'] },
  { title: ['Wi-Fi / Bluetooth device discovery', 'Wi-Fi / Bluetooth डिवाइस खोज'], desc: ['Enumerate nearby IoT, cameras and trackers. Blocked in browsers and tightly restricted on Android — planned for the native app with the right permissions.', 'आस-पास के IoT, कैमरे और ट्रैकर सूचीबद्ध करें। ब्राउज़र में बंद और Android पर सीमित — सही अनुमतियों के साथ नेटिव ऐप में प्रस्तावित।'] },
];

function HardwareRoadmap({ lang }: { lang: Lang }) {
  const idx = lang === 'en' ? 0 : 1;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[13px] text-gray-300 leading-relaxed flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
        {L(lang,
          "These modules need hardware a phone doesn't have, or access the platform blocks. We'd rather show them as honest roadmap than fake a reading — that's the QuantumShield promise.",
          'इन मॉड्यूल्स को ऐसा हार्डवेयर चाहिए जो फ़ोन में नहीं है, या जिसे प्लेटफ़ॉर्म रोकता है। नकली रीडिंग दिखाने के बजाय हम इन्हें ईमानदार रोडमैप के रूप में दिखाते हैं — यही QuantumShield का वादा है।')}
      </div>
      {HARDWARE.map((h, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 flex gap-3 opacity-90">
          <Lock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{h.title[idx]}</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-gray-600 text-gray-400">{L(lang, 'Coming', 'जल्द')}</span>
            </div>
            <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">{h.desc[idx]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FULL SWEEP  (guided wizard chaining the real modules)
   ═══════════════════════════════════════════════════════════ */
function SweepWizard({ lang, onExit }: { lang: Lang; onExit: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      label: L(lang, 'Prepare', 'तैयारी'),
      body: (
        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed">{L(lang,
            'Lock the door, draw the curtains, and dim or switch off the main lights. A dark room makes hidden lenses and LED glows far easier to see in the next steps.',
            'दरवाज़ा बंद करें, पर्दे खींचें, और मुख्य लाइट कम या बंद कर दें। अंधेरे कमरे में अगले चरणों में छुपे लेंस और LED ग्लो देखना बहुत आसान हो जाता है।')}</p>
          <ul className="space-y-2">
            {[
              L(lang, 'Have a flashlight ready (your other phone or a torch).', 'टॉर्च तैयार रखें (दूसरा फ़ोन या टॉर्च)।'),
              L(lang, 'Allow camera and sensor permissions when asked.', 'पूछे जाने पर कैमरा और सेंसर अनुमति दें।'),
              L(lang, 'Move slowly — rushing misses the small signals.', 'धीरे चलें — जल्दबाज़ी में छोटे संकेत छूट जाते हैं।'),
            ].map((s, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-gray-300"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /> {s}</li>
            ))}
          </ul>
        </div>
      ),
    },
    { label: L(lang, 'Lens Sweep', 'लेंस स्वीप'), body: <LensSweep lang={lang} /> },
    { label: L(lang, 'AI Inspect', 'AI जांच'), body: <RoomInspector lang={lang} /> },
    { label: L(lang, 'EMF Scan', 'EMF स्कैन'), body: <EmfScan lang={lang} /> },
    {
      label: L(lang, 'Finish', 'समाप्त'),
      body: (
        <div className="space-y-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <h4 className="font-bold flex items-center gap-2 mb-1"><ShieldCheck className="w-5 h-5 text-cyan-400" /> {L(lang, 'Sweep complete', 'स्वीप पूरा')}</h4>
            <p className="text-[13px] text-gray-300 leading-relaxed">{L(lang,
              "You've checked the room with light, AI vision and the magnetic sensor. If anything looked or read as unusual, trust it — re-check that spot by hand.",
              'आपने कमरे को रोशनी, AI विज़न और मैग्नेटिक सेंसर से जांचा। अगर कुछ असामान्य दिखा या पढ़ा, तो उस पर भरोसा करें — उस जगह को हाथ से दोबारा जांचें।')}</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <h4 className="font-bold text-red-300 flex items-center gap-2 mb-1"><AlertTriangle className="w-5 h-5" /> {L(lang, 'If you found a device', 'अगर कोई डिवाइस मिले')}</h4>
            <p className="text-[13px] text-gray-300 leading-relaxed">{L(lang,
              "Don't dismantle it. Photograph it where it sits, save tamper-evident proof in the Evidence Vault, leave the room, and call 112 (police) and 1930 (cybercrime).",
              'उसे खोलें नहीं। जहाँ है वहीं फ़ोटो लें, Evidence Vault में छेड़छाड़-प्रमाण सबूत सेव करें, कमरा छोड़ें, और 112 (पुलिस) तथा 1930 (साइबर क्राइम) पर कॉल करें।')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/evidence" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-2.5 font-bold text-sm text-center transition flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4" /> {L(lang, 'Save evidence', 'सबूत सेव करें')}
            </Link>
            <button onClick={onExit} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 font-bold text-sm transition">
              {L(lang, 'Done', 'पूरा हुआ')}
            </button>
          </div>
        </div>
      ),
    },
  ];

  const last = steps.length - 1;
  const cur = steps[step];

  return (
    <div className="space-y-4">
      {/* stepper */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-cyan-400' : 'bg-white/10'}`} />
            <span className={`block text-[9px] mt-1 text-center font-bold uppercase tracking-wide ${i === step ? 'text-cyan-300' : 'text-gray-600'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] font-black uppercase tracking-widest text-cyan-300/70 mb-2">
          {L(lang, 'Step', 'चरण')} {step + 1} / {steps.length} · {cur.label}
        </div>
        {cur.body}
      </div>

      {/* nav */}
      <div className="flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 px-4 font-bold text-sm transition flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> {L(lang, 'Back', 'पीछे')}
          </button>
        )}
        {step < last ? (
          <button onClick={() => setStep((s) => s + 1)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 rounded-xl py-2.5 font-bold text-sm transition flex items-center justify-center gap-1.5">
            {step === 0 ? L(lang, 'Start sweep', 'स्वीप शुरू करें') : L(lang, 'Next step', 'अगला चरण')} <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HUB SHELL
   ═══════════════════════════════════════════════════════════ */
const MODULES: { id: ModuleId; icon: any; label: [string, string]; desc: [string, string]; tag: [string, string] }[] = [
  { id: 'inspect', icon: Camera, label: ['AI Room Inspector', 'AI रूम इंस्पेक्टर'], desc: ['Video sweep → AI flags what to check by hand', 'वीडियो स्वीप → AI जांच-योग्य चीज़ें चिह्नित करे'], tag: ['Real AI vision', 'असली AI विज़न'] },
  { id: 'emf', icon: Radar, label: ['EMF Scan', 'EMF स्कैन'], desc: ['Find hidden electronics with the magnetometer', 'मैग्नेटोमीटर से छुपे इलेक्ट्रॉनिक्स खोजें'], tag: ['Real sensor', 'असली सेंसर'] },
  { id: 'lens', icon: Flashlight, label: ['Lens Sweep', 'लेंस स्वीप'], desc: ['Camera aid to spot lens reflections', 'लेंस की चमक पकड़ने की कैमरा सहायता'], tag: ['Real camera', 'असली कैमरा'] },
  { id: 'playbooks', icon: BookOpen, label: ['Inspection Playbooks', 'जांच प्लेबुक्स'], desc: ['Checklists for hotels, rentals, vehicles…', 'होटल, किराये, वाहन… की चेकलिस्ट'], tag: ['Expert guide', 'विशेषज्ञ गाइड'] },
  { id: 'hardware', icon: Cpu, label: ['Pro Hardware', 'प्रो हार्डवेयर'], desc: ['RF, thermal & device discovery roadmap', 'RF, थर्मल और डिवाइस-खोज रोडमैप'], tag: ['Coming', 'जल्द'] },
];

export default function SentinelHub() {
  const [active, setActive] = useState<ModuleId>('overview');
  // Global language store — same toggle as the app header.
  const lang = useLanguage((s) => s.lang);
  const toggleLang = useLanguage((s) => s.toggle);
  const idx = lang === 'en' ? 0 : 1;

  const Current = () => {
    switch (active) {
      case 'sweep': return <SweepWizard lang={lang} onExit={() => setActive('overview')} />;
      case 'inspect': return <RoomInspector lang={lang} />;
      case 'emf': return <EmfScan lang={lang} />;
      case 'lens': return <LensSweep lang={lang} />;
      case 'playbooks': return <Playbooks lang={lang} />;
      case 'hardware': return <HardwareRoadmap lang={lang} />;
      default: return null;
    }
  };

  const activeMeta = MODULES.find((m) => m.id === active);
  const activeTitle =
    active === 'sweep' ? [L(lang, 'Full Sweep', 'पूरा स्वीप'), ''] : activeMeta?.label;
  const ActiveIcon = active === 'sweep' ? PlayCircle : activeMeta?.icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* header */}
      <div className="relative text-center mb-6">
        <button
          onClick={toggleLang}
          className="absolute right-0 top-0 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs font-bold transition"
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'हिं' : 'EN'}
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-black uppercase tracking-widest mb-3">
          <ShieldCheck className="w-4 h-4" /> QuantumShield Sentinel
        </div>
        <h1 className="text-3xl font-black tracking-tight">{L(lang, 'Privacy & Surveillance Sweep', 'निजता और निगरानी स्वीप')}</h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">{L(lang,
          "Find hidden cameras, microphones and trackers using your phone's real sensors and AI — on-device, explained in plain language, no fake readings.",
          'अपने फ़ोन के असली सेंसर और AI से छुपे कैमरे, माइक और ट्रैकर खोजें — डिवाइस पर ही, सरल भाषा में समझाया, कोई नकली रीडिंग नहीं।')}</p>
      </div>

      {active === 'overview' ? (
        <>
          {/* full sweep CTA */}
          <button
            onClick={() => setActive('sweep')}
            className="w-full mb-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 hover:from-cyan-500/25 hover:to-blue-500/20 p-4 flex items-center gap-3 transition text-left group"
          >
            <PlayCircle className="w-9 h-9 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <h3 className="font-black">{L(lang, 'Start Full Sweep', 'पूरा स्वीप शुरू करें')}</h3>
              <p className="text-[12px] text-gray-400">{L(lang, 'Guided: dim lights → lens → AI video sweep → EMF → what to do', 'गाइडेड: रोशनी कम → लेंस → AI वीडियो स्वीप → EMF → आगे क्या करें')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
          </button>

          <div className="grid sm:grid-cols-2 gap-3">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setActive(m.id)} className="text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition p-4 group">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-300/80">{m.tag[idx]}</span>
                  </div>
                  <h3 className="font-bold text-sm">{m.label[idx]}</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{m.desc[idx]}</p>
                </button>
              );
            })}
            <Link href="/evidence" className="text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition p-4 group">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-300/80">{L(lang, 'Forensic', 'फ़ॉरेंसिक')}</span>
              </div>
              <h3 className="font-bold text-sm">{L(lang, 'Evidence Vault', 'एविडेंस वॉल्ट')}</h3>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{L(lang, 'Capture tamper-evident proof (SHA-256)', 'छेड़छाड़-प्रमाण सबूत लें (SHA-256)')}</p>
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 flex gap-3">
            <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[13px] text-gray-400 leading-relaxed">
              <span className="font-bold text-gray-200">{L(lang, 'How to do a full sweep:', 'पूरा स्वीप कैसे करें:')}</span>{' '}
              {L(lang, 'dim the lights →', 'रोशनी कम करें →')}{' '}
              <button onClick={() => setActive('lens')} className="text-cyan-400 underline">{L(lang, 'Lens Sweep', 'लेंस स्वीप')}</button> →{' '}
              <button onClick={() => setActive('inspect')} className="text-cyan-400 underline">{L(lang, 'AI Room Inspector', 'AI रूम इंस्पेक्टर')}</button> →{' '}
              <button onClick={() => setActive('emf')} className="text-cyan-400 underline">{L(lang, 'EMF Scan', 'EMF स्कैन')}</button> →{' '}
              {L(lang, 'if you find something, preserve evidence and call', 'कुछ मिले तो सबूत सुरक्षित करें और कॉल करें')}{' '}
              <strong>112</strong> / <strong>1930</strong>.
            </div>
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setActive('overview')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> {L(lang, 'All Sentinel tools', 'सभी सेंटिनल टूल')}
          </button>
          {ActiveIcon && activeTitle && (
            <div className="flex items-center gap-3 mb-4">
              <ActiveIcon className="w-7 h-7 text-cyan-400" />
              <div>
                <h2 className="text-xl font-black">{activeTitle[idx]}</h2>
                {activeMeta && <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/70">{activeMeta.tag[idx]}</span>}
              </div>
            </div>
          )}
          <Current />
        </>
      )}
    </div>
  );
}
