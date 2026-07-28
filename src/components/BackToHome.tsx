'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function BackToHome() {
  return (
    <Link
      href="/home"
      className="fixed top-20 left-4 z-40 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
    >
      <Home className="w-4 h-4" />
      <span className="text-sm font-medium">Back to Home</span>
    </Link>
  );
}