'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video, Monitor, Square, Camera, X,
  CheckCircle, Loader2, ShieldAlert, Download, AlertTriangle
} from 'lucide-react';

import { saveEvidence } from '@/lib/evidenceVault';

/* Direct-download fallback — evidence is never lost */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
}

/* ══════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════ */
function fmt(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function bestMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find(m => {
    try { return MediaRecorder.isTypeSupported(m); } catch { return false; }
  }) ?? '';
}

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
type Phase = 'idle' | 'choosing' | 'recording' | 'saving' | 'saved' | 'downloaded' | 'error';

/* ══════════════════════════════════════════════
   Component
══════════════════════════════════════════════ */
export default function FloatingRecorder() {
  const [phase,     setPhase]     = useState<Phase>('idle');
  const [seconds,   setSeconds]   = useState(0);
  const [errMsg,    setErrMsg]    = useState('');
  const [recMode,   setRecMode]   = useState<'camera' | 'screen'>('camera');
  const [savedName, setSavedName] = useState('');

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  /* Mirror of `seconds` — handleStop's [] closure would otherwise read 0 */
  const secondsRef  = useRef(0);
  const streamRef   = useRef<MediaStream | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewRef  = useRef<HTMLVideoElement>(null);
  /* Keep blob for download-fallback */
  const finalBlobRef  = useRef<Blob | null>(null);
  const finalNameRef  = useRef('');

  useEffect(() => () => stopAll(), []);

  function stopAll() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  }

  /* ── Start ── */
  const startRecording = useCallback(async (mode: 'camera' | 'screen') => {
    setErrMsg('');
    setRecMode(mode);
    chunksRef.current = [];

    try {
      let stream: MediaStream;
      if (mode === 'screen') {
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { frameRate: 30 },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', frameRate: { ideal: 30 } },
          audio: true,
        });
      }
      streamRef.current = stream;

      /* Live preview */
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        previewRef.current.play().catch(() => {});
      }

      const mime = bestMime();
      const rec  = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      rec.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop          = handleStop;
      rec.start(500);
      mediaRecRef.current = rec;

      /* Handle native "Stop sharing" click */
      stream.getVideoTracks()[0]?.addEventListener('ended', stopRecording);

      setSeconds(0);
      secondsRef.current = 0;
      setPhase('recording');
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'Camera / microphone permission denied. Tap the camera icon in your browser address bar and allow access, then try again.'
          : err?.name === 'NotFoundError'
          ? 'No camera or microphone found on this device.'
          : err?.name === 'NotSupportedError'
          ? 'Screen recording is not supported on this browser. Use Camera mode instead.'
          : `Could not start: ${err?.message ?? err}`;
      setErrMsg(msg);
      setPhase('error');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Stop ── */
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    try { mediaRecRef.current?.stop(); } catch { /* already stopped */ }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  }, []);

  /* ── After stop: save → fallback download ── */
  const handleStop = useCallback(async () => {
    setPhase('saving');

    /* Build the blob */
    const chunks   = chunksRef.current;
    const mimeType = chunks[0]?.type || 'video/webm';
    const ext      = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob     = new Blob(chunks, { type: mimeType });
    const name     = `Evidence_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.${ext}`;

    finalBlobRef.current = blob;
    finalNameRef.current  = name;

    /* Guard: empty recording */
    if (blob.size === 0) {
      setErrMsg('Recording was too short — no data captured. Please record for at least 1 second.');
      setPhase('error');
      return;
    }

    /* Try the encrypted vault first */
    try {
      await saveEvidence(blob, name, secondsRef.current);
      setSavedName(name);
      setPhase('saved');
      setTimeout(() => setPhase('idle'), 4000);
    } catch (dbErr: any) {
      /* Vault failed → auto-download so evidence is never lost */
      console.warn('[FloatingRecorder] IndexedDB save failed:', dbErr?.message);
      try {
        downloadBlob(blob, name);
        setSavedName(name);
        setPhase('downloaded');
        setTimeout(() => setPhase('idle'), 5000);
      } catch {
        setErrMsg('Could not save or download the recording. Check available storage.');
        setPhase('error');
      }
    }
  }, []);

  const dismiss = () => { stopAll(); setPhase('idle'); setErrMsg(''); };

  /* ══════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════ */

  /* IDLE — floating button */
  if (phase === 'idle') return (
    <button
      onClick={() => setPhase('choosing')}
      title="Start Evidence Recording"
      aria-label="Start Evidence Recording"
      className="
        fixed bottom-24 right-4 z-[9999]
        w-14 h-14 rounded-full
        bg-gradient-to-br from-red-600 to-rose-700
        shadow-lg shadow-red-700/50
        flex items-center justify-center
        hover:scale-110 active:scale-95 transition-transform
        ring-2 ring-red-500/30
      "
    >
      <Video className="w-6 h-6 text-white" />
      <span className="absolute inset-0 rounded-full ring-2 ring-red-400 animate-ping opacity-25 pointer-events-none" />
    </button>
  );

  /* CHOOSING mode */
  if (phase === 'choosing') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-72
      bg-slate-900 border border-slate-700/70 rounded-2xl
      shadow-2xl shadow-black/60 p-4 flex flex-col gap-3
    ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-white font-bold text-sm">Evidence Recorder</span>
        </div>
        <button onClick={dismiss} className="text-slate-500 hover:text-white transition p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">
        Encrypted &amp; saved to your <span className="text-emerald-400 font-semibold">Evidence Vault</span> on this device — zero cloud upload.
      </p>

      {/* Camera */}
      <button
        onClick={() => startRecording('camera')}
        className="
          flex items-center gap-3 text-left
          bg-red-600/20 border border-red-500/40 hover:bg-red-600/30
          rounded-xl px-4 py-3 transition group
        "
      >
        <div className="p-2 bg-red-600/30 rounded-lg group-hover:bg-red-600/50 transition">
          <Camera className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Camera Recording</div>
          <div className="text-slate-400 text-xs">Physical scene · all devices including iOS</div>
        </div>
      </button>

      {/* Screen */}
      <button
        onClick={() => startRecording('screen')}
        className="
          flex items-center gap-3 text-left
          bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30
          rounded-xl px-4 py-3 transition group
        "
      >
        <div className="p-2 bg-blue-600/30 rounded-lg group-hover:bg-blue-600/50 transition">
          <Monitor className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Screen Recording</div>
          <div className="text-slate-400 text-xs">Captures screen · desktop &amp; Android Chrome</div>
        </div>
      </button>

      <p className="text-[10px] text-slate-600 text-center">
        Auto date/time stamped · stored only on this device
      </p>
    </div>
  );

  /* RECORDING */
  if (phase === 'recording') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-72
      bg-slate-900 border border-red-500/60 rounded-2xl
      shadow-2xl shadow-red-900/40 overflow-hidden
    ">
      {/* Live preview */}
      <div className="relative bg-black w-full" style={{ aspectRatio: '16/9' }}>
        <video
          ref={previewRef}
          className="w-full h-full object-cover"
          autoPlay muted playsInline
        />
        {/* REC badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 rounded-full px-2.5 py-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-xs font-black tracking-widest">REC</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-[10px] text-slate-300 uppercase">
          {recMode}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white font-black text-2xl tabular-nums">{fmt(seconds)}</div>
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">Recording…</div>
        </div>
        <button
          onClick={stopRecording}
          className="
            flex items-center gap-2
            bg-red-600 hover:bg-red-700 active:scale-95
            text-white font-bold text-sm px-4 py-2.5
            rounded-xl transition shadow-lg shadow-red-700/30
          "
        >
          <Square className="w-4 h-4 fill-white" />
          STOP
        </button>
      </div>
    </div>
  );

  /* SAVING */
  if (phase === 'saving') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-64
      bg-slate-900 border border-slate-700/70 rounded-2xl
      shadow-2xl p-5 flex flex-col items-center gap-3 text-center
    ">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <div className="text-white font-semibold text-sm">Saving to Evidence Vault…</div>
      <div className="text-slate-400 text-xs">Stays on your device — no cloud upload</div>
    </div>
  );

  /* SAVED to IndexedDB */
  if (phase === 'saved') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-72
      bg-emerald-950 border border-emerald-500/50 rounded-2xl
      shadow-2xl shadow-emerald-900/30 p-5 flex flex-col gap-3
    ">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />
        <div>
          <div className="text-emerald-300 font-bold text-sm">Saved to Evidence Vault ✓</div>
          <div className="text-emerald-700 text-xs">Duration: {fmt(seconds)}</div>
        </div>
      </div>
      <p className="text-emerald-700 text-xs leading-relaxed">
        Open <span className="text-emerald-400 font-semibold">/evidence</span> to view, download, or attach to your police FIR report.
      </p>
      <Link
        href="/evidence"
        className="
          text-center bg-emerald-600/30 border border-emerald-500/40
          hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold
          rounded-xl py-2 transition
        "
      >
        Open Evidence Vault →
      </Link>
    </div>
  );

  /* DOWNLOADED (IndexedDB failed, file saved to device downloads) */
  if (phase === 'downloaded') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-72
      bg-blue-950 border border-blue-500/50 rounded-2xl
      shadow-2xl p-5 flex flex-col gap-3
    ">
      <div className="flex items-center gap-3">
        <Download className="w-7 h-7 text-blue-400 shrink-0" />
        <div>
          <div className="text-blue-300 font-bold text-sm">Saved to Downloads ✓</div>
          <div className="text-blue-700 text-xs">Duration: {fmt(seconds)}</div>
        </div>
      </div>
      <p className="text-blue-700 text-xs leading-relaxed">
        The vault was unavailable so the recording was downloaded directly to your device. Check your Downloads folder.
      </p>
      <p className="text-[10px] text-blue-900">
        File: <span className="text-blue-600 font-mono break-all">{savedName}</span>
      </p>
    </div>
  );

  /* ERROR */
  if (phase === 'error') return (
    <div className="
      fixed bottom-24 right-4 z-[9999] w-72
      bg-slate-900 border border-red-500/40 rounded-2xl
      shadow-2xl p-4 flex flex-col gap-3
    ">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-red-300 font-semibold text-sm">Recording failed</div>
          <div className="text-slate-400 text-xs mt-1 leading-relaxed">{errMsg}</div>
        </div>
      </div>

      {/* If blob was captured but vault failed, offer manual download */}
      {finalBlobRef.current && finalBlobRef.current.size > 0 && (
        <button
          onClick={() => downloadBlob(finalBlobRef.current!, finalNameRef.current)}
          className="
            flex items-center justify-center gap-2
            bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30
            text-blue-300 text-xs font-semibold rounded-xl py-2.5 transition
          "
        >
          <Download className="w-4 h-4" />
          Download recording anyway
        </button>
      )}

      <button
        onClick={dismiss}
        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl py-2 transition"
      >
        Dismiss
      </button>
    </div>
  );

  return null;
}
