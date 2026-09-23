"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "@phosphor-icons/react";

// Only where a list of lists is on screen: the two places "add one more" is
// an obvious next action. Not on a single list's own page, its new-list
// form, or anywhere without lists (Convites, Perfil, Início).
const SHOWN_ON = ["/lists", "/history"];

// Floating action button: an icon on mobile, icon + label from `md`.
export function NewListButton() {
  const pathname = usePathname();

  if (!SHOWN_ON.includes(pathname)) return null;

  return (
    <Link
      href="/lists/new"
      // Sits above the mobile bar (4rem tall) plus the iOS safe area.
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 inline-flex size-14 items-center justify-center gap-2 rounded-full bg-contrast text-contrast-foreground shadow-lg md:right-8 md:bottom-8 md:size-auto md:h-14 md:px-6"
    >
      <Plus weight="bold" className="size-6" aria-hidden />
      {/* Icon-only on mobile, so the name is kept for screen readers. */}
      <span className="sr-only font-medium md:not-sr-only">Nova lista</span>
    </Link>
  );
}
