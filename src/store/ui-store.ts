import { create } from "zustand";

interface UiStore {
  selectedDayId: string | null;
  selectedPartyId: string | null;

  setSelectedDay: (dayId: string | null) => void;
  setSelectedParty: (partyId: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedDayId: null,
  selectedPartyId: null,

  setSelectedDay: (dayId) => set({ selectedDayId: dayId }),
  setSelectedParty: (partyId) => set({ selectedPartyId: partyId }),
}));
