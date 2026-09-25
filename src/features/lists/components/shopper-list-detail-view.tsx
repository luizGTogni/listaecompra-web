"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CircleNotch, ShoppingBag, UsersThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { shopperListQuery } from "../queries";
import { AiSuggestButton } from "./ai-suggest-button";
import { AddItemForm } from "./add-item-form";
import { GuestBadge } from "./guest-badge";
import { DeleteListDialog } from "./delete-list-dialog";
import { ShareListSheet } from "./share-list-sheet";
import { ShopperItemRow } from "./shopper-item-row";
import { ToggleListClosedButton } from "./toggle-list-closed-button";

export function ShopperListDetailView({ listId }: { listId: string }) {
  const list = useQuery(shopperListQuery(listId));
  // Already in the cache (the route guard loaded it): no extra request.
  const currentUserId = useQuery(currentUserQuery).data?.user.id;

  if (list.isPending) {
    return (
      <div
        role="status"
        aria-label="Carregando lista"
        className="flex min-h-[40dvh] items-center justify-center gap-3 text-muted-foreground"
      >
        <CircleNotch className="size-6 animate-spin" aria-hidden />
        Carregando...
      </div>
    );
  }

  if (list.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 py-12 text-center"
      >
        <p>Não foi possível carregar esta lista.</p>
        <Button onClick={() => list.refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const { shopperList } = list.data;
  const isOwner =
    currentUserId !== undefined && shopperList.userId === currentUserId;
  const isGuest =
    currentUserId !== undefined && shopperList.userId !== currentUserId;
  const closed = !!shopperList.closedAt;
  // Unpurchased items first, so the shopping list itself shortens as you go.
  // `?? []`: a backend build from before the `items` > `shopperItems` rename
  // sends neither, and the page should show an empty list, not crash.
  const items = [...(shopperList.shopperItems ?? [])].sort((a, b) => {
    if (!!a.purchasedAt === !!b.purchasedAt) return 0;
    return a.purchasedAt ? 1 : -1;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {shopperList.title}
          </h1>
          {isGuest && <GuestBadge owner={shopperList.user} />}
          {closed && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              Concluída
            </span>
          )}
        </div>
        {shopperList.description && (
          <p className="text-muted-foreground">{shopperList.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Owner and accepted members can both see who else has access. */}
        <Button variant="outline" asChild>
          <Link href={`/lists/${listId}/members`}>
            <UsersThree aria-hidden />
            Membros
          </Link>
        </Button>
        {isOwner && !closed && shopperList.shareCode && (
          <ShareListSheet
            listId={listId}
            listTitle={shopperList.title}
            shareCode={shopperList.shareCode}
          />
        )}
        {isOwner && (
          <>
            <ToggleListClosedButton listId={listId} closed={closed} />
            <DeleteListDialog listId={listId} listTitle={shopperList.title} />
          </>
        )}
      </div>

      {closed && (
        <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
          Esta lista está concluída
          {isOwner ? ": reabra para adicionar ou alterar itens." : "."}
        </p>
      )}

      {!closed && (
        <>
          <AiSuggestButton listId={listId} />
          <AddItemForm listId={listId} />
        </>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
            <ShoppingBag className="size-8" weight="fill" aria-hidden />
          </span>
          <p className="text-muted-foreground">
            {closed ? "Esta lista não teve itens." : "Ainda não há itens."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ShopperItemRow
              key={item.id}
              listId={listId}
              item={item}
              disabled={closed}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
