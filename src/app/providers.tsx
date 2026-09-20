"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: ReactNode }) {
  // useState keeps a single QueryClient for the lifetime of the component.
  // Creating it at module level would share the cache between users on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute before a background refetch.
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    // "system" follows prefers-color-scheme; useTheme().setTheme overrides it
    // and the choice is remembered in localStorage.
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
