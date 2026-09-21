import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/services/api";
import { resendCode, verifyUser } from "../api";
import { RESEND_COOLDOWN_SECONDS } from "../constants";
import { isAlreadyVerifiedError } from "../errors";
import { currentUserQuery } from "../queries";
import { useAuthStore } from "../store";

export function useVerify() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function finish() {
    // The cached user still says "not verified". Removing it (instead of just
    // marking it stale) makes the guard on the home page wait for a fresh
    // answer, rather than bounce the user back here with the old one.
    queryClient.removeQueries({ queryKey: currentUserQuery.queryKey });
    router.replace("/");
  }

  return useMutation({
    mutationFn: verifyUser,
    onSuccess: finish,
    // Already verified (e.g. in another tab) is the outcome we wanted anyway.
    onError: (error) => {
      if (isAlreadyVerifiedError(error)) finish();
    },
  });
}

export function useResendCode() {
  const setResendAvailableAt = useAuthStore(
    (state) => state.setResendAvailableAt,
  );

  return useMutation({
    mutationFn: resendCode,
    onSuccess: () =>
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000),
    // Asked too soon: the server says how long is left.
    onError: (error) => {
      const seconds = error instanceof ApiError ? error.retryAfter : null;
      if (seconds) setResendAvailableAt(Date.now() + seconds * 1000);
    },
  });
}
