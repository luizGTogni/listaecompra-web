"use client";

import {
  CheckCircle,
  Circle,
  CircleNotch,
  Minus,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { cn } from "@/utils/cn";
import { getItemActionMessage } from "../errors";
import {
  useRemoveItem,
  useToggleItemPurchased,
  useUpdateItemQuantity,
} from "../hooks/use-shopper-list-detail";
import { ITEM_MAX_QUANTITY } from "../schemas";
import type { ShopperItem } from "../types";

interface ShopperItemRowProps {
  listId: string;
  item: ShopperItem;
  // The list is closed, or the viewer is not allowed to change it: every
  // control below becomes read-only.
  disabled: boolean;
}

export function ShopperItemRow({
  listId,
  item,
  disabled,
}: ShopperItemRowProps) {
  const togglePurchased = useToggleItemPurchased(listId);
  const updateQuantity = useUpdateItemQuantity(listId);
  const removeItem = useRemoveItem(listId);

  const currentUserId = useQuery(currentUserQuery).data?.user.id;

  const purchased = !!item.purchasedAt;
  // Items bought before the backend tracked the author have no name to show.
  const purchasedByName =
    purchased && item.purchasedBy
      ? item.purchasedById === currentUserId
        ? "você"
        : item.purchasedBy.name
      : null;
  // The backend refuses to change the quantity of a purchased item.
  const canEditQuantity = !disabled && !purchased;
  const busy =
    togglePurchased.isPending ||
    updateQuantity.isPending ||
    removeItem.isPending;
  const error =
    (togglePurchased.isError && togglePurchased.error) ||
    (updateQuantity.isError && updateQuantity.error) ||
    (removeItem.isError && removeItem.error) ||
    null;

  function changeQuantity(next: number) {
    if (next < 1) return;
    updateQuantity.mutate({ itemId: item.id, quantity: next });
  }

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={purchased}
          aria-label={
            purchased
              ? `Marcar ${item.title} como não comprado`
              : `Marcar ${item.title} como comprado`
          }
          disabled={disabled || togglePurchased.isPending}
          onClick={() => togglePurchased.mutate(item.id)}
          className="shrink-0 text-muted-foreground disabled:opacity-50"
        >
          {purchased ? (
            <CheckCircle className="size-6 text-contrast" weight="fill" />
          ) : (
            <Circle className="size-6" />
          )}
        </button>

        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            purchased && "text-muted-foreground line-through",
          )}
        >
          {item.title}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canEditQuantity || item.quantity <= 1}
            onClick={() => changeQuantity(item.quantity - 1)}
            aria-label="Diminuir quantidade"
          >
            <Minus aria-hidden />
          </Button>
          <span className="w-6 text-center text-sm tabular-nums">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canEditQuantity || item.quantity >= ITEM_MAX_QUANTITY}
            onClick={() => changeQuantity(item.quantity + 1)}
            aria-label="Aumentar quantidade"
          >
            <Plus aria-hidden />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || removeItem.isPending}
          onClick={() => removeItem.mutate(item.id)}
          aria-label={`Remover ${item.title}`}
          className="text-muted-foreground hover:text-destructive"
        >
          {removeItem.isPending ? (
            <CircleNotch className="animate-spin" aria-hidden />
          ) : (
            <Trash aria-hidden />
          )}
        </Button>
      </div>

      {purchasedByName && (
        <p className="pl-9 text-sm text-muted-foreground">
          Comprado por {purchasedByName}
        </p>
      )}
      {busy && (
        <span className="sr-only" role="status">
          Atualizando {item.title}...
        </span>
      )}
      {error && (
        <p role="alert" className="pl-9 text-sm text-destructive">
          {getItemActionMessage(error)}
        </p>
      )}
    </li>
  );
}
