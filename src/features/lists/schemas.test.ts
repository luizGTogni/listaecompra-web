import {
  DESCRIPTION_MAX_LENGTH,
  newListSchema,
  TITLE_MAX_LENGTH,
} from "./schemas";

const valid = { title: "Feira", description: "" };

function messages(input: Partial<typeof valid>) {
  const result = newListSchema.safeParse({ ...valid, ...input });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("newListSchema", () => {
  it("accepts a title with no description", () => {
    expect(newListSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a title, ignoring spaces", () => {
    expect(messages({ title: "   " })).toEqual(["Dê um nome para a lista."]);
  });

  it("limits the title length", () => {
    expect(messages({ title: "a".repeat(TITLE_MAX_LENGTH) })).toEqual([]);
    expect(messages({ title: "a".repeat(TITLE_MAX_LENGTH + 1) })).toHaveLength(
      1,
    );
  });

  it("limits the description length", () => {
    expect(
      messages({ description: "a".repeat(DESCRIPTION_MAX_LENGTH) }),
    ).toEqual([]);
    expect(
      messages({ description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1) }),
    ).toHaveLength(1);
  });

  it("trims both fields", () => {
    const result = newListSchema.parse({
      title: "  Feira  ",
      description: "  sábado ",
    });

    expect(result).toEqual({ title: "Feira", description: "sábado" });
  });
});
