import { ApiError, NetworkError } from "@/services/api";
import {
  getAiApplyMessage,
  getAiChatMessage,
  getIgnoredItemsMessage,
} from "./errors";

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

describe("getIgnoredItemsMessage", () => {
  it("is null when nothing was dropped", () => {
    expect(getIgnoredItemsMessage(3, 3)).toBeNull();
  });

  it("counts what was dropped", () => {
    expect(getIgnoredItemsMessage(3, 2)).toBe(
      "1 item foi ignorado por ser inválido.",
    );
    expect(getIgnoredItemsMessage(5, 2)).toBe(
      "3 itens foram ignorados por serem inválidos.",
    );
  });
});
