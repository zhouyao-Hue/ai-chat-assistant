# Week 13 预习 — FastAPI 前五问

> 收官冲刺交付物 · 列问题即可，W13 再逐条搞懂  
> 对照：你现在的 Express BFF（`server/index.js`）= 将来用 FastAPI 重写的目标形态

---

## 前五问清单

### 1. FastAPI 和 Flask / Express 比，为什么适合写 AI 应用的 BFF？

**预习方向：** 异步、类型提示、自动 OpenAPI 文档、和 Pydantic 校验请求体。  
**联系现有项目：** 你现在 Express 手写校验 `messages`、转发 SSE——FastAPI 里这些会怎么写更省事？

---

### 2. Pydantic 模型在 FastAPI 里干什么？和 TypeScript 的 `interface` 有什么相似/不同？

**预习方向：** 请求/响应 schema、自动 422 校验错误、字段类型与 optional。  
**联系现有项目：** 等价于你在 BFF 里检查 `messages` 数组、`role`、`content` 那段逻辑。

---

### 3. FastAPI 怎么做「流式响应」（SSE 或 StreamingResponse）？

**预习方向：** `StreamingResponse`、`EventSourceResponse`、async generator 逐块 yield。  
**联系现有项目：** 对应 `server/index.js` 里读 upstream body 再 `res.write` 的那段。

---

### 4. 依赖注入（Depends）是什么？API Key 应该放在 Depends 还是环境变量？

**预习方向：** 路由函数参数里 `Depends(get_api_key)`；测试时如何 mock。  
**联系现有项目：** 对应 `process.env.LLM_API_KEY`，但结构更清晰、可单测。

---

### 5. 若把 `ai-chat-assistant` 的 BFF 从 Express 迁到 FastAPI，你会拆哪几个路由/模块？最小 MVP 是什么？

**预习方向：** `/health`、`POST /api/chat/stream`、CORS 中间件、错误码统一。  
**联系现有项目：** 你已有 `INVALID_MODEL`、`UPSTREAM_*` 等——迁移时目录怎么分（`routers/`、`schemas/`、`services/`）？

---

## 自检（W13 开始前）

- [ ] 五个问题都能用自己的话复述一遍（不要求会写代码）
- [ ] 能说出：FastAPI 版 BFF 和当前 Express 版 **至少 2 个相同职责**
- [ ] 可选：扫一眼 [FastAPI 官方 Tutorial - First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
