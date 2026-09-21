import type { ThemeId } from "./ui/themes.ts";

export interface GroupRule {
  name: string;
  icon: string;
  keywords?: string[];
}

export interface SiteConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  apiEndpoint: string;
  externalUrl: string;
  iconUrl: string;
}

export interface GroupPosition {
  type: "first" | "last" | "before";
  target?: string;
}

export interface CustomGroupRule {
  name: string;
  icon?: string;
  keywords: string[];
  position?: GroupPosition;
}

export interface AppConfig {
  sites: SiteConfig[];
  defaultSite: string;
  customGroupRules?: CustomGroupRule[];
  /**
   * 启用的主题 id 列表（经 isThemeId 校验且去重）。
   * 第一个为默认主题；未配置或为空时启用注册表全部主题。
   */
  themes?: ThemeId[];
}

export interface ModelResponse {
  data?: unknown;
}
