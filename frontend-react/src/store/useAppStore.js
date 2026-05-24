import { create } from "zustand";

import { authStorage } from "../services/storageService";

export const useAppStore = create((set) => ({
  activeSection: "chat",
  currentUser: authStorage.getLoggedInUser(),
  newChatToken: 0,
  setActiveSection: (activeSection) => set({ activeSection }),
  startNewChat: () => set((state) => ({ activeSection: "chat", newChatToken: state.newChatToken + 1 })),
  refreshCurrentUser: () => set({ currentUser: authStorage.getLoggedInUser() }),
}));
