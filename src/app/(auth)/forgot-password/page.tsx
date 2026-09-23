import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Esqueceu a senha?</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Informe seu e-mail e enviaremos um código para criar uma nova senha.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Voltar para entrar
        </Link>
      </p>
    </>
  );
}
