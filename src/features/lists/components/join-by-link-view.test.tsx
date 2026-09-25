import { screen, waitFor } from "@testing-library/react";
import { mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { JoinByLinkView } from "./join-by-link-view";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

afterEach(() => {
  replace.mockClear();
  vi.unstubAllGlobals();
});

describe("JoinByLinkView", () => {
  it("joins as soon as it opens and goes to the list", async () => {
    const fetchMock = mockApi({
      "POST /shoppers/members/enter": {
        status: 201,
        body: { shopperListMember: { shopperListId: "list-9" } },
      },
    });
    renderWithProviders(<JoinByLinkView shareCode="abc" />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/lists/list-9"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows why the link does not work", async () => {
    mockApi({
      "POST /shoppers/members/enter": {
        status: 409,
        body: { name: "ShopperListClosed", message: "x" },
      },
    });
    renderWithProviders(<JoinByLinkView shareCode="abc" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esta lista já foi concluída.",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
