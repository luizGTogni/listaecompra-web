import { apiFetch } from "@/services/api";
import type { CreateUserInput, Credentials, User } from "./types";
import type { ChangePasswordValues, ResetPasswordValues } from "./schemas";

export function createUser(input: CreateUserInput) {
  return apiFetch<{ user: User }>("/users", {
    method: "POST",
    body: input,
  });
}

// Works for accounts that are not verified yet: that is what lets the user
// reach the code screen. On success the backend sets the session as an
// httpOnly cookie; there is nothing for the client to store.
export function createSession(credentials: Credentials) {
  return apiFetch<null>("/session", {
    method: "POST",
    body: credentials,
  });
}

export function signOut() {
  return apiFetch<null>("/session/logout", { method: "POST" });
}

export function verifyUser(codeValue: string) {
  return apiFetch<null>("/users/verify", {
    method: "POST",
    body: { codeValue },
  });
}

export function resendCode() {
  return apiFetch<null>("/code/resend", { method: "POST" });
}

// Who the cookie belongs to. Works for unverified accounts too, and is how
// the app learns whether the user still has to enter the code (`verifiedAt`).
export function getCurrentUser() {
  return apiFetch<{ user: User }>("/users/me");
}

// Sends a code (type `password_reset`) to the e-mail. The backend answers 404
// when no account has it; see `docs/backend-tasks.md`.
export function forgotPassword(email: string) {
  return apiFetch<null>("/password/forgot", {
    method: "POST",
    body: { email },
  });
}

// The code alone identifies the account: the backend needs no e-mail here.
export function resetPassword(input: ResetPasswordValues) {
  return apiFetch<null>("/password/reset", {
    method: "POST",
    body: input,
  });
}

export function changePassword(input: ChangePasswordValues) {
  return apiFetch<null>("/users/password/change", {
    method: "PATCH",
    body: input,
  });
}
