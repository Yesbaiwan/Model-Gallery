import { readFileSync } from "node:fs";

// 零构建：CSS/JS 以真实文件存放在 src/assets/，内联进 HTML。
// 与 favicon 的读取方式一致，Vercel 侧由 vercel.json 的 includeFiles: "src/**" 保证文件随函数打包。

/** 开发模式：本地直跑（非 Vercel、非测试服务器），资产每次读取以支持改文件后直接刷新。 */
const IS_DEV = !process.env.VERCEL && !process.env.TEST_SERVER;

function readAsset(name: string): string {
  return readFileSync(new URL(`../assets/${name}`, import.meta.url), "utf-8");
}

let cssCache: string | null = null;
let jsCache: string | null = null;

/** 页面内联样式。 */
export function cssStyles(): string {
  if (IS_DEV) return readAsset("app.css");
  return (cssCache ??= readAsset("app.css"));
}

/** 页面内联脚本（body 末尾执行）。 */
export function jsScripts(): string {
  if (IS_DEV) return readAsset("app.js");
  return (jsCache ??= readAsset("app.js"));
}

/** <head> 内联的主题初始化脚本：首屏渲染前恢复已保存主题，避免暗色用户闪烁。localStorage 键与 app.js 的 THEME_KEY 保持一致。 */
export const THEME_INIT_SCRIPT = `
  (() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
    } catch { /* storage 不可用 */ }
  })();
`;
