"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store";

// Whenever the token disappears (sign out, or the API said it expired) the
// cached server data goes too. Otherwise the next person to sign in on this
// browser could briefly see the previous user's lists.
export function ClearCacheOnSignOut() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (previous.token && !state.token) queryClient.clear();
      }),
    [queryClient],
  );

  return null;
}
