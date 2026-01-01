'use client';

import { useNavigationStore } from '@/store/navigation';
import type { TabId } from '@/types/navigation';

export function useActiveTab() {
  const activeTab = useNavigationStore((s) => s.activeTab);
  const setTab = useNavigationStore((s) => s.setTab);

  const isActive = (tab: TabId) => tab === activeTab;

  return {
    activeTab,
    setTab,
    isActive,
  };
}
