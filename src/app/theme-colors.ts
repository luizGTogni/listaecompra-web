// Browser chrome and PWA colors can't read CSS variables, so they are repeated
// here. `theme-colors.test.ts` fails if they drift from the tokens in globals.css.
export const THEME_COLORS = {
  light: "#fff8f0", // --background in :root
  dark: "#1c1917", // --background in .dark
} as const;
