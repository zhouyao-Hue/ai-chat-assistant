## 目录分层

- `src/api/`：外部请求（如 LLM 流式调用）
- `src/stores/`：全局状态（chat / settings）
- `src/hooks/`：组合 api + store 的业务逻辑（如发消息、重试）
- `src/pages/`：路由页面，负责拼装
- `src/components/`：可复用 UI，不直接调 LLM
- `src/utils/`：纯工具（如通用 SSE 解析）