import { useQuery } from "@tanstack/react-query";
import { currentUserQuery } from "./queries";
import { isUnauthorizedError } from "./unauthorized";

export type SessionStatus =
  | { state: "loading" }
  | { state: "error"; retry: () => void }
  | { state: "unauthenticated" }
  | { state: "unverified" }
  | { state: "verified" };

// The one place that turns "GET /users/me" into what a guard needs to know.
export function useSessionStatus(): SessionStatus {
  const currentUser = useQuery(currentUserQuery);

  if (isUnauthorizedError(currentUser.error))
    return { state: "unauthenticated" };
  if (currentUser.isError) {
    return { state: "error", retry: () => currentUser.refetch() };
  }
  if (!currentUser.isSuccess) return { state: "loading" };

  return {
    state: currentUser.data.user.verifiedAt ? "verified" : "unverified",
  };
}
