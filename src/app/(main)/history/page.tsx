import type { Metadata } from "next";
import { ListsView } from "@/features/lists/components/lists-view";

export const metadata: Metadata = {
  title: "Histórico",
  description: "Suas listas de compras concluídas.",
};

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Histórico</h1>
      <ListsView status="closed" />
    </main>
  );
}
