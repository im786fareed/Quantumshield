'use client';
import { Play, BookOpen, ShieldCheck, AlertCircle, Smartphone, Globe, ChevronRight } from 'lucide-react';
import BackToHome from '@/components/BackToHome';

export default function EducationPage() {
  const fraudInsights = [
    {
      title: "Digital Arrest Scam",
      type: "High Alert",
      desc: "How scammers pose as CBI/Police on WhatsApp video calls to threaten you into 'Digital Arrest'.",
      videoUrl: "https://www.youtube.com/embed/kYIeXbQhVuo", // Example educational link
      color: "border-red-500/50 bg-red-500/5"
    },
    {
      title: "Remote Access Fraud",
      type: "Device Risk",
      desc: "Why you should never install AnyDesk or TeamViewer on a stranger's request.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with your actual asset
      color: "border-blue-500/50 bg-blue-500/5"
    },
    {
      title: "UPI / QR Code Scam",
      type: "Financial",
      desc: "The secret trick: QR codes are only for SENDING money, never for receiving.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
      color: "border-emerald-500/50 bg-emerald-500/5"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <BackToHome />
        
        {/* Header */}
        <div className="mt-10 mb-16">
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
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Featured Masterclass</span>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-500/10 bg-slate-900">
             <iframe 
               src="https://www.youtube.com/embed/kYIeXbQhVuo" 
               title="Fraud Awareness"
               className="absolute inset-0 w-full h-full"
               allowFullScreen
             />
          </div>
        </div>

        {/* Insight Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {fraudInsights.map((fraud, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border ${fraud.color} flex flex-col justify-between hover:scale-[1.02] transition-transform`}>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{fraud.type}</div>
                <h3 className="text-xl font-bold mb-3">{fraud.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{fraud.desc}</p>
              </div>
              <button 
                onClick={() => window.open(fraud.videoUrl, '_blank')}
                className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white hover:text-indigo-400 transition"
              >
                Watch Breakdown <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Quick Knowledge Base */}
        <div className="mt-20 grid md:grid-cols-2 gap-12 border-t border-slate-800 pt-20">
           <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3"><ShieldCheck className="text-indigo-500" /> The 3 Golden Rules</h2>
              <ul className="space-y-4">
                <li className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1">1. Verify the Platform</strong>
                  Police will NEVER use WhatsApp, Telegram, or Skype for official legal statements.
                </li>
                <li className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1">2. No Personal Data</strong>
                  Never share Aadhaar, PAN, or OTP with anyone claiming to be from "Customs" or "CBI".
                </li>
                <li className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-sm text-slate-300">
                  <strong className="text-white block mb-1">3. The 1930 Rule</strong>
                  If money is lost, your only chance to get it back is to report within the first 2 hours.
                </li>
              </ul>
           </div>

           <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] p-10 flex flex-col items-center text-center justify-center">
              <BookOpen className="w-12 h-12 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold mb-2">Want to contribute?</h3>
              <p className="text-slate-400 text-sm mb-6">Share your scam story anonymously on our WhatsApp channel to help others stay safe.</p>
              <button className="bg-indigo-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition">Share Evidence</button>
           </div>
        </div>
      </div>
    </div>
  );
}