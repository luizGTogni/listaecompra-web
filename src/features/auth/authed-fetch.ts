import { ApiError, apiFetch } from "@/services/api";
import { useAuthStore } from "./store";

type ApiFetchInit = NonNullable<Parameters<typeof apiFetch>[1]>;

// `apiFetch` plus the session token. Every endpoint behind login goes through
// here. It lives in the auth feature so `services/` stays unaware of sessions.
export async function authFetch<T>(
  path: string,
  init: Omit<ApiFetchInit, "token"> = {},
): Promise<T> {
  try {
    return await apiFetch<T>(path, {
      ...init,
      token: useAuthStore.getState().token,
    });
  } catch (error) {
    // Only this error means "the token is missing, expired or forged".
    // Other 401s are unrelated: a wrong verification code is a 401 too.
    if (error instanceof ApiError && error.body?.name === "Unauthorized") {
      useAuthStore.getState().clearSession();
    }
    throw error;
  }
}
