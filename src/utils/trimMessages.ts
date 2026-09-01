import type { ChatMessagePayload } from "@/types";

/** 发送给模型的历史消息条数上限 */
export const MAX_HISTORY = 20;

/**
 * 保留最近 maxN 条消息，超出则丢弃更早的（用于控制上下文长度）。
 * @param msgs - 待裁剪的消息列表
 * @param maxN - 最大保留条数，默认 {@link MAX_HISTORY}
 * @returns 裁剪后的消息列表（不修改原数组）
 */
export function trimMessages(msgs: ChatMessagePayload[], maxN: number = MAX_HISTORY): ChatMessagePayload[] {
  if (msgs.length <= maxN) return msgs;
  return msgs.slice(-maxN);
}
