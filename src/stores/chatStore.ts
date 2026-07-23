import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "../types";

interface Session {
  id: string;
  title: string;
  createdAt: number;
}

interface ChatStore {
  sessions: Session[];
  currentSessionId: string | null;
  messagesBySession: Record<string, Message[]>;
  messages: Message[];
  streamingMessageId: string | null;

  createSession: () => void;
  switchSession: (id: string) => void;
  addMessages: (msgs: Message[]) => void;
  updateLastAssistant: (token: string) => void;
  removeLastAssistant: () => void;
  setStreamingMessageId: (id: string | null) => void;
  clearMessages: () => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
}

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
        set((s) => ({
          sessions: [...s.sessions, newSession],
          currentSessionId: newSession.id,
          messages: [],
        }));
      },

      switchSession: (id) =>
        set((s) => {
          const saved = s.currentSessionId
            ? { ...s.messagesBySession, [s.currentSessionId]: s.messages }
            : s.messagesBySession;
          return {
            messagesBySession: saved,
            currentSessionId: id,
            messages: s.messagesBySession[id] ?? [],
            streamingMessageId: null,
          };
        }),

      addMessages: (msgs) =>
        set((s) => ({ messages: [...s.messages, ...msgs] })),

      updateLastAssistant: (token) =>
        set((s) => ({
          messages: s.messages.map((m, i) =>
            i === s.messages.length - 1 && m.role === "assistant"
              ? { ...m, content: m.content + token }
              : m
          ),
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
          const nextId =
            s.currentSessionId === id ? (filtered[0]?.id ?? null) : s.currentSessionId;
          const nextMessages =
            s.currentSessionId === id
              ? (nextId ? s.messagesBySession[nextId] ?? [] : [])
              : s.messages;
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
      }),
    },
  ),
);
