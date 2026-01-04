'use client';
import { 
  Shield, MessageCircle, Send, PlayCircle, Zap, 
  ExternalLink, Newspaper, Mic, Lock, Search, 
  DeviceSmartphone, FileText 
} from 'lucide-react';
import ThreatMap from '@/components/ThreatMap';
import ScamDatabase from '@/components/ScamDatabase';
import Link from 'next/link'; // Critical for navigation

export default function HomePage() {
  const mainFeatures = [
    { name: 'AI Call Analyzer', icon: Mic, path: '/aianalyzer', color: 'text-red-400', desc: 'Real-time Voice Fraud Detection' },
    { name: 'Device Scanner', icon: DeviceSmartphone, path: '/devicescan', color: 'text-cyan-400', desc: 'Military-Grade System Audit' },
    { name: 'Evidence Vault', icon: Lock, path: '/evidence', color: 'text-emerald-400', desc: 'Encrypted Local Storage' },
    { name: 'Privacy Shield', icon: Shield, path: '/privacy', color: 'text-indigo-400', desc: 'AI Privacy Auditor' },
    { name: 'Police Reporter', icon: FileText, path: '/reporter', color: 'text-orange-400', desc: 'Generate 1930 Reports' },
    { name: 'File Encryption', icon: Zap, path: '/encryption', color: 'text-yellow-400', desc: 'Protect Sensitive Docs' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 space-y-12">
      
      {/* 1. LIVE THREAT RADAR */}
      <section className="relative">
        <ThreatMap />
      </section>

      {/* 2. THE FEATURE COMMAND CENTER (Restoring your lost tools) */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Zap className="text-yellow-400" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Defense Terminal</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {mainFeatures.map((feature, i) => (
            <Link key={i} href={feature.path} className="group">
              <div className="h-full bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-500 transition-all flex flex-col items-center text-center">
                <div className={`p-4 bg-black/40 rounded-2xl mb-4 group-hover:scale-110 transition ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{feature.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. COMMUNITY LINKS */}
      <section className="grid md:grid-cols-2 gap-6">
        <a href="https://t.me/QuantumShield_Protection" target="_blank" className="bg-blue-600/20 border border-blue-500/30 p-8 rounded-[2rem] flex items-center justify-between hover:bg-blue-600/30 transition">
          <div className="flex items-center gap-4">
            <Send className="w-10 h-10 text-blue-400" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Telegram</h3>
              <p className="text-blue-200/60 text-xs">Join Fraud Protection Channel</p>
            </div>
          </div>
          <ExternalLink className="text-blue-400 opacity-50" />
        </a>

        <a href="https://whatsapp.com/channel/your-link" target="_blank" className="bg-green-600/20 border border-green-500/30 p-8 rounded-[2rem] flex items-center justify-between hover:bg-green-600/30 transition">
          <div className="flex items-center gap-4">
            <MessageCircle className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">WhatsApp</h3>
              <p className="text-green-200/60 text-xs">Join Cyber Alerts Group</p>
            </div>
          </div>
          <ExternalLink className="text-green-400 opacity-50" />
        </a>
      </section>

      {/* 4. SCAM SEARCH (Live Integration) */}
      <section>
        <ScamDatabase />
      </section>

      {/* 5. INSIGHTS TAB */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-[3rem] p-10 text-center">
        <PlayCircle className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Fraud Insight Center</h2>
        <Link href="/education" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-2xl transition">
          OPEN INSIGHTS TAB
        </Link>
      </section>

    </div>
  );
}