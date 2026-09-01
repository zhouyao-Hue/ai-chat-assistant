import type { Message } from "@/types";

/**
 * 将消息列表序列化为 JSON 并触发浏览器下载。
 * @param messages - 当前会话消息
 * @param filename - 下载文件名
 */
export function exportChatAsJson(messages: Message[], filename = "chat-export.json") {
  const blob = new Blob([JSON.stringify(messages, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

/**
 * 将消息列表格式化为 Markdown 并触发浏览器下载。
 * @param messages - 当前会话消息
 * @param filename - 下载文件名
 */
export function exportChatAsMarkdown(messages: Message[], filename = "chat-export.md") {
  const lines = messages.map((m) => {
    const who = m.role === "user" ? "用户" : "助手";
    return `### ${who}\n\n${m.content}\n`;
  });
  const blob = new Blob([lines.join("\n")], {
    type: "text/markdown;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

/**
 * 通过临时 `<a download>` 触发 Blob 文件下载。
 * @param blob - 文件内容
 * @param filename - 下载文件名
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
