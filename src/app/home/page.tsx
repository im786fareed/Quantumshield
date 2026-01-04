'use client';
import { Shield, Mic, Lock, DeviceSmartphone, FileText, Zap, Activity, LayoutGrid, PlayCircle } from 'lucide-react';
import ThreatMap from '@/components/ThreatMap';
import Link from 'next/link';

export default function HomePage() {
  const protectionFeatures = [
    { name: 'AI Call Analyzer', icon: Mic, path: '/aianalyzer', color: 'text-red-400' },
    { name: 'Device Scanner', icon: DeviceSmartphone, path: '/devicescan', color: 'text-cyan-400' },
    { name: 'Evidence Vault', icon: Lock, path: '/evidence', color: 'text-emerald-400' },
    { name: 'Privacy Shield', icon: Shield, path: '/privacy', color: 'text-indigo-400' },
    { name: 'Police Reporter', icon: FileText, path: '/reporter', color: 'text-orange-400' },
    { name: 'File Encryption', icon: Zap, path: '/encryption', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-12 pb-24">
      {/* 1. DEFENSE TERMINAL (The "Missing" Features) */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <LayoutGrid className="text-indigo-400 w-6 h-6" />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Defense Terminal</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {protectionFeatures.map((f, i) => (
            <Link key={i} href={f.path} className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:border-indigo-500/50 transition-all">
              <div className={`p-4 bg-black/40 rounded-2xl mb-4 group-hover:scale-110 transition ${f.color}`}>
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold uppercase tracking-tight text-sm">{f.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. TRACES OF CYBER FRAUD (The Map from your screenshot) */}
      <section className="bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <Activity className="text-red-500 w-5 h-5" />
          <h2 className="text-xl font-black uppercase tracking-tighter">Traces of Cyber Fraud Worldwide</h2>
        </div>
        <div className="p-8">
          <ThreatMap />
        </div>
      </section>

      {/* 3. USER EDUCATION TAB */}
      <section className="bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] p-12 text-center">
        <PlayCircle className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Education Insight Center</h2>
        <Link href="/education" className="inline-block bg-indigo-600 px-12 py-4 rounded-2xl font-black shadow-xl">
          LEARN HOW TO PROTECT YOURSELF
        </Link>
      </section>
    </div>
  );
}