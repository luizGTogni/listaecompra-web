import { mockFetch } from "@/test/fetch";
import { getShopperLists } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getShopperLists", () => {
  it("asks for the page, the search and the status", async () => {
    const fetchMock = mockFetch(200, {
      shopperLists: [],
      page: 2,
      perPage: 10,
      total: 0,
    });

    await getShopperLists({ query: "feira", page: 2, status: "closed" });

    const [url] = fetchMock.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/v1/shoppers");
    expect(parsed.searchParams.get("page")).toBe("2");
    expect(parsed.searchParams.get("query")).toBe("feira");
    expect(parsed.searchParams.get("status")).toBe("closed");
  });

  it("leaves the query out when there is no search", async () => {
    const fetchMock = mockFetch(200, {
      shopperLists: [],
      page: 1,
      perPage: 10,
      total: 0,
    });

    await getShopperLists({ query: "", page: 1, status: "open" });

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has("query")).toBe(
      false,
    );
  });

  it("encodes special characters in the search", async () => {
    const fetchMock = mockFetch(200, {
      shopperLists: [],
      page: 1,
      perPage: 10,
      total: 0,
    });

    await getShopperLists({ query: "pão & leite", page: 1, status: "open" });

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("query")).toBe(
      "pão & leite",
    );
  });
});
