import { useMutation } from "@tanstack/react-query";
import { toggleShopperListClosed } from "../api";
import { useInvalidateListEverywhere } from "./use-shopper-list-detail";

export function useToggleListClosed(listId: string) {
  const invalidate = useInvalidateListEverywhere(listId);

  return useMutation({
    mutationFn: () => toggleShopperListClosed(listId),
    onSuccess: invalidate,
  });
}
