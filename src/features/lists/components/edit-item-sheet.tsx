"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch, PencilSimple } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getItemActionMessage } from "../errors";
import { useUpdateItemQuantity } from "../hooks/use-shopper-list-detail";
import { editItemSchema, type EditItemValues } from "../schemas";
import type { ShopperItem } from "../types";
import { normalizeUnit, parseQuantity, UNIT_INFO } from "../units";
import { UnitSelect } from "./unit-select";

interface EditItemSheetProps {
  listId: string;
  item: ShopperItem;
}

// Exact quantity and unit, for what the +/- steps cannot reach (750 g). The
// API has no way to rename an item, so the title is not editable.
export function EditItemSheet({ listId, item }: EditItemSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar ${item.title}`}
          className="text-muted-foreground"
        >
          <PencilSimple aria-hidden />
        </Button>
      </Dialog.Trigger>
      <BottomSheetContent
        title={`Editar ${item.title}`}
        description="Mude a quantidade e a unidade."
      >
        {/* Mounted only while open, so it always starts from the item. */}
        <EditItemForm
          listId={listId}
          item={item}
          onDone={() => setOpen(false)}
        />
      </BottomSheetContent>
    </Dialog.Root>
  );
}

function EditItemForm({
  listId,
  item,
  onDone,
}: EditItemSheetProps & { onDone: () => void }) {
  const updateItem = useUpdateItemQuantity(listId);
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors, touchedFields },
  } = useForm<EditItemValues>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      quantity: String(item.quantity).replace(".", ","),
      unit: normalizeUnit(item.unit),
    },
  });
  const unit = useWatch({ control, name: "unit" });

  function onSubmit(values: EditItemValues) {
    updateItem.mutate(
      {
        itemId: item.id,
        quantity: parseQuantity(values.quantity) ?? item.quantity,
        unit: values.unit,
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {updateItem.isError && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {getItemActionMessage(updateItem.error)}
        </div>
      )}
      <div className="flex items-start gap-2">
        <Field data-invalid={!!errors.quantity} className="w-28">
          <FieldLabel htmlFor="edit-quantity">Quantidade</FieldLabel>
          <Input
            id="edit-quantity"
            type="text"
            inputMode={UNIT_INFO[unit].decimal ? "decimal" : "numeric"}
            autoComplete="off"
            aria-invalid={!!errors.quantity}
            {...register("quantity")}
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel htmlFor="edit-unit">Unidade</FieldLabel>
          <UnitSelect
            id="edit-unit"
            {...register("unit", {
              onChange: () => {
                if (touchedFields.quantity) trigger("quantity");
              },
            })}
          />
        </Field>
      </div>
      <FieldError errors={[errors.quantity]} />
      <Button type="submit" size="lg" disabled={updateItem.isPending}>
        {updateItem.isPending && (
          <CircleNotch className="animate-spin" aria-hidden />
        )}
        Salvar
      </Button>
    </form>
  );
}
