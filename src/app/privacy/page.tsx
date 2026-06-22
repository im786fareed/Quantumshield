'use client';
import BackToHome from '@/components/BackToHome';
import { Trash2, ShieldAlert, Mail, Lock, Database, UserCheck, Share2, Server } from 'lucide-react';
import { nukeAllLocalData } from '@/lib/erasure'; // Ensure this helper exists from previous steps

export default function PrivacyPage() {
  const handleWipeData = async () => {
    if (confirm("🚨 WARNING: This will permanently delete all local recordings and your security settings. Are you sure?")) {
      try {
        await nukeAllLocalData();
        alert("Success: All local data has been erased.");
        window.location.href = "/"; // Refresh to reset consent and state
      } catch (err) {
        alert("Error: Could not complete data erasure.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <BackToHome />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">
            Privacy <span className="text-indigo-400">Policy</span>
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-mono">
            Compliance: DPDP Act 2023 | IT Act 2000 · Last updated 22 June 2026
          </p>
        </header>

        <div className="space-y-12 text-gray-300">
          {/* Section 1: Core Promise */}
          <section className="border-l-4 border-indigo-500 pl-6">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-400" /> Our Privacy Promise
            </h2>
            <p className="leading-relaxed">
              QuantumShield is built <strong>local-first</strong>. We do <strong>not</strong> store your
              scans, messages, recordings, or evidence on our servers, and we never sell your data.
              To analyse a threat in real time, some of what you submit is sent securely to trusted
              processing services (listed below), used only to produce your result, and then discarded —
              not retained by us. Recordings and your Evidence Vault stay on your device.
            </p>
          </section>

          {/* Section 2: What We Process & Where It Goes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" /> What We Process & Where It Goes
            </h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Links you check</span>
                Sent to Google Safe Browsing and our analysis engine to detect phishing. Not stored.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Messages, call text & legal descriptions</span>
                Analysed by Google&apos;s Gemini AI to explain scam risk and your rights. Not stored.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Email for Breach Check</span>
                Checked against the XposedOrNot public breach database. Not stored.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Microphone audio (Call Analyzer)</span>
                Processed in real time <strong>on your device</strong> for deepfake artifacts. Never uploaded.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Evidence Vault & recordings</span>
                Stored only on your device (browser IndexedDB). We keep nothing on our servers.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Usage analytics & settings</span>
                Anonymous usage stats (Vercel Analytics) and your consent/preferences stored locally.
              </li>
            </ul>
          </section>

          {/* Section 3: Third-party processors */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-indigo-400" /> Trusted Processors
            </h2>
            <p className="leading-relaxed mb-4">
              We rely on a small set of reputable services to perform real-time analysis. They receive
              only what is needed for that check and do not receive your identity from us:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><span><strong>Google</strong> — Safe Browsing (link threats) and Gemini AI (scam & legal analysis).</span></li>
              <li className="flex gap-2"><Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><span><strong>XposedOrNot</strong> — public data-breach lookup for the email you enter.</span></li>
              <li className="flex gap-2"><Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><span><strong>Vercel</strong> — hosting and anonymous, privacy-friendly usage analytics.</span></li>
            </ul>
          </section>

          {/* Section 4: Accounts (not yet enabled) */}
          <section className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" /> Accounts &amp; Sign-In
            </h2>
            <p className="leading-relaxed text-sm">
              Account sign-in is <strong>not currently enabled</strong> — you can use QuantumShield
              without creating an account. If we add optional accounts in a future update (for example,
              to let you sync your cases across devices), your login details would be managed by
              <strong> Google Firebase Authentication</strong>, and only your account identity — never
              your scans or evidence — would be involved. We will update this policy and notify you in
              the app before that happens.
            </p>
          </section>

          {/* Section 5: Your Rights & DANGER ZONE */}
          <section className="bg-red-950/20 border border-red-500/30 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-white uppercase italic">Danger Zone: Right to Erasure</h2>
            </div>
            <p className="text-sm text-red-200/70 mb-6">
              Under the DPDP Act 2023, you have the <strong>Right to Correction and Erasure</strong>.
              Clicking the button below will wipe your local <strong>Evidence Vault</strong>
              (IndexedDB) and clear all settings.
            </p>
            <button
              onClick={handleWipeData}
              className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              <Trash2 className="w-4 h-4" /> Permanently Wipe My Local Data
            </button>
          </section>

          {/* Section 6: Contact Us */}
          <section className="pt-10 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-400" /> Contact Security Team
            </h2>
            <p>For privacy inquiries or technical support:</p>
            <a
              href="mailto:quantumshield4india@gmail.com"
              className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4"
            >
              quantumshield4india@gmail.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
