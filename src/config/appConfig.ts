import type { AppConfig } from "../types.ts";
import { BUILTIN_GROUP_NAMES } from "./groupConfig.ts";

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
      throw new Error(`配置错误: defaultSite "${config.defaultSite}" 不在 sites 列表中`);
    }
  }

  if (config.customGroupRules) {
    if (!Array.isArray(config.customGroupRules)) {
      throw new Error("配置错误: customGroupRules 必须是数组");
    }

    const seenNames = new Set<string>(BUILTIN_GROUP_NAMES);

    for (let i = 0; i < config.customGroupRules.length; i++) {
      const rule = config.customGroupRules[i];

      if (!rule.name) {
        throw new Error(`配置错误: customGroupRules[${i}] 缺少 name 字段`);
      }

      if (seenNames.has(rule.name)) {
        throw new Error(`配置错误: customGroupRules[${i}] ("${rule.name}") name 与内置分组或其他自定义分组重复`);
      }
      seenNames.add(rule.name);

      if (!rule.keywords || !Array.isArray(rule.keywords) || rule.keywords.length === 0) {
        throw new Error(`配置错误: customGroupRules[${i}] ("${rule.name}") 缺少 keywords 字段或 keywords 为空`);
      }

      if (rule.position) {
        if (!["first", "last", "before"].includes(rule.position.type)) {
          throw new Error(
            `配置错误: customGroupRules[${i}] ("${rule.name}") position.type 必须是 "first"、"last" 或 "before"`,
          );
        }
        if (rule.position.type === "before") {
          if (!rule.position.target) {
            throw new Error(`配置错误: customGroupRules[${i}] ("${rule.name}") position.type 为 "before" 时必须指定 target`);
          }
          const builtinLower = BUILTIN_GROUP_NAMES.map((n) => n.toLowerCase());
          if (!builtinLower.includes(rule.position.target.toLowerCase())) {
            throw new Error(
              `配置错误: customGroupRules[${i}] ("${rule.name}") position.target "${rule.position.target}" 不是有效的内置分组名称`,
            );
          }
        }
      }
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

  return { sites, defaultSite, customGroupRules: config.customGroupRules };
}

export async function loadAppConfig(): Promise<AppConfig> {
  const config = await loadConfig();
  validateConfig(config);
  return normalizeConfig(config);
}
