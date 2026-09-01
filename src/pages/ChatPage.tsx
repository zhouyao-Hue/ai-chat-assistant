import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/context/ThemeContext";
import { useChatStore } from "@/stores/chatStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { exportChatAsJson, exportChatAsMarkdown } from "@/utils/exportChat";

/**
 * 根据会话标题生成安全的导出文件名。
 * @param title - 会话标题
 * @param ext - 扩展名（不含点）
 * @returns 如 `新会话.json`
 */
function buildExportFilename(title: string | undefined, ext: string): string {
  const base = title?.trim() || "chat-export";
  const safe = base.replace(/[^\w\u4e00-\u9fa5-]+/g, "_").slice(0, 40);
  return `${safe}.${ext}`;
}

/**
 * 主聊天页：消息列表、搜索、导出、离线横幅与输入区。
 */
export default function ChatPage() {
  const { theme, toggleTheme } = useTheme();
  const { messages, isOnline, isLoading, isStreaming, sendMessage, stopGeneration, retryLastMessage } = useChat();
  const model = useSettingsStore((s) => s.model);
  const sessions = useChatStore((s) => s.sessions);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const canExport = messages.length > 0;

  /** 按关键词过滤当前会话消息（仅影响展示，不影响导出） */
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;
  const noSearchHits = hasSearch && filteredMessages.length === 0;

  /** 导出当前会话为 JSON 文件 */
  const handleExportJson = useCallback(() => {
    exportChatAsJson(messages, buildExportFilename(currentSession?.title, "json"));
  }, [messages, currentSession?.title]);

  /** 导出当前会话为 Markdown 文件 */
  const handleExportMarkdown = useCallback(() => {
    exportChatAsMarkdown(messages, buildExportFilename(currentSession?.title, "md"));
  }, [messages, currentSession?.title]);

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  return (
    <main className="chat-main">
      <header className="chat-header">
        <div>
          <div className="chat-header-brand">Lumen</div>
          <div className="chat-header-meta">
            <span className="chat-header-meta-pill">{model}</span>
          </div>
          {import.meta.env.DEV && (
            <div className="chat-header-meta chat-header-dev">
              BFF · {import.meta.env.VITE_BFF_URL || "localhost:3001"}
            </div>
          )}
        </div>
        <div className="chat-header-actions">
          <input
            type="search"
            className="input-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索消息…"
            aria-label="搜索消息"
          />
          <button type="button" className="btn" onClick={handleExportJson} disabled={!canExport} aria-label="导出 JSON">
            JSON
          </button>
          <button type="button" className="btn" onClick={handleExportMarkdown} disabled={!canExport} aria-label="导出 Markdown">
            MD
          </button>
          <button
            type="button"
            className="btn"
            onClick={toggleTheme}
            aria-label="切换浅色/深色主题"
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? "浅色" : "深色"}
          </button>
        </div>
      </header>
      <ErrorBoundary>
        {messages.length === 0 && !isLoading ? (
          <div className="chat-empty">
            <div className="chat-empty-card">
              <div className="chat-empty-ornament" aria-hidden="true" />
              <p className="chat-empty-title">开始一段新对话</p>
              <p className="chat-empty-desc">在下方输入消息，按 Enter 或点发送</p>
            </div>
          </div>
        ) : noSearchHits ? (
          <div className="chat-status" role="status">
            <p>没有匹配「{searchQuery.trim()}」的消息</p>
          </div>
        ) : (
          <MessageList messages={filteredMessages} isLoading={isLoading} isStreaming={isStreaming} />
        )}
        {!isOnline && (
          <div className="offline-banner" role="status">
            网络已断开，请检查连接后再发送消息
          </div>
        )}
        <ChatInput
          ref={inputRef}
          onSend={sendMessage}
          onStop={stopGeneration}
          onRetry={retryLastMessage}
          isStreaming={isStreaming}
          isOffline={!isOnline}
        />
      </ErrorBoundary>
    </main>
  );
}
