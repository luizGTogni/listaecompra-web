import type { Metadata } from "next";
import { HomeView } from "@/features/lists/components/home-view";

export const metadata: Metadata = { title: "Início" };

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <HomeView />
    </main>
  );
}
