"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleNotch, UserCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { shopperListMembersQuery, shopperListQuery } from "../queries";
import { InviteMemberForm } from "./invite-member-form";
import { MemberRow } from "./member-row";

export function MembersView({ listId }: { listId: string }) {
  const list = useQuery(shopperListQuery(listId));
  const members = useQuery(shopperListMembersQuery(listId));
  const currentUserId = useQuery(currentUserQuery).data?.user.id;

  if (list.isPending || members.isPending) {
    return (
      <div
        role="status"
        aria-label="Carregando membros"
        className="flex min-h-[40dvh] items-center justify-center gap-3 text-muted-foreground"
      >
        <CircleNotch className="size-6 animate-spin" aria-hidden />
        Carregando...
      </div>
    );
  }

  if (list.isError || members.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <p>Não foi possível carregar os membros desta lista.</p>
        <Button
          onClick={() => {
            list.refetch();
            members.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const { shopperList } = list.data;
  const isOwner =
    currentUserId !== undefined && shopperList.userId === currentUserId;
  const closed = !!shopperList.closedAt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
        <p className="mt-1 text-muted-foreground">{shopperList.title}</p>
      </div>

      {isOwner && !closed && <InviteMemberForm listId={listId} />}
      {isOwner && closed && (
        <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
          Reabra a lista para convidar mais gente.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {/* The owner is not in the members list: it is implicit in the list itself. */}
        <li className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground">
          <UserCircle
            className="size-8 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate">
              {isOwner
                ? "Você"
                : shopperList.user
                  ? `${shopperList.user.name} (@${shopperList.user.username})`
                  : `Usuário ${shopperList.userId.slice(0, 8)}`}
            </p>
            <p className="text-sm text-muted-foreground">Dono da lista</p>
          </div>
        </li>

        {members.data.shopperListMembers.map((member) => (
          <MemberRow
            key={member.memberId}
            listId={listId}
            member={member}
            isSelf={member.memberId === currentUserId}
            canRemove={isOwner}
          />
        ))}
      </ul>

      {members.data.shopperListMembers.length === 0 && (
        <p className="text-center text-muted-foreground">
          {isOwner
            ? "Ninguém foi convidado ainda."
            : "Só você e o dono têm acesso a esta lista."}
        </p>
      )}
    </div>
  );
}
