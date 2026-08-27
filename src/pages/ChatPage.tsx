import { useRef, useEffect } from "react";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/context/ThemeContext";
export default function ChatPage() {
  const { toggleTheme } = useTheme();
  const { messages, isOnline, isLoading, isStreaming, sendMessage, stopGeneration, retryLastMessage } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid var(--border-color)" }}>
        <span style={{ fontWeight: 600 }}>AI Chat Assistant</span>
        {import.meta.env.DEV && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>BFF: {import.meta.env.VITE_BFF_URL || "(默认 localhost:3001)"}</div>}
        <button type="button" onClick={toggleTheme} aria-label="切换浅色/深色主题">
          切换主题
        </button>
      </header>
      <ErrorBoundary>
        {messages.length === 0 && !isLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.7,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div>
              <p style={{ fontSize: 18, marginBottom: 8 }}>开始一段新对话</p>
              <p style={{ fontSize: 14 }}>在下方输入消息，按 Enter 或点发送</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} isStreaming={isStreaming} />
        )}
        {!isOnline && (
          <div
            role="status"
            style={{
              padding: "8px 16px",
              background: "var(--offline-banner-bg, #fff3cd)",
              color: "var(--offline-banner-text, #856404)",
              borderTop: "1px solid var(--border-color)",
              fontSize: 14,
              textAlign: "center",
            }}
          >
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
    </div>
  );
}
