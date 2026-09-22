import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createSession, createUser } from "../api";
import { RESEND_COOLDOWN_SECONDS } from "../constants";
import { useAuthStore } from "../store";
import type { CreateUserInput } from "../types";

// Sign up > silent sign in > code screen.
//
// Verifying the code needs a session, so right after creating the account we
// sign in with the same credentials. The user never sees that step.
export function useSignUp() {
  const router = useRouter();
  const setEmail = useAuthStore((state) => state.setEmail);
  const setResendAvailableAt = useAuthStore(
    (state) => state.setResendAvailableAt,
  );

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { user } = await createUser(input);

      let signedIn = true;
      try {
        await createSession({ email: input.email, password: input.password });
      } catch {
        // The account exists, only the automatic sign in failed.
        signedIn = false;
      }
      return { signedIn, email: user.email };
    },
    onSuccess: ({ signedIn, email }) => {
      if (!signedIn) {
        router.replace("/sign-in");
        return;
      }
      setEmail(email);
      // The backend just e-mailed the first code; it will refuse a resend for a while.
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      router.replace("/verify");
    },
  });
}
