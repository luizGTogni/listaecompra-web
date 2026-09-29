import type { ItemUnit } from "@/features/lists/units";

export interface AiProposal {
  title?: string;
  description?: string;
  // `unit` is typed optional: a backend build from before units omits it
  // (read as UNIT).
  addItems: { title: string; quantity: number; unit?: ItemUnit }[];
  // Ids are what the backend needs to remove; titles are what the card shows.
  removeItems: { id: string; title: string }[];
}

export interface AiChatReply {
  reply: string;
  proposal: AiProposal | null;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

// `POST /ai/apply`. It drops invalid items without failing, so `added` can be
// lower than what was sent.
export interface AiApplyResult {
  shopperListId: string;
  added: number;
  removed: number;
}
