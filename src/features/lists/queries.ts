import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getShopperLists } from "./api";
import type { ListFilters } from "./types";

// Cache key of the user's lists. Whoever changes the lists invalidates it, so
// the list screen fetches again the next time it is shown. It is a prefix of
// every key below, so one invalidation covers all searches and pages.
export const shopperListsKey = ["shopper-lists"] as const;

export const shopperListsQuery = (filters: ListFilters) =>
  queryOptions({
    // Filters are part of the key: each search/page is cached on its own.
    queryKey: [...shopperListsKey, filters],
    queryFn: () => getShopperLists(filters),
    // While the next page or search loads, keep showing the previous one
    // instead of flashing an empty screen.
    placeholderData: keepPreviousData,
  });
