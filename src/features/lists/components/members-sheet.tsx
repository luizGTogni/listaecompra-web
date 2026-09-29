"use client";

import { Dialog } from "radix-ui";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { MembersView } from "./members-view";

// The members of a list without leaving it. The `/lists/[id]/members` page
// still exists for direct links. The content mounts only while open, so
// nothing is fetched until someone asks.
export function MembersSheet({
  open,
  onOpenChange,
  listId,
  listTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listTitle: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title="Membros" description={listTitle}>
        <div className="max-h-[60dvh] overflow-y-auto">
          <MembersView listId={listId} showHeader={false} />
        </div>
      </BottomSheetContent>
    </Dialog.Root>
  );
}
