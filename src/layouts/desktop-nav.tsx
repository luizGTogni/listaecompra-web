"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { isActive, NAV_ITEMS } from "./nav-items";

// The bottom bar's links, as a row in the header, from `md` upwards.
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon
                  weight={active ? "fill" : "regular"}
                  className="size-5"
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
