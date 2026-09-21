"use client";

import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useSignOut } from "../hooks/use-sign-out";

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useSignOut();

  return (
    <Button variant="ghost" className={className} onClick={signOut}>
      <SignOut aria-hidden />
      Sair
    </Button>
  );
}
