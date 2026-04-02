import type { ModelResponse } from "../types.ts";
import type { AppState } from "../state.ts";
import { GROUP_CONFIG } from "../config/groupConfig.ts";
import { getCachedModels, getCurrentSite, setCachedModels } from "../state.ts";

export function groupModels(models: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const model of models) {
    const modelLower = model.toLowerCase();
    let groupName = "default";

    // 按对象定义顺序匹配，先匹配到的分组优先
    for (const [name, config] of Object.entries(GROUP_CONFIG)) {
      if (name === "default") continue;

      if (config.keywords?.some((kw) => modelLower.includes(kw.toLowerCase()))) {
        groupName = name;
        break;
      }
    }

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(model);
  }

  return groups;
}

async function fetchModelsFromApi(
  state: AppState,
): Promise<{ models: string[] | null; error: string | null }> {
  const site = getCurrentSite(state);
  if (!site) {
    return { models: null, error: "没有可用的站点配置" };
  }

  try {
    const url = `${site.apiUrl.replace(/\/$/, "")}/${site.apiEndpoint.replace(/^\//, "")}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${site.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        models: null,
        error: `获取模型失败: ${response.status} ${response.statusText}`,
      };
    }

    const data: ModelResponse = await response.json();
    if (data?.data && Array.isArray(data.data)) {
      return { models: data.data.map((m) => m.id), error: null };
    }

    return { models: null, error: "API 响应格式不符合预期" };
  } catch (error) {
    return { models: null, error: (error as Error).message };
  }
}

export async function fetchModels(
  state: AppState,
  forceRefresh = false,
): Promise<{ models: string[] | null; error: string | null }> {
  if (!forceRefresh) {
    const cached = getCachedModels(state);
    if (cached) return { models: cached.models, error: cached.error };
  }

  const result = await fetchModelsFromApi(state);
  setCachedModels(state, result.models, result.error);
  return result;
}
