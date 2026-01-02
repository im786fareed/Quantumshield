import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Logo from "@/components/Logo";
import InstallPrompt from "@/components/InstallPrompt";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuantumShield – AI Cyber Protection Platform",
  description:
    "Protect yourself from scams, fraud, and cyber threats using AI-powered security tools.",
  keywords: [
    "cybersecurity",
    "scam protection",
    "AI security",
    "fraud detection",
    "online safety",
  ],
  authors: [{ name: "QuantumShield" }],
  creator: "QuantumShield",
  openGraph: {
    title: "QuantumShield – AI Cyber Protection",
    description:
      "AI-powered protection against scams, fraud, and cyber threats.",
    type: "website",
    siteName: "QuantumShield",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuantumShield",
    description: "AI-powered cyber safety platform",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <InstallPrompt />
        <CommandPalette />

        {/* HEADER */}
        <header className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-9 h-9" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  QuantumShield
                </h1>
                <p className="text-xs text-gray-400">
                  AI Cyber Protection Platform
                </p>
              </div>
            </div>

            <div className="hidden md:flex gap-4 text-sm">
              <a
                href="tel:1930"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
              >
                🚨 Emergency 1930
              </a>
              <a
                href="mailto:quantumshield4india@gmail.com"
                className="text-gray-400 hover:text-white"
              >
                Support
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 bg-black/50 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Logo className="w-7 h-7" />
                <span className="font-semibold">QuantumShield</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                AI-powered cyber protection helping users stay safe from scams,
                fraud, and digital threats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  {/* Fixed: Re-added the missing <a> tag here */}
                  <a 
                    href="mailto:quantumshield4india@gmail.com"
                    className="hover:text-white"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="tel:1930" className="hover:text-white">
                    Emergency Helpline (India)
                  </a>
                </li>
              </ul>
            </div>

<div>
  <h3 className="font-semibold mb-3">Legal</h3>
  <ul className="space-y-2 text-sm text-gray-400">
    <li>
      <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
    </li>
    <li>
      <a href="/terms" className="hover:text-white transition">Terms of Service</a>
    </li>
    <li>
      <a href="/disclaimer" className="hover:text-white transition">Disclaimer</a>
    </li>
  </ul>
</div>
          </div>

          <div className="text-center text-xs text-gray-500 border-t border-white/10 py-4">
            © {new Date().getFullYear()} QuantumShield. All rights reserved.
          </div>
        </footer>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}