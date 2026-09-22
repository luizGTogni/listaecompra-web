"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/page-status";
import { Button } from "@/components/ui/button";
import { useSessionStatus } from "../use-session-status";

// Everything behind this needs a signed-in AND verified user.
export function RequireVerified({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSessionStatus();

  useEffect(() => {
    if (session.state === "unauthenticated") router.replace("/sign-in");
    else if (session.state === "unverified") router.replace("/verify");
  }, [session.state, router]);

  if (session.state === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 px-4 py-16 text-center"
      >
        <p>Não foi possível carregar sua conta.</p>
        <Button onClick={session.retry}>Tentar novamente</Button>
      </div>
    );
  }

  if (session.state !== "verified") return <PageLoading />;

  return children;
}
