import { useAuthStore } from "@/features/auth/store";

// The auth store is a module-level singleton persisted in localStorage, so
// tests reset it to avoid leaking a session into the next test.
export function resetAuthStore() {
  localStorage.clear();
  useAuthStore.setState({ token: null, email: null, resendAvailableAt: null });
}

export function signInAs(email = "ana@example.com", token = "test-token") {
  useAuthStore.getState().setSession({ token, email });
}
