import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * App-wide language preference (English / Hindi).
 *
 * Single source of truth for the whole UI. Components read `lang`
 * and the header toggle (LanguageToggle) flips it. Persisted to
 * localStorage so the choice survives reloads and navigation.
 *
 * Note: persistence rehydrates AFTER first client render, so the
 * initial paint is always 'en' (matching server HTML) and then
 * updates to the saved value — no hydration mismatch.
 */
export type Lang = 'en' | 'hi';

type LanguageState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === 'en' ? 'hi' : 'en' }),
    }),
    { name: 'qs-lang' }
  )
);
