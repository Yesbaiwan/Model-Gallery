import type { ModelResponse, SiteConfig } from "../types.ts";

const MODEL_FETCH_TIMEOUT_MS = 3_000;
const MAX_MODEL_ID_LENGTH = 200;
const MAX_RESPONSE_BYTES = 1_000_000;

export type FetchErrorType = "http" | "size" | "parse" | "format" | "timeout" | "redirect" | "network";

export interface FetchModelsResult {
  models: string[] | null;
  error: string | null;
  /** 结构化错误分类，调用方据此决定状态码等，避免依赖错误文案匹配。 */
  errorType: FetchErrorType | null;
}

const failure = (error: string, errorType: FetchErrorType): FetchModelsResult => ({ models: null, error, errorType });

/** 请求失败时自动重试的次数。 */
const FETCH_ATTEMPTS = 2;

/** 值得重试的瞬态错误：超时与网络失败。其余错误（密钥无效、响应格式等）重试也不会改变结果。 */
const RETRYABLE_ERRORS: readonly FetchErrorType[] = ["timeout", "network"];

export async function fetchModels(
  site: SiteConfig,
  timeoutMs = MODEL_FETCH_TIMEOUT_MS,
  attempts = FETCH_ATTEMPTS,
): Promise<FetchModelsResult> {
  let result: FetchModelsResult = failure("模型接口请求失败，请稍后重试", "network");
  for (let attempt = 0; attempt < attempts; attempt++) {
    result = await fetchModelsOnce(site, timeoutMs);
    if (!result.errorType || !RETRYABLE_ERRORS.includes(result.errorType)) return result;
  }
  return result;
}

async function fetchModelsOnce(site: SiteConfig, timeoutMs: number): Promise<FetchModelsResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = joinApiUrl(site.apiUrl, site.apiEndpoint);

  try {
    // 手动模式：不跟随重定向，3xx 由本函数判定为错误，避免依赖运行时错误文案。
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${site.apiKey}`, "Content-Type": "application/json" },
    });

    if (response.status >= 300 && response.status < 400) return failure("模型接口禁止重定向", "redirect");
    if (!response.ok) return failure(`获取模型失败: ${response.status} ${response.statusText}`, "http");

    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) return failure("模型接口响应过大", "size");

    const text = await readBodyWithLimit(response, MAX_RESPONSE_BYTES);
    if (text === null) return failure("模型接口响应过大", "size");

    let data: ModelResponse;
    try {
      data = JSON.parse(text) as ModelResponse;
    } catch {
      return failure("API 响应不是有效 JSON", "parse");
    }
    if (!Array.isArray(data.data)) return failure("API 响应格式不符合预期", "format");

    const models = [
      ...new Set(
        data.data
          .map((model) =>
            typeof model === "object" && model !== null && typeof (model as { id?: unknown }).id === "string"
              ? (model as { id: string }).id.trim()
              : "",
          )
          .filter((id) => id.length > 0 && id.length <= MAX_MODEL_ID_LENGTH),
      ),
    ];
    return { models, error: null, errorType: null };
  } catch (error) {
    if ((error as Error).name === "AbortError" || (error as Error).name === "TimeoutError")
      return failure("获取模型超时，请稍后重试", "timeout");
    return failure("模型接口请求失败，请稍后重试", "network");
  } finally {
    clearTimeout(timeout);
  }
}

/** apiEndpoint 追加在 apiUrl 之后：两端多余斜线不会产生空段，apiUrl 的子路径得以保留。 */
export function joinApiUrl(apiUrl: string, apiEndpoint: string): string {
  return `${apiUrl.replace(/\/+$/, "")}/${apiEndpoint.replace(/^\/+/, "")}`;
}

/** 边读边累计字节数，超过上限立即取消流并返回 null，避免把超大响应整段读进内存。 */
async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string | null> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}
