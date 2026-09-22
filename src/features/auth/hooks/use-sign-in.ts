import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createSession } from "../api";
import { useAuthStore } from "../store";
import { resolvePostAuthRoute } from "../verification";

// Sign in > home, or sign in > code screen when the account is unverified.
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setEmail = useAuthStore((state) => state.setEmail);

  return useMutation({
    mutationFn: createSession,
    // The mutation stays "pending" until this promise settles, so the button
    // keeps its spinner while we decide where to go.
    onSuccess: async (_data, credentials) => {
      setEmail(credentials.email);
      router.replace(await resolvePostAuthRoute(queryClient));
    },
  });
}
