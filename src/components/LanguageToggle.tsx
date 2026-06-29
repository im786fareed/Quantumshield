'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

/**
 * Global EN ⇄ हिं switch shown in the app header.
 * Reads and writes the shared language store, so flipping it here
 * changes every screen that supports Hindi.
 */
export default function LanguageToggle() {
  const lang = useLanguage((s) => s.lang);
  const toggle = useLanguage((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      aria-label={lang === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में बदलें'}
      title={lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
      className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest transition"
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === 'en' ? 'हिं' : 'EN'}
    </button>
  );
}
