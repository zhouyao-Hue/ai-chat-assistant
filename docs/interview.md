# AI Chat Assistant — 简历 & 自述

> 收官冲刺交付物 · 面试前 1 分钟 + 5 分钟版本

---

## A. 简历项目描述（3～5 行）

**AI Chat Assistant** | 个人项目 · React + TypeScript + Express BFF  
2025.06 – 2025.08

- 独立完成流式 AI 聊天应用：前端 React+TS，Express BFF 代理 DeepSeek，API Key 仅存服务端
- 实现 SSE 全链路（fetch 读流 → token 逐字渲染），自定义 `useChat` 封装发送、Abort、指数退避重试与多轮上下文
- 产品能力：system prompt、历史裁剪（最近 N 条）、会话导出（JSON/Markdown）、消息搜索、多模型切换
- 健壮性与安全：ErrorBoundary、离线提示、防连点、Markdown 消毒（rehype-sanitize）、统一 BFF 错误码
- 工程化：TypeScript strict、Vitest 单测、设置页 lazy 加载、GitHub Actions（lint + tsc）

**技术栈：** React、TypeScript、Vite、Zustand、React Router、Express、SSE、Vitest

---

## B. 5 分钟自述要点

### 1. 项目是什么（约 30 秒）

这是一个 **React + TypeScript 的流式 AI 聊天应用**。  
用户在前端多会话聊天，消息通过 **SSE 流式**返回；后端有一层 **Express BFF**，负责保管 API Key 并转发大模型请求。  
我独立完成了从前端 UI、状态管理到 BFF 代理和错误处理的整条链路。

---

### 2. 为什么用 BFF（约 1 分钟）

核心原因：**API Key 不能进浏览器**。  
如果 Key 写在前端或 `VITE_` 环境变量里，打包后任何人都能在 DevTools 里看到。

所以架构是：

```text
浏览器 → 自己的 BFF（/api/chat/stream）→ DeepSeek API
```

BFF 做三件事：

1. 持有 `LLM_API_KEY`
2. 校验请求体（messages 格式、模型白名单）
3. 把上游 SSE 原样或透传给前端

这样前端只调自己的域名，安全边界清晰，面试也好讲。

---

### 3. 核心难点：`useChat` + SSE（约 2 分钟）

**SSE 怎么接：**  
`fetch` 拿到 `response.body.getReader()`，按行解析 `data:`，解析 JSON 里的 `delta.content`，每个 token 回调更新最后一条 assistant 消息。

**`useChat` 我处理了：**

- **多轮上下文**：从 store 取历史，拼 system + user/assistant，再 `trimMessages` 裁到最近 N 条
- **Abort**：`AbortController` 停止生成；Abort 后删掉空的 assistant 气泡
- **重试**：网络/5xx 指数退避，401 不重试（Key 错了重试没用）
- **防连点**：`streamingMessageId !== null` 时拒绝再发
- **离线**：`navigator.onLine` + 横幅，离线禁用发送

可以补一句：流式时列表用 Virtuoso 虚拟滚动，并加了流式光标，让用户知道还在生成。

---

### 4. 产品能力（约 1 分钟，选 2～3 个讲深）

**多轮 + 裁剪：** 不是每次只发当前一句，而是带历史；太长会超 token，所以只保留最近 20 条。

**system prompt：** 首条 messages 固定 system，控制助手人设，不用改 UI 文案。

**导出 / 搜索：** 导出 JSON、Markdown 备份会话；header 搜索框过滤当前会话，导出仍用全量 messages。

**多模型：** 设置页选模型，BFF 校验白名单（如 `deepseek-chat`），避免选 OpenAI 模型却打 DeepSeek 接口。

---

### 5. 工程化与收尾（约 30 秒）

- **TypeScript strict** 全项目可编译
- **Vitest** 测了 `HttpError`、`isError` 等工具
- **ErrorBoundary** + `resetKey` 重试渲染
- **rehype-sanitize** 防 Markdown XSS
- **GitHub Actions**：push/PR 跑 lint + tsc
- 设置页 **lazy**，build 后独立 chunk

如果问「你还想改进什么」：生产部署、E2E、token 估算、RAG 接入——自然接到后面 FastAPI / RAG 项目。

---

## C. 1 分钟超短版（电梯稿）

> 我做了一个 React+TS 流式 AI 聊天，Express BFF 保管 Key。前端自定义 `useChat` 处理 SSE、多轮、重试和 Abort；有导出、搜索、多模型和 Markdown 消毒。CI 跑 lint 和类型检查，整体可当完整前端+AI 应用 Demo 讲。
