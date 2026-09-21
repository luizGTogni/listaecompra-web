import { QueryClient } from "@tanstack/react-query";
import { resetAuthStore, signInAs } from "@/test/auth";
import { meReply, mockApi, mockFetchNetworkFailure } from "@/test/fetch";
import { currentUserQuery } from "./queries";
import { resolvePostAuthRoute } from "./verification";

beforeEach(() => {
  resetAuthStore();
  signInAs();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resolvePostAuthRoute", () => {
  it("goes home for a verified account, and caches the user", async () => {
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    const queryClient = new QueryClient();

    expect(await resolvePostAuthRoute(queryClient)).toBe("/");
    expect(queryClient.getQueryData(currentUserQuery.queryKey)).toBeDefined();
  });

  it("asks for the code when the account is not verified", async () => {
    mockApi({ "GET /users/me": meReply() });

    expect(await resolvePostAuthRoute(new QueryClient())).toBe("/verify");
  });

  it("goes home when the request fails and lets the home page handle it", async () => {
    mockApi({
      "GET /users/me": { status: 500, body: { name: "x", message: "x" } },
    });
    expect(await resolvePostAuthRoute(new QueryClient())).toBe("/");

    mockFetchNetworkFailure();
    expect(await resolvePostAuthRoute(new QueryClient())).toBe("/");
  });
});
