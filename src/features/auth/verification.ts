import type { QueryClient } from "@tanstack/react-query";
import { currentUserQuery } from "./queries";

// Where to send a user who just signed in: home when the account is verified,
// the code screen when it is not. fetchQuery keeps the user in the cache, so
// the guard on the home page does not ask for it a second time.
export async function resolvePostAuthRoute(
  queryClient: QueryClient,
): Promise<"/" | "/verify"> {
  try {
    const { user } = await queryClient.fetchQuery(currentUserQuery);
    return user.verifiedAt ? "/" : "/verify";
  } catch {
    // e.g. offline: the guard on the home page shows a retry button.
    return "/";
  }
}
