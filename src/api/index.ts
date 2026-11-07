import http from "node:http";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadAppConfig } from "../config/appConfig.ts";
import { buildGroupRules } from "../config/groupConfig.ts";
import type { AppConfig, GroupRule } from "../types.ts";
import { fetchModels } from "../services/models.ts";
import { renderPage } from "../ui/page.ts";
import { renderErrorPage } from "../ui/errorPage.ts";
import { ERROR_PAGE_TEXT } from "../ui/messages.ts";
import { resolveEnabledThemes, type ThemeDefinition, type ThemeId } from "../ui/themes.ts";

/** 浏览器缓存 1 小时：换图标最多 1 小时后生效；到期后靠 ETag 协商，未变时只回 304。 */
const FAVICON_CACHE_MAX_AGE_SECONDS = 3_600;
/** 主题选择 cookie：一年有效期，仅随本站请求发送。 */
const STYLE_COOKIE_MAX_AGE_SECONDS = 31_536_000;

function readStyleCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "style") return rest.join("=");
  }
  return undefined;
}

/** 主题选择链：URL 参数 > cookie > 启用主题列表的第一个。仅启用列表内的主题可选，URL 携带合法参数时下发 Set-Cookie。 */
function resolveStyleId(
  urlTheme: string | null,
  cookieTheme: string | undefined,
  enabled: readonly ThemeDefinition[],
): { styleId: ThemeId; setCookie: boolean } {
  const enabledIds = new Set(enabled.map((theme) => theme.id));
  if (urlTheme && enabledIds.has(urlTheme as ThemeId)) {
    return { styleId: urlTheme as ThemeId, setCookie: urlTheme !== cookieTheme };
  }
  const cookie = cookieTheme && enabledIds.has(cookieTheme as ThemeId) ? (cookieTheme as ThemeId) : undefined;
  return { styleId: cookie ?? enabled[0].id, setCookie: false };
}

interface RuntimeSnapshot {
  config: AppConfig;
  rules: GroupRule[];
}

let runtimePromise: Promise<RuntimeSnapshot> | null = null;
const faviconPath = fileURLToPath(new URL("../assets/favicon.svg", import.meta.url));
let faviconPromise: Promise<{ body: Buffer; etag: string }> | null = null;

/** 配置校验失败：错误信息只含站点名/分组名/order，不含 apiKey，可以直接展示在错误页。 */
class ConfigError extends Error {}

/** favicon 只读一次盘，并用内容哈希作为 ETag，改图标后可通过协商缓存立即生效。 */
function getFavicon(): Promise<{ body: Buffer; etag: string }> {
  faviconPromise ??= readFile(faviconPath).then((body) => ({
    body,
    etag: `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`,
  }));
  return faviconPromise;
}

function getRuntime(): Promise<RuntimeSnapshot> {
  if (!runtimePromise) {
    runtimePromise = loadAppConfig()
      .then((config) => ({ config, rules: buildGroupRules(config.customGroupRules) }))
      .catch((error: unknown) => {
        runtimePromise = null;
        throw new ConfigError(error instanceof Error ? error.message : ERROR_PAGE_TEXT.configErrorTitle);
      });
  }
  return runtimePromise;
}

function writeHead(res: http.ServerResponse, statusCode: number): void {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  // 页面不禁止 iframe 嵌套：NewAPI 等站点会把本页作为「首页内容」嵌入其主页
  // 页面会引用第三方图床图标，不向对方泄露本站地址
  res.setHeader("Referrer-Policy", "no-referrer");
  // 页面外观依赖 style cookie，无法在共享缓存中安全复用，因此统一不缓存。
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = statusCode;
}

function writeHtml(res: http.ServerResponse, statusCode: number, html: string): void {
  writeHead(res, statusCode);
  res.end(html);
}

function writeError(res: http.ServerResponse, statusCode: number, title: string, message: string): void {
  writeHtml(res, statusCode, renderErrorPage(title, message));
}

async function serveFavicon(req: http.IncomingMessage, res: http.ServerResponse, headOnly: boolean): Promise<void> {
  const { body, etag } = await getFavicon();
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", `public, max-age=${FAVICON_CACHE_MAX_AGE_SECONDS}`);
  if (req.headers["if-none-match"] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }
  res.statusCode = 200;
  if (headOnly) res.end();
  else res.end(body);
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    writeError(res, 405, ERROR_PAGE_TEXT.methodNotAllowedTitle, ERROR_PAGE_TEXT.methodNotAllowedMessage);
    return;
  }

  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const headOnly = req.method === "HEAD";

    if (url.pathname === "/favicon.svg") {
      await serveFavicon(req, res, headOnly);
      return;
    }
    if (url.pathname !== "/") {
      writeError(res, 404, ERROR_PAGE_TEXT.notFoundTitle, ERROR_PAGE_TEXT.notFoundMessage);
      return;
    }

    const runtime = await getRuntime();
    // 空值或纯空白视为未指定，回落到默认站点
    const requestedSite = url.searchParams.get("site")?.trim();
    const siteName = requestedSite || runtime.config.defaultSite;
    const site = runtime.config.sites.find((candidate) => candidate.name.toLowerCase() === siteName.toLowerCase());
    if (!site) {
      writeError(res, 404, ERROR_PAGE_TEXT.siteNotFoundTitle, ERROR_PAGE_TEXT.siteNotFoundMessage);
      return;
    }

    const { styleId, setCookie } = resolveStyleId(
      url.searchParams.get("theme"),
      readStyleCookie(req.headers.cookie),
      resolveEnabledThemes(runtime.config.themes),
    );
    if (setCookie) {
      res.setHeader("Set-Cookie", `style=${styleId}; Path=/; Max-Age=${STYLE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`);
    }

    const result = await fetchModels(site);
    const statusCode = result.errorType === "timeout" ? 504 : result.error ? 502 : 200;
    const html = renderPage(runtime.config, site, result.models, result.error, runtime.rules, styleId);
    if (headOnly) {
      writeHead(res, statusCode);
      res.end();
    } else {
      writeHtml(res, statusCode, html);
    }
  } catch (error) {
    console.error("请求处理失败:", error);
    if (res.writableEnded) return;
    if (error instanceof ConfigError) {
      // 配置错误是启动期问题，直接把具体原因展示到页面，避免用户只能看终端
      writeError(res, 500, ERROR_PAGE_TEXT.configErrorTitle, `${error.message}。${ERROR_PAGE_TEXT.configErrorHint}`);
      return;
    }
    writeError(res, 500, ERROR_PAGE_TEXT.serverErrorTitle, ERROR_PAGE_TEXT.serverErrorMessage);
  }
}

export default handleRequest;

if (!process.env.VERCEL && !process.env.TEST_SERVER) {
  const port = Number(process.env.PORT) || 3000;
  http.createServer(handleRequest).listen(port, () => {
    console.log(`\n  ▲ Model Gallery 开发服务器已启动`);
    console.log(`  ➜  本地访问: http://localhost:${port}\n`);
  });
  // 提前加载配置：有错误立刻打到终端，而不是等第一次请求
  void getRuntime().catch((error: Error) => console.error("配置加载失败:", error.message));
}
