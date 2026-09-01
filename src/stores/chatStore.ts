import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Session } from "@/types";

interface ChatStore {
  sessions: Session[];
  currentSessionId: string | null;
  messagesBySession: Record<string, Message[]>;
  messages: Message[];
  streamingMessageId: string | null;

  /** 创建新会话（先保存当前会话消息）并切换为当前 */
  createSession: () => void;
  /** 切换会话并持久化当前会话消息 */
  switchSession: (id: string) => void;
  /** 追加消息到当前会话 */
  addMessages: (msgs: Message[]) => void;
  /** 将 token 追加到最后一条 assistant 消息 */
  updateLastAssistant: (token: string) => void;
  /** 删除最后一条 assistant 消息（重试用） */
  removeLastAssistant: () => void;
  /** 标记正在流式输出的 assistant 消息 id */
  setStreamingMessageId: (id: string | null) => void;
  /** 清空当前会话消息 */
  clearMessages: () => void;
  /** 删除指定会话，必要时切换到相邻会话 */
  deleteSession: (id: string) => void;
  /** 重命名会话标题 */
  renameSession: (id: string, title: string) => void;
}

/** 多会话聊天状态（localStorage 持久化） */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      messagesBySession: {},
      messages: [],
      streamingMessageId: null,

      createSession: () => {
        const newSession: Session = {
          id: crypto.randomUUID(),
          title: "新会话",
          createdAt: Date.now(),
        };
        set((s) => {
          const saved = s.currentSessionId ? { ...s.messagesBySession, [s.currentSessionId]: s.messages } : s.messagesBySession;
          return {
            sessions: [...s.sessions, newSession],
            currentSessionId: newSession.id,
            messagesBySession: saved,
            messages: [],
            streamingMessageId: null,
          };
        });
      },

      switchSession: (id) =>
        set((s) => {
          const saved = s.currentSessionId ? { ...s.messagesBySession, [s.currentSessionId]: s.messages } : s.messagesBySession;
          return {
            messagesBySession: saved,
            currentSessionId: id,
            messages: s.messagesBySession[id] ?? [],
            streamingMessageId: null,
          };
        }),

      addMessages: (msgs) => set((s) => ({ messages: [...s.messages, ...msgs] })),

      updateLastAssistant: (token) =>
        set((s) => ({
          messages: s.messages.map((m, i) => (i === s.messages.length - 1 && m.role === "assistant" ? { ...m, content: m.content + token } : m)),
        })),

      removeLastAssistant: () =>
        set((s) => {
          const last = s.messages[s.messages.length - 1];
          if (last?.role === "assistant") {
            return { messages: s.messages.slice(0, -1) };
          }
          return {};
        }),

      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      clearMessages: () => set({ messages: [], streamingMessageId: null }),

      deleteSession: (id) =>
        set((s) => {
          const filtered = s.sessions.filter((ses) => ses.id !== id);
          const nextId = s.currentSessionId === id ? (filtered[0]?.id ?? null) : s.currentSessionId;
          const nextMessages = s.currentSessionId === id ? (nextId ? (s.messagesBySession[nextId] ?? []) : []) : s.messages;
          return {
            sessions: filtered,
            currentSessionId: nextId,
            messages: nextMessages,
          };
        }),

      renameSession: (id, title) =>
        set((s) => ({
          sessions: s.sessions.map((ses) => (ses.id === id ? { ...ses, title } : ses)),
        })),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        messages: state.messages,
        messagesBySession: state.messagesBySession,
      }),
    },
  ),
);
