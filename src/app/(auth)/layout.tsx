import type { ReactNode } from "react";
import Link from "next/link";
import { AuthAside } from "@/features/auth/components/auth-aside";
import { Logo } from "@/components/logo";

// Mobile: a single column with the logo on top. From lg: the brand panel
// takes the left half and the form stays centered in the right half.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <AuthAside className="hidden lg:flex" />

      <main className="flex flex-col px-4 py-6 sm:px-6 lg:justify-center lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 inline-block rounded-md lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
