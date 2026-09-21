import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false on the server and while hydrating, true afterwards. Anything that
// reads browser-only state (localStorage) must wait for this, otherwise the
// first client render would not match the HTML the server sent.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
