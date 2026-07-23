const SSE_EVENT_REGEX = /^data:\s*(.*)$/;
interface SSEOptions {
  onMessage: (data: string) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}
export async function streamSSE(url: string, body: Record<string, unknown>, options: SSEOptions) {
  const { onMessage, onDone, onError, signal } = options;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    if (!response.ok) {
      throw new Error(`SSE 请求失败: ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error(`SSE 请求失败: 无法获取取器`);
    }
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone?.();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const match = line.match(SSE_EVENT_REGEX);
        if (match) {
          const data = match[1].trim();
          if (data === "[DONE]") {
            onDone?.();
            return;
          }
          onMessage(data);
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    onError?.(err as Error);
  }
}
