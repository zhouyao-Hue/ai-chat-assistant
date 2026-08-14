import { useCallback, useRef, useEffect } from "react";
import { streamChat } from "@/api/llm";
import { useChatStore } from "@/stores/chatStore";
import type { Message } from "@/types";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

type StreamFn = (userInput: string, assistantMsg: Message) => void;
let _retry: StreamFn | null = null;

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);
  const lastUserInputRef = useRef<string>("");
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messages = useChatStore((s) => s.messages);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);

  const isStreaming = streamingMessageId !== null;
  const isLoading = messages.length === 0 && isStreaming;
  const startStream = useCallback((userInput: string, assistantMsg: Message) => {
    const controller = new AbortController();
    abortRef.current = controller;

    streamChat({
      message: userInput,
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
        const status = (err as Error & { status?: number }).status;
        const tip = err.message || "未知错误";
        if (status === 401) {
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
            _retry?.(userInput, assistantMsg);
          }, delay);
        } else {
          useChatStore.getState().updateLastAssistant(`\n\n❌ ${tip}；已达最大重试次数`);
          useChatStore.getState().setStreamingMessageId(null);
          retryCountRef.current = 0;
        }
      },
    });
  }, []);

  // eslint-disable-next-line
  _retry = startStream;

  const sendMessage = useCallback(
    (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed) return;
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

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryCountRef.current = 0;
    useChatStore.getState().setStreamingMessageId(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastInput = lastUserInputRef.current;
    if (!lastInput) return;

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

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    useChatStore.getState().clearMessages();
  }, []);

  return {
    messages,
    isStreaming,
    isLoading,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    resetChat,
  };
}
