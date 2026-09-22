import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface ListSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ListSearchField({ value, onChange }: ListSearchFieldProps) {
  return (
    // role="search" makes this a landmark screen reader users can jump to.
    // The form only exists so "Enter" on a phone keyboard does not reload.
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Buscar listas"
          placeholder="Buscar pelo nome"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={60}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          // Our own clear button replaces the browser's (which differs per browser).
          className="px-10 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onChange("")}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}
