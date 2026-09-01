import { useCallback, useRef, useEffect } from "react";
import { streamChat } from "@/api/llm";
import { HttpError, isAbortError } from "@/utils/errors";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useChatStore } from "@/stores/chatStore";
import { trimMessages } from "@/utils/trimMessages";
import type { Message, ChatMessagePayload } from "@/types";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

/**
 * 聊天核心 Hook：发送、流式、重试、中断。
 * @returns 消息列表与发送 / 停止 / 重试操作
 */
export function useChat() {
  const isOnline = useOnlineStatus();
  const abortRef = useRef<AbortController | null>(null);
  const lastUserInputRef = useRef<string>("");
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messages = useChatStore((s) => s.messages);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const startStreamRef = useRef<((userInput: string, assistantMsg: Message) => void) | null>(null);
  const isStreaming = streamingMessageId !== null;
  const isLoading = messages.length === 0 && isStreaming;

  /**
   * 发起一次流式请求：组装 system + 历史，处理 token / 错误 / 重试。
   * @param userInput - 当前用户输入（重试时回用）
   * @param assistantMsg - 占位 assistant 消息
   */
  const startStream = useCallback((userInput: string, assistantMsg: Message) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const history = trimMessages(
      useChatStore
        .getState()
        .messages.filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content })),
    );
    const DEFAULT_SYSTEM_PROMPT = "你是简洁专业的中文技术助手。回答要准确、分点清晰，代码用 markdown 代码块。";
    const historyWithSystem: ChatMessagePayload[] = [{ role: "system", content: DEFAULT_SYSTEM_PROMPT }, ...history];
    streamChat({
      messages: historyWithSystem,
      signal: controller.signal,
      onToken: (token) => {
        retryCountRef.current = 0;
        useChatStore.getState().updateLastAssistant(token);
      },
      onDone: () => {
        useChatStore.getState().setStreamingMessageId(null);
        retryCountRef.current = 0;
      },
      onError: (err) => {
        if (isAbortError(err)) return;
        const status = err instanceof HttpError ? err.status : undefined;
        const tip = !navigator.onLine ? "网络已断开，请检查连接后重试" : err.message || "未知错误";
        if (status !== undefined && status >= 400 && status < 500 && status !== 429) {
          useChatStore.getState().updateLastAssistant(`\n\n❌ ${tip}`);
          useChatStore.getState().setStreamingMessageId(null);
          retryCountRef.current = 0;
          return;
        }
        const nextAttempt = retryCountRef.current + 1;
        if (nextAttempt <= MAX_RETRIES) {
          retryCountRef.current = nextAttempt;
          const delay = Math.min(BASE_DELAY * 2 ** (nextAttempt - 1), MAX_DELAY);
          useChatStore.getState().updateLastAssistant(`\n\n⏳ ${tip}；${delay / 1000}s 后第 ${nextAttempt}/${MAX_RETRIES} 次重试...`);
          retryTimerRef.current = setTimeout(() => {
            startStreamRef.current?.(userInput, assistantMsg);
          }, delay);
        } else {
          useChatStore.getState().updateLastAssistant(`\n\n❌ ${tip}；已达最大重试次数`);
          useChatStore.getState().setStreamingMessageId(null);
          retryCountRef.current = 0;
        }
      },
    });
  }, []);

  /**
   * 发送用户消息并创建占位 assistant 气泡；流式中拒绝连发。
   * @param userInput - 用户输入原文
   */
  const sendMessage = useCallback(
    (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed) return;
      if (useChatStore.getState().streamingMessageId !== null) return;
      if (!navigator.onLine) return;
      lastUserInputRef.current = trimmed;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      useChatStore.getState().addMessages([userMsg, assistantMsg]);
      useChatStore.getState().setStreamingMessageId(assistantMsg.id);

      abortRef.current?.abort();
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      retryCountRef.current = 0;
      startStream(trimmed, assistantMsg);
    },
    [startStream],
  );

  /** 中断当前流式生成与待执行的重试；若 assistant 仍为空则删除空气泡。 */
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryCountRef.current = 0;
    useChatStore.getState().setStreamingMessageId(null);
    const last = useChatStore.getState().messages.at(-1);
    if (last?.role === "assistant" && !last.content.trim()) {
      useChatStore.getState().removeLastAssistant();
    }
  }, []);

  /** 删除最后一条 assistant 回复并按上次用户输入重新请求。 */
  const retryLastMessage = useCallback(() => {
    const lastInput = lastUserInputRef.current;
    if (!lastInput) return;
    if (!navigator.onLine) return;

    useChatStore.getState().removeLastAssistant();

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    useChatStore.getState().addMessages([assistantMsg]);
    useChatStore.getState().setStreamingMessageId(assistantMsg.id);

    abortRef.current?.abort();
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryCountRef.current = 0;
    startStream(lastInput, assistantMsg);
  }, [startStream]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    startStreamRef.current = startStream;
  }, [startStream]);

  return {
    messages,
    isOnline,
    isStreaming,
    isLoading,
    sendMessage,
    stopGeneration,
    retryLastMessage,
  };
}
