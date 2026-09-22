"use client";

import { CircleNotch, SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useSignOut } from "../hooks/use-sign-out";

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useSignOut();

  return (
    <Button
      variant="ghost"
      className={className}
      disabled={signOut.isPending}
      onClick={() => signOut.mutate()}
    >
      {signOut.isPending ? (
        <CircleNotch className="animate-spin" aria-hidden />
      ) : (
        <SignOut aria-hidden />
      )}
      Sair
    </Button>
  );
}
