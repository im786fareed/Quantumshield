'use client';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface SafetyScoreProps {
  score: number; // 0 to 100
}

export default function SafetyScore({ score }: SafetyScoreProps) {
  // Determine color and status based on the trust score
  const getStatus = (s: number) => {
    if (s >= 90) return { label: 'Secure', color: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (s >= 70) return { label: 'Moderate Risk', color: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { label: 'High Threat', color: 'text-red-500', border: 'border-red-500/50' };
  };

  const status = getStatus(score);

  return (
    <div className={`bg-slate-900/40 border ${status.border} p-8 rounded-[3rem] shadow-2xl backdrop-blur-md flex flex-col items-center text-center`}>
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        {/* Animated Gauge Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="96" cy="96" r="88" 
            className="stroke-slate-800 fill-none" 
            strokeWidth="12" 
          />
          <circle 
            cx="96" cy="96" r="88" 
            className={`fill-none transition-all duration-1000 ease-out ${status.color.replace('text', 'stroke')}`}
            strokeWidth="12"
            strokeDasharray={552.92}
            strokeDashoffset={552.92 - (552.92 * score) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Central Icon & Percentage */}
        <div className="flex flex-col items-center">
          {score >= 90 ? <ShieldCheck className="w-10 h-10 text-emerald-400" /> : 
           score >= 70 ? <Shield className="w-10 h-10 text-yellow-400" /> : 
           <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />}
          <span className="text-4xl font-black tracking-tighter mt-2">{score}%</span>
        </div>
      </div>

      <div>
        <h2 className={`text-xl font-black uppercase tracking-tighter italic ${status.color}`}>
          {status.label}
        </h2>
        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-2">
          Safety Trust Index (STI-v1)
        </p>
      </div>

      {/* Trust Messaging */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-6">
        <div className="text-left">
          <p className="text-[9px] text-slate-500 uppercase mb-1">Human Confidence</p>
          <p className="text-xs font-bold uppercase tracking-tight italic">Analyzing...</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 uppercase mb-1">Scam Likelihood</p>
          <p className={`text-xs font-bold uppercase tracking-tight italic ${score < 70 ? 'text-red-500' : 'text-slate-400'}`}>
            {100 - score}%
          </p>
        </div>
      </div>
    </div>
  );
}