"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getNewListFeedback } from "../errors";
import { useCreateList } from "../hooks/use-create-list";
import {
  DESCRIPTION_MAX_LENGTH,
  newListSchema,
  TITLE_MAX_LENGTH,
  type NewListValues,
} from "../schemas";

export function NewListForm() {
  const createList = useCreateList();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<NewListValues>({
    resolver: zodResolver(newListSchema),
    mode: "onTouched",
    defaultValues: { title: "", description: "" },
  });

  const feedback = createList.isError
    ? getNewListFeedback(createList.error)
    : null;
  // useWatch subscribes to one field, so only this component re-renders.
  const descriptionLength = useWatch({ control, name: "description" }).length;
  // isSuccess too: the redirect takes a moment and a second tap would create
  // a duplicate (which the backend would refuse, but the user would see an error).
  const busy = createList.isPending || createList.isSuccess;

  function onSubmit(values: NewListValues) {
    createList.mutate(values, {
      onError(error) {
        const { fields } = getNewListFeedback(error);
        for (const [name, message] of Object.entries(fields)) {
          setError(
            name as keyof NewListValues,
            { message },
            { shouldFocus: true },
          );
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        {feedback?.form && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {feedback.form}
          </div>
        )}

        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Nome da lista</FieldLabel>
          <Input
            id="title"
            placeholder="Ex.: Feira da semana"
            maxLength={TITLE_MAX_LENGTH}
            autoComplete="off"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
          <Textarea
            id="description"
            placeholder="Ex.: Compras do sábado, para a casa toda"
            maxLength={DESCRIPTION_MAX_LENGTH}
            aria-invalid={!!errors.description}
            aria-describedby="description-count"
            {...register("description")}
          />
          <FieldDescription id="description-count" className="text-right">
            {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
          </FieldDescription>
          <FieldError errors={[errors.description]} />
        </Field>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? (
              <>
                <CircleNotch className="animate-spin" aria-hidden />
                Criando lista...
              </>
            ) : (
              "Criar lista"
            )}
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/lists">Cancelar</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
