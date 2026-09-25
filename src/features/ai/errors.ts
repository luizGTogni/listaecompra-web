import { ApiError } from "@/services/api";
import { getCommonErrorMessage } from "@/services/error-messages";

export function getAiChatMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const name = error.body?.name;
    if (name === "AiUnavailable") {
      return "A IA está indisponível agora. Tente de novo em instantes.";
    }
    if (error.status === 429) {
      return "Você enviou mensagens demais. Aguarde um minuto e tente de novo.";
    }
    if (name === "ShopperListClosed") return "Esta lista está fechada.";
    if (name === "ResourceNotFound") {
      return "Não foi possível encontrar esta lista.";
    }
  }
  return getCommonErrorMessage(error);
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
