"use client";

import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/page-status";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "../queries";
import { RequireToken } from "./require-token";

// Everything behind this needs a signed-in AND verified user.
export function RequireVerified({ children }: { children: ReactNode }) {
  return (
    <RequireToken>
      <VerifiedGate>{children}</VerifiedGate>
    </RequireToken>
  );
}

function VerifiedGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentUser = useQuery(currentUserQuery);
  const notVerified =
    currentUser.isSuccess && !currentUser.data.user.verifiedAt;

  useEffect(() => {
    if (notVerified) router.replace("/verify");
  }, [notVerified, router]);

  if (currentUser.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 px-4 py-16 text-center"
      >
        <p>Não foi possível carregar sua conta.</p>
        <Button onClick={() => currentUser.refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  if (!currentUser.isSuccess || notVerified) return <PageLoading />;

  return children;
}
