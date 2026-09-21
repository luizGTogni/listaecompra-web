import { resetAuthStore, signInAs } from "@/test/auth";
import { mockFetch } from "@/test/fetch";
import { authFetch } from "./authed-fetch";
import { useAuthStore } from "./store";

beforeEach(resetAuthStore);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("authFetch", () => {
  it("sends the stored token", async () => {
    signInAs("ana@example.com", "jwt-token");
    const fetchMock = mockFetch(200, {});

    await authFetch("/shoppers");

    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer jwt-token",
    });
  });

  it("clears the session when the token is rejected", async () => {
    signInAs();
    mockFetch(401, { name: "Unauthorized", message: "Unauthorized." });

    await expect(authFetch("/shoppers")).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("keeps the session on other 401s, like a wrong verification code", async () => {
    signInAs();
    mockFetch(401, { name: "CodeInvalid", message: "Code invalid." });

    await expect(authFetch("/users/verify")).rejects.toMatchObject({
      status: 401,
    });
    expect(useAuthStore.getState().token).toBe("test-token");
  });
});
