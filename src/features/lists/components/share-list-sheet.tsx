"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowsClockwise,
  CircleNotch,
  Copy,
  ShareNetwork,
} from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { getListActionMessage } from "../errors";
import { useResetShareCode } from "../hooks/use-shopper-list-detail";

interface ShareListSheetProps {
  listId: string;
  listTitle: string;
  shareCode: string;
}

// Owner only. Shows the list's code, a QR code and a link that joins straight
// away, plus a way to replace the code when it leaked.
export function ShareListSheet({
  listId,
  listTitle,
  shareCode,
}: ShareListSheetProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetShareCode = useResetShareCode(listId);
  const link = `${window.location.origin}/join/${encodeURIComponent(shareCode)}`;

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  }

  async function share() {
    // No Web Share (most desktops): copying the link is the next best thing.
    if (!navigator.share) {
      await copy(link, "Link copiado.");
      return;
    }
    try {
      await navigator.share({
        title: "Lista&Compra",
        text: `Entre na minha lista "${listTitle}" no Lista&Compra:`,
        url: link,
      });
    } catch {
      // Closing the share sheet rejects with AbortError: nothing to report.
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <ShareNetwork aria-hidden />
          Compartilhar
        </Button>
      </Dialog.Trigger>
      <BottomSheetContent
        title="Compartilhar lista"
        description="Quem tiver o código ou o link entra na lista."
      >
        <div className="flex flex-col items-center gap-4">
          {/* White behind the code on purpose: scanners need the contrast in
              both themes. */}
          <div className="rounded-xl border bg-white p-3">
            <QRCodeSVG
              value={link}
              size={168}
              title={`QR code para entrar na lista ${listTitle}`}
            />
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium">Código da lista</span>
            <div className="flex items-center gap-2">
              <code
                data-testid="share-code"
                className="min-w-0 flex-1 rounded-lg bg-secondary px-3 py-2.5 text-sm break-all"
              >
                {shareCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copiar código"
                onClick={() => copy(shareCode, "Código copiado.")}
              >
                <Copy aria-hidden />
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2">
            <Button type="button" onClick={share}>
              <ShareNetwork aria-hidden />
              Compartilhar link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => copy(link, "Link copiado.")}
            >
              <Copy aria-hidden />
              Copiar link
            </Button>
          </div>

          <AlertDialog open={confirmingReset} onOpenChange={setConfirmingReset}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="w-full">
                <ArrowsClockwise aria-hidden />
                Gerar novo código
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gerar um novo código?</AlertDialogTitle>
                <AlertDialogDescription>
                  O código e o link atuais deixam de funcionar. Quem já entrou
                  continua na lista.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {resetShareCode.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {getListActionMessage(resetShareCode.error)}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resetShareCode.isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={resetShareCode.isPending}
                  onClick={(event) => {
                    // Stay open until it works, so a failure stays visible.
                    event.preventDefault();
                    resetShareCode.mutate(undefined, {
                      onSuccess: () => {
                        setConfirmingReset(false);
                        toast.success("Novo código gerado.");
                      },
                    });
                  }}
                >
                  {resetShareCode.isPending && (
                    <CircleNotch className="animate-spin" aria-hidden />
                  )}
                  Gerar novo código
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </BottomSheetContent>
    </Dialog.Root>
  );
}
