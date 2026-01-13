'use client';
import { useEffect, useState } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

export default function BehavioralTracker() {
  const [tremorLevel, setTremorLevel] = useState(0);
  const [isStressed, setIsStressed] = useState(false);

  useEffect(() => {
    // Check if the browser supports Device Motion API
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      // Required for iOS 13+
      (DeviceMotionEvent as any).requestPermission();
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      // Calculate the magnitude of motion
      const magnitude = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      
      // Simple logic to detect high-frequency tremors
      // In 2026, this would be passed to a local ML model
      const normalizedTremor = Math.min(magnitude / 20, 1);
      setTremorLevel(normalizedTremor);
      
      // If motion is erratic, flag high stress
      setIsStressed(normalizedTremor > 0.75);
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isStressed ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Biometric Stress Analysis
          </h3>
        </div>
        {isStressed && (
          <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-3 py-1 rounded-full border border-red-500/30 animate-bounce">
            HIGH STRESS DETECTED
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Tremor Meter */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${isStressed ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: `${tremorLevel * 100}%` }}
          />
        </div>

        <div className="flex items-start gap-3 mt-4 bg-black/40 p-4 rounded-2xl border border-white/5">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter">
            System is monitoring device handling. Unnatural tremors during calls 
            may indicate a coercive "Digital Arrest" environment.
          </p>
        </div>
      </div>
    </div>
  );
}