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
