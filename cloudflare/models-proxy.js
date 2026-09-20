/**
 * Cloudflare Workers 反代：当部署环境（如 Vercel）访问不到源站时，请求经此中转到达源站。
 * 使用：把 config 的站点 apiUrl 改为本 Worker 的域名。
 *       apiKey 和 apiEndpoint 保持不变。仅放行 GET /v1/models，其余路径和方法返回 404。
 */
const UPSTREAM = "https://api.zhubaiwan.xyz";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // 精确放行模型列表接口，其余路径和方法一律 404
    if (url.pathname !== "/v1/models" || request.method !== "GET") {
      return new Response("Not Found", { status: 404 });
    }
    // 以真实域名请求上游，鉴权头原样透传
    return fetch(new URL(url.pathname + url.search, UPSTREAM), {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
    });
  },
};
