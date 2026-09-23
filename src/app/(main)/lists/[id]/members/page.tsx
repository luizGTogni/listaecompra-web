import type { Metadata } from "next";
import { MembersView } from "@/features/lists/components/members-view";

export const metadata: Metadata = { title: "Membros" };

export default async function ListMembersPage({
  params,
}: PageProps<"/lists/[id]/members">) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <MembersView listId={id} />
    </main>
  );
}
