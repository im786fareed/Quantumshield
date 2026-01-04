'use client';
import { Shield, MessageCircle, Send, PlayCircle, Zap, ExternalLink, Newspaper, Database } from 'lucide-react';
import ThreatMap from '@/components/ThreatMap';
import ScamDatabase from '@/components/ScamDatabase';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 space-y-12">
      
      {/* 1. HERO SECTION & LIVE THREAT MAP */}
      <section className="relative">
        <ThreatMap />
      </section>

      {/* 2. JOIN THE COMMUNITY (Telegram & WhatsApp) */}
      <section className="grid md:grid-cols-2 gap-6">
        <a 
          href="https://t.me/QuantumShield_Protection" // Replace with your actual Telegram link
          target="_blank"
          className="bg-blue-600/20 border border-blue-500/30 p-8 rounded-[2rem] flex items-center justify-between hover:bg-blue-600/30 transition shadow-lg shadow-blue-500/5"
        >
          <div className="flex items-center gap-4">
            <Send className="w-10 h-10 text-blue-400" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Join Telegram</h3>
              <p className="text-blue-200/60 text-xs font-mono">QuantumShield- Cyber Fraud Protection</p>
            </div>
          </div>
          <ExternalLink className="text-blue-400 opacity-50" />
        </a>

        <a 
          href="https://whatsapp.com/channel/your-link" // Replace with your actual WhatsApp link
          target="_blank"
          className="bg-green-600/20 border border-green-500/30 p-8 rounded-[2rem] flex items-center justify-between hover:bg-green-600/30 transition shadow-lg shadow-green-500/5"
        >
          <div className="flex items-center gap-4">
            <MessageCircle className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Join WhatsApp</h3>
              <p className="text-green-200/60 text-xs font-mono">QuantumShield- Cyber Fraud Protection</p>
            </div>
          </div>
          <ExternalLink className="text-green-400 opacity-50" />
        </a>
      </section>

      {/* 3. LATEST NEWS (Automated simulation for best app feel) */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="text-cyan-400" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Fraud Alerts & News</h2>
        </div>
        <div className="grid gap-4">
          {[
            { tag: 'NEW', text: 'Increase in "Digital Arrest" calls reported in Hyderabad.', date: 'Today' },
            { tag: 'CRITICAL', text: 'Fake CBI profiles detected on WhatsApp video calls.', date: '2 hours ago' },
            { tag: 'ADVISORY', text: 'Authorities warn against "Parcel Tracking" SMS frauds.', date: 'Yesterday' }
          ].map((news, i) => (
            <div key={i} className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-slate-800">
              <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{news.tag}</span>
              <p className="text-sm flex-1">{news.text}</p>
              <span className="text-[10px] text-slate-500 font-mono">{news.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SCAM DATABASE ACCESS */}
      <section>
        <ScamDatabase />
      </section>

      {/* 5. EDUCATIONAL INSIGHTS (The New Video Tab) */}
      <section className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-[3rem] p-10 text-center">
        <PlayCircle className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Fraud Insight Center</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          Watch real-time breakdowns of how scams operate. Knowledge is your first line of defense.
        </p>
        <button 
          onClick={() => window.location.href = '/education'} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-2xl transition shadow-xl shadow-indigo-500/20"
        >
          OPEN INSIGHTS TAB
        </button>
      </section>

    </div>
  );
}