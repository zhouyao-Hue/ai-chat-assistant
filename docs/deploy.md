# 生产部署（当前方案）

## 访问地址（线上）

| 用途 | 地址 |
|------|------|
| **正式前端（打开这个）** | https://ai-chat-assistant-1c5.pages.dev |
| **设置页** | https://ai-chat-assistant-1c5.pages.dev/settings |
| **BFF / API** | https://ai-chat-assistant-k7fb.onrender.com |
| **BFF 健康检查** | https://ai-chat-assistant-k7fb.onrender.com/health |

| 组件 | 平台 | 费用 |
|------|------|------|
| 前端 | Cloudflare Pages | 免费档 |
| BFF | Render Free Web Service | 免费档（会休眠） |

> 曾试用 Vercel 前端，国内常超时，故改为 Cloudflare Pages。当前生产以 **Pages + Render** 为准。

---

## 每次部署速查（照着做）

改了什么，就部署对应一侧；前后端都改则**两边都要发**。

| 你改了什么 | 部署哪边 |
|------------|----------|
| `src/`、`index.html`、`public/`、样式、`.env.production` | **只发前端** |
| `server/`、BFF 环境变量、CORS | **只发后端** |
| 两边都有 | **先发 BFF，再发前端**（CORS 改动尤其如此） |

### A. 每次发前端（Cloudflare Pages 正式站）

前置：已 `npx wrangler login`；项目根有 `.env.production`：

```env
VITE_BFF_URL=https://ai-chat-assistant-k7fb.onrender.com
```

```powershell
cd C:\Users\董鉴华\ai-chat-assistant

npm run build
npx wrangler pages deploy dist --project-name=ai-chat-assistant --branch=main --commit-dirty=true
```

| 检查项 | 正确值 |
|--------|--------|
| `--project-name` | **`ai-chat-assistant`**（不是 `ai-chat-assistant-1c5`） |
| `--branch` | **`main`**（否则只是 Preview，正式站不更新） |
| 验证地址 | https://ai-chat-assistant-1c5.pages.dev （Ctrl+Shift+R） |

命令跑完即结束，无需额外「结束部署」。

### B. 每次发后端（Render BFF）

本仓库根目录有 `Dockerfile`，Render 会识别为 **Docker** 部署。日常更新：

