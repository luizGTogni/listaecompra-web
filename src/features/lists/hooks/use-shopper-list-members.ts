import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { inviteShopperListMember, removeShopperListMember } from "../api";
import {
  shopperListDetailKey,
  shopperListMembersKey,
  shopperListsKey,
} from "../queries";

export function useInviteMember(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => inviteShopperListMember(listId, username),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: shopperListMembersKey(listId),
      }),
  });
}

// The owner removing someone else. For the current user leaving the list
// themselves, use `useLeaveList` instead: the consequences differ (they lose
// access to the list, this one doesn't).
export function useRemoveMember(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeShopperListMember(listId, memberId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: shopperListMembersKey(listId),
      }),
  });
}

// The current user leaving a list they are a member of (or declining a
// pending invite from this screen, same endpoint either way).
export function useLeaveList(listId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeShopperListMember(listId, memberId),
    onSuccess: () => {
      // The list no longer shows up for this user anywhere.
      queryClient.invalidateQueries({ queryKey: shopperListsKey });
      queryClient.removeQueries({ queryKey: shopperListMembersKey(listId) });
      queryClient.removeQueries({ queryKey: shopperListDetailKey(listId) });
      router.replace("/lists");
    },
  });
}
