import { screen, waitFor } from "@testing-library/react";
import HistoryPage from "@/app/(main)/history/page";
import { listsReply, mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HistoryPage", () => {
  it("has its heading and asks only for closed lists", async () => {
    const fetchMock = mockApi({ "GET /shoppers": listsReply([]) });
    renderWithProviders(<HistoryPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Histórico" }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(requestsTo(fetchMock, "GET /shoppers")).toHaveLength(1),
    );
    const [url] = requestsTo(fetchMock, "GET /shoppers")[0];
    expect(new URL(url).searchParams.get("status")).toBe("closed");
  });
});
