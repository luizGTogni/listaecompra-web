import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ListsPaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ListsPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: ListsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-3"
    >
      <Button variant="outline" disabled={page === 1} onClick={onPrevious}>
        <CaretLeft aria-hidden />
        Anterior
      </Button>
      <span aria-current="page" className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} onClick={onNext}>
        Próxima
        <CaretRight aria-hidden />
      </Button>
    </nav>
  );
}
