import { create } from 'zustand';
import { TAB_IDS, type TabId } from '@/types/navigation';

interface NavState {
  activeTab: TabId;
  setTab: (tab: TabId) => void;
  moveNext: () => void;
  movePrev: () => void;
}

export const useNavigationStore = create<NavState>((set, get) => ({
  activeTab: 'home',

  setTab: (tab) => {
    set({ activeTab: tab });
  },

  moveNext: () => {
    const current = get().activeTab;
    const index = TAB_IDS.indexOf(current);
    const next = TAB_IDS[index + 1] ?? current;
    set({ activeTab: next });
  },

  movePrev: () => {
    const current = get().activeTab;
    const index = TAB_IDS.indexOf(current);
    const prev = TAB_IDS[index - 1] ?? current;
    set({ activeTab: prev });
  },
}));
