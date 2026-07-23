import { useSettingsStore } from "../stores/settingsStore";
type StreamChatOptions = {
  message: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
};

export async function streamChat(options: StreamChatOptions) {
  const { message, signal, onToken, onDone, onError } = options;
  const { model } = useSettingsStore.getState();
  try {
    const response = await fetch("http://localhost:3001/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
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
      const err = new Error(tip) as Error & { status?: number };
      err.status = status;
      throw err;
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
    if ((err as Error).name === "AbortError") return;
    onError?.(err as Error);
  }
}