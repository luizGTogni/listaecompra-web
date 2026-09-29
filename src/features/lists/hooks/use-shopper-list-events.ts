import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { currentUserQuery } from "@/features/auth/queries";
import { API_URL } from "@/services/api";
import {
  shopperListDetailKey,
  shopperListMembersKey,
  shopperListsKey,
} from "../queries";

// What `GET /shoppers/:id/events` (SSE) sends, one per `data:` line. Every
// event carries only an id, never the changed object (a deliberate choice on
// the backend, to keep events small and not leak data): the front always
// refetches instead of trusting the payload as the source of truth.
type ShopperListEvent =
  | { type: "item-added"; actorId: string; itemId: string }
  | { type: "item-removed"; actorId: string; itemId: string }
  | { type: "item-purchased-toggled"; actorId: string; itemId: string }
  | { type: "item-quantity-updated"; actorId: string; itemId: string }
  | { type: "list-closed-toggled"; actorId: string }
  | { type: "list-deleted"; actorId: string }
  | { type: "member-removed"; actorId: string; memberId: string };

const EVENT_TYPES: ShopperListEvent["type"][] = [
  "item-added",
  "item-removed",
  "item-purchased-toggled",
  "item-quantity-updated",
  "list-closed-toggled",
  "list-deleted",
  "member-removed",
];

// Live updates from everyone else on this list: adding/removing/(un)checking
// an item, closing/reopening or deleting the list, removing a member. Only
// while the screen is open, one connection per list.
export function useShopperListEvents(listId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  // Already in the cache (the route guard loaded it): no extra request.
  const currentUserId = useQuery(currentUserQuery).data?.user.id;

  // Read from the effect below without making it reconnect on every render:
  // `currentUserId` arrives from its own, separately-timed request, and a
  // mocked `useRouter` in tests returns a new object every call. Only
  // `listId` should ever make the connection effect itself reconnect.
  // The refs are written from their own effects, never during render — the
  // React Compiler forbids touching a ref while rendering (see
  // `session-events.ts`'s note on the same rule).
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    const source = new EventSource(`${API_URL}/shoppers/${listId}/events`, {
      withCredentials: true,
    });

    function handle(event: MessageEvent) {
      const currentUserId = currentUserIdRef.current;
      const router = routerRef.current;
      const data = JSON.parse(event.data) as ShopperListEvent;
      // Our own actions already update the cache through their own
      // mutation's `onSuccess`; acting on the event too would be redundant
      // (an extra fetch, or a toast about your own change).
      if (data.actorId === currentUserId) return;

      switch (data.type) {
        case "item-added":
        case "item-removed":
        case "item-purchased-toggled":
        case "item-quantity-updated":
          queryClient.invalidateQueries({
            queryKey: shopperListDetailKey(listId),
          });
          break;

        case "list-closed-toggled":
          queryClient.invalidateQueries({
            queryKey: shopperListDetailKey(listId),
          });
          // The "Concluída" badge on /lists and /history depends on this too.
          queryClient.invalidateQueries({ queryKey: shopperListsKey });
          break;

        case "list-deleted":
          queryClient.removeQueries({ queryKey: shopperListDetailKey(listId) });
          queryClient.invalidateQueries({ queryKey: shopperListsKey });
          toast.info("Esta lista foi excluída.");
          router.replace("/lists");
          break;

        case "member-removed":
          if (data.memberId === currentUserId) {
            // The owner removed the person looking at this very screen.
            queryClient.invalidateQueries({ queryKey: shopperListsKey });
            queryClient.removeQueries({
              queryKey: shopperListMembersKey(listId),
            });
            queryClient.removeQueries({
              queryKey: shopperListDetailKey(listId),
            });
            toast.info("Você foi removido desta lista.");
            router.replace("/lists");
          } else {
            queryClient.invalidateQueries({
              queryKey: shopperListMembersKey(listId),
            });
          }
          break;
      }
    }

    for (const type of EVENT_TYPES) source.addEventListener(type, handle);

    // No special handling on `onerror`: the browser reconnects on its own,
    // and a revoked access is already caught by `list-deleted` and
    // `member-removed` above before the connection ever needs to drop.

    return () => source.close();
    // `queryClient` (unlike `currentUserId`/`router`) is stable across
    // renders, so it is safe to depend on directly.
  }, [listId, queryClient]);
}
