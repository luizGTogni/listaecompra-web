// Dates arrive as ISO strings: JSON has no Date type.
export interface ShopperList {
  id: string;
  userId: string;
  title: string;
  description: string;
  closedAt: string | null;
  createdAt: string;
  user?: ListOwner;
}

// Who owns a list. `GET /shoppers` and `GET /shoppers/:id` send it; the
// create/close responses do not. Typed optional because a backend build from
// before that change omits it, and the screens must not crash.
export interface ListOwner {
  name: string;
  username: string;
}

export interface CreateShopperListInput {
  title: string;
  description: string;
}

export type ListStatus = "open" | "closed";

export interface ListFilters {
  // Case-insensitive match on the title or description.
  query: string;
  page: number;
  status: ListStatus;
}

// GET /shoppers, one page of results.
export interface ShopperListsPage {
  shopperLists: ShopperList[];
  page: number;
  perPage: number;
  total: number;
}

export interface ShopperItem {
  id: string;
  shopperListId: string;
  title: string;
  description: string;
  quantity: number;
  purchasedAt: string | null;
  createdAt: string;
}

// GET /shoppers/:id: the list plus its items (`shopperItems`, oldest first).
export interface ShopperListDetail extends ShopperList {
  shopperItems: ShopperItem[];
}

export interface AddItemInput {
  title: string;
  description: string;
  quantity: number;
}

// The backend only knows the member by id: no username/name comes back on
// this one (see docs/backend-tasks.md). `acceptedAt: null` is a pending
// invite. Used by `GET /shoppers/:id/members`.
export interface ShopperListMember {
  memberId: string;
  shopperListId: string;
  acceptedAt: string | null;
  invitedAt: string;
}

// `GET /users/shoppers/invites`: unlike the plain member list above, an
// invite carries the list's title and who sent it, since the recipient has
// no other way to see either before accepting. Optional because a backend
// build from before that change omits it, and the screen must not crash.
export interface MyInvite extends ShopperListMember {
  shopperList?: {
    title: string;
    user: {
      name: string;
      username: string;
    };
  };
}
