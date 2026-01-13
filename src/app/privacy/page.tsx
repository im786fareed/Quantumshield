'use client';
import BackToHome from '@/components/BackToHome';
import { Trash2, ShieldAlert, Mail, Lock, Database, UserCheck } from 'lucide-react';
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
            Compliance: DPDP Act 2023 | IT Act 2000
          </p>
        </header>

        <div className="space-y-12 text-gray-300">
          {/* Section 1: Core Promise */}
          <section className="border-l-4 border-indigo-500 pl-6">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-400" /> Data Collection
            </h2>
            <p className="leading-relaxed">
              QuantumShield is committed to protecting your privacy. We collect minimal data necessary 
              to provide our security services. No personal data is stored on our servers; 
              we operate on a <strong>Local-First</strong> architecture.
            </p>
          </section>

          {/* Section 2: What We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" /> What We Collect
            </h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">User Submissions</span>
                URLs, phone numbers, and files you voluntarily submit for scanning.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Local Audio</span>
                Processed in real-time for deepfake artifacts. Never uploaded.
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Usage Analytics</span>
                Anonymous data to improve threat detection (Vercel Analytics).
              </li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="block font-bold text-white mb-1">Consent Logs</span>
                Stored locally to remember your privacy preferences.
              </li>
            </ul>
          </section>

          {/* Section 3: Your Rights & DANGER ZONE */}
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

          {/* Section 4: Contact Us */}
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