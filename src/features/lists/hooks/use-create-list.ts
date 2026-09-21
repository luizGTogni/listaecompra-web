import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createShopperList } from "../api";
import { shopperListsKey } from "../queries";

export function useCreateList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShopperList,
    onSuccess: ({ shopperList }) => {
      // The cached lists no longer match the server: mark them stale.
      queryClient.invalidateQueries({ queryKey: shopperListsKey });
      toast.success(`Lista "${shopperList.title}" criada.`);
      // replace, not push: "Back" should not return to a filled-in form.
      router.replace("/lists");
    },
  });
}
