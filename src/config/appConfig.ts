import type { AppConfig } from "../types.ts";

const DEFAULT_SITE_CONFIG = {
  apiEndpoint: "/v1/models",
  externalUrl: "https://github.com/ZhuBaiwan-oOZZXX/Model-Gallery",
  iconUrl: "https://docs.newapi.pro/assets/logo.png",
};

function validateConfig(config: AppConfig): void {
  if (!config.sites || config.sites.length === 0) {
    throw new Error("配置错误: sites 为空，请检查 config.json 或 CONFIG_JSON 环境变量");
  }

  for (const site of config.sites) {
    if (!site.name) {
      throw new Error("配置错误: 站点缺少 name 字段");
    }
    if (!site.apiUrl) {
      throw new Error(`配置错误: 站点 "${site.name}" 缺少 apiUrl 字段`);
    }
    if (!site.apiKey) {
      throw new Error(`配置错误: 站点 "${site.name}" 缺少 apiKey 字段`);
    }
  }

  if (config.defaultSite) {
    if (!config.sites.some((s) => s.name === config.defaultSite)) {
      throw new Error(
        `配置错误: defaultSite "${config.defaultSite}" 不在 sites 列表中`,
      );
    }
  }
}

async function loadConfig(): Promise<AppConfig> {
  const configFromEnv = Deno.env.get("CONFIG_JSON");
  if (configFromEnv) {
    try {
      return JSON.parse(configFromEnv);
    } catch {
      throw new Error("CONFIG_JSON 环境变量解析失败，请检查 JSON 格式");
    }
  }

  try {
    const configText = await Deno.readTextFile("./config.json");
    return JSON.parse(configText);
  } catch {
    throw new Error("未找到 config.json 文件，请创建配置文件或设置 CONFIG_JSON 环境变量");
  }
}

function normalizeConfig(config: AppConfig): AppConfig {
  const sites = config.sites.map((site) => ({
    ...DEFAULT_SITE_CONFIG,
    ...site,
    apiEndpoint: site.apiEndpoint || DEFAULT_SITE_CONFIG.apiEndpoint,
    externalUrl: site.externalUrl || DEFAULT_SITE_CONFIG.externalUrl,
    iconUrl: site.iconUrl || DEFAULT_SITE_CONFIG.iconUrl,
  }));

  const defaultSite = config.defaultSite && sites.find((s) => s.name === config.defaultSite)
    ? config.defaultSite
    : (sites[0]?.name ?? "");

  return { sites, defaultSite };
}

export async function loadAppConfig(): Promise<AppConfig> {
  const config = await loadConfig();
  validateConfig(config);
  return normalizeConfig(config);
}
