# AI Chat Assistant

基于 React + Express BFF 的流式 AI 聊天应用。  
前端负责会话 UI / 状态；服务端保管 API Key，代理大模型流式响应。

## 功能

- 多会话聊天、设置页模型选择
- SSE 流式输出、Markdown 渲染、长消息折叠
- 消息列表虚拟滚动
- Express BFF 转发（Key 不进浏览器）

## 技术栈

- 前端：React、Vite、Zustand、React Router、react-markdown、react-virtuoso
- 后端：Express（`server/`）
- 模型：DeepSeek（OpenAI 兼容接口）

## 架构

```mermaid
flowchart LR
  U[用户浏览器] --> FE[React 前端<br/>Vite]
  FE -->|POST /api/chat/stream| BFF[Express BFF<br/>server/]
  BFF -->|Bearer Key + stream| LLM[DeepSeek API]
  LLM -->|SSE tokens| BFF
  BFF -->|SSE| FE
  
## 本地启动

### 1. 安装依赖

```bash
npm install
## 目录分层

- `src/api/`：外部请求（如 LLM 流式调用）
- `src/stores/`：全局状态（chat / settings）
- `src/hooks/`：组合 api + store 的业务逻辑（如发消息、重试）
- `src/pages/`：路由页面，负责拼装
- `src/components/`：可复用 UI，不直接调 LLM
- `src/utils/`：纯工具（如通用 SSE 解析）