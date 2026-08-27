import type { Message } from "@/types";

export function exportChatAsJson(messages: Message[], filename = "chat-export.json") {
  const blob = new Blob([JSON.stringify(messages, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}