// Units an item can be measured in, and everything that depends on one:
// which quantities are valid, how they step and how they read in pt-BR. The
// limits mirror the backend's, so the form can refuse a value before the API
// does (the backend stays the source of truth).
export const ITEM_UNITS = [
  "UNIT",
  "KG",
  "G",
  "L",
  "ML",
  "PACK",
  "BOX",
  "BOTTLE",
  "CAN",
  "DOZEN",
] as const;

export type ItemUnit = (typeof ITEM_UNITS)[number];

interface UnitInfo {
  // Option text in the unit picker.
  label: string;
  // Shown after the number; UNIT shows the bare number, as it always did.
  singular: string;
  plural: string;
  // Only weight and volume take fractions.
  decimal: boolean;
  max: number;
  // What the +/- buttons add or remove.
  step: number;
}

export const UNIT_INFO: Record<ItemUnit, UnitInfo> = {
  UNIT: {
    label: "Unidade",
    singular: "",
    plural: "",
    decimal: false,
    max: 999,
    step: 1,
  },
  KG: {
    label: "Quilo (kg)",
    singular: "kg",
    plural: "kg",
    decimal: true,
    max: 100,
    step: 0.5,
  },
  G: {
    label: "Grama (g)",
    singular: "g",
    plural: "g",
    decimal: true,
    max: 10_000,
    step: 100,
  },
  L: {
    label: "Litro (L)",
    singular: "L",
    plural: "L",
    decimal: true,
    max: 200,
    step: 0.5,
  },
  ML: {
    label: "Mililitro (mL)",
    singular: "mL",
    plural: "mL",
    decimal: true,
    max: 20_000,
    step: 100,
  },
  PACK: {
    label: "Pacote",
    singular: "pacote",
    plural: "pacotes",
    decimal: false,
    max: 99,
    step: 1,
  },
  BOX: {
    label: "Caixa",
    singular: "caixa",
    plural: "caixas",
    decimal: false,
    max: 99,
    step: 1,
  },
  BOTTLE: {
    label: "Garrafa",
    singular: "garrafa",
    plural: "garrafas",
    decimal: false,
    max: 99,
    step: 1,
  },
  CAN: {
    label: "Lata",
    singular: "lata",
    plural: "latas",
    decimal: false,
    max: 999,
    step: 1,
  },
  DOZEN: {
    label: "Dúzia",
    singular: "dúzia",
    plural: "dúzias",
    decimal: false,
    max: 99,
    step: 1,
  },
};

export const MAX_DECIMAL_PLACES = 3;

// Old items and old backend builds have no unit: they are plain units.
export function normalizeUnit(unit: ItemUnit | undefined | null): ItemUnit {
  return unit ?? "UNIT";
}

// Floating point noise (0.1 + 0.2) has no place in a shopping list.
export function roundQuantity(value: number) {
  return (
    Math.round(value * 10 ** MAX_DECIMAL_PLACES) / 10 ** MAX_DECIMAL_PLACES
  );
}

const quantityFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: MAX_DECIMAL_PLACES,
});

// "1,5 kg", "2 L", "3 garrafas", "1 dúzia"; UNIT is just the number.
export function formatQuantity(quantity: number, unit?: ItemUnit | null) {
  const info = UNIT_INFO[normalizeUnit(unit)];
  const number = quantityFormat.format(quantity);
  const suffix = quantity === 1 ? info.singular : info.plural;
  return suffix ? `${number} ${suffix}` : number;
}

// What people type: "1,5" and "1.5" both mean one and a half. `null` when it
// is not a plain non-negative number.
export function parseQuantity(text: string): number | null {
  const value = text.trim().replace(",", ".");
  if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) return null;
  return Number(value);
}

// An error message, or `null` when the quantity is fine for the unit.
export function getQuantityError(quantity: number, unit?: ItemUnit | null) {
  const normalized = normalizeUnit(unit);
  const info = UNIT_INFO[normalized];

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "A quantidade deve ser maior que zero.";
  }
  if (!info.decimal && !Number.isInteger(quantity)) {
    return "Use um número inteiro.";
  }
  if (Math.abs(roundQuantity(quantity) - quantity) > 1e-9) {
    return `Use no máximo ${MAX_DECIMAL_PLACES} casas decimais.`;
  }
  if (quantity > info.max) {
    return `A quantidade máxima é ${formatQuantity(info.max, normalized)}.`;
  }
  return null;
}

// Moving an item to another unit: a fraction cannot stay in "garrafas", and
// 500 g does not fit in "kg" (max 100). Rounds and clamps instead of failing.
export function fitQuantityToUnit(quantity: number, unit: ItemUnit) {
  const info = UNIT_INFO[unit];
  const rounded = info.decimal ? quantity : Math.max(1, Math.round(quantity));
  return Math.min(rounded, info.max);
}
