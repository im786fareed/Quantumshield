import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Your Custom Components
import Logo from "@/components/Logo";
import InstallPrompt from "@/components/InstallPrompt";
import CommandPalette from "@/components/CommandPalette";
import ConsentPopup from "@/components/ConsentPopup"; // The Legal Layer
import FloatingRecorder from "@/components/FloatingRecorder";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";
import AccountButton from "@/components/AccountButton";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "QuantumShield – AI Cyber Protection Platform",
  description: "Advanced protection against scams, fraud, and digital threats using AI-powered tools.",
  keywords: ["cybersecurity", "scam protection", "AI security", "fraud detection", "digital arrest"],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white min-h-screen font-sans flex flex-col">
        <AuthProvider>
        {/* GLOBAL SECURITY LAYERS */}
        <ConsentPopup />
        <InstallPrompt />
        <CommandPalette />
        <FloatingRecorder />

        {/* TOP NAVIGATION HEADER */}
        <header className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-tighter">
                  QuantumShield
                </h1>
                <p className="text-[10px] text-gray-500 font-mono">AI PROTECTION NETWORK</p>
              </div>
            </Link>

            <div className="flex gap-6 items-center">
              <Link href="/" className="hidden md:block text-xs font-bold hover:text-blue-400 transition uppercase tracking-widest">
                Home
              </Link>
              <Link href="/legal-rights" className="hidden md:block text-xs font-bold hover:text-indigo-400 transition uppercase tracking-widest">
                My Rights
              </Link>
              <Link href="/education" className="hidden md:block text-xs font-bold hover:text-blue-400 transition uppercase tracking-widest">
                Education
              </Link>
              <a
                href="tel:1930"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase shadow-lg shadow-red-600/20"
              >
                🚨 Emergency 1930
              </a>
              <AccountButton />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1">
          <AuthGate>{children}</AuthGate>
        </main>

        {/* SITE FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 mt-12">
          {/* FOUNDER — WHY I BUILT THIS */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/5">
            <div className="max-w-4xl mx-auto px-6 py-14">
              <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                <img
                  src="/founder.png"
                  alt="Fareed Shaik, founder of QuantumShield"
                  className="w-28 h-28 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-lg shadow-purple-900/30 shrink-0"
                />
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-3">
                    Why I Built QuantumShield
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Every day, ordinary people — parents, students, shopkeepers — lose their hard-earned
                    money to scam calls, fake links, and digital fraud. Most never see it coming, and the
                    tools to stay safe are scattered, confusing, or hidden behind a price. I built
                    QuantumShield to change that: one trusted shield that anyone in India can use to check a
                    suspicious message, verify a caller, understand their rights, and act quickly when
                    something feels wrong. If this app stops even one family from being cheated, it has
                    done its job.
                  </p>
                  <p className="mt-4 text-sm font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Every citizen should know their legal rights.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-white">
                    Fareed Shaik
                    <span className="text-gray-500 font-normal"> · Founder, QuantumShield</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Logo className="w-7 h-7" />
                <span className="font-semibold uppercase tracking-widest text-xs text-white">QuantumShield</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Shielding the nation from cyber threats through 
                on-device AI analysis and zero-storage vaults.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest">Direct Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="mailto:quantumshield4india@gmail.com" className="hover:text-white transition">Email Security Team</a></li>
                <li><a href="tel:1930" className="hover:text-white transition">Cyber Crime Helpline (1930)</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest">Platform Info</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition text-red-400/80">Safety Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-600 border-t border-white/5 py-6 font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} QUANTUMSHIELD. NO DATA IS STORED ON SERVERS.
          </div>
        </footer>

        {/* ANALYTICS (Client-Side) */}
        <Analytics />
        <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}