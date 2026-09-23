"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CaretRight, Envelope, Plus, ShoppingBag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { myInvitesQuery, shopperListsQuery } from "../queries";
import { ListCard } from "./list-card";

// How many open lists the home shows; the rest is behind "Ver todas".
const RECENT_LISTS = 3;

export function HomeView() {
  const me = useQuery(currentUserQuery);
  // The same cache entry as page 1 of /lists: opening that screen after this
  // one costs no request, and a change to any list refreshes both.
  const lists = useQuery(
    shopperListsQuery({ query: "", page: 1, status: "open" }),
  );
  // Only a hint: if it fails the banner is simply not shown.
  const invites = useQuery(myInvitesQuery).data?.shopperListMembers.length ?? 0;

  const currentUserId = me.data?.user.id;
  const firstName = me.data?.user.name.split(" ")[0];
  const recent = lists.data?.shopperLists.slice(0, RECENT_LISTS) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {firstName ? `Olá, ${firstName}` : "Olá"}
        </h1>
        <Button asChild>
          <Link href="/lists/new">
            <Plus aria-hidden />
            Nova lista
          </Link>
        </Button>
      </div>

      {invites > 0 && (
        <Link
          href="/invites"
          className="flex items-center gap-3 rounded-xl bg-accent p-4 text-accent-foreground transition-colors hover:bg-accent/80"
        >
          <Envelope className="size-6 shrink-0" weight="fill" aria-hidden />
          <span className="flex-1 font-medium">
            {invites === 1
              ? "Você tem 1 convite pendente"
              : `Você tem ${invites} convites pendentes`}
          </span>
          <CaretRight className="size-5 shrink-0" aria-hidden />
        </Link>
      )}

      <section aria-labelledby="recent-lists" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="recent-lists" className="text-xl font-semibold">
            Listas em andamento
          </h2>
          {recent.length > 0 && (
            <Link
              href="/lists"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todas
            </Link>
          )}
        </div>

        {lists.isError ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <p>Não foi possível carregar suas listas.</p>
            <Button onClick={() => lists.refetch()}>Tentar novamente</Button>
          </div>
        ) : lists.isPending ? (
          <div
            role="status"
            aria-label="Carregando listas"
            className="flex flex-col gap-3"
          >
            {[0, 1].map((index) => (
              <div
                key={index}
                aria-hidden
                className="h-24 animate-pulse rounded-xl bg-secondary"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
              <ShoppingBag className="size-8" weight="fill" aria-hidden />
            </span>
            <p className="font-medium">Você não tem listas em andamento</p>
            <p className="text-sm text-muted-foreground">
              Crie uma lista e comece a adicionar o que precisa comprar.
            </p>
            <Button asChild variant="outline">
              <Link href="/lists/new">Criar minha primeira lista</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((list) => (
              <li key={list.id}>
                <ListCard
                  list={list}
                  isGuest={
                    currentUserId !== undefined && list.userId !== currentUserId
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
