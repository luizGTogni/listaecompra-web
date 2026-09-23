"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch } from "@phosphor-icons/react";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { getChangePasswordFeedback } from "../errors";
import { useChangePassword } from "../hooks/use-password";
import { changePasswordSchema, type ChangePasswordValues } from "../schemas";

export function ChangePasswordForm() {
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const feedback = change.isError
    ? getChangePasswordFeedback(change.error)
    : null;

  function onSubmit(values: ChangePasswordValues) {
    change.mutate(values, {
      onSuccess: () => reset(),
      onError(error) {
        const { fields } = getChangePasswordFeedback(error);
        for (const [name, message] of Object.entries(fields)) {
          setError(
            name as keyof ChangePasswordValues,
            { message },
            { shouldFocus: true },
          );
        }
      },
    });
  }

  return (
    <section
      aria-labelledby="change-password-title"
      className="flex flex-col gap-4"
    >
      <h2 id="change-password-title" className="text-xl font-semibold">
        Alterar senha
      </h2>
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

          <Field data-invalid={!!errors.currentPassword}>
            <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword")}
            />
            <FieldError errors={[errors.currentPassword]} />
          </Field>

          <Field data-invalid={!!errors.newPassword}>
            <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            <FieldError errors={[errors.newPassword]} />
          </Field>

          <Button type="submit" size="lg" disabled={change.isPending}>
            {change.isPending ? (
              <>
                <CircleNotch className="animate-spin" aria-hidden />
                Salvando...
              </>
            ) : (
              "Alterar senha"
            )}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
}
