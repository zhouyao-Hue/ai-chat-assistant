import type { ChatMessagePayload } from "@/types";
export const MAX_HISTORY = 20;
export function trimMessages(msgs: ChatMessagePayload[], maxN: number = MAX_HISTORY): ChatMessagePayload[] {
  if (msgs.length <= maxN) return msgs;
  return msgs.slice(-maxN);
}