import type { Metadata } from "next";
import { NewListForm } from "@/features/lists/components/new-list-form";

export const metadata: Metadata = { title: "Nova lista" };

export default function NewListPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Nova lista</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        Dê um nome e, se quiser, uma descrição. Os itens você adiciona depois.
      </p>

      <NewListForm />
    </main>
  );
}
