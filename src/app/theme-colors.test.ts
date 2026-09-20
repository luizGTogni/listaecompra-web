import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { THEME_COLORS } from "@/app/theme-colors";
import manifest from "@/app/manifest";

const css = readFileSync(resolve(__dirname, "../styles/globals.css"), "utf8");

function background(selector: string) {
  const block =
    css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

  return block.match(/--background:\s*(#[0-9a-fA-F]{6})/)?.[1].toLowerCase();
}

describe("THEME_COLORS", () => {
  it("matches the --background tokens in globals.css", () => {
    expect(THEME_COLORS.light).toBe(background(":root"));
    expect(THEME_COLORS.dark).toBe(background("\\.dark"));
  });
});

describe("web app manifest", () => {
  const m = manifest();

  it("is installable as a standalone app", () => {
    expect(m).toMatchObject({
      name: "Lista e Compra",
      start_url: "/",
      display: "standalone",
      background_color: THEME_COLORS.light,
    });
  });

  it("declares 192, 512 and maskable icons", () => {
    const icons = m.icons ?? [];

    expect(icons.map((i) => i.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"]),
    );
    expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("points every icon to a file that exists in public/", () => {
    for (const icon of m.icons ?? []) {
      const path = resolve(__dirname, "../../public", icon.src.slice(1));

      expect(() => readFileSync(path), icon.src).not.toThrow();
    }
  });
});
