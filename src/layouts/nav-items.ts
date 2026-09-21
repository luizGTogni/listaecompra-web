import type { Icon } from "@phosphor-icons/react";
import {
  ClockCounterClockwise,
  Envelope,
  House,
  ShoppingBag,
  UserCircle,
} from "@phosphor-icons/react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  // The middle button of the mobile bar: bigger, filled, raised.
  featured?: boolean;
}

// One list drives both the bottom bar (mobile) and the header links (desktop).
// Adding a tab means adding a line here and a route under app/(main)/.
// Keep the featured item in the middle: the bar is symmetric around it.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: House },
  { href: "/history", label: "Histórico", icon: ClockCounterClockwise },
  { href: "/lists", label: "Lista", icon: ShoppingBag, featured: true },
  { href: "/invites", label: "Convites", icon: Envelope },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

// "/" only matches itself; the others also match their sub-routes
// (/lists/new keeps "Lista" highlighted).
export function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
