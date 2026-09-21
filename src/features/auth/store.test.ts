import { resetAuthStore } from "@/test/auth";
import { useAuthStore } from "./store";

beforeEach(resetAuthStore);

describe("useAuthStore", () => {
  it("starts signed out", () => {
    expect(useAuthStore.getState()).toMatchObject({ token: null, email: null });
  });

  it("keeps the session in localStorage, without the functions", () => {
    useAuthStore.getState().setSession({ token: "t", email: "a@b.com" });

    const saved = JSON.parse(localStorage.getItem("auth")!);
    expect(saved.state).toEqual({
      token: "t",
      email: "a@b.com",
      resendAvailableAt: null,
    });
  });

  it("forgets the session on sign out", () => {
    useAuthStore.getState().setSession({ token: "t", email: "a@b.com" });

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState()).toMatchObject({ token: null, email: null });
  });

  it("remembers when a resend becomes possible, until sign out", () => {
    const store = useAuthStore.getState();
    store.setSession({ token: "t", email: "a@b.com" });

    store.setResendAvailableAt(123);
    expect(useAuthStore.getState().resendAvailableAt).toBe(123);

    store.clearSession();
    expect(useAuthStore.getState().resendAvailableAt).toBeNull();
  });
});
