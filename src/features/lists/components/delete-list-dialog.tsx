"use client";

import { useState } from "react";
import { CircleNotch, Trash } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getListActionMessage } from "../errors";
import { useDeleteList } from "../hooks/use-delete-list";

export function DeleteListDialog({
  listId,
  listTitle,
}: {
  listId: string;
  listTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const deleteList = useDeleteList(listId);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive">
          <Trash aria-hidden />
          Excluir lista
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir &ldquo;{listTitle}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Isso remove a lista e todos os seus itens para sempre. Não é
            possível desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteList.isError && (
          <p role="alert" className="text-sm text-destructive">
            {getListActionMessage(deleteList.error)}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteList.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteList.isPending}
            onClick={(event) => {
              // Radix closes the dialog on click by default; keep it open
              // until the delete actually succeeds, so a failure stays visible.
              event.preventDefault();
              deleteList.mutate();
            }}
          >
            {deleteList.isPending ? (
              <>
                <CircleNotch className="animate-spin" aria-hidden />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
