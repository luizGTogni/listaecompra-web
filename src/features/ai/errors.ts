import { ApiError } from "@/services/api";
import { getCommonErrorMessage } from "@/services/error-messages";

export function getAiChatMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "AiUnavailable" || error.status === 503) {
      return "A IA está indisponível agora. Tente de novo em instantes.";
    }
    if (error.status === 429) {
      return "Você enviou mensagens demais. Aguarde um minuto e tente de novo.";
    }
    if (name === "ShopperListClosed" || error.status === 409) {
      return "Esta lista está fechada.";
    }
    if (name === "ResourceNotFound") {
      return "Não foi possível encontrar esta lista.";
    }
  }
  return getCommonErrorMessage(error);
}

// Warning under an applied proposal when the backend dropped some items.
export function getIgnoredItemsMessage(sent: number, added: number) {
  const ignored = sent - added;
  if (ignored <= 0) return null;
  return ignored === 1
    ? "1 item foi ignorado por ser inválido."
    : `${ignored} itens foram ignorados por serem inválidos.`;
}

export function getAiApplyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "ShopperListClosed") return "Esta lista está fechada.";
    if (name === "ResourceNotFound") {
      return "Não foi possível encontrar esta lista.";
    }
    if (name === "Forbbiden") return "Só o dono da lista pode mudar o nome.";
    if (name === "ResourceAlreadyExists") {
      return "Você já tem uma lista com esse nome.";
    }
  }
  return getCommonErrorMessage(error);
}
