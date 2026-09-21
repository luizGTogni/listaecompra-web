import { ApiError } from "@/services/api";
import { getCommonErrorMessage as commonMessage } from "@/services/error-messages";
import { signUpSchema, type SignUpValues } from "./schemas";

export interface SignUpFeedback {
  // Messages to attach to specific inputs.
  fields: Partial<Record<keyof SignUpValues, string>>;
  // Message for the whole form, when no single input is to blame.
  form?: string;
}

const FIELDS = Object.keys(signUpSchema.shape) as (keyof SignUpValues)[];

// Turns whatever the request threw into messages the user can act on.
export function getSignUpFeedback(error: unknown): SignUpFeedback {
  if (error instanceof ApiError) {
    // Each clash names its own field, so the message goes under that input.
    if (error.body?.name === "EmailAlreadyExists") {
      return { fields: { email: "Este e-mail já está em uso." } };
    }
    if (error.body?.name === "UsernameAlreadyExists") {
      return { fields: { username: "Este nome de usuário já está em uso." } };
    }

    // The server rejected a value the client-side schema let through.
    if (error.status === 400 && error.body?.fields?.length) {
      const fields: SignUpFeedback["fields"] = {};
      for (const { field: name } of error.body.fields) {
        const field = FIELDS.find((known) => known === name);
        if (field) fields[field] = "Valor inválido.";
      }
      if (Object.keys(fields).length > 0) return { fields };
    }
  }

  return { fields: {}, form: commonMessage(error) };
}

export function getSignInMessage(error: unknown): string {
  // The API answers the same for an unknown e-mail and a wrong password, so
  // the screen does not reveal which accounts exist.
  if (error instanceof ApiError && error.body?.name === "InvalidCredentials") {
    return "E-mail ou senha incorretos.";
  }
  return commonMessage(error);
}

export function getVerifyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "CodeExpired") {
      return "Este código expirou. Peça um novo código.";
    }
    // A code that does not exist (404) or was replaced by a newer one.
    if (name === "CodeInvalid" || name === "ResourceNotFound") {
      return "Código incorreto. Confira o e-mail e tente de novo.";
    }
  }
  return commonMessage(error);
}

export function getResendMessage(error: unknown): string {
  if (error instanceof ApiError && error.body?.name === "TooManyRequests") {
    return error.retryAfter
      ? `Aguarde ${error.retryAfter}s para pedir um novo código.`
      : "Aguarde um pouco para pedir um novo código.";
  }
  return commonMessage(error);
}

export function isAlreadyVerifiedError(error: unknown) {
  return (
    error instanceof ApiError && error.body?.name === "UserAlreadyVerified"
  );
}
