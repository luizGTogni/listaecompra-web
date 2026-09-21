import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Entrar" };

export default function SignInPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Entre para ver suas listas de compras.
      </p>

      <SignInForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </>
  );
}
