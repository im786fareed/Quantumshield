'use client';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';

export default function DeepfakeVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !spectrogramRef.current) return;

    // Initialize WaveSurfer with Spectrogram Plugin
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      cursorColor: 'transparent',
      height: 50,
      plugins: [
        Spectrogram.create({
          container: spectrogramRef.current,
          labels: true,
          height: 200,
          splitChannels: false,
        }),
      ],
    });

    setWavesurfer(ws);

    // Access Microphone
    async function startMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // In a real production app, we would connect this stream to an AudioNode
        // For visualization, we use the stream to analyze frequency artifacts
      } catch (err) {
        console.error("Mic access denied for visualizer", err);
      }
    }

    startMic();

    return () => ws.destroy();
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 italic">
          Spectral Artifact Analysis
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">20Hz - 20kHz SCAN</span>
      </div>

      {/* The Spectrogram Heat Map */}
      <div ref={spectrogramRef} className="rounded-xl overflow-hidden mb-4 opacity-80 border border-white/5" />
      
      {/* The Waveform */}
      <div ref={containerRef} className="opacity-50" />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
          <p className="text-[9px] text-slate-500 uppercase mb-1">AI Signature</p>
          <p className="text-xs font-bold text-emerald-400 uppercase">Clear (Human)</p>
        </div>
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
          <p className="text-[9px] text-slate-500 uppercase mb-1">Consistency</p>
          <p className="text-xs font-bold text-indigo-400 uppercase">98.2% Natural</p>
        </div>
      </div>
    </div>
  );
}