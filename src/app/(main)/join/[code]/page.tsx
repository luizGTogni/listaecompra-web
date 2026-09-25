import type { Metadata } from "next";
import { JoinByLinkView } from "@/features/lists/components/join-by-link-view";

export const metadata: Metadata = { title: "Entrar na lista" };

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <JoinByLinkView shareCode={decodeURIComponent(code)} />
    </main>
  );
}
