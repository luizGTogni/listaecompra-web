import { screen } from "@testing-library/react";
import ListDetailPage from "@/app/(main)/lists/[id]/page";
import { listDetailReply, meReply, mockApi } from "@/test/fetch";
import { makeList } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderPage(id = "list-1") {
  const ui = await ListDetailPage({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve({}),
  });
  return renderWithProviders(ui);
}

describe("ListDetailPage", () => {
  it("shows the list's title", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", title: "Feira da semana" }),
      ),
    });

    await renderPage();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Feira da semana" }),
    ).toBeInTheDocument();
  });
});