1. 把含 `server/`（及 Dockerfile）的提交推到 Render 所连分支（通常 `main`）
2. [Render Dashboard](https://dashboard.render.com) → 对应 Web Service  
   - Auto-Deploy 开着：等 **Live**  
   - 否则：**Manual Deploy** → Deploy latest commit
3. 只改环境变量：服务 → **Environment** → Save → 必要时再 Manual Deploy
4. 探活：https://ai-chat-assistant-k7fb.onrender.com/health → 期望 `"ok": true`

首次创建或对照填表见下方「一、BFF：Render New Web Service 填表」。

### C. 部署后快速验收

1. 打开 https://ai-chat-assistant-1c5.pages.dev（不要用带哈希的预览域名做日常验收）
2. 设置页模型选 **`deepseek-chat`**
3. 发一条消息，确认流式正常
4. DevTools → Network：`POST .../api/chat/stream` → 200

---

## 架构

```text
浏览器 → Cloudflare Pages（静态 dist）
              ↓  VITE_BFF_URL
         Render Express BFF（Docker）
              ↓  LLM_API_KEY
         DeepSeek API（SSE）
```

- API Key **只在 Render 环境变量**，不进前端包
- `CORS_ORIGIN` 精确白名单；Pages 预览由后缀白名单放行（需 BFF 已部署含该逻辑的代码）

---

## 一、BFF：Render New Web Service 填表

入口：Dashboard → **New +** → **Web Service** → 选中 GitHub 仓库（如 `zhouyao-Hua/ai-chat-assistant`）。

仓库有 `Dockerfile` 时，页面会提示 *It looks like you're using Docker…*，按下面填即可。

### 1. Source Code

| 项 | 填法 |
|----|------|
| 仓库 | 本项目的 GitHub 仓库（Connect 后可选） |

### 2. General

| 字段 | 填什么 | 说明 |
|------|--------|------|
| **Name** | `ai-chat-assistant`（或你喜欢的名字） | 会生成 `https://<name>-xxxx.onrender.com`；现网示例为 `ai-chat-assistant-k7fb` |
| **Project** | 可选，如 `My project` / `Production` | 仅分组，不影响运行 |
| **Language** | **Docker** | 有根目录 `Dockerfile` 时用 Docker；不要改成 Node 除非你改掉部署方式 |
| **Branch** | **`main`** | 正式 BFF 跟 `main`；功能分支未合并则线上不会带上新 CORS 等改动 |
| **Region** | `Oregon (US West)` 即可 | 免费档常见可选区；定了以后尽量别换 |
| **Root Directory** | **留空** | Dockerfile / `server/` 都在仓库根，不要填 `src` |

### 3. Compute

| 字段 | 填什么 |
|------|--------|
| 套餐 | **Free**（$0/月，0.1 CPU，512 MB RAM） |

注意：Free 会休眠、无 SSH、无持久盘。紫条提示属正常。

### 4. Environment Variables（必填）

点 **Add Environment Variable**（或 **Add from .env**，勿上传含真实 Key 的文件到 Git）。建议：

| Key | Value |
|-----|--------|
| `LLM_API_KEY` | 你的 DeepSeek Key（`sk-...`） |
| `LLM_API_BASE` | `https://api.deepseek.com` |
| `CORS_ORIGIN` | `https://ai-chat-assistant-1c5.pages.dev` |
| `CORS_ORIGIN_SUFFIXES` | `.ai-chat-assistant-1c5.pages.dev`（可选；新代码默认已含，显式写更清晰） |

可选再加：`http://localhost:5173` 到 `CORS_ORIGIN`（逗号分隔），方便本地联调线上 BFF。

**不要**手填 `PORT`（Render 注入；容器内应用读 `process.env.PORT`，本项目兼容默认 `3001` / 平台端口）。

### 5. 底部操作

1. （可选）展开 **Advanced**：可把 Health Check Path 设为 `/health`
2. 点 **Deploy web service**
3. 等 Build / Deploy 到 **Live**
4. 打开服务页上的 URL + `/health` 验证

### 6. 与现网地址对齐

当前生产 BFF：

```text
https://ai-chat-assistant-k7fb.onrender.com
https://ai-chat-assistant-k7fb.onrender.com/health
```

若新建服务得到了**新** URL，需要同步改：

1. 前端 `.env.production` 的 `VITE_BFF_URL`
2. 重新执行「每次发前端」
3. 文档 / README 里的 BFF 链接

**已有服务、只更新代码**：不要再点 New Web Service，直接在旧服务上 Manual Deploy / Auto-Deploy。

### Dockerfile 在做什么（便于面试）

根目录 `Dockerfile`：`node:22-alpine` → `npm install --omit=dev` → `CMD node server/index.js`。Render 选 Docker 时用这份文件构建镜像，无需再填 Build/Start Command。

本地联调线上 BFF：

```env
VITE_BFF_URL=https://ai-chat-assistant-k7fb.onrender.com
```

且 `CORS_ORIGIN` 含 `http://localhost:5173`。

---

## 二、前端补充说明（Cloudflare Pages）

### 项目对照（勿发错）

| Wrangler `--project-name` | 绑定域名 | 用途 |
|---------------------------|----------|------|
| **`ai-chat-assistant`** | https://ai-chat-assistant-1c5.pages.dev | **正式站** |
| `ai-chat-assistant-1c5` | https://ai-chat-assistant-1c5-eco.pages.dev | 另一项目，勿当正式站 |

### 预览部署（可选）

省略 `--branch=main` 或当前不在生产分支时，会得到：

- `https://<hash>.ai-chat-assistant-1c5.pages.dev`

仅适合验 UI。聊天需 BFF 已放行预览后缀；**日常 Demo 用正式站**。

### 备选：Dashboard 连 Git

| 项 | 值 |
|----|-----|
| Framework | Vite |
| Build | `npm run build` |
| Output | `dist` |
| Env | `VITE_BFF_URL=https://ai-chat-assistant-k7fb.onrender.com` |

仓库含 `public/_redirects`，保证 `/settings` 刷新不 404。

---

## 三、常见问题

| 现象 | 处理 |
|------|------|
| 正式站没更新 | `--project-name=ai-chat-assistant` + `--branch=main`；勿发到 `ai-chat-assistant-1c5` |
| 预览站 CORS / Failed to fetch | 用正式站，或把含后缀白名单的 BFF 重新 Deploy 到 Render |
| 400 + gpt 模型名 | 选 `deepseek-chat` |
| Render 第一次很慢 | Free 休眠，先访问 `/health` 唤醒 |
| 怎么「结束」部署 | 命令成功即结束；下线见下方 |

### 下线 / 删除（可选）

- **Pages**：Dashboard → Workers & Pages → 项目 `ai-chat-assistant` → Delete project  
- **Render**：Dashboard → 服务 → Settings → Delete Web Service（或 Suspend）

---

## 四、面试可讲一句

> 前端静态托管 Cloudflare Pages，BFF 在 Render；Key 只在服务端；CORS 白名单限制前端域名；因国内访问 Vercel 不稳定，公开 Demo 用 Pages。
