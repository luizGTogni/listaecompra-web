"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getForgotPasswordMessage } from "../errors";
import { useForgotPassword } from "../hooks/use-password";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(({ email }) => forgot.mutate(email))}
      noValidate
    >
      <FieldGroup className="gap-5">
        {forgot.isError && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {getForgotPasswordMessage(forgot.error)}
          </div>
        )}

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        {/* Disabled after success too, until the redirect: no double send. */}
        <Button
          type="submit"
          size="lg"
          disabled={forgot.isPending || forgot.isSuccess}
        >
          {forgot.isPending ? (
            <>
              <CircleNotch className="animate-spin" aria-hidden />
              Enviando...
            </>
          ) : (
            "Enviar código"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
