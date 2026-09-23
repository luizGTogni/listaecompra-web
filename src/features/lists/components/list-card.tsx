import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { formatDate } from "@/utils/format-date";
import type { ShopperList } from "../types";
import { GuestBadge } from "./guest-badge";

interface ListCardProps {
  list: ShopperList;
  // The list belongs to someone else, who invited the current user.
  isGuest?: boolean;
  // Off on a screen where every card is closed anyway (Histórico): the tag
  // would just repeat what the screen already says.
  showClosedBadge?: boolean;
}

export function ListCard({
  list,
  isGuest = false,
  showClosedBadge = true,
}: ListCardProps) {
  const closed = showClosedBadge && list.closedAt;

  return (
    // The link is stretched over the whole card (the `after` on it), and the
    // badges sit above it: a badge can be a button (the owner popover), and a
    // button cannot live inside a link.
    <div className="relative flex items-center gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors focus-within:bg-accent hover:bg-accent">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate font-medium">
          <Link
            href={`/lists/${list.id}`}
            className="rounded-sm after:absolute after:inset-0 after:rounded-xl"
          >
            {list.title}
          </Link>
        </h2>
        {(isGuest || closed) && (
          // Own row: with a long title the badges would squeeze it to nothing.
          <div className="relative z-10 flex flex-wrap gap-1.5 self-start">
            {isGuest && <GuestBadge owner={list.user} />}
            {closed && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                Concluída
              </span>
            )}
          </div>
        )}
        {list.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {list.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Criada em {formatDate(list.createdAt)}
        </p>
      </div>
      <CaretRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
