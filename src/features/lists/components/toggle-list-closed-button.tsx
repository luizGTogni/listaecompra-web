"use client";

import {
  CheckCircle,
  CircleNotch,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getListActionMessage } from "../errors";
import { useToggleListClosed } from "../hooks/use-toggle-list-closed";

export function ToggleListClosedButton({
  listId,
  closed,
}: {
  listId: string;
  closed: boolean;
}) {
  const toggleClosed = useToggleListClosed(listId);

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        disabled={toggleClosed.isPending}
        onClick={() => toggleClosed.mutate()}
      >
        {toggleClosed.isPending ? (
          <CircleNotch className="animate-spin" aria-hidden />
        ) : closed ? (
          <ClockCounterClockwise aria-hidden />
        ) : (
          <CheckCircle aria-hidden />
        )}
        {closed ? "Reabrir lista" : "Concluir lista"}
      </Button>
      {toggleClosed.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getListActionMessage(toggleClosed.error)}
        </p>
      )}
    </div>
  );
}
