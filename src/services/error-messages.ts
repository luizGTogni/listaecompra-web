import { ApiError, NetworkError } from "./api";

// Failures that mean the same on every screen. Each feature handles its own
// specific errors first and falls back to this.
export function getCommonErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  if (error instanceof ApiError && error.status === 429) {
    return "Muitas tentativas. Aguarde um minuto e tente novamente.";
  }
  return "Algo deu errado do nosso lado. Tente novamente em instantes.";
}
