// Dates arrive as ISO strings: JSON has no Date type.
export interface ShopperList {
  id: string;
  userId: string;
  title: string;
  description: string;
  closedAt: string | null;
  createdAt: string;
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
