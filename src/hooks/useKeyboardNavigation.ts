'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/store/navigation';
import { TAB_IDS } from '@/types/navigation';

export function useKeyboardNavigation() {
  const activeTab = useNavigationStore((s) => s.activeTab);
  const setTab = useNavigationStore((s) => s.setTab);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore typing inside inputs / textareas
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K (reserved for command palette later)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        console.log('Command palette trigger (future)');
        return;
      }

      const index = TAB_IDS.indexOf(activeTab);

      // Arrow navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = TAB_IDS[index + 1] ?? TAB_IDS[0];
        setTab(next);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = TAB_IDS[index - 1] ?? TAB_IDS[TAB_IDS.length - 1];
        setTab(prev);
      }

      // Number shortcuts (1–9)
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (TAB_IDS[idx]) {
          setTab(TAB_IDS[idx]);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, setTab]);
}
