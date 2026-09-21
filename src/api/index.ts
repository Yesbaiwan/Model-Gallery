import http from "node:http";
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

/** 模型列表页面在边缘缓存的秒数与后台重新验证窗口。 */
const EDGE_CACHE_TTL_SECONDS = 60;
const EDGE_CACHE_STALE_WHILE_REVALIDATE_SECONDS = 300;
const FAVICON_CACHE_MAX_AGE_SECONDS = 86_400;
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

function getRuntime(): Promise<RuntimeSnapshot> {
  if (!runtimePromise) {
    runtimePromise = loadAppConfig()
      .then((config) => ({ config, rules: buildGroupRules(config.customGroupRules) }))
      .catch((error) => {
        runtimePromise = null;
        throw error;
      });
  }
  return runtimePromise;
}

function writeHead(res: http.ServerResponse, statusCode: number): void {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  // 模型列表页面按站点 URL 缓存 60 秒并在后台重新验证；错误页不缓存。
  res.setHeader(
    "Cache-Control",
    statusCode >= 400
      ? "no-store"
      : `public, s-maxage=${EDGE_CACHE_TTL_SECONDS}, stale-while-revalidate=${EDGE_CACHE_STALE_WHILE_REVALIDATE_SECONDS}`,
  );
  // 页面外观依赖 style cookie，边缘缓存必须按 Cookie 分片，避免串皮
  if (statusCode < 400) res.setHeader("Vary", "Cookie");
  res.statusCode = statusCode;
}

function writeHtml(res: http.ServerResponse, statusCode: number, html: string): void {
  writeHead(res, statusCode);
  res.end(html);
}

function writeError(res: http.ServerResponse, statusCode: number, title: string, message: string): void {
  writeHtml(res, statusCode, renderErrorPage(title, message));
}

async function serveFavicon(res: http.ServerResponse, headOnly: boolean): Promise<void> {
  const file = await readFile(faviconPath);
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", `public, max-age=${FAVICON_CACHE_MAX_AGE_SECONDS}`);
  res.statusCode = 200;
  if (headOnly) res.end();
  else res.end(file);
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
      await serveFavicon(res, headOnly);
      return;
    }
    if (url.pathname !== "/") {
      writeError(res, 404, ERROR_PAGE_TEXT.notFoundTitle, ERROR_PAGE_TEXT.notFoundMessage);
      return;
    }

    const runtime = await getRuntime();
    const requestedSite = url.searchParams.get("site");
    const siteName = requestedSite ?? runtime.config.defaultSite;
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
    if (!res.writableEnded) writeError(res, 500, ERROR_PAGE_TEXT.serverErrorTitle, ERROR_PAGE_TEXT.serverErrorMessage);
  }
}

export default handleRequest;

if (!process.env.VERCEL && !process.env.TEST_SERVER) {
  const port = Number(process.env.PORT) || 3000;
  http.createServer(handleRequest).listen(port, () => {
    console.log(`\n  ▲ Model Gallery 开发服务器已启动`);
    console.log(`  ➜  本地访问: http://localhost:${port}\n`);
  });
}
