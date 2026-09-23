"use client";

import { UsersThree } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ListOwner } from "../types";

const BADGE_CLASSES =
  "inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground";

// The "Convidado" tag. When the owner is known, tapping (or hovering, with a
// mouse) shows whose list it is. A popover, not a `title` attribute: `title`
// never shows on a touch screen.
export function GuestBadge({ owner }: { owner?: ListOwner }) {
  const content = (
    <>
      <UsersThree className="size-3.5" weight="fill" aria-hidden />
      Convidado
    </>
  );

  // An older backend does not send the owner: nothing to show, so no button.
  if (!owner) return <span className={BADGE_CLASSES}>{content}</span>;

  return (
    <Popover>
      <PopoverTrigger
        className={`${BADGE_CLASSES} cursor-pointer`}
        aria-label={`Convidado. Lista de ${owner.name}`}
      >
        {content}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-64"
        // The card's link is a React ancestor of this (portaled) content:
        // without this, a tap inside it would also open the list.
        onClick={(event) => event.stopPropagation()}
      >
        <p>
          Lista de <strong className="font-medium">{owner.name}</strong>
        </p>
        <p className="text-muted-foreground">@{owner.username}</p>
      </PopoverContent>
    </Popover>
  );
}
