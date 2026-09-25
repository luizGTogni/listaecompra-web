"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight, ListPlus, Plus, Sparkle } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";

// Only where a list of lists is on screen: the two places "add one more" is
// an obvious next action. Not on a single list's own page, its new-list
// form, or anywhere without lists (Convites, Perfil, Início).
const SHOWN_ON = ["/lists", "/history"];

// Floating action button: an icon on mobile, icon + label from `md`. It opens
// a chooser: an empty list (the default path) or, soon, one drafted by AI.
// The chooser is a bottom sheet on mobile and a centered card from `md`.
export function NewListButton() {
  const pathname = usePathname();

  if (!SHOWN_ON.includes(pathname)) return null;

  return (
    <Dialog.Root>
      <Dialog.Trigger
        // Sits above the mobile bar (4rem tall) plus the iOS safe area.
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 inline-flex size-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-contrast text-contrast-foreground shadow-lg md:right-8 md:bottom-8 md:size-auto md:h-14 md:px-6"
      >
        <Plus weight="bold" className="size-6" aria-hidden />
        {/* Icon-only on mobile, so the name is kept for screen readers. */}
        <span className="sr-only font-medium md:not-sr-only">Nova lista</span>
      </Dialog.Trigger>

      <BottomSheetContent
        title="Como você quer começar?"
        description="Escolha um jeito de montar sua próxima lista de compras."
      >
        <div className="flex flex-col gap-3">
          <Dialog.Close asChild>
            <Link
              href="/lists/new"
              className="group flex min-h-20 items-center gap-4 rounded-2xl border-2 border-primary bg-accent p-4 text-accent-foreground"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ListPlus className="size-6" weight="bold" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">Lista vazia</span>
                <span className="block text-sm">
                  Comece do zero e adicione os itens do seu jeito.
                </span>
              </span>
              <CaretRight
                className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                weight="bold"
                aria-hidden
              />
            </Link>
          </Dialog.Close>

          <Dialog.Close asChild>
            <Link
              href="/lists/new/ai"
              className="group flex min-h-20 items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Sparkle className="size-6" weight="fill" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  Criar com IA
                </span>
                <span className="block text-sm text-muted-foreground">
                  Conte o que precisa e a gente sugere os itens pra você.
                </span>
              </span>
              <CaretRight
                className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                weight="bold"
                aria-hidden
              />
            </Link>
          </Dialog.Close>
        </div>
      </BottomSheetContent>
    </Dialog.Root>
  );
}
