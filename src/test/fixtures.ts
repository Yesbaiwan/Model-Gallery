import { buildGroupRules } from "../config/groupConfig.ts";
import type { AppConfig, SiteConfig } from "../types.ts";

/** 渲染测试共用的站点与配置夹具。 */

export const DEFAULT_RULES = buildGroupRules();

export const SECRET_KEY = "sk-SECRET-KEY-12345-UNIQUE";

export const TEST_SITE: SiteConfig = {
  name: "测试站点",
  apiUrl: "https://api.example.com",
  apiKey: SECRET_KEY,
  apiEndpoint: "/v1/models",
  externalUrl: "https://external.example.com",
  iconUrl: "https://icon.example.com/logo.png",
};

export const TEST_OTHER_SITE: SiteConfig = {
  name: "其他站点",
  apiUrl: "https://other.com",
  apiKey: "sk-other-key",
  apiEndpoint: "/v1/models",
  externalUrl: "https://other.example.com",
  iconUrl: "https://other.example.com/icon.png",
};

export const TEST_CONFIG: AppConfig = {
  sites: [TEST_SITE, TEST_OTHER_SITE],
  defaultSite: "测试站点",
};
