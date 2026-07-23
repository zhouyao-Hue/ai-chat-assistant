import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import ErrorBoundary from "../components/ErrorBoundary";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../stores/chatStore";
import { useState, useEffect } from "react";

export default function ChatPage() {
  type Theme = "light" | "dark";
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "light");
  const messages = useChatStore((s) => s.messages);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const { sendMessage, stopGeneration, retryLastMessage } = useChat();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <ErrorBoundary>
        <MessageList messages={messages} isLoading={messages.length === 0 && streamingMessageId !== null} isStreaming={streamingMessageId !== null} />
        <ChatInput onSend={sendMessage} onStop={stopGeneration} onRetry={retryLastMessage} isStreaming={streamingMessageId !== null} />
        <button onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}>Toggle Theme</button>
      </ErrorBoundary>
    </div>
  );
}
