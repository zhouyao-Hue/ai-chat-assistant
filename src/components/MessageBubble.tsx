import type { Message } from "@/types";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
function formatTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const isUser = message.role === "user";
  const COLLAPSE_LEN = 400;
  const isLong = message.content.length > COLLAPSE_LEN;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`msg-row ${isUser ? "msg-row-user" : "msg-row-ai"}`}>
      <div className={`msg-bubble ${isUser ? "msg-bubble-user" : "msg-bubble-ai"}`}>
        <div className="msg-content" style={isLong && !expanded ? { maxHeight: 160, overflow: "hidden" } : undefined}>
          {isUser ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
        </div>
        {isLong && (
          <button type="button" className="msg-expand-btn" onClick={() => setExpanded((v) => !v)} style={{ marginTop: 8, cursor: "pointer" }}>
            {expanded ? "收起" : "展开全文"}
          </button>
        )}
        <div className="msg-time">{formatTime(message.timestamp)}</div>
        <button type="button" onClick={handleCopy} className="msg-copy-btn" aria-label={copied ? "已复制到剪切板" : "复制消息内容"}>
          {copied ? "已复制!" : "复制"}
        </button>
      </div>
    </div>
  );
}
export default memo(MessageBubble);