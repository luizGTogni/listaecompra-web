import { ApiError } from "@/services/api";

// True only when the session cookie itself is missing, expired or forged.
// Other 401s mean something else (e.g. a wrong verification code) and must
// not be treated as "signed out".
export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.body?.name === "Unauthorized";
}
