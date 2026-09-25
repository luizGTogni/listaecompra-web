import { useEffect } from "react";

// Sets the tab title from client data (the server only knows the static one).
// Falls back to the current title while `title` is still undefined.
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} · Lista&Compra`;
  }, [title]);
}
