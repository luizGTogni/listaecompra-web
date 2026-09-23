"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleNotch, Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { myInvitesQuery } from "../queries";
import { InviteRow } from "./invite-row";

export function InvitesView() {
  const invites = useQuery(myInvitesQuery);

  if (invites.isPending) {
    return (
      <div
        role="status"
        aria-label="Carregando convites"
        className="flex min-h-[40dvh] items-center justify-center gap-3 text-muted-foreground"
      >
        <CircleNotch className="size-6 animate-spin" aria-hidden />
        Carregando...
      </div>
    );
  }

  if (invites.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <p>Não foi possível carregar seus convites.</p>
        <Button onClick={() => invites.refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const list = invites.data.shopperListMembers;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Envelope className="size-8" weight="fill" aria-hidden />
        </span>
        <p className="text-muted-foreground">Nenhum convite pendente.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {list.map((invite) => (
        <InviteRow key={invite.shopperListId} invite={invite} />
      ))}
    </ul>
  );
}
