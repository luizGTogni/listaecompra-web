"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getJoinByCodeMessage } from "../errors";
import { useJoinByCode } from "../hooks/use-join-by-code";

// The page behind a shared link (`/join/<code>`): joins as soon as it opens.
export function JoinByLinkView({ shareCode }: { shareCode: string }) {
  const router = useRouter();
  const { mutate, isError, error } = useJoinByCode();
  // Strict Mode runs effects twice in development: joining twice would turn
  // the second call into a "you are already a member" error.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    mutate(shareCode, {
      onSuccess({ shopperListMember }) {
        toast.success("Você entrou na lista.");
        router.replace(`/lists/${shopperListMember.shopperListId}`);
      },
    });
  }, [mutate, router, shareCode]);

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <p>{getJoinByCodeMessage(error)}</p>
        <Button asChild>
          <Link href="/lists">Ir para minhas listas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Entrando na lista"
      className="flex min-h-[40dvh] items-center justify-center gap-3 text-muted-foreground"
    >
      <CircleNotch className="size-6 animate-spin" aria-hidden />
      Entrando na lista...
    </div>
  );
}
