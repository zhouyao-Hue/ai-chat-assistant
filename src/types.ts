import type { ReactNode } from "react";

// —— 领域模型（聊天核心）——

/** 消息角色 */
export type Role = "user" | "assistant";

/** 单条聊天消息 */
export interface Message {
  id: string;
  content: string;
  role: Role;
  timestamp: number;
}

/** 会话摘要 */
export interface Session {
  id: string;
  title: string;
  createdAt: number;
}

// —— 网络 / 流式 ——

/** 发给模型的角色（含 system） */
export type ChatRole = Role | "system";

/** 发给 BFF / 上游的单条消息载荷 */
export type ChatMessagePayload = {
  role: ChatRole;
  content: string;
};

/** 流式聊天请求参数（api/llm.streamChat） */
export type StreamChatOptions = {
  messages: ChatMessagePayload[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
};

// —— UI 状态 ——

/** 输入框 reducer 状态 */
export type InputState = {
  text: string;
  hasStopped: boolean;
};

/** 输入框 reducer action */
export type InputAction =
  | { type: "SET_TEXT"; payload: string }
  | { type: "MARK_STOPPED" }
  | { type: "CLEAR_STOPPED" }
  | { type: "RESET_AFTER_SEND" };

/** ErrorBoundary props */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** ErrorBoundary state */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

/** 主题字面量 */
export type Theme = "light" | "dark";

/** ThemeContext 对外值 */
export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};
