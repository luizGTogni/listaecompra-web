import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Crie uma nova senha</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Se o e-mail informado tiver uma conta, enviamos um código de 6
        caracteres. Digite-o abaixo, com a nova senha.
      </p>

      <ResetPasswordForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não recebeu?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Pedir outro código
        </Link>
      </p>
    </>
  );
}
