"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleNotch, ShoppingBag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useShopperListEvents } from "../hooks/use-shopper-list-events";
import { shopperListQuery } from "../queries";
import { AiSuggestButton } from "./ai-suggest-button";
import { AddItemForm } from "./add-item-form";
import { GuestBadge } from "./guest-badge";
import { ListOptionsMenu } from "./list-options-menu";
import { ShopperItemRow } from "./shopper-item-row";

export function ShopperListDetailView({ listId }: { listId: string }) {
  const list = useQuery(shopperListQuery(listId));
  // Already in the cache (the route guard loaded it): no extra request.
  const currentUserId = useQuery(currentUserQuery).data?.user.id;
  useShopperListEvents(listId);
  useDocumentTitle(list.data?.shopperList.title);

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
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
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
          <ListOptionsMenu list={shopperList} isOwner={isOwner} />
        </div>
        {shopperList.description && (
          <p className="text-muted-foreground">{shopperList.description}</p>
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
