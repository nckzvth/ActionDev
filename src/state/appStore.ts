import { create } from "zustand";

interface AppState {
  commandOpen: boolean;
  authOpen: boolean;
  mobileNavOpen: boolean;
  setCommandOpen(open: boolean): void;
  setAuthOpen(open: boolean): void;
  setMobileNavOpen(open: boolean): void;
}

export const useAppStore = create<AppState>((set) => ({
  commandOpen: false,
  authOpen: false,
  mobileNavOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setAuthOpen: (authOpen) => set({ authOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));

