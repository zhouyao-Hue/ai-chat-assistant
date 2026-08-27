import type { ReactNode } from "react";

// —— 领域模型（聊天核心）——

/** 消息角色；被 Message 使用 */
export type Role = "user" | "assistant";

/** 单条聊天消息 → useChat / chatStore / MessageList / MessageBubble / mock/messages */
export interface Message {
  id: string;
  content: string;
  role: Role;
  timestamp: number;
}

/** 会话摘要 → chatStore */
export interface Session {
  id: string;
  title: string;
  createdAt: number;
}

// —— 网络 / SSE ——

/** HTTP 错误类与守卫 → utils/errors（HttpError / isError） */
export type ChatRole = Role | "system";
export type ChatMessagePayload = {
  role: ChatRole;
  content: string;
};

/** 上层流式聊天参数 → api/llm（streamChat） */
export type StreamChatOptions = {
  messages: ChatMessagePayload[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
};

/** 底层 SSE 读取回调 → utils/sse（streamSSE） */
export interface SSEOptions {
  onMessage: (data: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

// —— UI 状态 ——

/** 输入框 reducer 状态 → components/ChatInput */
export type InputState = {
  text: string;
  hasStopped: boolean;
};

/** 输入框 reducer action → components/ChatInput */
export type InputAction = { type: "SET_TEXT"; payload: string } | { type: "MARK_STOPPED" } | { type: "CLEAR_STOPPED" } | { type: "RESET_AFTER_SEND" };

/** ErrorBoundary props → components/ErrorBoundary */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** ErrorBoundary state → components/ErrorBoundary */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

/** 主题字面量 → context/ThemeContext */
export type Theme = "light" | "dark";

/** ThemeContext 值 → context/ThemeContext */
export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};


