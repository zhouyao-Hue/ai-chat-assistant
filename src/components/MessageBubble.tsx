import type { Message } from "@/types";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

/**
 * 将时间戳格式化为「今天/昨天/日期 + 时分」。
 * @param ts - Unix 毫秒时间戳
 * @returns 可读时间字符串
 */
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

/**
 * 单条消息气泡：Markdown（消毒）、折叠长文、复制、流式光标。
 * @param props.message - 消息实体
 * @param props.isStreaming - 是否为当前流式中的 assistant 气泡
 */
function MessageBubble({ message, isStreaming = false }: { message: Message; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false);

  /** 复制消息正文到剪贴板 */
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
        <div className={`msg-content${isLong && !expanded ? " msg-content-collapsed" : ""}`}>
          {isUser ? message.content : <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message.content}</ReactMarkdown>}
          {isStreaming && (
            <span className="streaming-cursor" aria-hidden="true">
              ▍
            </span>
          )}
        </div>
        {isLong && (
          <button type="button" className="msg-expand-btn" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "收起" : "展开全文"}
          </button>
        )}
        <div className="msg-meta">
          <span className="msg-time">{formatTime(message.timestamp)}</span>
          <button type="button" onClick={handleCopy} className="msg-copy-btn" aria-label={copied ? "已复制到剪切板" : "复制消息内容"}>
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default memo(MessageBubble);
