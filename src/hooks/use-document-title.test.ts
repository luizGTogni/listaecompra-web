import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "./use-document-title";

describe("useDocumentTitle", () => {
  it("sets the title with the app suffix and ignores undefined", () => {
    document.title = "Lista · Lista&Compra";
    const { rerender } = renderHook(({ t }) => useDocumentTitle(t), {
      initialProps: { t: undefined as string | undefined },
    });
    expect(document.title).toBe("Lista · Lista&Compra");

    rerender({ t: "Mercado" });
    expect(document.title).toBe("Mercado · Lista&Compra");
  });
});
