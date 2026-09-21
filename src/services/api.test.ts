import { mockFetch, mockFetchNetworkFailure } from "@/test/fetch";
import { ApiError, apiFetch, NetworkError } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("sends the body as JSON to the API base URL", async () => {
    const fetchMock = mockFetch(201, { ok: true });

    const data = await apiFetch("/users", {
      method: "POST",
      body: { name: "Ana" },
    });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Ana" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("sends the token as a bearer header", async () => {
    const fetchMock = mockFetch(200, {});

    await apiFetch("/shoppers", { token: "jwt" });

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
      Authorization: "Bearer jwt",
    });
  });

  it("does not set a content type when there is no body", async () => {
    const fetchMock = mockFetch(200, {});

    await apiFetch("/health");

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});
  });

  it("returns null for an empty 204 response", async () => {
    mockFetch(204);

    expect(await apiFetch("/users/verify", { method: "POST" })).toBeNull();
  });

  it("throws an ApiError with the status and body on non-2xx", async () => {
    mockFetch(409, { name: "EmailAlreadyExists", message: "Taken." });

    const error = await apiFetch("/users").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      message: "Taken.",
      body: { name: "EmailAlreadyExists" },
    });
  });

  it("reads Retry-After from a 429 answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ name: "TooManyRequests", message: "x" }),
          {
            status: 429,
            headers: { "Retry-After": "42" },
          },
        ),
      ),
    );

    await expect(apiFetch("/code/resend")).rejects.toMatchObject({
      status: 429,
      retryAfter: 42,
    });
  });

  it("has no retryAfter when the header is missing", async () => {
    mockFetch(500, { name: "x", message: "x" });

    await expect(apiFetch("/users")).rejects.toMatchObject({
      retryAfter: null,
    });
  });

  it("keeps the status when the error body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 })),
    );

    await expect(apiFetch("/users")).rejects.toMatchObject({
      status: 502,
      body: null,
    });
  });

  it("throws a NetworkError when the server cannot be reached", async () => {
    mockFetchNetworkFailure();

    await expect(apiFetch("/users")).rejects.toBeInstanceOf(NetworkError);
  });
});
