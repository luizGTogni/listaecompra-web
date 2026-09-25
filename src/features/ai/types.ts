export interface AiProposal {
  title?: string;
  description?: string;
  addItems: { title: string; quantity: number }[];
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
