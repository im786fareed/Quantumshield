'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/useLanguage';

/**
 * Header entry point to the Protection Center. A small client component so the
 * label follows the app's language toggle (the header layout is a server
 * component and cannot read the language store directly).
 */
export default function ProtectionNavLink() {
  const { lang } = useLanguage();
  return (
    <Link
      href="/protection"
      aria-label={lang === 'en' ? 'Protection Center' : 'सुरक्षा केंद्र'}
      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-[10px] font-black uppercase tracking-wide shadow-lg shadow-cyan-600/20 whitespace-nowrap"
    >
      🛡️ {lang === 'en' ? 'Protection' : 'सुरक्षा'}
    </Link>
  );
}
