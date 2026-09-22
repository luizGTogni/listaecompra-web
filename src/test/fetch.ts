// Tests stub the global fetch instead of hitting the backend.
type Reply = { status: number; body?: unknown };

function toResponse({ status, body }: Reply) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// One reply for every request.
export function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn<
    (url: string, init?: RequestInit) => Promise<Response>
  >(async () => toResponse({ status, body }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// A reply per endpoint, keyed by "METHOD /path" (path without the API prefix).
// Values can be a list to answer successive calls differently. Unknown
// endpoints fail the test loudly.
// A route can also be a function of the request URL, to answer by query/page.
export function mockApi(
  routes: Record<string, Reply | Reply[] | ((url: URL) => Reply)>,
) {
  const counters = new Map<string, number>();
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname.replace("/api/v1", "");
    const key = `${init?.method ?? "GET"} ${path}`;
    const route = routes[key];
    if (!route) throw new Error(`Unexpected request: ${key}`);
    const index = counters.get(key) ?? 0;
    counters.set(key, index + 1);
    const reply =
      typeof route === "function"
        ? route(new URL(url))
        : Array.isArray(route)
          ? route[Math.min(index, route.length - 1)]
          : route;
    return toResponse(reply);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function mockFetchNetworkFailure() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function requestsTo(fetchMock: ReturnType<typeof mockApi>, key: string) {
  return fetchMock.mock.calls.filter(([url, init]) => {
    const path = new URL(url).pathname.replace("/api/v1", "");
    return `${init?.method ?? "GET"} ${path}` === key;
  });
}

// A `GET /shoppers` reply for tests: fills in page/perPage/total from the
// list given, as if it were the only page.
export function listsReply(
  shopperLists: unknown[],
  overrides: Partial<{
    page: number;
    perPage: number;
    total: number;
  }> = {},
): Reply {
  return {
    status: 200,
    body: {
      shopperLists,
      page: 1,
      perPage: 10,
      total: shopperLists.length,
      ...overrides,
    },
  };
}

// A `GET /users/me` reply for tests. Pass a date for a verified account.
export function meReply(verifiedAt: string | null = null): Reply {
  return {
    status: 200,
    body: {
      user: {
        id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
        name: "Ana Souza",
        username: "ana_souza",
        email: "ana@example.com",
        verifiedAt,
        createdAt: "2026-09-20T12:00:00.000Z",
      },
    },
  };
}
