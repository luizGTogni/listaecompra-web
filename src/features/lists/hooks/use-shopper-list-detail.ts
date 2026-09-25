import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addShopperItem,
  removeShopperItem,
  resetShareCode,
  toggleItemPurchased,
  updateItemQuantity,
} from "../api";
import { shopperListDetailKey, shopperListsKey } from "../queries";
import type { AddItemInput } from "../types";

// Every item mutation below only touches this one list's detail, so they all
// invalidate the same key. They do NOT touch `shopperListsKey`: the list
// screens show titles and dates, not items, so an item changing does not
// make them stale.
function useInvalidateListDetail(listId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: shopperListDetailKey(listId) });
}

export function useAddItem(listId: string) {
  const invalidate = useInvalidateListDetail(listId);

  return useMutation({
    mutationFn: (input: AddItemInput) => addShopperItem(listId, input),
    onSuccess: invalidate,
  });
}

export function useToggleItemPurchased(listId: string) {
  const invalidate = useInvalidateListDetail(listId);

  return useMutation({
    mutationFn: (itemId: string) => toggleItemPurchased(listId, itemId),
    onSuccess: invalidate,
  });
}

export function useUpdateItemQuantity(listId: string) {
  const invalidate = useInvalidateListDetail(listId);

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateItemQuantity(listId, itemId, quantity),
    onSuccess: invalidate,
  });
}

export function useRemoveItem(listId: string) {
  const invalidate = useInvalidateListDetail(listId);

  return useMutation({
    mutationFn: (itemId: string) => removeShopperItem(listId, itemId),
    onSuccess: invalidate,
  });
}

// Closing/reopening and deleting change what the list screens show
// (Concluída badge, or the list disappearing), so these also invalidate
// `shopperListsKey`, unlike the item mutations above.
export function useInvalidateListEverywhere(listId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: shopperListDetailKey(listId) });
    queryClient.invalidateQueries({ queryKey: shopperListsKey });
  };
}

// Only the detail carries the code, and no list screen shows it.
export function useResetShareCode(listId: string) {
  const invalidate = useInvalidateListDetail(listId);

  return useMutation({
    mutationFn: () => resetShareCode(listId),
    onSuccess: invalidate,
  });
}
