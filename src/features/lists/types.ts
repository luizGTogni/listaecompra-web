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
