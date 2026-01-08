'use client';
import { Play, ShieldCheck, AlertCircle, Smartphone, Globe, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EducationPage() {
  const fraudInsights = [
    {
      title: "Digital Arrest Scam",
      type: "High Alert",
      desc: "How scammers pose as CBI/Police on WhatsApp video calls to threaten you into 'Digital Arrest'.",
      videoId: "vS0_W9U5280", // Official CyberDost Alert
      color: "border-red-500/50 bg-red-500/5"
    },
    {
      title: "Remote Access Fraud",
      type: "Device Risk",
      desc: "Why you should never install AnyDesk or TeamViewer on a stranger's request.",
      videoId: "kYIeXbQhVuo", // Safety breakdown
      color: "border-blue-500/50 bg-blue-500/5"
    },
    {
      title: "UPI / QR Code Scam",
      type: "Financial",
      desc: "The secret trick: QR codes are only for SENDING money, never for receiving.",
      videoId: "_V0f8p-N3Ew", // RBI Awareness
      color: "border-emerald-500/50 bg-emerald-500/5"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Back to Defense Terminal</span>
        </Link>
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Fraud <span className="text-indigo-500">Insights</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">
            Master the tactics used by cyber criminals. Knowledge is the ultimate shield that no hacker can bypass.
          </p>
        </div>

        {/* Featured Video Player */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Case Study</span>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-500/10 bg-slate-900">
             <iframe 
               src={`https://www.youtube.com/embed/${fraudInsights[0].videoId}`} 
               title="Fraud Awareness Masterclass"
               className="absolute inset-0 w-full h-full"
               allowFullScreen
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             />
          </div>
        </div>

        {/* Insight Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {fraudInsights.map((fraud, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border ${fraud.color} flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg`}>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{fraud.type}</div>
                <h3 className="text-xl font-bold mb-3">{fraud.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{fraud.desc}</p>
              </div>
              <a 
                href={`https://www.youtube.com/watch?v=${fraud.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white hover:text-indigo-400 transition"
              >
                Watch Breakdown <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Protection Strategy */}
        <div className="mt-20 grid md:grid-cols-2 gap-12 border-t border-slate-800 pt-20">
           <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="text-indigo-500" /> The 3 Golden Rules
              </h2>
              <ul className="space-y-4">
                <li className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1 uppercase tracking-tighter">1. No WhatsApp Arrests</strong>
                  Police/CBI will NEVER use WhatsApp or Skype for official legal statements or arrests.
                </li>
                <li className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1 uppercase tracking-tighter">2. QR = Outgoing Only</strong>
                  Scanning a QR code is exclusively for sending money. Never scan to receive funds.
                </li>
                <li className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1 uppercase tracking-tighter">3. The 1930 Window</strong>
                  If defrauded, call 1930 immediately. Your best chance to recover funds is within 2 hours.
                </li>
              </ul>
           </div>

           <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] p-10 flex flex-col items-center text-center justify-center">
              <AlertCircle className="w-12 h-12 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold mb-2">Identify a Trace?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                If you have screenshots or recordings of a scammer, upload them to our Evidence Vault to help protect others.
              </p>
              <Link href="/evidence" className="bg-indigo-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20">
                Upload Evidence
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}