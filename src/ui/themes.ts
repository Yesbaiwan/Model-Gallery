// 主题注册表：「主题」= 皮肤层（经典/档案/手绘），由配置 themes 数组启用、DOM data-style 标记。
// 注意区分明暗模式（亮色/暗色，DOM data-theme 属性 + light-dark()），与本注册表无关。
// 新增主题只需在此追加条目并在 messages.ts 补显示名，
// 然后在 src/assets/themes/ 下放置对应的皮肤与动效 CSS 文件。
import { UI_TEXT } from "./messages.ts";

export interface ThemeDefinition {
  id: ThemeId;
  /** src/assets/ 下相对路径的主题文件（皮肤 + 动效一体，每主题单文件） */
  cssFile: string;
  /** 可选的共享动效文件；主题自带动效时留空 */
  motionFile?: string;
  /** Google Fonts 样式表地址；空字符串表示使用系统字体栈，不注入字体链接 */
  fontHref: string;
  /** 切换明暗时是否启用 View Transitions 全页交叉淡入；关闭则立即生效 */
  themeTransition: boolean;
  /** 是否渲染模型卡右上角的复制箭头标记（copied 状态样式的具体呈现由各主题 CSS 自行定义） */
  copyIcon: boolean;
}

export type ThemeId = "classic" | "archive" | "handdrawn";

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "classic",
    cssFile: "themes/classic.css",
    fontHref: "",
    themeTransition: false,
    copyIcon: true,
  },
  {
    id: "archive",
    cssFile: "themes/archive.css",
    motionFile: "motion.css",
    fontHref: "",
    themeTransition: true,
    copyIcon: false,
  },
  {
    id: "handdrawn",
    cssFile: "themes/handdrawn.css",
    motionFile: "motion.css",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&family=Long+Cang&family=Zhi+Mang+Xing&display=swap",
    themeTransition: true,
    copyIcon: false,
  },
];

export const DEFAULT_THEME_ID: ThemeId = "classic";

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id)!;
}

/** 解析启用主题：未配置或为空时启用注册表全部主题；已配置时按配置顺序返回（第一个即默认主题） */
export function resolveEnabledThemes(rawIds?: readonly ThemeId[]): readonly ThemeDefinition[] {
  if (!rawIds || rawIds.length === 0) return THEMES;
  return rawIds.map(getTheme);
}

/** 主题的用户可见显示名（文案集中在 messages.ts）。 */
export function themeName(id: ThemeId): string {
  return UI_TEXT.styleNames[id];
}
