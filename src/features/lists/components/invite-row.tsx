"use client";

import { Check, CircleNotch, Envelope, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeDate } from "@/utils/format-date";
import { getInviteActionMessage } from "../errors";
import { useAcceptInvite, useDeclineInvite } from "../hooks/use-my-invites";
import type { MyInvite } from "../types";

export function InviteRow({ invite }: { invite: MyInvite }) {
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const vars = { listId: invite.shopperListId, memberId: invite.memberId };
  const error = accept.isError
    ? accept.error
    : decline.isError
      ? decline.error
      : null;

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Envelope
          className="size-8 shrink-0 text-muted-foreground"
          aria-hidden
        />

        {/* Room to wrap to two lines: the title and who sent it matter more
            than fitting on one, especially with the buttons squeezed in on
            mobile (see below). */}
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {invite.shopperList?.title ?? "Convite para uma lista"}
          </p>
          <p className="text-sm text-muted-foreground">
            {invite.shopperList
              ? `Convite de ${invite.shopperList.user.name} (@${invite.shopperList.user.username}) · `
              : "Recebido "}
            {/* The exact date is one hover (or long press) away. */}
            <time
              dateTime={invite.invitedAt}
              title={formatDate(invite.invitedAt)}
            >
              {formatRelativeDate(invite.invitedAt)}
            </time>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={accept.isPending || decline.isPending}
          onClick={() => decline.mutate(vars)}
        >
          {decline.isPending ? (
            <CircleNotch className="animate-spin" aria-hidden />
          ) : (
            <X aria-hidden />
          )}
          Recusar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={accept.isPending || decline.isPending}
          onClick={() => accept.mutate(vars)}
        >
          {accept.isPending ? (
            <CircleNotch className="animate-spin" aria-hidden />
          ) : (
            <Check aria-hidden />
          )}
          Aceitar
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive sm:pl-11">
          {getInviteActionMessage(error)}
        </p>
      )}
    </li>
  );
}
