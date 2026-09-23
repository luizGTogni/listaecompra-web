import { screen } from "@testing-library/react";
import Home from "@/app/(main)/page";
import { listsReply, meReply, mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home", () => {
  it("has its heading", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers": listsReply([]),
      "GET /users/shoppers/invites": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<Home />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /Olá/ }),
    ).toBeInTheDocument();
  });
});
