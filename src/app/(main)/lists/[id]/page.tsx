import type { Metadata } from "next";
import { ShopperListDetailView } from "@/features/lists/components/shopper-list-detail-view";

// The list's own title would make a better <title>, but that needs
// server-side data fetching with the session cookie forwarded
// (generateMetadata + next/headers), not done yet.
export const metadata: Metadata = { title: "Lista" };

export default async function ListDetailPage({
  params,
}: PageProps<"/lists/[id]">) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <ShopperListDetailView listId={id} />
    </main>
  );
}
