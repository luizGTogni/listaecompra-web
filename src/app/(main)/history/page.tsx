import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Histórico" };

export default function HistoryPage() {
  return <ComingSoon title="Histórico" />;
}
