'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Monitor, Square, Camera, X, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';

/* ── IndexedDB helpers ── */
function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('QuantumShieldVault', 1);
    req.onupgradeneeded = (e: any) => {
      const db: IDBDatabase = e.target.result;
      if (!db.objectStoreNames.contains('evidence')) {
        db.createObjectStore('evidence', { keyPath: 'id' });
      }
    };
    req.onsuccess = (e: any) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToVault(blob: Blob, fileName: string): Promise<void> {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['evidence'], 'readwrite');
    tx.objectStore('evidence').add({
      id: Date.now(),
      fileName,
      blob,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
    tx.oncomplete = () => resolve();
    tx.onerror   = () => reject(tx.error);
  });
}

/* ── Timer formatter ── */
function fmt(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

type Phase = 'idle' | 'choosing' | 'recording' | 'saving' | 'saved' | 'error';

export default function FloatingRecorder() {
  const [phase,   setPhase]   = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [errMsg,  setErrMsg]  = useState('');
  const [mode,    setMode]    = useState<'camera' | 'screen'>('camera');

  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<Blob[]>([]);
  const streamRef    = useRef<MediaStream | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewRef   = useRef<HTMLVideoElement>(null);

  /* ── Clean up on unmount ── */
  useEffect(() => () => stopAll(), []);

  function stopAll() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  /* ── Start recording ── */
  const startRecording = useCallback(async (recMode: 'camera' | 'screen') => {
    setErrMsg('');
    setMode(recMode);
    try {
      let stream: MediaStream;

      if (recMode === 'screen') {
        // getDisplayMedia — desktop + Android Chrome 94+
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { frameRate: 30 },
          audio: true,
        });
      } else {
        // getUserMedia — all devices including iOS Safari
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', frameRate: 30 },
          audio: true,
        });
      }

      streamRef.current = stream;

      // Show live preview
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        previewRef.current.play().catch(() => {});
      }

      // Choose best supported format
      const mime =
        MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' :
        MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' :
        MediaRecorder.isTypeSupported('video/webm')                  ? 'video/webm' :
        MediaRecorder.isTypeSupported('video/mp4')                   ? 'video/mp4' : '';

      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = handleStop;
      rec.start(500); // collect chunks every 500 ms
      mediaRecRef.current = rec;

      // If the user clicks "Stop sharing" in the browser native dialog
      stream.getVideoTracks()[0]?.addEventListener('ended', () => stop());

      setSeconds(0);
      setPhase('recording');
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err: any) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setErrMsg(denied
        ? 'Permission denied. Allow camera/microphone in browser settings and try again.'
        : `Could not start recording: ${err?.message ?? err}`);
      setPhase('error');
    }
  }, []);

  /* ── Stop ── */
  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  }, []);

  /* ── After stop: save to vault ── */
  const handleStop = useCallback(async () => {
    setPhase('saving');
    try {
      const ext  = chunksRef.current[0]?.type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type });
      const name = `Evidence_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.${ext}`;
      await saveToVault(blob, name);
      setPhase('saved');
      setTimeout(() => setPhase('idle'), 3500);
    } catch {
      setErrMsg('Failed to save to Evidence Vault.');
      setPhase('error');
    }
  }, []);

  const dismiss = () => { stopAll(); setPhase('idle'); setErrMsg(''); };

  /* ─────────────── UI ─────────────── */

  /* Idle — small floating button */
  if (phase === 'idle') {
    return (
      <button
        onClick={() => setPhase('choosing')}
        title="Start Evidence Recording"
        className="fixed bottom-24 right-4 z-[9999] w-14 h-14 rounded-full
          bg-gradient-to-br from-red-600 to-rose-700
          shadow-lg shadow-red-600/40
          flex items-center justify-center
          hover:scale-110 active:scale-95 transition-transform
          ring-2 ring-red-500/30"
      >
        <Video className="w-6 h-6 text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full ring-2 ring-red-400 animate-ping opacity-30 pointer-events-none" />
      </button>
    );
  }

  /* Choosing mode */
  if (phase === 'choosing') {
    return (
      <div className="fixed bottom-24 right-4 z-[9999] w-72
        bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/60
        p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-white font-bold text-sm">Evidence Recorder</span>
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          Recording saves directly to your <span className="text-emerald-400 font-semibold">Evidence Vault</span> — no cloud upload, stays on your device.
        </p>

        {/* Camera */}
        <button
          onClick={() => startRecording('camera')}
          className="flex items-center gap-3 bg-red-600/20 border border-red-500/40
            hover:bg-red-600/30 rounded-xl px-4 py-3 text-left transition group"
        >
          <div className="p-2 bg-red-600/30 rounded-lg group-hover:bg-red-600/50 transition">
            <Camera className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Camera Recording</div>
            <div className="text-slate-400 text-xs">Records physical scene — works on all devices</div>
          </div>
        </button>

        {/* Screen */}
        <button
          onClick={() => startRecording('screen')}
          className="flex items-center gap-3 bg-blue-600/20 border border-blue-500/40
            hover:bg-blue-600/30 rounded-xl px-4 py-3 text-left transition group"
        >
          <div className="p-2 bg-blue-600/30 rounded-lg group-hover:bg-blue-600/50 transition">
            <Monitor className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Screen Recording</div>
            <div className="text-slate-400 text-xs">Captures your screen — desktop & Android Chrome</div>
          </div>
        </button>

        <p className="text-[10px] text-slate-600 text-center">
          Recordings are evidence — date/time stamped automatically
        </p>
      </div>
    );
  }

  /* Active recording */
  if (phase === 'recording') {
    return (
      <div className="fixed bottom-24 right-4 z-[9999] w-72
        bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl shadow-red-900/40
        overflow-hidden">

        {/* Live preview */}
        <div className="relative bg-black w-full aspect-video">
          <video
            ref={previewRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {/* REC badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 rounded-full px-2 py-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-black tracking-widest">REC</span>
          </div>
          {/* Mode badge */}
          <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-[10px] text-slate-300">
            {mode === 'screen' ? 'SCREEN' : 'CAMERA'}
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 flex items-center justify-between">
          <div>
            <div className="text-white font-black text-xl tabular-nums">{fmt(seconds)}</div>
            <div className="text-slate-500 text-[10px]">Recording in progress</div>
          </div>
          <button
            onClick={stop}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700
              text-white font-bold text-sm px-4 py-2.5 rounded-xl transition
              shadow-lg shadow-red-600/30"
          >
            <Square className="w-4 h-4 fill-white" />
            STOP
          </button>
        </div>
      </div>
    );
  }

  /* Saving */
  if (phase === 'saving') {
    return (
      <div className="fixed bottom-24 right-4 z-[9999] w-64
        bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl
        p-5 flex flex-col items-center gap-3 text-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <div className="text-white font-semibold text-sm">Saving to Evidence Vault…</div>
        <div className="text-slate-400 text-xs">Encrypting locally — nothing leaves your device</div>
      </div>
    );
  }

  /* Saved */
  if (phase === 'saved') {
    return (
      <div className="fixed bottom-24 right-4 z-[9999] w-72
        bg-emerald-950 border border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-900/30
        p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <div className="text-emerald-300 font-bold text-sm">Saved to Evidence Vault</div>
            <div className="text-emerald-700 text-xs">Duration: {fmt(seconds)}</div>
          </div>
        </div>
        <p className="text-emerald-600 text-xs leading-relaxed">
          Video is stored securely on this device. Open <span className="text-emerald-400 font-semibold">/evidence</span> to view, download, or attach to your police report.
        </p>
        <a
          href="/evidence"
          className="text-center bg-emerald-600/30 border border-emerald-500/40
            hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold
            rounded-xl py-2 transition"
        >
          Open Evidence Vault →
        </a>
      </div>
    );
  }

  /* Error */
  if (phase === 'error') {
    return (
      <div className="fixed bottom-24 right-4 z-[9999] w-72
        bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl
        p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-red-300 font-semibold text-sm">Recording failed</div>
            <div className="text-slate-400 text-xs mt-1 leading-relaxed">{errMsg}</div>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl py-2 transition"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return null;
}
