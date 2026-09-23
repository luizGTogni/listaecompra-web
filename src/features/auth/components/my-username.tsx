"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { currentUserQuery } from "../queries";

// Owners invite people to a list by username, so this is what to share.
export function MyUsername() {
  const currentUser = useQuery(currentUserQuery);
  const [copied, setCopied] = useState(false);

  if (!currentUser.data) return null;
  const { name, username } = currentUser.data.user;

  async function copy() {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (permissions, insecure context...);
      // the username is still on screen and can be selected by hand.
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-lg font-medium">{name}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2 text-sm">
          @{username}
        </code>
        <Button type="button" variant="outline" size="icon" onClick={copy}>
          {copied ? (
            <Check className="text-contrast" aria-hidden />
          ) : (
            <Copy aria-hidden />
          )}
          <span className="sr-only">Copiar usuário</span>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Compartilhe com quem for te convidar para uma lista.
      </p>
    </div>
  );
}
