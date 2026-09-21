"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/page-status";
import { useIsClient } from "@/hooks/use-is-client";
import { useAuthStore } from "../store";

// Client-side route guard. The token lives in localStorage, which the server
// cannot read, so the redirect has to happen in the browser.
export function RequireToken({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (isClient && !token) router.replace("/sign-in");
  }, [isClient, token, router]);

  if (!isClient || !token) return <PageLoading />;

  return children;
}
