"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { currentUserQuery } from "@/features/auth/queries";
import {
  notifySessionInvalid,
  onSessionInvalid,
} from "@/features/auth/session-events";
import { isUnauthorizedError } from "@/features/auth/unauthorized";
import { ApiError } from "@/services/api";

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
            // A 4xx is the server's final answer (not verified, forbidden...),
            // so asking again would not help. Retry only network and 5xx errors.
            retry: (failureCount, error) =>
              failureCount < 2 &&
              !(error instanceof ApiError && error.status < 500),
          },
        },
        // Any authenticated request can find out mid-session that the cookie
        // is gone (expired, or the user signed out in another tab). The
        // client itself does not exist yet at this point (it is what we are
        // building), so these only announce it; see the effect below.
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Skip the current-user query itself: a failed refetch would
            // just trigger another one.
            if (
              isUnauthorizedError(error) &&
              query.queryKey[0] !== currentUserQuery.queryKey[0]
            ) {
              notifySessionInvalid();
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (isUnauthorizedError(error)) notifySessionInvalid();
          },
        }),
      }),
  );

  // Whichever request notices the session is gone, refresh the current user:
  // the guard watching it (RequireToken/RequireVerified) then redirects to
  // /sign-in.
  useEffect(
    () =>
      onSessionInvalid(() => {
        queryClient.invalidateQueries({ queryKey: currentUserQuery.queryKey });
      }),
    [queryClient],
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
        {/* Top, not bottom: the bottom belongs to the navigation bar. */}
        <Toaster position="top-center" />
        {children}
        {/* Dev only. Parked above the bottom bar and the "+" button, where the
            default corner would cover the Perfil tab and swallow its taps. */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed right-2 bottom-40 z-50 md:bottom-28">
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="relative"
            />
          </div>
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
