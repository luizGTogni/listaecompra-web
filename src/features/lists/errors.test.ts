import { ApiError, NetworkError } from "@/services/api";
import { getAddItemFeedback, getNewListFeedback } from "./errors";

describe("getNewListFeedback", () => {
  it("puts a repeated name under the title field", () => {
    const feedback = getNewListFeedback(
      new ApiError(409, { name: "ResourceAlreadyExists", message: "x" }),
    );

    expect(feedback.fields).toEqual({
      title: "Você já tem uma lista com este nome.",
    });
    expect(feedback.form).toBeUndefined();
  });

  it("maps validation errors to their fields", () => {
    const feedback = getNewListFeedback(
      new ApiError(400, {
        name: "ValidationError",
        message: "x",
        fields: [
          { code: "too_small", field: "title", message: "x" },
          { code: "x", field: "unknown", message: "x" },
        ],
      }),
    );

    expect(feedback.fields).toEqual({ title: "Valor inválido." });
  });

  it("falls back to a form message", () => {
    expect(getNewListFeedback(new NetworkError()).form).toMatch(/conectar/);
    expect(getNewListFeedback(new ApiError(500, null)).form).toMatch(
      /Algo deu errado/,
    );
  });
});

describe("getAddItemFeedback: 400 answers", () => {
  it("handles a business error with no `fields`", () => {
    const error = new ApiError(400, {
      name: "InvalidItemQuantity",
      message: "x",
    });
    expect(getAddItemFeedback(error).fields.quantity).toMatch(/inválida/);
  });

  it("handles a validation error with `fields`", () => {
    const error = new ApiError(400, {
      name: "ZodError",
      message: "x",
      fields: [{ field: "unit", code: "invalid_value", message: "x" }],
    });
    expect(getAddItemFeedback(error).fields.quantity).toMatch(/inválida/);
  });

  it("does not assume `fields` exists", () => {
    const error = new ApiError(400, { name: "Other", message: "x" });
    expect(() => getAddItemFeedback(error)).not.toThrow();
  });
});
