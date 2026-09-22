import { apiFetch } from "@/services/api";
import type {
  CreateShopperListInput,
  ListFilters,
  ShopperList,
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
