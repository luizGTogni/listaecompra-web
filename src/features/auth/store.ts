import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// The session itself is an httpOnly cookie the browser manages; this store
// only keeps what the UI needs and JavaScript is allowed to see.
interface AuthState {
  // Shown on the verify screen ("we sent a code to ..."). Set on sign-up/in,
  // cleared on sign out.
  email: string | null;
  // When the backend will accept a new "resend code" request (epoch ms).
  // Kept here, not in component state, so a reload does not lose it.
  resendAvailableAt: number | null;
  setEmail: (email: string) => void;
  setResendAvailableAt: (timestamp: number) => void;
  clear: () => void;
}

// Global client state that outlives page navigations and reloads: a good fit
// for Zustand. Server data (session, lists, items) belongs to TanStack Query.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      resendAvailableAt: null,
      setEmail: (email) => set({ email }),
      setResendAvailableAt: (resendAvailableAt) => set({ resendAvailableAt }),
      clear: () => set({ email: null, resendAvailableAt: null }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      // Persist the data, never the functions.
      partialize: ({ email, resendAvailableAt }) => ({
        email,
        resendAvailableAt,
      }),
    },
  ),
);
