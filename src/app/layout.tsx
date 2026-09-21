import type { Metadata, Viewport } from "next";
import "@fontsource-variable/roboto/wght.css";
import { Providers } from "@/app/providers";
import { THEME_COLORS } from "@/app/theme-colors";
import "@/styles/globals.css";

export const metadata: Metadata = {
  // Pages set `title` and it is wrapped by the template, e.g. "Criar conta · Lista&Compra".
  title: { default: "Lista&Compra", template: "%s · Lista&Compra" },
  description: "Sua lista de compras, sempre à mão.",
  applicationName: "Lista&Compra",
  // iOS: lets "Add to Home Screen" open the app without Safari's browser UI.
  appleWebApp: { capable: true, title: "Lista&Compra" },
};

export const viewport: Viewport = {
  // Mobile-first: the page uses the real device width, with no initial zoom.
  width: "device-width",
  initialScale: 1,
  // Colors the browser toolbar / status bar to match the theme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes sets the `dark` class on <html>
    // before React hydrates, so the server and client markup differ on purpose.
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
