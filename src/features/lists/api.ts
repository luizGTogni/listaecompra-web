import { apiFetch } from "@/services/api";
import type {
  AddItemInput,
  CreateShopperListInput,
  ListFilters,
  MyInvite,
  ShopperItem,
  ShopperList,
  ShopperListDetail,
  ShopperListMember,
  ShopperListsPage,
} from "./types";

export function createShopperList(input: CreateShopperListInput) {
  return apiFetch<{ shopperList: ShopperList }>("/shoppers", {
    method: "POST",
    body: input,
  });
}

export function getShopperLists({ query, page, status }: ListFilters) {
  const params = new URLSearchParams({ page: String(page), status });
  // The backend defaults `query` to "": leave it out when there is no search.
  if (query) params.set("query", query);

  return apiFetch<ShopperListsPage>(`/shoppers?${params}`);
}

export function getShopperList(listId: string) {
  return apiFetch<{ shopperList: ShopperListDetail }>(`/shoppers/${listId}`);
}

// Owner only; the backend answers 404 (not 403) for a guest, same as for a
// list that does not exist.
export function toggleShopperListClosed(listId: string) {
  return apiFetch<{ shopperList: ShopperList }>(`/shoppers/${listId}/close`, {
    method: "PATCH",
  });
}

// Owner only, see toggleShopperListClosed.
export function deleteShopperList(listId: string) {
  return apiFetch<null>(`/shoppers/${listId}`, { method: "DELETE" });
}

export function addShopperItem(listId: string, input: AddItemInput) {
  return apiFetch<{ shopperItem: ShopperItem }>(
    `/shoppers/${listId}/items/add`,
    { method: "POST", body: input },
  );
}

export function removeShopperItem(listId: string, itemId: string) {
  return apiFetch<null>(`/shoppers/${listId}/items/${itemId}/remove`, {
    method: "DELETE",
  });
}

export function toggleItemPurchased(listId: string, itemId: string) {
  return apiFetch<{ shopperItem: ShopperItem }>(
    `/shoppers/${listId}/items/${itemId}/purchase`,
    { method: "PATCH" },
  );
}

// Quantity 0 removes the item (the backend's own shortcut for it).
export function updateItemQuantity(
  listId: string,
  itemId: string,
  quantity: number,
) {
  return apiFetch<{ shopperItem: ShopperItem }>(
    `/shoppers/${listId}/items/${itemId}/quantity`,
    { method: "PATCH", body: { quantity } },
  );
}

// Owner or an already-accepted member; includes pending invites.
export function getShopperListMembers(listId: string) {
  return apiFetch<{ shopperListMembers: ShopperListMember[] }>(
    `/shoppers/${listId}/members`,
  );
}

// Owner only. The backend looks the person up by username (exact match, and
// sign-up stores usernames in lower case).
export function inviteShopperListMember(listId: string, username: string) {
  return apiFetch<{ shopperListMember: ShopperListMember }>(
    `/shoppers/${listId}/members/invite`,
    { method: "POST", body: { username } },
  );
}

// Owner removing someone else, or a member removing themselves (leaving).
export function removeShopperListMember(listId: string, memberId: string) {
  return apiFetch<null>(`/shoppers/${listId}/members/${memberId}/remove`, {
    method: "DELETE",
  });
}

// The current user's own pending invites, across every list.
export function getMyInvites() {
  return apiFetch<{ shopperListMembers: MyInvite[] }>(
    "/users/shoppers/invites",
  );
}

export function acceptShopperListInvite(listId: string, memberId: string) {
  return apiFetch<{ shopperListMember: ShopperListMember }>(
    `/shoppers/${listId}/members/${memberId}/accept`,
    { method: "PATCH" },
  );
}

export function declineShopperListInvite(listId: string, memberId: string) {
  return apiFetch<null>(`/shoppers/${listId}/members/${memberId}/decline`, {
    method: "DELETE",
  });
}

// Owner only, open lists only. The old code (and every link with it) stops
// working.
export function resetShareCode(listId: string) {
  return apiFetch<{ shopperList: ShopperList }>(
    `/shoppers/${listId}/share-code/reset`,
    { method: "PATCH" },
  );
}

// Joins straight away as an accepted member: no invite to accept.
export function enterListByShareCode(shareCode: string) {
  return apiFetch<{ shopperListMember: ShopperListMember }>(
    "/shoppers/members/enter",
    { method: "POST", body: { shareCode } },
  );
}
