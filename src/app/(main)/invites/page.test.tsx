import { screen } from "@testing-library/react";
import InvitesPage from "@/app/(main)/invites/page";
import { mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("InvitesPage", () => {
  it("has its heading", async () => {
    mockApi({
      "GET /users/shoppers/invites": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<InvitesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Convites" }),
    ).toBeInTheDocument();
  });
});
