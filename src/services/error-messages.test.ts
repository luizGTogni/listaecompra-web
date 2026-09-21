import { ApiError, NetworkError } from "./api";
import { getCommonErrorMessage } from "./error-messages";

describe("getCommonErrorMessage", () => {
  it("reports connection problems", () => {
    expect(getCommonErrorMessage(new NetworkError())).toMatch(/conectar/);
  });

  it("reports rate limiting", () => {
    expect(getCommonErrorMessage(new ApiError(429, null))).toMatch(/Muitas/);
  });

  it("falls back to a generic message", () => {
    expect(getCommonErrorMessage(new ApiError(500, null))).toMatch(
      /Algo deu errado/,
    );
    expect(getCommonErrorMessage(new Error("boom"))).toMatch(/Algo deu errado/);
  });
});
