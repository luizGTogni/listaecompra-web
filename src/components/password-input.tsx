"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Password field with a show/hide toggle. On a phone, seeing what you typed
// beats a "confirm password" field.
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-2 -translate-y-1/2"
        // The label names the action; aria-pressed exposes the current state.
        aria-label="Mostrar senha"
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeSlash aria-hidden /> : <Eye aria-hidden />}
      </Button>
    </div>
  );
}
