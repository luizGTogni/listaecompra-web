import { authFetch } from "@/features/auth/authed-fetch";
import type { CreateShopperListInput, ShopperList } from "./types";

export function createShopperList(input: CreateShopperListInput) {
  return authFetch<{ shopperList: ShopperList }>("/shoppers", {
    method: "POST",
    body: input,
  });
}
