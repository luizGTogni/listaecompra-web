"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch, Plus } from "@phosphor-icons/react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getAddItemFeedback } from "../errors";
import { useAddItem } from "../hooks/use-shopper-list-detail";
import {
  addItemSchema,
  ITEM_TITLE_MAX_LENGTH,
  toAddItemInput,
  type AddItemValues,
} from "../schemas";
import { UNIT_INFO } from "../units";
import { UnitSelect } from "./unit-select";

// react-hook-form types the form by what is typed into it, zod by what comes
// out: split input and output, as both are the same today but need not stay so.
type AddItemFormValues = z.input<typeof addItemSchema>;

export function AddItemForm({ listId }: { listId: string }) {
  const addItem = useAddItem(listId);
  const titleRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    trigger,
    control,
    formState: { errors, touchedFields },
  } = useForm<AddItemFormValues, unknown, AddItemValues>({
    resolver: zodResolver(addItemSchema),
    mode: "onTouched",
    defaultValues: { title: "", quantity: "1", unit: "UNIT" },
  });
  const unit = useWatch({ control, name: "unit" });
  const { ref: titleFieldRef, ...titleField } = register("title");

  const feedback = addItem.isError ? getAddItemFeedback(addItem.error) : null;

  useEffect(() => {
    // Only after a successful add: an invalid attempt keeps what was typed.
    if (addItem.isSuccess) titleRef.current?.focus();
  }, [addItem.isSuccess]);

  function onSubmit(values: AddItemValues) {
    addItem.mutate(toAddItemInput(values), {
      onSuccess: () => {
        // Ready for the next item right away; quantity and unit keep the
        // last values, since a whole shopping run often repeats them.
        reset({ title: "", quantity: values.quantity, unit: values.unit });
        addItem.reset();
      },
      onError(error) {
        const { fields } = getAddItemFeedback(error);
        for (const [name, message] of Object.entries(fields)) {
          setError(name as keyof AddItemValues, { message });
        }
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-xl border bg-card p-3 text-card-foreground"
    >
      <FieldGroup className="gap-3">
        {feedback?.form && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {feedback.form}
          </div>
        )}
        <Field data-invalid={!!errors.title}>
          <Input
            {...titleField}
            ref={(node) => {
              titleFieldRef(node);
              titleRef.current = node;
            }}
            aria-label="Nome do item"
            placeholder="Novo item, ex.: Arroz"
            maxLength={ITEM_TITLE_MAX_LENGTH}
            autoComplete="off"
            aria-invalid={!!errors.title}
          />
          <FieldError errors={[errors.title]} />
        </Field>
        <div className="grid grid-cols-[6.5rem_1fr] gap-3">
          <Field data-invalid={!!errors.quantity}>
            <FieldLabel htmlFor="add-quantity" className="text-xs">
              Quantidade
            </FieldLabel>
            {/* Text, not type="number": that one refuses a comma in some
                browsers, and "1,5" is how people write it here. */}
            <Input
              id="add-quantity"
              type="text"
              inputMode={UNIT_INFO[unit].decimal ? "decimal" : "numeric"}
              autoComplete="off"
              aria-invalid={!!errors.quantity}
              {...register("quantity")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="add-unit" className="text-xs">
              Unidade
            </FieldLabel>
            <UnitSelect
              id="add-unit"
              {...register("unit", {
                // The quantity may stop being valid ("1,5" in garrafas).
                onChange: () => {
                  if (touchedFields.quantity) trigger("quantity");
                },
              })}
            />
          </Field>
        </div>
        {errors.quantity && (
          <p role="alert" className="-mt-1 text-sm text-destructive">
            {errors.quantity.message}
          </p>
        )}
        <Button type="submit" size="lg" disabled={addItem.isPending}>
          {addItem.isPending ? (
            <CircleNotch className="animate-spin" aria-hidden />
          ) : (
            <Plus aria-hidden />
          )}
          Adicionar item
        </Button>
      </FieldGroup>
    </form>
  );
}
