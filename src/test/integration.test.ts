import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { Server } from "node:http";

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_TEST_SERVER = process.env.TEST_SERVER;
const ORIGINAL_CONFIG_JSON = process.env.CONFIG_JSON;

const TEST_CONFIG = {
  sites: [
    {
      name: "测试站点A",
      apiUrl: "https://api.example.com",
      apiKey: "sk-test-key-a",
      apiEndpoint: "/v1/models",
      externalUrl: "https://a.example.com",
      iconUrl: "https://a.example.com/icon.png",
    },
    {
      name: "测试站点B",
      apiUrl: "https://api.b.example.com",
      apiKey: "sk-test-key-b",
      apiEndpoint: "/v1/models",
      externalUrl: "https://b.example.com",
      iconUrl: "https://b.example.com/icon.png",
    },
  ],
  defaultSite: "测试站点A",
  themes: ["classic", "handdrawn"],
};

describe("集成测试：启动服务器后检测", () => {
  let server: Server;
  let baseUrl: string;
  let handleRequest: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
  let upstreamCalls = 0;

  before(async () => {
    process.env.TEST_SERVER = "1";
    process.env.CONFIG_JSON = JSON.stringify(TEST_CONFIG);

    globalThis.fetch = async (input, init) => {
      upstreamCalls += 1;
      const requestUrl = String(input);
      const headers = init?.headers as Record<string, string>;
      const siteB = requestUrl.startsWith("https://api.b.example.com");
      assert.equal(headers.Authorization, siteB ? "Bearer sk-test-key-b" : "Bearer sk-test-key-a");
      return new Response(JSON.stringify({ data: [{ id: siteB ? "gemini-pro" : "gpt-4" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const module = await import("../api/index.ts");
    handleRequest = module.default;

    server = http.createServer((req, res) => {
      void handleRequest(req, res);
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (address && typeof address === "object") {
      baseUrl = `http://127.0.0.1:${address.port}`;
    } else {
      throw new Error("无法获取服务器地址");
    }
  });

  after(async () => {
    globalThis.fetch = ORIGINAL_FETCH;
    if (ORIGINAL_TEST_SERVER === undefined) delete process.env.TEST_SERVER;
    else process.env.TEST_SERVER = ORIGINAL_TEST_SERVER;
    if (ORIGINAL_CONFIG_JSON === undefined) delete process.env.CONFIG_JSON;
    else process.env.CONFIG_JSON = ORIGINAL_CONFIG_JSON;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function fetchText(
    path: string,
    headers: Record<string, string> = {},
    method = "GET",
  ): Promise<{
    status: number;
    text: string;
    contentType: string | null;
    cacheControl: string | null;
    vary: string | null;
    etag: string | null;
    referrerPolicy: string | null;
    xFrameOptions: string | null;
    setCookie: string[];
  }> {
    return new Promise((resolve, reject) => {
      const req = http.request(`${baseUrl}${path}`, { headers, method }, (res) => {
        let data = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            text: data,
            contentType: res.headers["content-type"] || null,
            cacheControl: res.headers["cache-control"] || null,
            vary: res.headers.vary || null,
            etag: res.headers.etag || null,
            referrerPolicy: res.headers["referrer-policy"]?.toString() ?? null,
            xFrameOptions: res.headers["x-frame-options"]?.toString() ?? null,
            setCookie: res.headers["set-cookie"] ?? [],
          });
        });
      });
      req.on("error", reject);
      req.end();
    });
  }

  test("主页返回 200，包含标题、默认站点和模型，且不泄露 API Key", async () => {
    const { status, text } = await fetchText("/");

    assert.equal(status, 200);
    assert.ok(text.includes("Model Gallery"));
    assert.ok(text.includes("测试站点A"));
    assert.ok(text.includes("gpt-4"));
    assert.ok(!text.includes("sk-test-key-a"));
    assert.ok(!text.includes("sk-test-key-b"));
  });

  test("页面统一不缓存，避免 Cookie 分片导致的串皮", async () => {
    const home = await fetchText("/");
    assert.equal(home.cacheControl, "no-store");
    assert.equal(home.vary, null, "不应再下发 Vary: Cookie");
    assert.equal(home.xFrameOptions, "DENY", "页面不应允许被 iframe 嵌套");

    const notFound = await fetchText("/unknown-path");
    assert.equal(notFound.status, 404);
    assert.equal(notFound.cacheControl, "no-store", "错误页不应被缓存");
  });

  test("空 site 参数回落到默认站点", async () => {
    const empty = await fetchText("/?site=");
    assert.equal(empty.status, 200);
    assert.ok(empty.text.includes("gpt-4"), "应渲染默认站点的模型");
  });

  test("站点名大小写不敏感，不存在的站点返回 404", async () => {
    const lowerCase = await fetchText(`/?site=${encodeURIComponent("测试站点a")}`);
    assert.equal(lowerCase.status, 200, "站点名大小写不影响匹配");
    assert.ok(lowerCase.text.includes("gpt-4"), "应渲染站点 A 的模型");

    const unknown = await fetchText(`/?site=${encodeURIComponent("不存在的站点")}`);
    assert.equal(unknown.status, 404, "拼错的站点名应返回 404");
    assert.ok(unknown.text.includes("站点不存在"), "应提示站点不存在而非渲染默认站点");
    assert.ok(!unknown.text.includes("gpt-4"), "不应回落到默认站点的模型");
  });

  test("刷新链接指向当前站点", async () => {
    const home = await fetchText("/");
    const encoded = encodeURIComponent("测试站点A");
    assert.ok(home.text.includes(`href="/?site=${encoded}"`), "刷新链接应保留当前站点");

    const before = upstreamCalls;
    const refreshed = await fetchText(`/?site=${encoded}`);
    assert.equal(refreshed.status, 200);
    assert.ok(upstreamCalls > before, "页面不缓存，重新请求会再次访问上游");
  });

  test("favicon 返回 200、内容类型为 SVG，并支持 ETag 协商缓存", async () => {
    const first = await fetchText("/favicon.svg");

    assert.equal(first.status, 200);
    assert.ok(first.contentType?.includes("image/svg+xml"));
    assert.ok(first.text.includes("<svg"));
    assert.ok(first.etag, "应下发 ETag");

    const revalidated = await fetchText("/favicon.svg", { "If-None-Match": first.etag! });
    assert.equal(revalidated.status, 304);
  });

  test("HEAD 请求返回同样的头部且不带响应体", async () => {
    const page = await fetchText("/", {}, "HEAD");
    assert.equal(page.status, 200);
    assert.equal(page.text, "");
    assert.equal(page.cacheControl, "no-store");

    const favicon = await fetchText("/favicon.svg", {}, "HEAD");
    assert.equal(favicon.status, 200);
    assert.equal(favicon.text, "");
    assert.ok(favicon.etag, "HEAD 也应带 ETag");
  });

  test("站点切换返回 200 并显示目标站点", async () => {
    const { status, text } = await fetchText(`/?site=${encodeURIComponent("测试站点B")}`);

    assert.equal(status, 200);
    assert.ok(text.includes("gemini-pro"));
    assert.ok(!text.includes("sk-test-key-b"));
  });

  test("未知路径返回 404", async () => {
    const { status, text } = await fetchText("/unknown-path");

    assert.equal(status, 404);
    assert.ok(text.includes("页面不存在"));
  });

  test("URL theme 参数切换主题并下发 Set-Cookie", async () => {
    const themed = await fetchText("/?theme=classic");
    assert.equal(themed.status, 200);
    assert.ok(themed.text.includes('data-style="classic"'), "应渲染 classic 主题");
    assert.ok(
      themed.setCookie.some((cookie) => cookie.startsWith("style=classic;")),
      "应下发 style cookie",
    );

    const styled = await fetchText("/", { Cookie: "style=handdrawn" });
    assert.ok(styled.text.includes('data-style="handdrawn"'), "cookie 应生效于无参数请求");
    assert.equal(styled.setCookie.length, 0, "cookie 回访不应重复下发 Set-Cookie");
  });

  test("themes 之外的主题被拒绝并回退默认主题", async () => {
    const { text, setCookie } = await fetchText("/", { Cookie: "style=archive" });
    assert.ok(text.includes('data-style="classic"'), "未启用的 cookie 主题应回退默认主题 classic");
    assert.equal(setCookie.length, 0, "回退不应下发 Set-Cookie");

    const viaUrl = await fetchText("/?theme=archive");
    assert.ok(viaUrl.text.includes('data-style="classic"'), "未启用的 URL 主题应回退默认主题 classic");

    const unthemed = await fetchText("/");
    assert.ok(unthemed.text.includes('data-style="classic"'), "无 cookie 时使用启用列表第一个主题");
    const themeHref = `href="/?site=${encodeURIComponent("测试站点A")}&amp;theme=handdrawn"`;
    assert.ok(unthemed.text.includes(themeHref), "切换下拉只列启用主题");
    assert.ok(!unthemed.text.includes("theme=archive"), "未启用主题不应出现在下拉中");
  });

  test("启用列表内的 theme 参数正常切换", async () => {
    const { text } = await fetchText("/?theme=handdrawn");
    assert.ok(text.includes('data-style="handdrawn"'), "启用列表内的主题可通过 URL 切换");
  });

  test("在非默认站点切换主题后仍停留该站点", async () => {
    const siteB = encodeURIComponent("测试站点B");
    const { text } = await fetchText(`/?site=${siteB}&theme=classic`);
    assert.ok(text.includes("gemini-pro"), "应渲染站点 B 的模型");
    assert.ok(text.includes(`href="/?site=${siteB}&amp;theme=handdrawn"`), "主题切换链接应保留站点参数");
  });

  test("HTML 响应附带 no-referrer 参考策略", async () => {
    const { referrerPolicy } = await fetchText("/");
    assert.equal(referrerPolicy, "no-referrer");
  });

  test("非法 theme 参数回退默认主题且不下发 cookie", async () => {
    const { status, text, setCookie } = await fetchText("/?theme=not-a-theme");

    assert.equal(status, 200);
    assert.ok(text.includes(`data-style="classic"`), "非法参数应回退内置默认主题");
    assert.equal(setCookie.length, 0, "非法参数不应下发 Set-Cookie");
  });
});
