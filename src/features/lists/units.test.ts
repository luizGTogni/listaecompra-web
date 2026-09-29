import {
  fitQuantityToUnit,
  formatQuantity,
  getQuantityError,
  parseQuantity,
} from "./units";

describe("formatQuantity", () => {
  it("writes decimals with a comma and no trailing zeros", () => {
    expect(formatQuantity(1.5, "KG")).toBe("1,5 kg");
    expect(formatQuantity(2, "KG")).toBe("2 kg");
    expect(formatQuantity(0.25, "L")).toBe("0,25 L");
  });

  it("handles the plural", () => {
    expect(formatQuantity(1, "BOTTLE")).toBe("1 garrafa");
    expect(formatQuantity(3, "BOTTLE")).toBe("3 garrafas");
    expect(formatQuantity(2, "DOZEN")).toBe("2 dúzias");
    expect(formatQuantity(24, "CAN")).toBe("24 latas");
  });

  it("shows only the number for units, and for items with no unit", () => {
    expect(formatQuantity(3, "UNIT")).toBe("3");
    expect(formatQuantity(3)).toBe("3");
    expect(formatQuantity(3, null)).toBe("3");
  });
});

describe("parseQuantity", () => {
  it("accepts a comma or a dot", () => {
    expect(parseQuantity("1,5")).toBe(1.5);
    expect(parseQuantity(" 1.5 ")).toBe(1.5);
    expect(parseQuantity("2")).toBe(2);
  });

  it("rejects what is not a plain number", () => {
    for (const text of ["", "abc", "-1", "1,2,3", "1e3"]) {
      expect(parseQuantity(text)).toBeNull();
    }
  });
});

describe("getQuantityError", () => {
  it("accepts fractions only in weight and volume", () => {
    expect(getQuantityError(1.5, "KG")).toBeNull();
    expect(getQuantityError(1.5, "BOTTLE")).toBe("Use um número inteiro.");
    expect(getQuantityError(1.5)).toBe("Use um número inteiro.");
  });

  it("requires a positive quantity", () => {
    expect(getQuantityError(0, "UNIT")).toBe(
      "A quantidade deve ser maior que zero.",
    );
  });

  it("allows at most 3 decimal places", () => {
    expect(getQuantityError(0.125, "KG")).toBeNull();
    expect(getQuantityError(0.1234, "KG")).toBe(
      "Use no máximo 3 casas decimais.",
    );
  });

  it.each([
    ["UNIT", 999, 1000],
    ["CAN", 999, 1000],
    ["PACK", 99, 100],
    ["BOX", 99, 100],
    ["BOTTLE", 99, 100],
    ["DOZEN", 99, 100],
    ["KG", 100, 100.5],
    ["G", 10000, 10001],
    ["L", 200, 200.5],
    ["ML", 20000, 20001],
  ] as const)("%s: %d is the maximum", (unit, max, over) => {
    expect(getQuantityError(max, unit)).toBeNull();
    expect(getQuantityError(over, unit)).toMatch(/máxima/);
  });
});

describe("fitQuantityToUnit", () => {
  it("rounds for whole-number units, never below 1", () => {
    expect(fitQuantityToUnit(1.5, "BOTTLE")).toBe(2);
    expect(fitQuantityToUnit(0.3, "BOTTLE")).toBe(1);
  });

  it("clamps to the new unit's maximum", () => {
    expect(fitQuantityToUnit(500, "KG")).toBe(100);
    expect(fitQuantityToUnit(500, "PACK")).toBe(99);
  });
});
