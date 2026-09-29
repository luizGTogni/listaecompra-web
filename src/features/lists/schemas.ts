import { z } from "zod";
import type { AddItemInput } from "./types";
import {
  getQuantityError,
  ITEM_UNITS,
  parseQuantity,
  type ItemUnit,
} from "./units";

export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 200;

// The backend accepts any string here (even empty), so these limits are the
// frontend's own: see docs/backend-tasks.md.
export const newListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Dê um nome para a lista.")
    .max(
      TITLE_MAX_LENGTH,
      `O nome deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`,
    ),
});

export type NewListValues = z.infer<typeof newListSchema>;

export const ITEM_TITLE_MAX_LENGTH = 60;

// `quantity` and `unit` are checked together: what is valid depends on both.
function checkQuantity(
  value: { quantity: string; unit: ItemUnit },
  ctx: z.RefinementCtx,
) {
  const quantity = parseQuantity(value.quantity);
  const message =
    quantity === null
      ? "Digite uma quantidade válida."
      : getQuantityError(quantity, value.unit);
  if (message) ctx.addIssue({ code: "custom", path: ["quantity"], message });
}

// Editing an existing item: the API only takes these two.
export const editItemSchema = z
  .object({ quantity: z.string(), unit: z.enum(ITEM_UNITS) })
  .superRefine(checkQuantity);

export type EditItemValues = z.infer<typeof editItemSchema>;

// The backend requires the title non-empty by rejecting a duplicate blank
// one at most once; these are the frontend's own, friendlier limits.
// `quantity` stays the text that was typed ("1,5" is fine): what it means
// depends on the unit, so it is checked together with it and turned into a
// number by `toAddItemInput` only when submitting.
export const addItemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Dê um nome para o item.")
      .max(
        ITEM_TITLE_MAX_LENGTH,
        `O nome deve ter no máximo ${ITEM_TITLE_MAX_LENGTH} caracteres.`,
      ),
    quantity: z.string(),
    unit: z.enum(ITEM_UNITS),
  })
  .superRefine(checkQuantity);

export type AddItemValues = z.infer<typeof addItemSchema>;

// Only for values that already passed `addItemSchema`.
export function toAddItemInput(values: AddItemValues): AddItemInput {
  return {
    title: values.title,
    description: "",
    quantity: parseQuantity(values.quantity) ?? 1,
    unit: values.unit,
  };
}

// Same rules as sign-up's username. A pasted "@maria" or "Maria" is fine:
// usernames are stored in lower case, so it is normalized before checking.
export const inviteMemberSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, "").toLowerCase())
    .pipe(
      z
        .string()
        .min(3, "O usuário deve ter pelo menos 3 caracteres.")
        .max(20, "O usuário deve ter no máximo 20 caracteres.")
        .regex(/^[a-z0-9_]+$/, "Use apenas letras, números e _."),
    ),
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

// What people paste is either the bare code or the whole share link
// (`.../join/<code>`): both work.
export function extractShareCode(input: string) {
  const value = input.trim();
  const fromLink = value.match(/\/join\/([^/?#\s]+)/);
  return fromLink ? decodeURIComponent(fromLink[1]) : value;
}

export const joinByCodeSchema = z.object({
  shareCode: z
    .string()
    .transform(extractShareCode)
    .pipe(z.string().min(1, "Digite o código da lista.")),
});

export type JoinByCodeValues = z.infer<typeof joinByCodeSchema>;
