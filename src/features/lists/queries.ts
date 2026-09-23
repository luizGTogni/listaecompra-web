import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getMyInvites,
  getShopperList,
  getShopperListMembers,
  getShopperLists,
} from "./api";
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

// Cache key of one list's detail (its items included). Any change to that
// list or its items invalidates this.
export const shopperListDetailKey = (listId: string) =>
  ["shopper-list", listId] as const;

export const shopperListQuery = (listId: string) =>
  queryOptions({
    queryKey: shopperListDetailKey(listId),
    queryFn: () => getShopperList(listId),
  });

// Cache key of one list's members (owner + guests, including pending
// invites). Separate from the list detail: inviting/removing someone does
// not change the list or its items.
export const shopperListMembersKey = (listId: string) =>
  ["shopper-list-members", listId] as const;

export const shopperListMembersQuery = (listId: string) =>
  queryOptions({
    queryKey: shopperListMembersKey(listId),
    queryFn: () => getShopperListMembers(listId),
  });

// The current user's own pending invites, across every list.
export const myInvitesKey = ["my-invites"] as const;

export const myInvitesQuery = queryOptions({
  queryKey: myInvitesKey,
  queryFn: getMyInvites,
});
