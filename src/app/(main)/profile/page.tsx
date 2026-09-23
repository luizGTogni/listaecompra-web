import type { Metadata } from "next";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { MyUsername } from "@/features/auth/components/my-username";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = { title: "Perfil" };

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Perfil</h1>
      <div className="flex flex-col gap-6">
        <MyUsername />
        <ChangePasswordForm />
        {/* From md the header already has "Sair". */}
        <SignOutButton className="-ml-2.5 self-start md:hidden" />
      </div>
    </main>
  );
}
