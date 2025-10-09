import { Settlement } from '@/types/settlements';
import { produce } from 'immer';
import { create } from 'zustand';

export interface SettlementStore {
  settlements: Settlement[];
  setSettlements: (settlements: Settlement[]) => void;
}

const useSettlementStore = create<SettlementStore>((set) => ({
  settlements: [],
  setSettlements: (settlements) =>
    set(
      produce((state) => {
        state.settlements = settlements;
      })
    ),
}));

export default useSettlementStore;
