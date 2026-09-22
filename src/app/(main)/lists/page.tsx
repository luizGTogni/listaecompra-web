import type { Metadata } from "next";
import { ListsView } from "@/features/lists/components/lists-view";

export const metadata: Metadata = { title: "Lista" };

export default function ListsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Suas listas</h1>
      <ListsView status="open" />
    </main>
  );
}
