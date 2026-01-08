import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Logo from "@/components/Logo";
import InstallPrompt from "@/components/InstallPrompt";
import CommandPalette from "@/components/CommandPalette";
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
      <body className="antialiased bg-black text-white min-h-screen font-sans">
        <InstallPrompt />
        <CommandPalette />

        {/* TOP NAVIGATION HEADER */}
        <header className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo and App Name - Clicking this takes user to the Defense Terminal */}
            <Link href="/" className="flex items-center gap-3 group">
              <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-tighter">
                  QuantumShield
                </h1>
                <p className="text-[10px] text-gray-500 font-mono">AI PROTECTION NETWORK</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex gap-6 items-center">
              <Link href="/" className="hidden md:block text-xs font-bold hover:text-blue-400 transition uppercase tracking-widest">
                Home
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
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA: This is where your Feature Grid and Map load */}
        <main className="flex-1">
          {children}
        </main>

        {/* SITE FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Logo className="w-7 h-7" />
                <span className="font-semibold uppercase tracking-widest text-xs">QuantumShield</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered cyber protection helping users stay safe from scams,
                fraud, and digital traces. Shielding the nation from cyber threats.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-4 tracking-widest">Direct Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="mailto:quantumshield4india@gmail.com" className="hover:text-white transition">
                    Email Security Team
                  </a>
                </li>
                <li>
                  <a href="tel:1930" className="hover:text-white transition">
                    Cyber Crime Helpline (1930)
                  </a>
                </li>
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

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}