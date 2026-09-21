import type { Metadata } from "next";
import { RequireToken } from "@/features/auth/components/require-token";
import { VerifyForm } from "@/features/auth/components/verify-form";

export const metadata: Metadata = { title: "Confirmar e-mail" };

export default function VerifyPage() {
  return (
    // Needs a token (the code is checked against the signed-in user), but not
    // a verified account: that is exactly what this screen is for.
    <RequireToken>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Confirme seu e-mail
      </h1>
      <VerifyForm />
    </RequireToken>
  );
}
