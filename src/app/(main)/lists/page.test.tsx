import { screen, waitFor } from "@testing-library/react";
import ListsPage from "@/app/(main)/lists/page";
import { listsReply, mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ListsPage", () => {
  it("has its heading and the search field, and asks only for open lists", async () => {
    const fetchMock = mockApi({ "GET /shoppers": listsReply([]) });
    renderWithProviders(<ListsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Suas listas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Buscar listas" }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(requestsTo(fetchMock, "GET /shoppers")).toHaveLength(1),
    );
    const [url] = requestsTo(fetchMock, "GET /shoppers")[0];
    expect(new URL(url).searchParams.get("status")).toBe("open");
  });
});
