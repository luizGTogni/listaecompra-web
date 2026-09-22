import type { ShopperList } from "@/features/lists/types";

let counter = 0;

// A shopping list as the API returns it. Override what the test cares about.
export function makeList(overrides: Partial<ShopperList> = {}): ShopperList {
  counter += 1;
  return {
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    userId: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    title: `Lista ${counter}`,
    description: "",
    closedAt: null,
    createdAt: "2026-09-20T12:00:00.000Z",
    ...overrides,
  };
}

export function makeLists(count: number) {
  return Array.from({ length: count }, () => makeList());
}
