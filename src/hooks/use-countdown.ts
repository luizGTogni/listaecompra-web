import { useCallback, useSyncExternalStore } from "react";

const secondsUntil = (deadline: number | null) =>
  deadline === null
    ? 0
    : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

// Whole seconds left until `deadline` (epoch ms), ticking once per second.
// Works from an absolute time, not a counter, so it stays right after the tab
// was in the background or the page was reloaded.
export function useSecondsUntil(deadline: number | null) {
  // The clock is an external system, so it is read with useSyncExternalStore:
  // React re-renders only when the number of seconds changes.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (secondsUntil(deadline) === 0) return () => {};
      const id = setInterval(() => {
        onChange();
        if (secondsUntil(deadline) === 0) clearInterval(id);
      }, 1000);
      return () => clearInterval(id);
    },
    [deadline],
  );

  return useSyncExternalStore(
    subscribe,
    () => secondsUntil(deadline),
    () => 0,
  );
}
