"use client";

import { useRef, useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSecondsUntil } from "@/hooks/use-countdown";
import { getResendMessage, getVerifyMessage } from "../errors";
import { useResendCode, useVerify } from "../hooks/use-verify";
import { useSignOut } from "../hooks/use-sign-out";
import { CODE_LENGTH } from "../constants";
import { useAuthStore } from "../store";

export function VerifyForm() {
  const email = useAuthStore((state) => state.email);
  const signOut = useSignOut();
  const verify = useVerify();
  const resend = useResendCode();
  const remaining = useSecondsUntil(
    useAuthStore((state) => state.resendAvailableAt),
  );
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(value: string) {
    resend.reset();
    verify.mutate(value, {
      // Wrong code: clear the boxes and put the cursor back to try again.
      onError() {
        setCode("");
        inputRef.current?.focus();
      },
    });
  }

  const isComplete = code.length === CODE_LENGTH;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (isComplete) submit(code);
      }}
      className="flex flex-col gap-6"
    >
      <p className="text-muted-foreground">
        Enviamos um código de {CODE_LENGTH} caracteres para{" "}
        <strong className="font-medium break-words text-foreground">
          {email}
        </strong>
        . Ele vale por 15 minutos.
      </p>

      <div className="flex flex-col gap-3">
        <InputOTP
          ref={inputRef}
          maxLength={CODE_LENGTH}
          value={code}
          // The code is upper case; accept it typed or pasted in any case.
          onChange={(value) => setCode(value.toUpperCase())}
          onComplete={submit}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          inputMode="text"
          autoComplete="one-time-code"
          autoFocus
          disabled={verify.isPending}
          aria-label="Código de verificação"
          aria-invalid={verify.isError}
          containerClassName="justify-center gap-2"
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

        {verify.isError && (
          <p role="alert" className="text-center text-sm text-destructive">
            {getVerifyMessage(verify.error)}
          </p>
        )}
        {resend.isError && (
          <p role="alert" className="text-center text-sm text-destructive">
            {getResendMessage(resend.error)}
          </p>
        )}
        {resend.isSuccess && (
          <p role="status" className="text-center text-sm text-contrast">
            Enviamos um novo código. O anterior deixou de valer.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isComplete || verify.isPending}
      >
        {verify.isPending ? (
          <>
            <CircleNotch className="animate-spin" aria-hidden />
            Verificando...
          </>
        ) : (
          "Confirmar"
        )}
      </Button>

      <div className="flex flex-col items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          disabled={resend.isPending || remaining > 0}
          onClick={() => resend.mutate()}
        >
          {remaining > 0
            ? `Reenviar código em ${remaining}s`
            : "Reenviar código"}
        </Button>
        <Button
          type="button"
          variant="link"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          Usar outra conta
        </Button>
      </div>
    </form>
  );
}
