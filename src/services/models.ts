import type { ModelResponse, SiteConfig } from "../types.ts";

export const MODEL_FETCH_TIMEOUT_MS = 3_000;
export const MAX_MODELS = 500;
export const MAX_MODEL_ID_LENGTH = 200;
export const MAX_RESPONSE_BYTES = 1_000_000;

export type FetchErrorType = "http" | "size" | "parse" | "format" | "timeout" | "redirect" | "network";

export interface FetchModelsResult {
  models: string[] | null;
  error: string | null;
  /** 结构化错误分类，调用方据此决定状态码等，避免依赖错误文案匹配。 */
  errorType: FetchErrorType | null;
}

const failure = (error: string, errorType: FetchErrorType): FetchModelsResult => ({ models: null, error, errorType });

/** 请求失败时自动重试的次数。 */
export const FETCH_ATTEMPTS = 2;

export async function fetchModels(
  site: SiteConfig,
  timeoutMs = MODEL_FETCH_TIMEOUT_MS,
  attempts = FETCH_ATTEMPTS,
): Promise<FetchModelsResult> {
  let result: FetchModelsResult = failure("模型接口请求失败，请稍后重试", "network");
  for (let attempt = 0; attempt < attempts; attempt++) {
    result = await fetchModelsOnce(site, timeoutMs);
    if (!result.errorType) return result;
  }
  return result;
}

async function fetchModelsOnce(site: SiteConfig, timeoutMs: number): Promise<FetchModelsResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = new URL(site.apiEndpoint, site.apiUrl.endsWith("/") ? site.apiUrl : `${site.apiUrl}/`).toString();

  try {
    const response = await fetch(url, {
      redirect: "error",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${site.apiKey}`, "Content-Type": "application/json" },
    });

    if (!response.ok) return failure(`获取模型失败: ${response.status} ${response.statusText}`, "http");

    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) return failure("模型接口响应过大", "size");

    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) return failure("模型接口响应过大", "size");

    let data: ModelResponse;
    try {
      data = JSON.parse(text) as ModelResponse;
    } catch {
      return failure("API 响应不是有效 JSON", "parse");
    }
    if (!Array.isArray(data.data)) return failure("API 响应格式不符合预期", "format");
    if (data.data.length > MAX_MODELS) return failure("模型数量超过限制", "format");

    const models = data.data
      .map((model) =>
        typeof model === "object" && model !== null && typeof (model as { id?: unknown }).id === "string"
          ? (model as { id: string }).id.trim()
          : "",
      )
      .filter((id) => id.length > 0 && id.length <= MAX_MODEL_ID_LENGTH);
    return { models, error: null, errorType: null };
  } catch (error) {
    if ((error as Error).name === "AbortError" || (error as Error).name === "TimeoutError")
      return failure("获取模型超时，请稍后重试", "timeout");
    if ((error as Error).message === "redirected") return failure("模型接口禁止重定向", "redirect");
    return failure("模型接口请求失败，请稍后重试", "network");
  } finally {
    clearTimeout(timeout);
  }
}
