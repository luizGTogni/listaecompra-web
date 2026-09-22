import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Lista" };

// The detail of one list (its items) is the next screen to build.
export default function ListDetailPage() {
  return <ComingSoon title="Lista" />;
}
