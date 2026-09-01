/**
 * HTTP 响应错误（带 status），供 llm / useChat 区分可重试与不可重试。
 */
export class HttpError extends Error {
  status: number;

  /**
   * @param message - 用户可读错误信息
   * @param status - HTTP 状态码
   */
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * 判断 unknown 是否为 Error 实例（catch 块类型收窄）。
 * @param value - 任意捕获值
 * @returns 是否为 Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * 判断是否为 fetch / AbortController 中断错误。
 * @param value - 任意捕获值
 * @returns 是否为 AbortError
 */
export function isAbortError(value: unknown): boolean {
  return isError(value) && value.name === "AbortError";
}
