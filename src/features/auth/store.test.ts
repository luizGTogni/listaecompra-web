import { resetAuthStore } from "@/test/auth";
import { useAuthStore } from "./store";

beforeEach(resetAuthStore);

describe("useAuthStore", () => {
  it("starts empty", () => {
    expect(useAuthStore.getState()).toMatchObject({
      email: null,
      resendAvailableAt: null,
    });
  });

  it("keeps the e-mail in localStorage, without the functions", () => {
    useAuthStore.getState().setEmail("a@b.com");

    const saved = JSON.parse(localStorage.getItem("auth")!);
    expect(saved.state).toEqual({ email: "a@b.com", resendAvailableAt: null });
  });

  it("forgets everything on clear", () => {
    useAuthStore.getState().setEmail("a@b.com");
    useAuthStore.getState().setResendAvailableAt(123);

    useAuthStore.getState().clear();

    expect(useAuthStore.getState()).toMatchObject({
      email: null,
      resendAvailableAt: null,
    });
  });

  it("remembers when a resend becomes possible", () => {
    useAuthStore.getState().setResendAvailableAt(123);

    expect(useAuthStore.getState().resendAvailableAt).toBe(123);
  });
});
