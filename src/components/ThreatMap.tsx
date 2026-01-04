'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ShieldCheck, Zap, AlertCircle, Map as MapIcon } from 'lucide-react';
interface Threat {
  id: number;
  type: string;
  location: string;
  x: number;
  y: number;
}

export default function ThreatMap({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [activeInterceptions, setActiveInterceptions] = useState(0);

  const threatTypes = ['Digital Arrest Blocked', 'Data Loss Prevented', 'Phishing URL Neutralized', 'Remote Access Blocked'];
  const locations = ['Mumbai, IN', 'Delhi, IN', 'Hyderabad, IN', 'Bangalore, IN', 'Dubai, UAE', 'London, UK', 'New York, USA'];

  // Simulation logic to generate random "Threat Interceptions"
  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        x: Math.floor(Math.random() * 80) + 10, // Keep away from edges
        y: Math.floor(Math.random() * 80) + 10,
      };

      setThreats(prev => [...prev.slice(-4), newThreat]); // Keep last 5 threats
      setActiveInterceptions(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="flex flex-col md:flex-row justify-between items-start mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Global Threat Intelligence</h2>
          </div>
          <p className="text-slate-500 text-sm font-mono">Live Interceptions across the QuantumShield Network</p>
        </div>
        
        <div className="mt-4 md:mt-0 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Interceptions</div>
          <div className="text-3xl font-black text-cyan-400 font-mono">{activeInterceptions.toLocaleString()}</div>
        </div>
      </div>

      {/* The Visual Map Area */}
      <div className="relative aspect-video bg-slate-900/50 rounded-[2rem] border border-slate-800 overflow-hidden mb-8">
        <MapIcon className="absolute inset-0 w-full h-full text-slate-800/20 p-20" />
        
        <AnimatePresence>
          {threats.map((threat) => (
            <motion.div
              key={threat.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {/* Radar Pulse Effect */}
              <div className="absolute inset-0 w-12 h-12 bg-cyan-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping" />
              <div className="relative z-10 p-2 bg-slate-950 border border-cyan-500/50 rounded-lg shadow-xl flex items-center gap-3 whitespace-nowrap">
                <div className="p-1.5 bg-cyan-500/20 rounded-md">
                  <Zap className="w-3 h-3 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-white uppercase leading-none">{threat.type}</div>
                  <div className="text-[8px] text-slate-400 font-mono mt-0.5">{threat.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {threats.map((threat) => (
          <div key={threat.id} className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50 animate-in slide-in-from-right-4">
             <AlertCircle className="w-5 h-5 text-red-500" />
             <div className="flex-1">
               <div className="text-xs font-bold text-slate-200">{threat.type}</div>
               <div className="text-[10px] text-slate-500 font-mono italic">Source suppressed for privacy • {threat.location}</div>
             </div>
             <div className="px-2 py-1 bg-green-500/10 rounded border border-green-500/20 text-[8px] font-black text-green-400 uppercase">Blocked</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-8 opacity-20 grayscale text-[9px] font-mono text-white uppercase tracking-widest">
          <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Real-time Nodes: 4,129</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Latency: 14ms</span>
      </div>
    </div>
  );
}