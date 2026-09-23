"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotch, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getInviteMemberFeedback } from "../errors";
import { useInviteMember } from "../hooks/use-shopper-list-members";
import { inviteMemberSchema, type InviteMemberValues } from "../schemas";

export function InviteMemberForm({ listId }: { listId: string }) {
  const inviteMember = useInviteMember(listId);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    mode: "onTouched",
    defaultValues: { username: "" },
  });

  const feedback = inviteMember.isError
    ? getInviteMemberFeedback(inviteMember.error)
    : null;

  function onSubmit(values: InviteMemberValues) {
    inviteMember.mutate(values.username, {
      onSuccess: () => reset({ username: "" }),
      onError(error) {
        const { fields } = getInviteMemberFeedback(error);
        for (const [name, message] of Object.entries(fields)) {
          setError(name as keyof InviteMemberValues, { message });
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {feedback?.form && (
        <div
          role="alert"
          className="mb-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {feedback.form}
        </div>
      )}
      <Field data-invalid={!!errors.username}>
        <FieldLabel htmlFor="username">Convidar por usuário</FieldLabel>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              id="username"
              placeholder="@usuario"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={!!errors.username}
              {...register("username")}
            />
          </div>
          <Button type="submit" disabled={inviteMember.isPending}>
            {inviteMember.isPending ? (
              <CircleNotch className="animate-spin" aria-hidden />
            ) : (
              <UserPlus aria-hidden />
            )}
            Convidar
          </Button>
        </div>
        <FieldDescription>
          O nome de usuário aparece no Perfil de cada pessoa.
        </FieldDescription>
        <FieldError errors={[errors.username]} />
      </Field>
    </form>
  );
}
