# Model Gallery 工作区说明

## 项目

- 小型 TypeScript/Node.js SSR 应用：从 OpenAI 兼容接口获取模型 ID，渲染为按关键词分组、主题自适应的 HTML 展示页。
- 主要模块：`src/api/`（HTTP/Vercel 入口）、`src/config/`（配置校验/默认值与分组规则）、`src/services/`（上游模型获取与分组）、`src/ui/`（HTML 组件、转义、样式与浏览器脚本）、`src/test/`（单元/集成/安全回归测试）、`cloudflare/`（Cloudflare Workers 反代脚本）。

## 命令

- `npm install` — 安装依赖（Node.js 24.x 或更新）。
- `npm run dev` — 启动本地服务器，端口 3000（可用 `PORT` 覆盖）。
- `npm run typecheck` — 严格模式 TypeScript 检查，无产物输出。
- `npm test` — 运行 Node 测试套件。
- `npm run format` — 用 Prettier 格式化 TS/JS/CSS 与根目录 JSON 文件。
- `npm run format:check` — 仅校验格式，不改动文件。

## 架构与修改规则

- 请求边界保持在 `src/api/index.ts`；配置、上游获取、分组与渲染归属各自分层，不得混入 handler。
- `src/api/index.ts` 同时是本地 Node HTTP 入口和 Vercel serverless 入口（`vercel.json`）。保留其默认 handler 导出，以及阻止在 Vercel/测试环境下启动本地监听的守卫逻辑。
- 使用显式 `.ts` 导入扩展名；代码为 ESM，启用严格 TypeScript。
- `loadAppConfig()` 优先读取 `CONFIG_JSON`，否则读取 `config.json`，校验必填的站点/URL/分组规则并应用默认值。严禁在 HTML 或用户可见的错误/日志中暴露 `apiKey`。
- 新增任何用户可控或配置的值时，保持 URL 校验与 HTML 转义逻辑完整。上游请求必须保留超时中止和经过净化的错误信息。
- 分组匹配为大小写不敏感的子串匹配，按规则顺序执行；首个命中的规则生效，未匹配的模型归入 `default`。调整内置/自定义规则顺序时需同步更新分组测试。
- 术语约定：「主题」= 皮肤层（经典/档案/手绘，配置 `themes` 数组、cookie `style`、DOM `data-style`）；「明暗」= 亮色/暗色模式（DOM `data-theme` 属性 + CSS `light-dark()`/`color-scheme`）。两者独立互不干扰，代码与文案不得混用。
- UI 为服务端渲染 HTML，手写样式与脚本（`src/assets/base.css`、`src/assets/themes/*.css`、`src/assets/motion.css`、`src/assets/app.js`）经 `src/ui/assets.ts` 内联进页面（加载顺序 base → 主题皮肤 → 动效层，动效规则依赖该顺序覆盖基础规则）；没有 Tailwind CDN，也没有构建步骤。保持零构建的资产管线，动态内容一律通过 UI 辅助函数转义。交互元素使用原生 `<button>` 配合 `aria-*` 状态；保持 `src/assets/app.js` 依赖的 `data-action`/`data-role` 事件委托契约（明暗按钮 `toggle-mode`、主题选择器 `toggle-style-selector`）。
- 所有用户可见文案放在 `src/ui/messages.ts`；不得在组件或请求 handler 中硬编码新字符串。`fetchModels` 的错误携带结构化 `errorType`，应基于它判断，而不是匹配错误消息文本。

## 配置与部署

- 本地配置为 `config.json`（参考 `config.example.json`）；其中含密钥，已被 git 忽略。Vercel 使用 `CONFIG_JSON` 环境变量，且优先级更高。
- `vercel.json` 将所有路径（含 `/favicon.svg`）路由到 `src/api/index.ts`；保持与部署环境兼容的 Node 行为，避免在 serverless bundle 中不成立的文件系统假设。`src/assets/` 下的资产在模块加载时读取并内联，与 `includeFiles: "src/**"` 覆盖的 favicon 模式一致。
- 成功的 HTML 响应设置 `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`；4xx/5xx 页面使用 `no-store`。错误页统一走 `renderErrorPage`（`src/ui/errorPage.ts`）。
- 测试全部 mock `globalThis.fetch`；不得添加发起真实网络请求的测试。
