import { z } from "zod";

// Mirrors the backend's createUserBodySchema. The backend stays the source of
// truth: this only gives instant feedback before the request. Text is trimmed
// first because mobile keyboards often append a space after autocompleting.
export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  username: z
    .string()
    .trim()
    .min(3, "O usuário deve ter pelo menos 3 caracteres.")
    .max(20, "O usuário deve ter no máximo 20 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _."),
  // `z.email().trim()` would validate before trimming, so pipe instead.
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .trim()
    .min(3, "A senha deve ter pelo menos 3 caracteres.")
    .max(64, "A senha deve ter no máximo 64 caracteres."),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  // No length rule here: the server decides if the password is right.
  password: z.string().trim().min(1, "Informe sua senha."),
});

export type SignInValues = z.infer<typeof signInSchema>;
