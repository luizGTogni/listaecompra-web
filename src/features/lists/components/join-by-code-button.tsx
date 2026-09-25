"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch, Key } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getJoinByCodeMessage } from "../errors";
import { useJoinByCode } from "../hooks/use-join-by-code";
import { joinByCodeSchema, type JoinByCodeValues } from "../schemas";

export function JoinByCodeButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const joinByCode = useJoinByCode();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinByCodeValues>({
    resolver: zodResolver(joinByCodeSchema),
    defaultValues: { shareCode: "" },
  });

  function onSubmit({ shareCode }: JoinByCodeValues) {
    joinByCode.mutate(shareCode, {
      onSuccess({ shopperListMember }) {
        toast.success("Você entrou na lista.");
        router.push(`/lists/${shopperListMember.shopperListId}`);
      },
    });
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      joinByCode.reset();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <Key aria-hidden />
          Entrar com código
        </Button>
      </Dialog.Trigger>
      <BottomSheetContent
        title="Entrar com código"
        description="Digite o código que a pessoa compartilhou com você."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {joinByCode.isError && (
            <div
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {getJoinByCodeMessage(joinByCode.error)}
            </div>
          )}
          <Field data-invalid={!!errors.shareCode}>
            <FieldLabel htmlFor="share-code">Código da lista</FieldLabel>
            <Input
              id="share-code"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={!!errors.shareCode}
              {...register("shareCode")}
            />
            <FieldError errors={[errors.shareCode]} />
          </Field>
          {/* Also disabled after success, until the redirect: no double join. */}
          <Button
            type="submit"
            size="lg"
            disabled={joinByCode.isPending || joinByCode.isSuccess}
          >
            {joinByCode.isPending && (
              <CircleNotch className="animate-spin" aria-hidden />
            )}
            Entrar na lista
          </Button>
        </form>
      </BottomSheetContent>
    </Dialog.Root>
  );
}
