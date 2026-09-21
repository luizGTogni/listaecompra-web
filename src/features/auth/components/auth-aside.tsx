import Link from "next/link";
import { CheckCircle, Circle } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/logo";
import { cn } from "@/utils/cn";

const PREVIEW_ITEMS = [
  { name: "Arroz", done: true },
  { name: "Leite", done: true },
  { name: "Tomate", done: false },
  { name: "Pão francês", done: false },
];

// Brand panel beside the form, desktop only (the layout hides it below lg).
export function AuthAside({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex-col justify-between gap-12 bg-accent p-12 text-accent-foreground",
        className,
      )}
    >
      <Link href="/" className="w-fit rounded-md">
        <Logo />
      </Link>

      <div className="flex max-w-md flex-col gap-4">
        <h2 className="text-4xl leading-tight font-bold tracking-tight">
          Suas compras, em um só lugar.
        </h2>
        <p className="text-lg">
          Monte a lista, compartilhe com quem mora com você e marque o que já
          está no carrinho.
        </p>
      </div>

      {/* Purely decorative preview of the product. */}
      <div
        aria-hidden="true"
        className="w-full max-w-sm rotate-[-2deg] self-center rounded-2xl bg-card p-5 text-card-foreground shadow-xl"
      >
        <p className="mb-3 font-bold">Feira da semana</p>
        <ul className="flex flex-col gap-3">
          {PREVIEW_ITEMS.map(({ name, done }) => (
            <li key={name} className="flex items-center gap-3">
              {done ? (
                <CheckCircle weight="fill" className="size-6 text-contrast" />
              ) : (
                <Circle className="size-6 text-muted-foreground" />
              )}
              <span
                className={cn(done && "text-muted-foreground line-through")}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
