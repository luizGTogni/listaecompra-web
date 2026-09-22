import { useAuthStore } from "@/features/auth/store";

// The store only keeps UI-facing bits now: the session itself is an httpOnly
// cookie, invisible to JavaScript and to this store. Tests reset it, and
// simulate "signed in" by mocking `GET /users/me` (see `meReply` in
// `test/fetch.ts`), which is what the app itself relies on.
export function resetAuthStore() {
  localStorage.clear();
  useAuthStore.setState({ email: null, resendAvailableAt: null });
}

// Pre-fills the e-mail the store remembers, e.g. from an earlier sign-in.
export function signInAs(email = "ana@example.com") {
  useAuthStore.getState().setEmail(email);
}
