import { useEffect, useState } from "react";

// Follows `value`, but only after it stopped changing for `delayMs`. Used so a
// search box sends one request when the user pauses, not one per keystroke.
export function useDebounce<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
