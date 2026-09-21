import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createSession } from "../api";
import { useAuthStore } from "../store";
import type { Credentials } from "../types";
import { resolvePostAuthRoute } from "../verification";

// Sign in > home, or sign in > code screen when the account is unverified.
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      const { token } = await createSession(credentials);
      return { token, email: credentials.email };
    },
    // The mutation stays "pending" until this promise settles, so the button
    // keeps its spinner while we decide where to go.
    onSuccess: async (session) => {
      setSession(session);
      router.replace(await resolvePostAuthRoute(queryClient));
    },
  });
}
