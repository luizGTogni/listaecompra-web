import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createSession, createUser } from "../api";
import { RESEND_COOLDOWN_SECONDS } from "../constants";
import { useAuthStore } from "../store";
import type { CreateUserInput } from "../types";

// Sign up > silent sign in > code screen.
//
// Verifying the code needs a token, so right after creating the account we
// sign in with the same credentials. The user never sees that step.
export function useSignUp() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { user } = await createUser(input);

      try {
        const { token } = await createSession({
          email: input.email,
          password: input.password,
        });
        return { token, email: user.email };
      } catch {
        // The account exists, only the automatic sign in failed.
        return { token: null, email: user.email };
      }
    },
    onSuccess: ({ token, email }) => {
      if (!token) {
        router.replace("/sign-in");
        return;
      }
      // The backend just e-mailed the first code; it will refuse a resend for a while.
      setSession({
        token,
        email,
        resendAvailableAt: Date.now() + RESEND_COOLDOWN_SECONDS * 1000,
      });
      router.replace("/verify");
    },
  });
}
