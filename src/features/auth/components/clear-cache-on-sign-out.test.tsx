import { resetAuthStore, signInAs } from "@/test/auth";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../store";
import { ClearCacheOnSignOut } from "./clear-cache-on-sign-out";

beforeEach(resetAuthStore);

describe("ClearCacheOnSignOut", () => {
  it("empties the query cache when the token disappears", () => {
    signInAs();
    const { queryClient } = renderWithProviders(<ClearCacheOnSignOut />);
    queryClient.setQueryData(["shopper-lists"], { shopperLists: [] });

    useAuthStore.getState().clearSession();

    expect(queryClient.getQueryData(["shopper-lists"])).toBeUndefined();
  });

  it("keeps the cache while the user stays signed in", () => {
    signInAs();
    const { queryClient } = renderWithProviders(<ClearCacheOnSignOut />);
    queryClient.setQueryData(["shopper-lists"], { shopperLists: [] });

    signInAs("other@example.com", "new-token");

    expect(queryClient.getQueryData(["shopper-lists"])).toBeDefined();
  });
});
