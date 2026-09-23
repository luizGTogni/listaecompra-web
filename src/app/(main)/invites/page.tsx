import type { Metadata } from "next";
import { InvitesView } from "@/features/lists/components/invites-view";

export const metadata: Metadata = {
  title: "Convites",
  description: "Convites para listas de compras que você recebeu.",
};

export default function InvitesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Convites</h1>
      <InvitesView />
    </main>
  );
}
