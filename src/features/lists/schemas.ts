import { z } from "zod";

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
export const ITEM_MAX_QUANTITY = 999;

// The backend requires the title non-empty by rejecting a duplicate blank
// one at most once; these are the frontend's own, friendlier limits.
export const addItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Dê um nome para o item.")
    .max(
      ITEM_TITLE_MAX_LENGTH,
      `O nome deve ter no máximo ${ITEM_TITLE_MAX_LENGTH} caracteres.`,
    ),
  quantity: z.coerce
    .number()
    .int("Use um número inteiro.")
    .min(1, "A quantidade mínima é 1.")
    .max(ITEM_MAX_QUANTITY, `A quantidade máxima é ${ITEM_MAX_QUANTITY}.`),
});

export type AddItemValues = z.infer<typeof addItemSchema>;

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
