"use client";

import { useEffect, useRef, useState } from "react";
import { Check, PaperPlaneRight, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { getAiApplyMessage, getAiChatMessage } from "../errors";
import { useAiChat, useApplyAiProposal } from "../hooks/use-ai-chat";
import type { AiProposal } from "../types";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  proposal?: AiProposal | null;
  // What the person did with the proposal.
  decision?: "applied" | "discarded";
}

interface AiChatProps {
  // Chat about an existing list; without it, the chat creates a new one.
  shopperListId?: string;
  greeting: string;
  placeholder: string;
  suggestions: string[];
  className?: string;
}

// How much of the conversation is sent along with each message.
const HISTORY_LIMIT = 12;

// The conversation lives only in this component: closing the screen or the
// sheet starts a new one (the history is not saved).
export function AiChat({
  shopperListId,
  greeting,
  placeholder,
  suggestions,
  className,
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chat = useAiChat(shopperListId);
  const apply = useApplyAiProposal(shopperListId);
  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);

  const thinking = chat.isPending;

  useEffect(() => {
    bottom.current?.scrollIntoView?.({ block: "end" });
  }, [messages, thinking, error]);

  function send(text: string) {
    const value = text.trim();
    if (!value || thinking) return;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      text: value,
    };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError(null);

    // The greeting is ours, not part of the conversation with the model.
    const history = [...messages.filter((m) => m.id !== 0), userMessage]
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.text }));

    chat.mutate(history, {
      onSuccess: ({ reply, proposal }) => {
        setMessages((current) => [
          ...current,
          { id: nextId.current++, role: "assistant", text: reply, proposal },
        ]);
      },
      onError: (failure) => setError(getAiChatMessage(failure)),
    });
  }

  function decide(id: number, decision: "applied" | "discarded") {
    setMessages((current) =>
      current.map((m) => (m.id === id ? { ...m, decision } : m)),
    );
  }

  function applyProposal(message: Message) {
    if (!message.proposal) return;
    setError(null);
    apply.mutate(message.proposal, {
      onSuccess: () => decide(message.id, "applied"),
      onError: (failure) => setError(getAiApplyMessage(failure)),
    });
  }

  const started = messages.length > 1;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversa com a IA"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1"
      >
        {messages.map((message) => (
          <Bubble
            key={message.id}
            message={message}
            createsList={!shopperListId}
            applying={apply.isPending}
            onApply={() => applyProposal(message)}
            onDiscard={() => decide(message.id, "discarded")}
          />
        ))}

        {thinking && (
          <div className="flex items-start gap-2" role="status">
            <Avatar />
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3.5">
              <span className="sr-only">A IA está pensando…</span>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  aria-hidden
                  style={{ animationDelay: `${delay}ms` }}
                  className="size-2 animate-bounce rounded-full bg-muted-foreground"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {!started && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="min-h-11 cursor-pointer rounded-full border border-primary/40 bg-accent px-4 text-sm font-medium text-accent-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          aria-label="Mensagem para a IA"
          placeholder={placeholder}
          rows={1}
          value={draft}
          maxLength={500}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter breaks the line.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Enviar"
          disabled={!draft.trim() || thinking}
          className="size-11 shrink-0 rounded-full"
        >
          <PaperPlaneRight weight="fill" aria-hidden />
        </Button>
      </form>
    </div>
  );
}

function Avatar() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Sparkle className="size-4" weight="fill" aria-hidden />
    </span>
  );
}

interface BubbleProps {
  message: Message;
  createsList: boolean;
  applying: boolean;
  onApply: () => void;
  onDiscard: () => void;
}

function Bubble({
  message,
  createsList,
  applying,
  onApply,
  onDiscard,
}: BubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 whitespace-pre-wrap text-primary-foreground md:max-w-[75%]">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar />
      <div className="flex max-w-[85%] flex-col gap-2 md:max-w-[75%]">
        <p className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 whitespace-pre-wrap">
          {message.text}
        </p>
        {message.proposal && (
          <ProposalCard
            proposal={message.proposal}
            decision={message.decision}
            createsList={createsList}
            applying={applying}
            onApply={onApply}
            onDiscard={onDiscard}
          />
        )}
      </div>
    </div>
  );
}

interface ProposalCardProps {
  proposal: AiProposal;
  decision?: "applied" | "discarded";
  createsList: boolean;
  applying: boolean;
  onApply: () => void;
  onDiscard: () => void;
}

function ProposalCard({
  proposal,
  decision,
  createsList,
  applying,
  onApply,
  onDiscard,
}: ProposalCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-4 text-card-foreground shadow-xs",
        decision === "discarded" && "opacity-60",
      )}
    >
      {proposal.title && (
        <div>
          <p className="text-xs text-muted-foreground">
            {createsList ? "Nome da lista" : "Novo nome"}
          </p>
          <h3 className="font-semibold">{proposal.title}</h3>
        </div>
      )}
      {proposal.description && (
        <p className="text-sm text-muted-foreground">{proposal.description}</p>
      )}

      {proposal.addItems.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            {createsList ? "Itens" : "Adicionar"}
          </p>
          <ul className="flex flex-col divide-y text-sm">
            {proposal.addItems.map((item) => (
              <li
                key={item.title}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span>{item.title}</span>
                <span className="text-muted-foreground tabular-nums">
                  ×{item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {proposal.removeItems.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Remover</p>
          <ul className="flex flex-col divide-y text-sm">
            {proposal.removeItems.map((item) => (
              <li key={item.id} className="py-1.5">
                <span className="text-muted-foreground line-through">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {decision === "applied" ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-contrast">
          <Check weight="bold" aria-hidden />
          {createsList ? "Lista criada" : "Aplicado à lista"}
        </p>
      ) : decision === "discarded" ? (
        <p className="text-sm text-muted-foreground">Descartado</p>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={applying}
            onClick={onApply}
            className="min-h-11 flex-1"
          >
            {createsList ? "Criar lista" : "Aplicar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={applying}
            onClick={onDiscard}
            className="min-h-11"
          >
            Descartar
          </Button>
        </div>
      )}
    </div>
  );
}
