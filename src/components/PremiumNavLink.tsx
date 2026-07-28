'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

/**
 * Header entry point to the Premium upgrade page. Small client component so the
 * label follows the language toggle (the header layout is a server component).
 * Always visible — the upgrade prompt shouldn't depend on being signed in.
 */
export default function PremiumNavLink() {
  const { lang } = useLanguage();
  const en = lang === 'en';
  return (
    <Link
      href="/premium"
      aria-label={en ? 'Upgrade to Premium' : 'प्रीमियम में अपग्रेड करें'}
      className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-colors whitespace-nowrap"
    >
      <Crown className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{en ? 'Upgrade' : 'अपग्रेड'}</span>
    </Link>
  );
}
