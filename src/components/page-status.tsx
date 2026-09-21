import { CircleNotch } from "@phosphor-icons/react";

// Centered spinner for a page that is waiting on something (session, data).
export function PageLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[50dvh] items-center justify-center gap-3 text-muted-foreground"
    >
      <CircleNotch className="size-6 animate-spin" aria-hidden />
      <span>Carregando...</span>
    </div>
  );
}
