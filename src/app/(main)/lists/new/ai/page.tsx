import type { Metadata } from "next";
import { AiChat } from "@/features/ai/components/ai-chat";
import { CREATE_SUGGESTIONS } from "@/features/ai/suggestions";

export const metadata: Metadata = { title: "Criar com IA" };

export default function NewListWithAiPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Criar com IA</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Descreva o que você vai comprar ou fazer e a IA monta a lista.
      </p>

      <div className="flex h-[65dvh] min-h-96 flex-col rounded-3xl border bg-card p-4 md:h-[calc(100dvh-16rem)] md:min-h-[32rem]">
        <AiChat
          greeting="Oi! O que você quer comprar? Me conte, por exemplo, uma receita ou um evento."
          placeholder="Descreva sua lista…"
          suggestions={CREATE_SUGGESTIONS}
        />
      </div>
    </main>
  );
}
