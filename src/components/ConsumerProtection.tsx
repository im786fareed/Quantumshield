'use client';
import { useEffect, useState } from 'react';
import {
  ShieldCheck, ScanLine, AlertTriangle, GraduationCap, Users,
  CalendarDays, TrendingUp, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { ensureFirstSeen, getProtectionStats, type ProtectionStats } from '@/lib/activity';

/* ── Real, sourced India scam data (I4C / MHA Annual Report 2025–26, CBI).
      Same figures cited on the landing page — no invented numbers. ── */
const INDIA_SCAMS = [
  { name: 'Digital Arrest',     amount: '₹1,935 Cr', where: 'Nationwide · SC-directed CBI probe',       sev: 'critical' },
  { name: 'Investment / Trading', amount: '₹22 Cr+', where: 'Fake WhatsApp & Telegram groups',          sev: 'critical' },
  { name: 'UPI / QR Fraud',     amount: '₹95 Cr',    where: 'Fake collect-requests & QR codes',          sev: 'high' },
  { name: 'Job / Task Scam',    amount: '₹100 Cr',   where: 'Linked to SE-Asia trafficking camps',       sev: 'high' },
  { name: 'Deepfake / AI Scam', amount: '₹2.68 Cr',  where: 'Celebrity deepfakes on social media',       sev: 'high' },
  { name: 'WhatsApp Hijack',    amount: '₹50 Cr',    where: 'Ghost pairing & OTP theft',                 sev: 'medium' },
];

const sevStyle = (s: string) =>
  s === 'critical' ? 'border-red-500/40 bg-red-500/10' :
  s === 'high'     ? 'border-orange-500/40 bg-orange-500/10' :
                     'border-yellow-500/30 bg-yellow-500/10';

const sevText = (s: string) =>
  s === 'critical' ? 'text-red-400' :
  s === 'high'     ? 'text-orange-400' :
                     'text-yellow-400';

export default function ConsumerProtection({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [stats, setStats] = useState<ProtectionStats | null>(null);

  useEffect(() => {
    ensureFirstSeen();
    setStats(getProtectionStats());
  }, []);

  const hi = lang === 'hi';

  return (
    <div className="space-y-10">

      {/* ── 1. YOUR PROTECTION (real on-device activity) ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-black uppercase tracking-tight">
            {hi ? 'आपकी सुरक्षा' : 'Your Protection'}
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          {hi
            ? 'सब कुछ आपके फ़ोन पर — कुछ भी अपलोड नहीं होता।'
            : 'Everything below is real activity on your phone. Nothing is uploaded.'}
        </p>

        {stats && stats.isNew ? (
          /* Honest empty state — no fake numbers for a brand-new user */
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <ScanLine className="w-9 h-9 text-blue-400 mx-auto mb-3" />
            <p className="font-bold mb-1">
              {hi ? 'आपकी सुरक्षा यहीं से शुरू होती है' : 'Your protection record starts here'}
            </p>
            <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
              {hi
                ? 'अपना पहला स्कैन चलाएँ — फिर यहाँ आपकी असली सुरक्षा गिनती दिखेगी।'
                : 'Run your first scan and your real protection stats will appear here — true numbers, only from your own use.'}
            </p>
            <Link href="/scanner"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 font-bold px-6 py-3 rounded-xl text-sm transition">
              {hi ? 'पहला स्कैन चलाएँ' : 'Run your first scan'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={ScanLine}     value={stats?.checks ?? 0}           label={hi ? 'स्कैन किए' : 'Checks run'}        accent="text-blue-400" />
            <StatCard icon={AlertTriangle} value={stats?.threats ?? 0}          label={hi ? 'खतरे पकड़े' : 'Risks flagged'}    accent="text-red-400" />
            <StatCard icon={CalendarDays}  value={stats?.daysProtected ?? 0}    label={hi ? 'दिन सुरक्षित' : 'Days protected'}  accent="text-green-400" />
            <StatCard icon={GraduationCap} value={stats?.videosWatched ?? 0}    label={hi ? 'सबक देखे' : 'Lessons watched'}    accent="text-purple-400" />
            <StatCard icon={Users}         value={stats?.contactsProtected ?? 0} label={hi ? 'भरोसेमंद संपर्क' : 'Trusted contacts'} accent="text-amber-400" />
          </div>
        )}
      </section>

      {/* ── 2. INDIA'S ACTIVE SCAMS (real sourced data) ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-black uppercase tracking-tight">
            {hi ? 'भारत में सक्रिय घोटाले · 2025–26' : "India's Active Scams · 2025–26"}
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          {hi
            ? 'असली, सत्यापित आँकड़े — ताकि आप जानें कि अभी किससे बचना है।'
            : 'Real, verified figures so you know exactly what to watch for right now.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INDIA_SCAMS.map((s) => (
            <div key={s.name} className={`border rounded-xl p-4 ${sevStyle(s.sev)}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-sm">{s.name}</span>
                <span className={`font-black text-sm ${sevText(s.sev)}`}>{s.amount}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">{s.where}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          {hi ? 'स्रोत' : 'Source'}: I4C / MHA Annual Report 2025–26 · CBI · Business Standard
        </p>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, accent }: { icon: any; value: number; label: string; accent: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
      <Icon className={`w-6 h-6 mb-2 ${accent}`} />
      <div className="text-2xl font-black">{value.toLocaleString()}</div>
      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
