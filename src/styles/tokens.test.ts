import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "globals.css"), "utf8");

function readTokens(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1];
  if (!block) throw new Error(`Block "${selector}" not found in globals.css`);

  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (light + 0.05) / (dark + 0.05);
}

// [foreground, background] pairs where text is drawn.
const textPairs = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["primary", "background"], // primary used as link/text color
  ["contrast-foreground", "contrast"],
  ["contrast", "background"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["destructive", "background"],
];

// Borders and focus rings are UI components: WCAG 1.4.11 asks for 3:1.
const uiPairs = [
  ["input", "background"],
  ["input", "card"],
  ["ring", "background"],
  ["ring", "card"],
];

describe.each([
  ["light", ":root"],
  ["dark", "\\.dark"],
])("%s theme tokens", (_name, selector) => {
  const tokens = readTokens(selector);

  it.each(textPairs)("%s on %s has AA text contrast (4.5:1)", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(uiPairs)("%s on %s has AA UI contrast (3:1)", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });
});

describe("brand palette", () => {
  it("keeps the agreed light-theme colors", () => {
    const light = readTokens(":root");

    expect(light).toMatchObject({
      background: "#fff8f0",
      card: "#ffffff",
      primary: "#c2410c",
      contrast: "#2e7d32",
      foreground: "#292524",
      "muted-foreground": "#78716c",
    });
  });
});

describe("base styles", () => {
  it("defines breakpoints once, mobile-first", () => {
    for (const bp of ["sm", "md", "lg", "xl"]) {
      expect(css).toContain(`--breakpoint-${bp}:`);
    }
  });

  it("has a visible focus style", () => {
    expect(css).toContain(":focus-visible");
  });

  it("respects prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
