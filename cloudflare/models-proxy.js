/**
 * Cloudflare Workers 反代：当部署环境（如 Vercel）访问不到源站时，请求经此中转到达源站。
 * 使用：把 config 的站点 apiUrl 改为本 Worker 的域名。
 *       apiKey 和 apiEndpoint 保持不变，路径与查询参数原样透传（支持 apiUrl 子路径或自定义 apiEndpoint）。
 *       仅放行 GET，其余方法返回 404。
 */
const UPSTREAM = "https://your-api-domain";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // 只放行 GET，其余方法一律 404
    if (request.method !== "GET") {
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
