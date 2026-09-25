import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  shopperListDetailKey,
  shopperListsKey,
} from "@/features/lists/queries";
import { applyAiProposal, sendAiChat } from "../api";

export function useAiChat(shopperListId?: string) {
  return useMutation({
    mutationFn: (messages: Parameters<typeof sendAiChat>[0]["messages"]) =>
      sendAiChat({ shopperListId, messages }),
  });
}

// A new list opens its detail screen; an existing one just refreshes.
export function useApplyAiProposal(shopperListId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposal: Parameters<typeof applyAiProposal>[0]["proposal"]) =>
      applyAiProposal({ shopperListId, proposal }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: shopperListsKey });
      if (shopperListId) {
        queryClient.invalidateQueries({
          queryKey: shopperListDetailKey(shopperListId),
        });
        toast.success("Lista atualizada.");
      } else {
        toast.success("Lista criada.");
        router.push(`/lists/${result.shopperListId}`);
      }
    },
  });
}
