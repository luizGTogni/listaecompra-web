import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "./api";

// One definition of the key + fetcher, shared by useQuery, fetchQuery and the
// cache cleanup so they all agree on the same cache entry.
export const currentUserQuery = queryOptions({
  queryKey: ["current-user"],
  queryFn: getCurrentUser,
});
