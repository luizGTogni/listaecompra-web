import type { ReactNode } from "react";

// Placeholder for screens that are in the navigation but not built yet.
export function ComingSoon({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">Esta tela ainda vai chegar.</p>
      {children}
    </main>
  );
}
