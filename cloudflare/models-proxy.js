/**
 * Cloudflare Workers 反代：当部署环境（如 Vercel）访问不到源站时，请求经此中转到达源站。
 * 使用：把 config 的站点 apiUrl 改为本 Worker 的域名。
 *       apiKey 和 apiEndpoint 保持不变。仅放行 GET /v1/models，其余路径和方法返回 404。
 */
const UPSTREAM = "https://your-api-domain";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // 精确放行模型列表接口，其余路径和方法一律 404
    if (url.pathname !== "/v1/models" || request.method !== "GET") {
      return new Response("Not Found", { status: 404 });
    }
    // 只透传鉴权与期望的响应类型，避免把 cf-* 等边缘头带给上游
    return fetch(new URL(url.pathname + url.search, UPSTREAM), {
      method: request.method,
      headers: {
        Authorization: request.headers.get("Authorization") ?? "",
        Accept: "application/json",
      },
      redirect: "manual",
    });
  },
};
