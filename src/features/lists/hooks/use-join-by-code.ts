import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enterListByShareCode } from "../api";
import { shopperListsKey } from "../queries";

export function useJoinByCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareCode: string) => enterListByShareCode(shareCode),
    // A new list to show on /lists (and on Início).
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shopperListsKey }),
  });
}
