"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch } from "@phosphor-icons/react";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSignUpFeedback } from "../errors";
import { useSignUp } from "../hooks/use-sign-up";
import { signUpSchema, type SignUpValues } from "../schemas";

export function SignUpForm() {
  const signUp = useSignUp();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    // Validate a field when it loses focus, not while the user is still typing.
    mode: "onTouched",
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const feedback = signUp.isError ? getSignUpFeedback(signUp.error) : null;

  function onSubmit(values: SignUpValues) {
    signUp.mutate(values, {
      onError(error) {
        const { fields } = getSignUpFeedback(error);
        for (const [name, message] of Object.entries(fields)) {
          setError(
            name as keyof SignUpValues,
            { message },
            { shouldFocus: true },
          );
        }
      },
    });
  }

  return (
    // noValidate: zod owns the messages, so the browser's own bubbles stay off.
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

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="username">Usuário</FieldLabel>
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={!!errors.username}
            aria-describedby="username-hint"
            {...register("username")}
          />
          <FieldDescription id="username-hint">
            De 3 a 20 caracteres: letras, números e _.
          </FieldDescription>
          <FieldError errors={[errors.username]} />
        </Field>

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

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button type="submit" size="lg" disabled={signUp.isPending}>
          {signUp.isPending ? (
            <>
              <CircleNotch className="animate-spin" aria-hidden />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
