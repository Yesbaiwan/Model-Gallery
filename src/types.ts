import type { ThemeId } from "./ui/themes.ts";

export interface GroupRule {
  name: string;
  icon: string;
  keywords?: string[];
}

/** 内置分组：order 必须显式写在 src/config/builtinGroups.ts 里，不使用数组下标推算。 */
export interface BuiltinGroupRule extends GroupRule {
  order: number;
}

export interface CustomGroupRule {
  name: string;
  icon?: string;
  keywords: string[];
  /**
   * 分组排序序号，必填整数，数字越小越靠前。
   * 全局唯一：与其它内置组或自定义组的 order 重复时启动报错。
   * 覆盖内置组时填该内置组原本的 order 即可保持原位。
   */
  order: number;
}

export interface SiteConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  apiEndpoint: string;
  externalUrl: string;
  iconUrl: string;
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
