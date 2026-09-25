import { ApiError } from "@/services/api";
import { getCommonErrorMessage } from "@/services/error-messages";
import { addItemSchema, newListSchema, type NewListValues } from "./schemas";

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

export interface AddItemFeedback {
  fields: Partial<Record<keyof typeof addItemSchema.shape, string>>;
  form?: string;
}

export function getAddItemFeedback(error: unknown): AddItemFeedback {
  if (error instanceof ApiError) {
    // One item per name in a list, same idea as the list title above.
    if (error.body?.name === "ResourceAlreadyExists") {
      return { fields: { title: "Você já tem um item com este nome." } };
    }
    if (error.body?.name === "ShopperListClosed") {
      return { fields: {}, form: "Esta lista está fechada." };
    }
  }

  return { fields: {}, form: getCommonErrorMessage(error) };
}

// Shared by toggling "comprado", changing the quantity and removing an item:
// none of them has per-field input to blame, just a message to show.
export function getItemActionMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "ShopperListClosed") return "Esta lista está fechada.";
    if (name === "ShopperItemAlreadyPurchased") {
      return "Este item já foi comprado.";
    }
    if (name === "InvalidItemQuantity") return "Quantidade inválida.";
    if (name === "ResourceNotFound") {
      return "Este item não existe mais. Atualize a página.";
    }
  }
  return getCommonErrorMessage(error);
}

// Shared by fechar/reabrir and excluir: both are owner-only, and the backend
// answers 404 either way when the current user is not the owner.
export function getListActionMessage(error: unknown): string {
  if (error instanceof ApiError && error.body?.name === "ResourceNotFound") {
    return "Não foi possível encontrar esta lista.";
  }
  return getCommonErrorMessage(error);
}

export interface InviteMemberFeedback {
  fields: Partial<Record<"username", string>>;
  form?: string;
}

export function getInviteMemberFeedback(error: unknown): InviteMemberFeedback {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "ResourceAlreadyExists") {
      return { fields: { username: "Esta pessoa já foi convidada." } };
    }
    if (name === "ResourceNotFound") {
      return {
        fields: { username: "Não encontramos ninguém com esse usuário." },
      };
    }
    // Inviting yourself.
    if (name === "Forbbiden") {
      return { fields: { username: "Você não pode convidar a si mesmo." } };
    }
    if (name === "ShopperListClosed") {
      return { fields: {}, form: "Esta lista está fechada." };
    }
  }
  return { fields: {}, form: getCommonErrorMessage(error) };
}

// Shared by removing a member and leaving the list.
export function getMemberActionMessage(error: unknown): string {
  if (error instanceof ApiError && error.body?.name === "ResourceNotFound") {
    return "Esta pessoa não faz mais parte da lista.";
  }
  return getCommonErrorMessage(error);
}

export function getInviteActionMessage(error: unknown): string {
  if (error instanceof ApiError && error.body?.name === "ResourceNotFound") {
    return "Este convite não existe mais.";
  }
  return getCommonErrorMessage(error);
}

// Joining by code (typed or from a link). The backend answers 404 for an
// unknown code, 409 `ShopperListClosed` for a finished list, 409
// `ResourceAlreadyExists` when already a member and 403 for the owner.
export function getJoinByCodeMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "ResourceNotFound") {
      return "Código inválido ou expirado. Peça um novo código para quem criou a lista.";
    }
    if (name === "ShopperListClosed") return "Esta lista já foi concluída.";
    if (name === "ResourceAlreadyExists") {
      return "Você já participa desta lista.";
    }
    if (name === "Forbbiden") return "Esta lista já é sua.";
  }
  return getCommonErrorMessage(error);
}
