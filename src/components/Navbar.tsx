'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO & HOME LINK */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="text-indigo-500 w-6 h-6 transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="font-bold tracking-tighter uppercase text-white leading-none">QuantumShield</span>
            <span className="text-[10px] text-gray-500 font-mono leading-none mt-1">AI DEFENSE</span>
          </div>
        </Link>
        
        {/* NAVIGATION LINKS */}
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-xs font-bold hover:text-indigo-400 transition uppercase tracking-widest text-gray-300">
            Home
          </Link>
          <Link href="/education" className="text-xs font-bold hover:text-indigo-400 transition uppercase tracking-widest text-gray-300">
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
    </nav>
  );
}