import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const PORT = process.env.PORT || 3001;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.post("/api/chat/stream", async (req, res) => {
  const { messages, model } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages 必填且为非空数据" });
  }
  const ok = messages.every((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "system") && typeof m.content === "string" && m.content.trim().length > 0);
  if (!ok) {
    return res.status(400).json({ error: "messages 数据格式不正确" });
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
        model: model || "deepseek-chat",
        stream: true,
        messages,
      }),
    });
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text || `upstream ${upstream.status}` });
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

app.listen(PORT, () => {
  console.log(`BFF http://localhost:${PORT}`);
});
