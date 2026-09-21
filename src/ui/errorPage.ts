import { escapeHtml } from "./escape.ts";

/** 面向 4xx/5xx 的最小错误页，与主页面保持一致的品牌观感（独立于主题样式层，避免页面过重）。 */
export function renderErrorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: light-dark(#f5f5f7, #0d0d0d);
      color: light-dark(#1d1d1f, #f5f5f7);
    }
    .card {
      max-width: 420px;
      padding: 2.5rem 2rem;
      text-align: center;
      border-radius: 20px;
      background: light-dark(rgba(255, 255, 255, 0.7), rgba(44, 44, 46, 0.7));
      border: 1px solid light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
      box-shadow: 0 4px 24px light-dark(rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.2));
    }
    h1 { margin: 0 0 0.5rem; font-size: 20px; }
    p { margin: 0; font-size: 14px; color: light-dark(#86868b, #98989d); overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}
