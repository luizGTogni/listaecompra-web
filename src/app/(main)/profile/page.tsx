import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = { title: "Perfil" };

export default function ProfilePage() {
  return (
    <ComingSoon title="Perfil">
      <SignOutButton className="mt-6 -ml-2.5" />
    </ComingSoon>
  );
}
