"use client";

import { useState } from "react";
import {
  CheckCircle,
  ClockCounterClockwise,
  DotsThree,
  ShareNetwork,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import { DropdownMenu } from "radix-ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { getListActionMessage } from "../errors";
import { useToggleListClosed } from "../hooks/use-toggle-list-closed";
import type { ShopperList } from "../types";
import { DeleteListDialog } from "./delete-list-dialog";
import { MembersSheet } from "./members-sheet";
import { ShareListSheet } from "./share-list-sheet";

const ITEM_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground";

// Everything that acts on the list itself, in one place: members for anyone
// with access, and the owner's share/close/delete. The share sheet and the
// delete confirmation are dialogs opened from here, so the menu can close
// while they stay.
export function ListOptionsMenu({
  list,
  isOwner,
}: {
  list: ShopperList;
  isOwner: boolean;
}) {
  const [membersOpen, setMembersOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toggleClosed = useToggleListClosed(list.id);
  const closed = !!list.closedAt;
  // The backend only resets/uses the code of an open list.
  const canShare = isOwner && !closed && !!list.shareCode;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Opções da lista"
            className="shrink-0"
          >
            <DotsThree className="size-6" weight="bold" aria-hidden />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-56 rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            {/* Owner and accepted members can both see who else has access. */}
            <DropdownMenu.Item
              className={ITEM_CLASS}
              onSelect={() => setMembersOpen(true)}
            >
              <UsersThree className="size-5" aria-hidden />
              Membros
            </DropdownMenu.Item>

            {canShare && (
              <DropdownMenu.Item
                className={ITEM_CLASS}
                onSelect={() => setSharing(true)}
              >
                <ShareNetwork className="size-5" aria-hidden />
                Compartilhar
              </DropdownMenu.Item>
            )}

            {isOwner && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className={ITEM_CLASS}
                  disabled={toggleClosed.isPending}
                  onSelect={() =>
                    toggleClosed.mutate(undefined, {
                      onError: (error) =>
                        toast.error(getListActionMessage(error)),
                    })
                  }
                >
                  {closed ? (
                    <ClockCounterClockwise className="size-5" aria-hidden />
                  ) : (
                    <CheckCircle className="size-5" aria-hidden />
                  )}
                  {closed ? "Reabrir lista" : "Concluir lista"}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={cn(ITEM_CLASS, "text-destructive")}
                  onSelect={() => setDeleting(true)}
                >
                  <Trash className="size-5" aria-hidden />
                  Excluir lista
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <MembersSheet
        open={membersOpen}
        onOpenChange={setMembersOpen}
        listId={list.id}
        listTitle={list.title}
      />
      {canShare && (
        <ShareListSheet
          open={sharing}
          onOpenChange={setSharing}
          listId={list.id}
          listTitle={list.title}
          shareCode={list.shareCode!}
        />
      )}
      {isOwner && (
        <DeleteListDialog
          open={deleting}
          onOpenChange={setDeleting}
          listId={list.id}
          listTitle={list.title}
        />
      )}
    </>
  );
}
