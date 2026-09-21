import type { ReactNode } from "react";
import { RequireVerified } from "@/features/auth/components/require-verified";
import { BottomNav } from "@/layouts/bottom-nav";
import { Header } from "@/layouts/header";
import { NewListButton } from "@/layouts/new-list-button";

// Route groups like (main) organize routes without changing the URL. Pages in
// this group share the header and the navigation, and need a signed-in,
// verified user (so the navigation only shows once that is confirmed).
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <RequireVerified>
        {/* Room for the fixed bottom bar and the floating button on mobile. */}
        <div className="pb-32 md:pb-0">{children}</div>
        <BottomNav />
        <NewListButton />
      </RequireVerified>
    </>
  );
}
