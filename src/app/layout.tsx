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
  description: "Protect yourself from scams, fraud, and cyber threats using AI-powered security tools.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* We removed the Geist font variables to fix the ENOTFOUND error.
        Now the app will use high-quality system fonts (Inter/Arial) automatically.
      */}
      <body className="antialiased bg-black text-white min-h-screen font-sans">
        <InstallPrompt />
        <CommandPalette />

        {/* HEADER: Updated to link correctly to your features */}
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

            <div className="flex gap-4 items-center">
               {/* Shaik: This "Home" link now points to "/" 
                 which loads your 6-feature Defense Terminal 
               */}
              <Link href="/" className="hidden md:block text-xs font-bold hover:text-blue-400 transition">HOME</Link>
              <Link href="/education" className="hidden md:block text-xs font-bold hover:text-blue-400 transition">EDUCATION</Link>
              
              <a
                href="tel:1930"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase shadow-lg shadow-red-600/20"
              >
                🚨 Emergency 1930
              </a>
            </div>
          </div>
        </header>

        {/* This is where your Defense Terminal and Map load */}
        <main className="flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Logo className="w-7 h-7" />
                <span className="font-semibold uppercase tracking-widest text-xs">QuantumShield</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                AI-powered cyber protection helping users stay safe from scams,
                fraud, and digital traces.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-widest">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:quantumshield4india@gmail.com" className="hover:text-white transition">Email Security Team</a></li>
                <li><a href="tel:1930" className="hover:text-white transition">Cyber Crime Helpline</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-widest">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition">Safety Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-600 border-t border-white/5 py-4 font-mono">
            © {new Date().getFullYear()} QUANTUMSHIELD. SHIELDING THE NATION.
          </div>
        </footer>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}