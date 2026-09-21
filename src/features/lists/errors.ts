import { ApiError } from "@/services/api";
import { getCommonErrorMessage } from "@/services/error-messages";
import { newListSchema, type NewListValues } from "./schemas";

export interface NewListFeedback {
  fields: Partial<Record<keyof NewListValues, string>>;
  form?: string;
}

const FIELDS = Object.keys(newListSchema.shape) as (keyof NewListValues)[];

export function getNewListFeedback(error: unknown): NewListFeedback {
  if (error instanceof ApiError) {
    // The title is the only thing that can clash: one list per name and user.
    if (error.status === 409) {
      return { fields: { title: "Você já tem uma lista com este nome." } };
    }

    if (error.status === 400 && error.body?.fields?.length) {
      const fields: NewListFeedback["fields"] = {};
      for (const { field: name } of error.body.fields) {
        const field = FIELDS.find((known) => known === name);
        if (field) fields[field] = "Valor inválido.";
      }
      if (Object.keys(fields).length > 0) return { fields };
    }
  }

  return { fields: {}, form: getCommonErrorMessage(error) };
}
