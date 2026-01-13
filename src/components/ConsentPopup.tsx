'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Mic, MapPin, X } from 'lucide-react';

export default function ConsentPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user already consented in 2026
    const hasConsented = localStorage.getItem('qs_consent_2026');
    if (!hasConsented) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('qs_consent_2026', 'true');
    setIsOpen(false);
    // Trigger initial permission request to the browser
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-indigo-500/30 max-w-md w-full rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-500/20 p-4 rounded-full">
            <ShieldCheck className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center uppercase tracking-tighter italic mb-4">
          Privacy <span className="text-indigo-500">First</span> Setup
        </h2>

        <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
          To protect you from "Digital Arrest" scams, QuantumShield needs your permission for two local-only features:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 items-start bg-black/40 p-4 rounded-2xl border border-white/5">
            <Mic className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
            <div>
              <p className="text-xs font-bold text-white uppercase">Microphone (Local Only)</p>
              <p className="text-[10px] text-slate-500 leading-tight">Analyzes voice artifacts for deepfakes. Audio is never recorded or uploaded.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-black/40 p-4 rounded-2xl border border-white/5">
            <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
            <div>
              <p className="text-xs font-bold text-white uppercase">GPS Location</p>
              <p className="text-[10px] text-slate-500 leading-tight">Only used during an SOS trigger to alert your family. Data stays on your device.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleAccept}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
        >
          I AGREE & PROTECT ME
        </button>

        <p className="text-[9px] text-center text-slate-600 mt-4 uppercase">
          Compliant with DPDP Act 2023 & IT Act.
        </p>
      </div>
    </div>
  );
}