'use client';
import { 
  Shield, Mic, Lock, DeviceSmartphone, FileText, Zap, 
  PlayCircle, MessageCircle, Send, ExternalLink, Activity, Info 
} from 'lucide-react';
import ThreatMap from '@/components/ThreatMap';
import ScamDatabase from '@/components/ScamDatabase';
import Link from 'next/link';

export default function HomePage() {
  const protectionFeatures = [
    { name: 'AI Call Analyzer', icon: Mic, path: '/aianalyzer', color: 'text-red-400', desc: 'Detects Scam Voices' },
    { name: 'Device Scanner', icon: DeviceSmartphone, path: '/devicescan', color: 'text-cyan-400', desc: 'Finds Malware/AnyDesk' },
    { name: 'Evidence Vault', icon: Lock, path: '/evidence', color: 'text-emerald-400', desc: 'Save Scam Screenshots' },
    { name: 'Privacy Shield', icon: Shield, path: '/privacy', color: 'text-indigo-400', desc: 'AI Privacy Auditor' },
    { name: 'Police Reporter', icon: FileText, path: '/reporter', color: 'text-orange-400', desc: 'Instant 1930 Reports' },
    { name: 'File Encryption', icon: Zap, path: '/encryption', color: 'text-yellow-400', desc: 'Lock Sensitive Docs' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 space-y-16 pb-24">
      
      {/* 1. DEFENSE TERMINAL (Your Core Tools) */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Shield className="text-indigo-400 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Personal Defense Terminal</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {protectionFeatures.map((feature, i) => (
            <Link key={i} href={feature.path} className="group">
              <div className="h-full bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all flex flex-col items-center text-center shadow-xl">
                <div className={`p-4 bg-black/40 rounded-2xl mb-4 group-hover:scale-110 transition ${feature.color} shadow-inner`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{feature.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. TRACES OF CYBER FRAUD (Worldwide Map) */}
      <section className="bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Activity className="text-red-500 w-5 h-5" /> Traces of Cyber Fraud Worldwide
            </h2>
            <p className="text-slate-500 text-xs">AI-monitored global threat activity</p>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <ThreatMap />
        </div>
      </section>

      {/* 3. USER EDUCATION & INSIGHTS */}
      <section className="bg-gradient-to-b from-indigo-900/20 to-black border border-indigo-500/20 rounded-[3rem] p-8 md:p-12 text-center">
        <PlayCircle className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Fraud Insight Center</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          Don't be a trace in our database. Learn how scammers operate and how to utilize our features to protect yourself.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-left mb-10 max-w-4xl mx-auto">
           <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
              <Info className="text-indigo-400 w-5 h-5 mt-1 shrink-0" />
              <p className="text-xs text-slate-300">Scammers use "Digital Arrest" tactics to induce panic. Use our <strong>Call Analyzer</strong> to verify threats.</p>
           </div>
           <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
              <Info className="text-indigo-400 w-5 h-5 mt-1 shrink-0" />
              <p className="text-xs text-slate-300">Save screenshots of suspicious WhatsApp chats in the <strong>Evidence Vault</strong> for police reporting.</p>
           </div>
        </div>
        <Link href="/education" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-xl">
          VIEW EDUCATION TAB
        </Link>
      </section>

      {/* 4. COMMUNITIES & SCAM SEARCH */}
      <section className="space-y-6">
        <ScamDatabase />
        <div className="grid md:grid-cols-2 gap-4">
          <a href="https://t.me/QuantumShield_Protection" target="_blank" className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center justify-between hover:bg-blue-600/20 transition">
             <div className="flex items-center gap-4"><Send className="text-blue-400" /> <span className="font-bold">Telegram Community</span></div>
             <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
          <a href="https://whatsapp.com/channel/your-actual-link" target="_blank" className="bg-green-600/10 border border-green-500/20 p-6 rounded-3xl flex items-center justify-between hover:bg-green-600/20 transition">
             <div className="flex items-center gap-4"><MessageCircle className="text-green-400" /> <span className="font-bold">WhatsApp Channel</span></div>
             <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </section>
    </div>
  );
}