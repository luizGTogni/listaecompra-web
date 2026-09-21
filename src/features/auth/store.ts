import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Session {
  // JWT returned by POST /session (the backend signs it for 7 days).
  token: string;
  // Only used to tell the user where the verification code was sent.
  email: string;
  // When the backend will accept a new "resend code" request (epoch ms).
  // Kept here, not in component state, so a reload does not lose it.
  resendAvailableAt?: number | null;
}

interface AuthState {
  token: string | null;
  email: string | null;
  resendAvailableAt: number | null;
  setSession: (session: Session) => void;
  setResendAvailableAt: (timestamp: number) => void;
  clearSession: () => void;
}

// Global client state that outlives page navigations and reloads: a good fit
// for Zustand. Server data (lists, items) belongs to TanStack Query instead.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      resendAvailableAt: null,
      setSession: ({ token, email, resendAvailableAt = null }) =>
        set({ token, email, resendAvailableAt }),
      setResendAvailableAt: (resendAvailableAt) => set({ resendAvailableAt }),
      clearSession: () =>
        set({ token: null, email: null, resendAvailableAt: null }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      // Persist the data, never the functions.
      partialize: ({ token, email, resendAvailableAt }) => ({
        token,
        email,
        resendAvailableAt,
      }),
    },
  ),
);
