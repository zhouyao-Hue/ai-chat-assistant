/** HTTP 响应错误（带 status）→ api/llm、hooks/useChat */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
export function isAbortError(value: unknown): boolean {
  return isError(value) && value.name === "AbortError";
}
