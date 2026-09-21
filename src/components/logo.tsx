import { cn } from "@/utils/cn";

// The mark uses fixed brand colors on purpose: the logo looks the same in light
// and dark mode. Keep it in sync with src/assets/logo/mark.svg.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="96" height="96" rx="22" fill="#C2410C" />
      <rect x="24" y="20" width="48" height="56" rx="8" fill="#FFF8F0" />
      <path
        d="M31 36l3 3 6-7"
        fill="none"
        stroke="#2E7D32"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="50" r="2.8" fill="#C2410C" />
      <circle cx="34" cy="64" r="2.8" fill="#C2410C" />
      <path
        d="M45 36h18M45 50h18M45 64h12"
        fill="none"
        stroke="#C2410C"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Mark + wordmark. The text is real text (not part of the SVG), so it follows
// the theme, scales with the user's font size and is read by screen readers.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-xl leading-none font-bold tracking-tight">
        Lista<span className="font-normal text-primary">{"&"}</span>Compra
      </span>
    </span>
  );
}
