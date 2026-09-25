"use client";

import type { ComponentProps } from "react";
import { X } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { cn } from "@/utils/cn";

// A Radix Dialog styled as a bottom sheet on mobile and a centered card from
// `md`. Use with `Dialog.Root`/`Dialog.Trigger`; the header (title, subtitle
// and close button) is built in, the body goes in `children`.
interface BottomSheetContentProps extends Omit<
  ComponentProps<typeof Dialog.Content>,
  "title"
> {
  title: string;
  description: string;
}

export function BottomSheetContent({
  title,
  description,
  className,
  children,
  ...props
}: BottomSheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

      <Dialog.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col gap-5 rounded-t-3xl border-t bg-background p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-foreground shadow-2xl duration-200 outline-none md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:border md:pb-6 data-open:animate-in data-open:slide-in-from-bottom md:data-open:slide-in-from-bottom-0 md:data-open:zoom-in-95 data-closed:animate-out data-closed:slide-out-to-bottom md:data-closed:slide-out-to-bottom-0 md:data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {/* Grab handle: a visual cue that this is a sheet (mobile only). */}
        <div
          className="mx-auto -mt-1 h-1.5 w-10 rounded-full bg-border md:hidden"
          aria-hidden
        />

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-muted-foreground">
              {description}
            </Dialog.Description>
          </div>
          <Dialog.Close
            aria-label="Fechar"
            className="-mt-1 -mr-1 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>
        </div>

        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
