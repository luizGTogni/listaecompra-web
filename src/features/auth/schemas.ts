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

export const forgotPasswordSchema = z.object({
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// Same rule as the sign-up password (the backend's newPassword schema).
const newPassword = z
  .string()
  .trim()
  .min(3, "A senha deve ter pelo menos 3 caracteres.")
  .max(64, "A senha deve ter no máximo 64 caracteres.");

export const resetPasswordSchema = z.object({
  codeValue: z.string().length(6, "Informe o código de 6 caracteres."),
  newPassword,
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  // No length rule: the server decides if it is the right password.
  currentPassword: z.string().trim().min(1, "Informe sua senha atual."),
  newPassword,
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
