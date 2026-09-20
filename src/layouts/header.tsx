import Link from "next/link";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-card px-4 md:px-6">
      <Link href="/" className="rounded-md focus-visible:outline-ring">
        <Logo />
      </Link>
    </header>
  );
}
