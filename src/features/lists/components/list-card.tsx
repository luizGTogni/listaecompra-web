import Link from "next/link";
import { CaretRight, UsersThree } from "@phosphor-icons/react";
import type { ShopperList } from "../types";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

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
    <Link
      href={`/lists/${list.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-accent"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate font-medium">{list.title}</h2>
        {(isGuest || closed) && (
          // Own row: with a long title the badges would squeeze it to nothing.
          <div className="flex flex-wrap gap-1.5">
            {isGuest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                <UsersThree className="size-3.5" weight="fill" aria-hidden />
                Convidado
              </span>
            )}
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
          Criada em {dateFormat.format(new Date(list.createdAt))}
        </p>
      </div>
      <CaretRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}
