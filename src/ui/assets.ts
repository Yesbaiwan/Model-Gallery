import { readFileSync } from "node:fs";
import { getTheme, type ThemeId } from "./themes.ts";

// 零构建：CSS/JS 以真实文件存放在 src/assets/，内联进 HTML。
// 与 favicon 的读取方式一致，Vercel 侧由 vercel.json 的 includeFiles: "src/**" 保证文件随函数打包。

/** 开发模式：本地直跑（非 Vercel、非测试服务器），资产每次读取以支持改文件后直接刷新。 */
const IS_DEV = !process.env.VERCEL && !process.env.TEST_SERVER;

function readAsset(name: string): string {
  return readFileSync(new URL(`../assets/${name}`, import.meta.url), "utf-8");
}

const cssCache = new Map<ThemeId, string>();
let jsCache: string | null = null;

/** 页面内联样式：基础结构层 + 所选主题皮肤 + 主题动效层，按此顺序合并以保证后续规则可覆盖前者。 */
export function cssStyles(themeId: ThemeId): string {
  const theme = getTheme(themeId);
  const compose = () =>
    [readAsset("base.css"), readAsset(theme.cssFile), theme.motionFile ? readAsset(theme.motionFile) : ""]
      .filter(Boolean)
      .join("\n");
  if (IS_DEV) return compose();
  let cached = cssCache.get(themeId);
  if (!cached) {
    cached = compose();
    cssCache.set(themeId, cached);
  }
  return cached;
}

/** 页面内联脚本（body 末尾执行）。 */
export function jsScripts(): string {
  if (IS_DEV) return readAsset("app.js");
  return (jsCache ??= readAsset("app.js"));
}

/** <head> 内联的明暗模式初始化脚本：首屏渲染前恢复已保存的亮暗选择，避免暗色用户闪烁。
 *  localStorage 键 "theme" 与 app.js 的 THEME_KEY 保持一致（历史命名，存的是明暗值 light/dark）。 */
export const COLOR_MODE_INIT_SCRIPT = `
  (() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
    } catch { /* storage 不可用 */ }
  })();
`;
