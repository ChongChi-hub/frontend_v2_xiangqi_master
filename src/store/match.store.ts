import { create } from 'zustand';
import type { MatchFoundData } from '@/services/socket.service';

interface MatchStoreState {
  activeMatch: MatchFoundData | null;
  setActiveMatch: (match: MatchFoundData | null) => void;
  clearActiveMatch: () => void;
}

export const useMatchStore = create<MatchStoreState>((set) => ({
  activeMatch: null,
  setActiveMatch: (match: MatchFoundData | null) => set({ activeMatch: match }),
  clearActiveMatch: () => set({ activeMatch: null }),
}));

export default useMatchStore;
