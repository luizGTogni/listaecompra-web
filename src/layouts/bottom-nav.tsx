"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { isActive, NAV_ITEMS } from "./nav-items";

// Mobile tab bar, fixed to the bottom of the screen (thumb zone). From `md`
// the same links move to the header, so the bar is hidden.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      // The padding keeps the bar clear of the iOS home indicator (PWA).
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-end px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, featured }) => {
          const active = isActive(pathname, href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                // Tells screen readers which tab is the current page.
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg text-xs",
                  active ? "font-medium text-primary" : "text-muted-foreground",
                )}
              >
                {featured ? (
                  <span className="-mt-6 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-card">
                    <Icon weight="fill" className="size-7" aria-hidden />
                  </span>
                ) : (
                  <Icon
                    weight={active ? "fill" : "regular"}
                    className="size-6"
                    aria-hidden
                  />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
