import { apiFetch } from "@/services/api";
import type { AiChatMessage, AiChatReply, AiProposal } from "./types";

// Without `shopperListId` the chat is about a list that does not exist yet.
export function sendAiChat(input: {
  shopperListId?: string;
  messages: AiChatMessage[];
}) {
  return apiFetch<AiChatReply>("/ai/chat", { method: "POST", body: input });
}

// Nothing the chat says changes a list until this call: the person confirms.
export function applyAiProposal(input: {
  shopperListId?: string;
  proposal: AiProposal;
}) {
  const { title, description, addItems, removeItems } = input.proposal;

  return apiFetch<{ shopperListId: string; added: number; removed: number }>(
    "/ai/apply",
    {
      method: "POST",
      body: {
        shopperListId: input.shopperListId,
        title,
        description,
        addItems,
        removeItemIds: removeItems.map((item) => item.id),
      },
    },
  );
}
