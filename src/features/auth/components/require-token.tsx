"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/page-status";
import { Button } from "@/components/ui/button";
import { useSessionStatus } from "../use-session-status";

// Needs a session (cookie), but not a verified account: only `/verify` uses
// this directly, everything else needs `RequireVerified`.
export function RequireToken({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSessionStatus();

  useEffect(() => {
    if (session.state === "unauthenticated") router.replace("/sign-in");
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

  if (session.state === "loading" || session.state === "unauthenticated") {
    return <PageLoading />;
  }

  return children;
}
