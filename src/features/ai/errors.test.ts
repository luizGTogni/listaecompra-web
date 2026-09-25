import { ApiError, NetworkError } from "@/services/api";
import { getAiApplyMessage, getAiChatMessage } from "./errors";

const apiError = (status: number, name?: string) =>
  new ApiError(status, name ? { name, message: name } : null);

describe("getAiChatMessage", () => {
  it("explains an unavailable AI, the rate limit and a closed list", () => {
    expect(getAiChatMessage(apiError(503, "AiUnavailable"))).toMatch(
      /indisponível/,
    );
    expect(getAiChatMessage(apiError(429))).toMatch(/demais/);
    expect(getAiChatMessage(apiError(409, "ShopperListClosed"))).toBe(
      "Esta lista está fechada.",
    );
  });

  it("falls back to the shared messages", () => {
    expect(getAiChatMessage(new NetworkError())).toMatch(/conectar/);
  });
});

describe("getAiApplyMessage", () => {
  it("names who may rename and the duplicate title", () => {
    expect(getAiApplyMessage(apiError(403, "Forbbiden"))).toMatch(/dono/);
    expect(getAiApplyMessage(apiError(409, "ResourceAlreadyExists"))).toMatch(
      /mesmo nome|esse nome/,
    );
  });
});
