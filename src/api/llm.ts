import { useSettingsStore } from "@/stores/settingsStore";
import { HttpError, isError, isAbortError } from "@/utils/errors";
import type { StreamChatOptions } from "@/types";

export async function streamChat(options: StreamChatOptions) {
  const { messages, signal, onToken, onDone, onError } = options;
  const { model } = useSettingsStore.getState();
  const BFF_BASE = import.meta.env.VITE_BFF_URL?.replace(/\/$/, "") || "http://localhost:3001";
  try {
    const response = await fetch(`${BFF_BASE}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model,
      }),
      signal,
    });
    if (!response.ok) {
      const status = response.status;
      let tip = `请求失败(${status})`;
      if (status === 401) tip = "401：API Key 无效或未授权，请检查设置页";
      else if (status === 429) tip = "429：请求过于频繁或额度不足，请稍后再试";
      else if (status === 500 || status >= 500) tip = `${status}：服务器异常，请稍后再试`;
      throw new HttpError(tip, status);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("无法读取响应流");
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          onDone?.();
          return;
        }
        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0].delta?.content;
          if (token) onToken(token);
        } catch {
          void 0;
        }
      }
    }
    onDone?.();
  } catch (err) {
    if (isAbortError(err)) return;
    if (isError(err)) onError?.(err);
    else onError?.(new Error(String(err)));
  }
}
