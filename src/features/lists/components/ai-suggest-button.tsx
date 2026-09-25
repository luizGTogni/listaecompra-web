"use client";

import { Sparkle } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { AiChat } from "@/features/ai/components/ai-chat";
import { LIST_SUGGESTIONS } from "@/features/ai/suggestions";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";

// Floating round button (bottom right) that opens the AI chat for this list.
export function AiSuggestButton({ listId }: { listId: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        // Same spot as the new-list button, which is not shown on this page:
        // above the mobile bar (4rem tall) plus the iOS safe area.
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 inline-flex size-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg md:right-8 md:bottom-8 md:size-auto md:h-14 md:px-6"
      >
        <Sparkle className="size-6" weight="fill" aria-hidden />
        {/* Icon-only on mobile, so the name is kept for screen readers. */}
        <span className="sr-only font-medium md:not-sr-only">
          Sugerir itens com IA
        </span>
      </Dialog.Trigger>

      <BottomSheetContent
        title="Ajuda da IA"
        description="Peça itens, mude o nome ou refaça a lista."
        className="h-[85dvh] md:h-[min(46rem,85dvh)] md:max-w-2xl"
      >
        <AiChat
          shopperListId={listId}
          greeting="Oi! Posso sugerir itens, mudar o nome ou refazer esta lista. O que você quer fazer?"
          placeholder="Ex.: quero fazer um bolo de cenoura"
          suggestions={LIST_SUGGESTIONS}
        />
      </BottomSheetContent>
    </Dialog.Root>
  );
}
