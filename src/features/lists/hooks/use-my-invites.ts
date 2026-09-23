import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptShopperListInvite, declineShopperListInvite } from "../api";
import { myInvitesKey, shopperListsKey } from "../queries";

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, memberId }: { listId: string; memberId: string }) =>
      acceptShopperListInvite(listId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myInvitesKey });
      // The list now shows up under "Lista".
      queryClient.invalidateQueries({ queryKey: shopperListsKey });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, memberId }: { listId: string; memberId: string }) =>
      declineShopperListInvite(listId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myInvitesKey }),
  });
}
