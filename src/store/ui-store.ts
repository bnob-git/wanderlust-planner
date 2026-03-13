import { create } from "zustand";

interface UiStore {
  selectedDayId: string | null;
  selectedPartyId: string | null;

  // AI settings
  aiEnabled: boolean;
  dismissedConflicts: string[];
  dismissedSuggestions: string[];

  setSelectedDay: (dayId: string | null) => void;
  setSelectedParty: (partyId: string | null) => void;

  // AI actions
  setAiEnabled: (enabled: boolean) => void;
  dismissConflict: (conflictKey: string) => void;
  dismissSuggestion: (suggestionKey: string) => void;
  clearDismissedConflicts: () => void;
  clearDismissedSuggestions: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedDayId: null,
  selectedPartyId: null,

  // AI settings
  aiEnabled: true,
  dismissedConflicts: [],
  dismissedSuggestions: [],

  setSelectedDay: (dayId) => set({ selectedDayId: dayId }),
  setSelectedParty: (partyId) => set({ selectedPartyId: partyId }),

  // AI actions
  setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
  dismissConflict: (conflictKey) =>
    set((state) => ({
      dismissedConflicts: [...state.dismissedConflicts, conflictKey],
    })),
  dismissSuggestion: (suggestionKey) =>
    set((state) => ({
      dismissedSuggestions: [...state.dismissedSuggestions, suggestionKey],
    })),
  clearDismissedConflicts: () => set({ dismissedConflicts: [] }),
  clearDismissedSuggestions: () => set({ dismissedSuggestions: [] }),
}));
