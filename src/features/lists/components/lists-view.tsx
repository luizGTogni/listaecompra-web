"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "@/features/auth/queries";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/utils/cn";
import { shopperListsQuery } from "../queries";
import type { ListStatus } from "../types";
import { ListCard } from "./list-card";
import { ListSearchField } from "./list-search-field";
import { ListsPagination } from "./lists-pagination";

interface ListsViewProps {
  status: ListStatus;
}

// Powers both /lists (open) and /history (closed): the backend filters by
// status, so a list only ever needs one or the other, never a mix.
export function ListsView({ status }: ListsViewProps) {
  const [text, setText] = useState("");
  const query = useDebounce(text.trim(), 300);

  // The page number belongs to the search it was chosen in. Remembering the
  // query next to it resets to page 1 when the search changes, with no effect.
  const [pageState, setPageState] = useState({ query, page: 1 });
  const page = pageState.query === query ? pageState.page : 1;

  const lists = useQuery(shopperListsQuery({ query, page, status }));
  // Already in the cache (the route guard loaded it), so this costs no request.
  // A list whose owner is someone else is one the user was invited to.
  const currentUserId = useQuery(currentUserQuery).data?.user.id;

  function goToPage(next: number) {
    setPageState({ query, page: next });
    // Otherwise the new page would open scrolled to its bottom.
    window.scrollTo({ top: 0 });
  }

  const items = lists.data?.shopperLists ?? [];
  const totalPages = lists.data
    ? Math.max(1, Math.ceil(lists.data.total / lists.data.perPage))
    : 1;
  // Showing the previous results while the new ones load.
  const isRefreshing = lists.isPlaceholderData;

  return (
    <div className="flex flex-col gap-5">
      <ListSearchField value={text} onChange={setText} />

      {lists.isError ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <p>Não foi possível carregar suas listas.</p>
          <Button onClick={() => lists.refetch()}>Tentar novamente</Button>
        </div>
      ) : lists.isPending ? (
        <ListsSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          status={status}
          query={query}
          page={page}
          onClearSearch={() => setText("")}
          onFirstPage={() => goToPage(1)}
        />
      ) : (
        <>
          {/* Read out by screen readers after a search, without moving focus. */}
          <p role="status" className="sr-only">
            {items.length} de {lists.data.total} lista(s)
            {query ? ` para “${query}”` : ""}.
          </p>
          <ul
            aria-busy={isRefreshing}
            className={cn(
              "flex flex-col gap-3 transition-opacity",
              isRefreshing && "opacity-60",
            )}
          >
            {items.map((list) => (
              <li key={list.id}>
                <ListCard
                  list={list}
                  isGuest={
                    currentUserId !== undefined && list.userId !== currentUserId
                  }
                  showClosedBadge={status === "open"}
                />
              </li>
            ))}
          </ul>
          <ListsPagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => goToPage(page - 1)}
            onNext={() => goToPage(page + 1)}
          />
        </>
      )}
    </div>
  );
}

function ListsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando listas"
      className="flex flex-col gap-3"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          aria-hidden
          className="h-24 animate-pulse rounded-xl bg-secondary"
        />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  status: ListStatus;
  query: string;
  page: number;
  onClearSearch: () => void;
  onFirstPage: () => void;
}

function EmptyState({
  status,
  query,
  page,
  onClearSearch,
  onFirstPage,
}: EmptyStateProps) {
  // A page beyond the last one, e.g. the last list on it was just deleted.
  if (page > 1) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Não há mais listas depois desta página.
        </p>
        <Button variant="outline" onClick={onFirstPage}>
          Voltar para a primeira página
        </Button>
      </div>
    );
  }

  if (query) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Nenhuma lista com &ldquo;{query}&rdquo;.
        </p>
        <Button variant="outline" onClick={onClearSearch}>
          Ver todas as listas
        </Button>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <ShoppingBag className="size-8" weight="fill" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-medium">Nenhuma lista concluída</h2>
          <p className="mt-1 text-muted-foreground">
            As listas que você fechar aparecem aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-accent text-accent-foreground">
        <ShoppingBag className="size-8" weight="fill" aria-hidden />
      </span>
      <div>
        <h2 className="text-lg font-medium">Você ainda não tem listas</h2>
        <p className="mt-1 text-muted-foreground">
          Crie a primeira para começar a organizar suas compras.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/lists/new">Criar minha primeira lista</Link>
      </Button>
    </div>
  );
}
