"use client";

import {
  CircleNotch,
  SignOut,
  UserCircle,
  UserMinus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getMemberActionMessage } from "../errors";
import {
  useLeaveList,
  useRemoveMember,
} from "../hooks/use-shopper-list-members";
import type { ShopperListMember } from "../types";

interface MemberRowProps {
  listId: string;
  member: ShopperListMember;
  isSelf: boolean;
  // Only the owner may remove someone else.
  canRemove: boolean;
}

// A member is shown by name and @username; an older backend build sends only
// the id, so that truncated id is the fallback.
export function MemberRow({
  listId,
  member,
  isSelf,
  canRemove,
}: MemberRowProps) {
  const removeMember = useRemoveMember(listId);
  const leaveList = useLeaveList(listId);
  const pending = !member.acceptedAt;
  const fallbackName = `Usuário ${member.memberId.slice(0, 8)}`;
  const displayName = member.user?.name ?? fallbackName;
  const mutation = isSelf ? leaveList : removeMember;

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="flex items-center gap-3">
        <UserCircle
          className="size-8 shrink-0 text-muted-foreground"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="truncate">
            {isSelf ? "Você" : displayName}
            {!isSelf && member.user && (
              <span className="text-muted-foreground">
                {" "}
                (@{member.user.username})
              </span>
            )}
          </p>
          {pending && (
            <p className="text-sm text-muted-foreground">Convite pendente</p>
          )}
        </div>

        {isSelf ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={leaveList.isPending}
            onClick={() => leaveList.mutate(member.memberId)}
            className="text-destructive"
          >
            {leaveList.isPending ? (
              <CircleNotch className="animate-spin" aria-hidden />
            ) : (
              <SignOut aria-hidden />
            )}
            {pending ? "Recusar" : "Sair"}
          </Button>
        ) : (
          canRemove && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={removeMember.isPending}
              onClick={() => removeMember.mutate(member.memberId)}
              aria-label={`Remover ${displayName}`}
              className="text-destructive"
            >
              {removeMember.isPending ? (
                <CircleNotch className="animate-spin" aria-hidden />
              ) : (
                <UserMinus aria-hidden />
              )}
            </Button>
          )
        )}
      </div>

      {mutation.isError && (
        <p role="alert" className="pl-11 text-sm text-destructive">
          {getMemberActionMessage(mutation.error)}
        </p>
      )}
    </li>
  );
}
