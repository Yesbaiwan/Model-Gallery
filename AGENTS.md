# Model Gallery

从 OpenAI 兼容接口拉取模型 ID，按关键词分组，用服务端渲染输出可切换主题的模型展示页。支持多站点、三套皮肤（经典 / 档案 / 手绘）与明暗模式，零构建、无运行时依赖。对接的是 NewAPI / OneAPI / DoneHub 这类模型站，不是 iTunes。

## 功能与位置

| 功能 | 位置 | 说明 |
| --- | --- | --- |
| 请求入口 | `src/api/index.ts` | 唯一入口，本地 Node 与 Vercel 共用；`/`、`/favicon.svg`，其余 404 |
| 配置加载 | `src/config/appConfig.ts` | `CONFIG_JSON` 优先，否则 `config.json`；校验后应用默认值 |
| 内置分组 | `src/config/builtinGroups.ts` | 纯数据：组名、order、图标、关键词 |
| 规则合并与匹配 | `src/config/groupConfig.ts` | 合并内置/自定义规则，按 order 排序，模型归组 |
| 上游获取 | `src/services/models.ts` | 拼接 `apiUrl` + `apiEndpoint`，超时、重试、大小限制与错误分类 |
| 页面与组件 | `src/ui/` | `page.ts` 组装页面，`components.ts` 组件，`errorPage.ts` 错误页，`escape.ts` 转义 |
| 主题 | `src/ui/themes.ts` + `src/assets/` | 主题注册表决定启用的皮肤与内联的 CSS/JS |
| 文案 | `src/ui/messages.ts` | 所有用户可见字符串的唯一来源 |
| 反代 | `cloudflare/models-proxy.js` | 源站被墙时中转 `/v1/models` |
| 测试 | `src/test/` | Node 测试套件，全部 mock `fetch` |

## 命令

`npm install`、`npm run dev`（端口 3000，`PORT` 可覆盖）、`npm run typecheck`、`npm test`、`npm run format` / `format:check`。

## 必须保持的约定

- **请求边界**：只有 `src/api/index.ts` 处理 HTTP；配置、上游、分组、渲染各自分层。页面统一 `Cache-Control: no-store`（外观依赖 cookie，共享缓存会串皮），favicon 单独走 `max-age` + 内容哈希 `ETag`/`304`。
- **配置与安全**：`apiUrl` 必须 https（本机 localhost 例外），不允许 query/hash；新增配置项时同步 URL 校验。`apiKey` 不得出现在页面、错误文案或日志。配置错误经 `ConfigError` 展示具体原因，错误页统一 `renderErrorPage`。
- **分组语义**：模型 ID 转小写，按 order 升序比对关键词，**关键词在词首出现即命中**（`ling` 不命中 `kling`，`wan` 命中 `wanx2.1`；中文不受位置限制），首个命中生效，未命中进 `default`。order 必填、全局唯一；内置组一律 100 的整数倍（100…3300），`default` 固定 9000，其它分组必须小于它。托管商组（Groq 600、Nvidia 700）靠 order 排在品牌组前，因此 `nvidia/llama-*` 归托管商。
- **不要重新引入**：`position`/`before`/拓扑排序/前缀优先。顺序只由 order 表达；同一模型多处命中时，谁 order 小谁先中。
- **关键词**：优先品牌全词或带连字符的写法（`phi-`、`seed-`、`spark-`、`yi-`、`step-`）。泛词（`meta`、`sonar`、`command`、`dots`）真实 ID 必须靠它命中，不收窄；误判交给用户覆盖内置组。
- **UI**：所有文案进 `src/ui/messages.ts`，动态内容必须转义。交互用原生 `<button>` + `aria-*`，保持 `app.js` 依赖的 `data-action`/`data-role` 契约（`toggle-mode`、`toggle-style-selector`、`toggle-group`）。资产内联顺序为 base → 主题皮肤 → 动效层，不要打乱。
- **术语**：「主题」= 皮肤层（cookie `style`、DOM `data-style`）；「明暗」= 亮色/暗色（DOM `data-theme`、`light-dark()`）。两者独立，不得混用。
- **测试**：全部 mock `globalThis.fetch`，不得新增真实网络请求。

## 部署

本地用 `config.json`（含密钥，已 ignore）；Vercel 用 `CONFIG_JSON`。`vercel.json` 将全部路径路由到入口函数，`includeFiles` 只打包 `src/assets/**`。资产与 favicon 通过 `import.meta.url` 读盘，**部署后需实测一次**；本地无法验证 Vercel 的打包路径。

## 已评估、暂不做

- 模型数量上限：真实使用遇不到，硬加会引入截断语义。
- 页面标题带站点名：产品决策，未定。
- 为退役/小众模型（`babbage`、`davinci`、`abab`、Amazon、AI21 等）加内置关键词：交给用户自定义组。
- 明暗“跟随系统”与 `theme` cookie 改名：低概率/产品取舍。
