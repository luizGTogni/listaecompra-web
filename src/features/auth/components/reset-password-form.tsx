"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { CircleNotch } from "@phosphor-icons/react";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CODE_LENGTH } from "../constants";
import { getResetPasswordMessage } from "../errors";
import { useResetPassword } from "../hooks/use-password";
import { resetPasswordSchema, type ResetPasswordValues } from "../schemas";

export function ResetPasswordForm() {
  const reset = useResetPassword();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { codeValue: "", newPassword: "" },
  });

  return (
    <form onSubmit={handleSubmit((values) => reset.mutate(values))} noValidate>
      <FieldGroup className="gap-5">
        {reset.isError && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {getResetPasswordMessage(reset.error)}
          </div>
        )}

        <Field data-invalid={!!errors.codeValue}>
          <FieldLabel htmlFor="codeValue">Código</FieldLabel>
          <Controller
            control={control}
            name="codeValue"
            render={({ field }) => (
              <InputOTP
                id="codeValue"
                maxLength={CODE_LENGTH}
                value={field.value}
                // The code is upper case; accept it typed or pasted in any case.
                onChange={(value) => field.onChange(value.toUpperCase())}
                onBlur={field.onBlur}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                inputMode="text"
                autoComplete="one-time-code"
                autoFocus
                aria-invalid={!!errors.codeValue}
                containerClassName="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="rounded-lg border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          <FieldError errors={[errors.codeValue]} />
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

        <Button
          type="submit"
          size="lg"
          disabled={reset.isPending || reset.isSuccess}
        >
          {reset.isPending ? (
            <>
              <CircleNotch className="animate-spin" aria-hidden />
              Salvando...
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
