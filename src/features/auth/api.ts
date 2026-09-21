import { apiFetch } from "@/services/api";
import { authFetch } from "./authed-fetch";
import type { CreateUserInput, Credentials, User } from "./types";

export function createUser(input: CreateUserInput) {
  return apiFetch<{ user: User }>("/users", {
    method: "POST",
    body: input,
  });
}

// Works for accounts that are not verified yet: that is what lets the user
// reach the code screen, because verifying needs a token.
export function createSession(credentials: Credentials) {
  return apiFetch<{ token: string }>("/session", {
    method: "POST",
    body: credentials,
  });
}

export function verifyUser(codeValue: string) {
  return authFetch<null>("/users/verify", {
    method: "POST",
    body: { codeValue },
  });
}

export function resendCode() {
  return authFetch<null>("/code/resend", { method: "POST" });
}

// Who the token belongs to. Works for unverified accounts too, and is how the
// app learns whether the user still has to enter the code (`verifiedAt`).
export function getCurrentUser() {
  return authFetch<{ user: User }>("/users/me");
}
