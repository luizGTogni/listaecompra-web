"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch, Plus } from "@phosphor-icons/react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getAddItemFeedback } from "../errors";
import { useAddItem } from "../hooks/use-shopper-list-detail";
import {
  addItemSchema,
  ITEM_TITLE_MAX_LENGTH,
  type AddItemValues,
} from "../schemas";

// react-hook-form types the form by what is typed into it, zod by what comes
// out (`quantity` goes from the input's string to a number): split input and
// output so a value can be a valid submission without being a valid keystroke.
type AddItemInput = z.input<typeof addItemSchema>;

export function AddItemForm({ listId }: { listId: string }) {
  const addItem = useAddItem(listId);
  const titleRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AddItemInput, unknown, AddItemValues>({
    resolver: zodResolver(addItemSchema),
    mode: "onTouched",
    defaultValues: { title: "", quantity: 1 },
  });
  const { ref: titleFieldRef, ...titleField } = register("title");

  const feedback = addItem.isError ? getAddItemFeedback(addItem.error) : null;

  useEffect(() => {
    // Only after a successful add: an invalid attempt keeps what was typed.
    if (addItem.isSuccess) titleRef.current?.focus();
  }, [addItem.isSuccess]);

  function onSubmit(values: AddItemValues) {
    addItem.mutate(
      { ...values, description: "" },
      {
        onSuccess: () => {
          // Ready for the next item right away; quantity keeps the last value,
          // since a whole shopping run often repeats it (e.g. "2 of each").
          reset({ title: "", quantity: values.quantity });
          addItem.reset();
        },
        onError(error) {
          const { fields } = getAddItemFeedback(error);
          for (const [name, message] of Object.entries(fields)) {
            setError(name as keyof AddItemValues, { message });
          }
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-3">
        {feedback?.form && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {feedback.form}
          </div>
        )}
        <div className="flex items-start gap-2">
          <Field data-invalid={!!errors.title} className="flex-1">
            <Input
              {...titleField}
              ref={(node) => {
                titleFieldRef(node);
                titleRef.current = node;
              }}
              aria-label="Nome do item"
              placeholder="Adicionar item, ex.: Arroz"
              maxLength={ITEM_TITLE_MAX_LENGTH}
              autoComplete="off"
              aria-invalid={!!errors.title}
            />
            <FieldError errors={[errors.title]} />
          </Field>
          <Field data-invalid={!!errors.quantity} className="w-20">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              aria-label="Quantidade"
              aria-invalid={!!errors.quantity}
              {...register("quantity")}
            />
            <FieldError errors={[errors.quantity]} />
          </Field>
          <Button type="submit" size="icon" disabled={addItem.isPending}>
            {addItem.isPending ? (
              <CircleNotch className="animate-spin" aria-hidden />
            ) : (
              <Plus aria-hidden />
            )}
            <span className="sr-only">Adicionar item</span>
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
