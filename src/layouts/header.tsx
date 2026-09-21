import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { DesktopNav } from "./desktop-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <Link href="/" className="rounded-md focus-visible:outline-ring">
        <Logo />
      </Link>
      <DesktopNav />
      {/* On mobile, "Sair" lives on the Perfil screen. */}
      <SignOutButton className="hidden md:inline-flex" />
    </header>
  );
}
