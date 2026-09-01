import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_MODELS = ["deepseek-chat", "deepseek-reasoner"];

/** 默认允许的前端 Origin（本地 Vite 常见端口） */
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

/** 允许列表：CORS_ORIGIN 逗号分隔，否则用默认本地端口 */
const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins.join(","))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * 主机名后缀白名单：覆盖 Cloudflare Pages 预览 / 分支别名
 * （如 `32a29edd.ai-chat-assistant-1c5.pages.dev`）。
 * 环境变量 CORS_ORIGIN_SUFFIXES 逗号分隔；未设置时默认本项目 Pages 后缀。
 */
const allowedOriginSuffixes = (
  process.env.CORS_ORIGIN_SUFFIXES || ".ai-chat-assistant-1c5.pages.dev"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => (s.startsWith("*.") ? s.slice(1) : s.startsWith(".") ? s : `.${s}`));

/**
 * 判断 Origin 是否在精确白名单或 Pages 预览后缀内。
 * @param {string | undefined} origin - 请求 Origin
 * @returns {boolean}
 */
function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  let hostname;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }
  return allowedOriginSuffixes.some(
    (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );
}

app.use(
  cors({
    /**
     * 校验请求 Origin：无 Origin、精确白名单或后缀匹配则放行，并回写单个 Allow-Origin。
     * @param {string | undefined} origin - 请求 Origin
     * @param {(err: Error | null, allow?: boolean) => void} callback - cors 回调
     */
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
  }),
);
app.use(express.json());

/**
 * 健康检查：服务存活、是否配置了 API Key（不返回 Key 原文）。
 */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "ai-chat-bff",
    time: new Date().toISOString(),
    hasApiKey: Boolean(process.env.LLM_API_KEY && !process.env.LLM_API_KEY.includes("你的真实Key")),
  });
});

/**
 * 流式聊天代理：校验 messages / model，转发上游 SSE。
 */
app.post("/api/chat/stream", async (req, res) => {
  const { messages, model } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages 必填且为非空数据" });
  }
  const ok = messages.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant" || m.role === "system") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );
  if (!ok) {
    return res.status(400).json({ error: "messages 数据格式不正确" });
  }
  const chosenModel = model || "deepseek-chat";
  if (!ALLOWED_MODELS.includes(chosenModel)) {
    return res.status(400).json({
      code: "INVALID_MODEL",
      error: `不支持的模型：${chosenModel}。可选：${ALLOWED_MODELS.join(", ")}`,
    });
  }
  const apiKey = process.env.LLM_API_KEY;
  const baseURL = (process.env.LLM_API_BASE || "https://api.deepseek.com").replace(/\/$/, "");
  if (!apiKey || apiKey.includes("你的真实Key")) {
    return res.status(500).json({ error: "服务端未配置 LLM_API_KEY" });
  }
  try {
    const upstream = await fetch(`${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        stream: true,
        messages,
      }),
    });
    if (!upstream.ok) {
      const text = await upstream.text();
      const status = upstream.status;
      const code = status === 401 ? "UPSTREAM_UNAUTHORIZED" : status === 429 ? "UPSTREAM_RATE_LIMIT" : "UPSTREAM_ERROR";
      return res.status(status).json({
        code,
        error: text.slice(0, 300) || `upstream ${status}`,
      });
    }
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: String(err) });
    } else {
      res.end();
    }
  }
});

/**
 * JSON 解析失败时返回统一 400，避免抛出 HTML 堆栈页。
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      code: "INVALID_JSON",
      error: "请求体不是合法 JSON",
    });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`BFF http://localhost:${PORT}`);
});
