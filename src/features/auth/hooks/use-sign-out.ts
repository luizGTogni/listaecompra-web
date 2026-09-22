import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signOut } from "../api";
import { useAuthStore } from "../store";

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clear();
      // The next person to use this browser must never see this user's data.
      queryClient.clear();
      router.replace("/sign-in");
    },
  });
}
