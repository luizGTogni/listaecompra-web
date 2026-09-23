import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteShopperList } from "../api";
import { shopperListDetailKey, shopperListsKey } from "../queries";

export function useDeleteList(listId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteShopperList(listId),
    onSuccess: () => {
      // Gone for good: drop the detail instead of just invalidating it, so
      // nothing tries to refetch a list that no longer exists.
      queryClient.removeQueries({ queryKey: shopperListDetailKey(listId) });
      queryClient.invalidateQueries({ queryKey: shopperListsKey });
      toast.success("Lista excluída.");
      router.replace("/lists");
    },
  });
}
