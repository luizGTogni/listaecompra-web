import { screen } from "@testing-library/react";
import ListMembersPage from "@/app/(main)/lists/[id]/members/page";
import { listDetailReply, meReply, mockApi } from "@/test/fetch";
import { makeList } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ListMembersPage", () => {
  it("shows the list's title and the members heading", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", title: "Feira" }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });

    const ui = await ListMembersPage({
      params: Promise.resolve({ id: "list-1" }),
      searchParams: Promise.resolve({}),
    });
    renderWithProviders(ui);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Membros" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Feira")).toBeInTheDocument();
  });
});
