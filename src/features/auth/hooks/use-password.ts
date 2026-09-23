import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changePassword, forgotPassword, resetPassword } from "../api";
import { isUnknownEmailError } from "../errors";

// Asks for the code, then moves on to the screen where it is typed.
export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      try {
        await forgotPassword(email);
      } catch (error) {
        // Unknown e-mail: carry on as if it had been sent.
        if (!isUnknownEmailError(error)) throw error;
      }
    },
    onSuccess: () => router.replace("/reset-password"),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Senha alterada. Entre com a nova senha.");
      router.replace("/sign-in");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Senha alterada."),
  });
}
