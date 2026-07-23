import { useState } from "react";

function ChatInput({
  onSend,
  onStop,
  onRetry,
  isStreaming,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  onRetry: () => void;
  isStreaming: boolean;
}) {
  const [text, setText] = useState("");
  const [hasStopped, setHasStopped] = useState(false);

  const handleSend = () => {
    if (isStreaming) {
      onStop();
      setHasStopped(true);
      return;
    }
    if (hasStopped) {
      onRetry();
      setHasStopped(false);
      return;
    }
    if (!text.trim()) return;
    onSend(text);
    setText("");
    setHasStopped(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (hasStopped) setHasStopped(false);
  };

  const buttonColor = isStreaming ? "#e74c3c" : hasStopped ? "#f39c12" : "#3498db";

  return (
    <div className="chat-input">
      <input
        value={text}
        placeholder="输入消息..."
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={isStreaming}
        style={{
          flex: 1,
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: 6,
          fontSize: 14,
        }}
      />
      <button
        onClick={handleSend}
        style={{
          backgroundColor: buttonColor,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        {isStreaming ? "⏹ 停止" : hasStopped ? "🔄 重试" : "发送"}
      </button>
    </div>
  );
}

export default ChatInput;
