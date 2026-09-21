import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Leva menos de um minuto. Depois é só montar sua primeira lista.
      </p>

      <SignUpForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        {/* /sign-in is the next screen; the link 404s until it exists. */}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
