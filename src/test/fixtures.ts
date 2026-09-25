import type {
  MyInvite,
  ShopperItem,
  ShopperList,
  ShopperListMember,
} from "@/features/lists/types";

let counter = 0;

// A shopping list as the API returns it. Override what the test cares about.
export function makeList(overrides: Partial<ShopperList> = {}): ShopperList {
  counter += 1;
  return {
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    userId: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    shareCode: `share-code-${counter}`,
    title: `Lista ${counter}`,
    description: "",
    closedAt: null,
    createdAt: "2026-09-20T12:00:00.000Z",
    // The default owner is the test user (see meReply).
    user: { name: "Ana Souza", username: "ana_souza" },
    ...overrides,
  };
}

export function makeLists(count: number) {
  return Array.from({ length: count }, () => makeList());
}

// A shopping list item as the API returns it.
export function makeItem(overrides: Partial<ShopperItem> = {}): ShopperItem {
  counter += 1;
  return {
    id: `10000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    shopperListId: "00000000-0000-4000-8000-000000000001",
    title: `Item ${counter}`,
    description: "",
    quantity: 1,
    purchasedAt: null,
    purchasedById: null,
    purchasedBy: null,
    createdAt: "2026-09-20T12:00:00.000Z",
    ...overrides,
  };
}

// A list membership (accepted or pending invite) as the API returns it from
// `GET /shoppers/:id/members`.
export function makeMember(
  overrides: Partial<ShopperListMember> = {},
): ShopperListMember {
  counter += 1;
  return {
    memberId: `20000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    shopperListId: "00000000-0000-4000-8000-000000000001",
    acceptedAt: "2026-09-20T12:00:00.000Z",
    invitedAt: "2026-09-19T12:00:00.000Z",
    ...overrides,
  };
}

// An invite as `GET /users/shoppers/invites` returns it: a member row plus
// the list's title and who sent it.
export function makeInvite(
  overrides: Partial<Omit<MyInvite, "shopperList">> = {},
  shopperListOverrides: Partial<MyInvite["shopperList"]> = {},
): MyInvite {
  return {
    ...makeMember({ acceptedAt: null, ...overrides }),
    shopperList: {
      title: "Feira da semana",
      user: { name: "Maria Souza", username: "maria" },
      ...shopperListOverrides,
    },
  };
}
