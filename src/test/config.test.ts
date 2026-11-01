import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadAppConfig } from "../config/appConfig.ts";
import { groupModels, buildGroupRules } from "../config/groupConfig.ts";
import { BUILTIN_GROUP_RULES, DEFAULT_ICON } from "../config/builtinGroups.ts";
import type { CustomGroupRule } from "../types.ts";

const ORIGINAL_ENV = process.env.CONFIG_JSON;
let tempDir: string | undefined;

function setEnv(config: unknown): void {
  process.env.CONFIG_JSON = JSON.stringify(config);
}

function clearEnv(): void {
  delete process.env.CONFIG_JSON;
}

async function writeConfigFixture(config: unknown): Promise<string> {
  tempDir ??= await mkdtemp(join(tmpdir(), "model-gallery-config-test-"));
  const filePath = join(tempDir, `config-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  await writeFile(filePath, JSON.stringify(config), "utf-8");
  return filePath;
}

describe("配置加载", () => {
  before(() => {
    delete process.env.CONFIG_JSON;
  });

  after(async () => {
    if (ORIGINAL_ENV) process.env.CONFIG_JSON = ORIGINAL_ENV;
    else delete process.env.CONFIG_JSON;
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  });

  test("环境变量 CONFIG_JSON 优先加载", async () => {
    setEnv({
      sites: [{ name: "环境站点", apiUrl: "https://env.com", apiKey: "sk-env" }],
      defaultSite: "环境站点",
    });
    const config = await loadAppConfig();
    assert.equal(config.sites[0].name, "环境站点");
    assert.equal(config.defaultSite, "环境站点");
  });

  test("无环境变量时从指定配置文件加载", async () => {
    clearEnv();
    const configPath = await writeConfigFixture({
      sites: [{ name: "文件站点", apiUrl: "https://file.com", apiKey: "sk-file" }],
    });
    const config = await loadAppConfig(configPath);
    assert.equal(config.sites[0].name, "文件站点");
    assert.equal(config.defaultSite, "文件站点");
  });

  test("CONFIG_JSON JSON 格式错误时抛错", async () => {
    process.env.CONFIG_JSON = "{invalid json";
    await assert.rejects(() => loadAppConfig(), /解析失败/);
  });
});

describe("配置默认值", () => {
  before(() => delete process.env.CONFIG_JSON);
  after(() => {
    if (ORIGINAL_ENV) process.env.CONFIG_JSON = ORIGINAL_ENV;
    else delete process.env.CONFIG_JSON;
  });

  test("站点可选字段填充默认值", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
    });
    const config = await loadAppConfig();
    assert.equal(config.sites[0].apiEndpoint, "/v1/models");
    assert.ok(config.sites[0].externalUrl, "externalUrl 应有默认值");
    assert.ok(config.sites[0].iconUrl, "iconUrl 应有默认值");
  });

  test("defaultSite 缺省时取第一个站点", async () => {
    setEnv({
      sites: [
        { name: "站点A", apiUrl: "https://a.com", apiKey: "sk-a" },
        { name: "站点B", apiUrl: "https://b.com", apiKey: "sk-b" },
      ],
    });
    const config = await loadAppConfig();
    assert.equal(config.defaultSite, "站点A");
  });

  test("站点自定义字段覆盖默认值", async () => {
    setEnv({
      sites: [
        {
          name: "测试",
          apiUrl: "https://api.com",
          apiKey: "sk-1",
          apiEndpoint: "/custom/endpoint",
          externalUrl: "https://custom.com",
          iconUrl: "https://custom.com/icon.png",
        },
      ],
    });
    const config = await loadAppConfig();
    assert.equal(config.sites[0].apiEndpoint, "/custom/endpoint");
    assert.equal(config.sites[0].externalUrl, "https://custom.com");
    assert.equal(config.sites[0].iconUrl, "https://custom.com/icon.png");
  });
});

describe("配置错误检测", () => {
  before(() => delete process.env.CONFIG_JSON);
  after(() => {
    if (ORIGINAL_ENV) process.env.CONFIG_JSON = ORIGINAL_ENV;
    else delete process.env.CONFIG_JSON;
  });

  test("sites 为空时抛错", async () => {
    setEnv({ sites: [] });
    await assert.rejects(() => loadAppConfig(), /sites 为空/);
  });

  test("站点必填字段缺失时逐项抛错", async () => {
    setEnv({ sites: [{ apiUrl: "https://api.com", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /name.*必须是非空字符串/);
    setEnv({ sites: [{ name: "测试", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /apiUrl.*必须是非空字符串/);
    setEnv({ sites: [{ name: "测试", apiUrl: "https://api.com" }] });
    await assert.rejects(() => loadAppConfig(), /apiKey.*必须是非空字符串/);
  });

  test("defaultSite 不在 sites 中时抛错", async () => {
    setEnv({
      sites: [{ name: "站点A", apiUrl: "https://a.com", apiKey: "sk-a" }],
      defaultSite: "不存在的站点",
    });
    await assert.rejects(() => loadAppConfig(), /不在 sites 列表中/);
  });

  test("externalUrl 使用非 http/https 协议时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1", externalUrl: "javascript:alert(1)" }],
    });
    await assert.rejects(() => loadAppConfig(), /externalUrl 必须是 http:\/\/ 或 https:\/\/ 协议/);
  });

  test("iconUrl 使用非 http/https 协议时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1", iconUrl: "data:image/svg+xml,<svg></svg>" }],
    });
    await assert.rejects(() => loadAppConfig(), /iconUrl 必须是 http:\/\/ 或 https:\/\/ 协议/);
  });

  test("customGroupRules name 与内置分组重复时允许覆盖", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "OpenAI", keywords: ["custom"], order: 100 }],
    });
    const config = await loadAppConfig();
    assert.equal(config.customGroupRules?.[0].name, "OpenAI");
  });

  test("覆盖内置分组未提供 icon 时沿用内置图标", () => {
    const rules = buildGroupRules([{ name: "deepseek", keywords: ["ds"], order: 1100 }]);
    const custom = rules.find((rule) => rule.name.toLowerCase() === "deepseek");
    const builtin = BUILTIN_GROUP_RULES.find((rule) => rule.name === "DeepSeek");
    assert.ok(custom && builtin);
    assert.equal(custom.icon, builtin.icon);
  });

  test("覆盖内置分组时显式 icon 优先于内置图标", () => {
    const rules = buildGroupRules([
      { name: "DeepSeek", keywords: ["ds"], icon: "https://example.com/ds.png", order: 1100 },
    ]);
    assert.equal(rules.find((rule) => rule.name === "DeepSeek")?.icon, "https://example.com/ds.png");
  });

  test("customGroupRules 缺 name 时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ keywords: ["a"], order: 0 }] as CustomGroupRule[],
    });
    await assert.rejects(() => loadAppConfig(), /name.*必须是非空字符串/);
  });

  test("keywords 缺失、空数组、空白或超长时抛错", async () => {
    for (const keywords of [undefined, [], [""], ["  "], ["valid", 1], ["x".repeat(81)]]) {
      setEnv({
        sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
        customGroupRules: [{ name: "自定义", keywords }],
      });
      await assert.rejects(() => loadAppConfig(), /keywords 必须是非空字符串数组/);
    }
  });

  test("根配置不是对象时抛出明确错误", async () => {
    setEnv(null);
    await assert.rejects(() => loadAppConfig(), /根配置必须是 JSON 对象/);
  });

  test("apiUrl 使用非 http/https 协议时抛错", async () => {
    setEnv({ sites: [{ name: "测试", apiUrl: "ftp://api.com", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /apiUrl 必须是 http:\/\/ 或 https:\/\/ 协议/);
  });

  test("apiUrl 使用 http:// 时仅允许本地地址，且不接受查询参数", async () => {
    setEnv({ sites: [{ name: "测试", apiUrl: "http://api.com", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /apiUrl 必须使用 https:\/\//);

    setEnv({ sites: [{ name: "测试", apiUrl: "https://api.com?key=1", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /apiUrl 不能包含查询参数或锚点/);

    setEnv({ sites: [{ name: "测试", apiUrl: "http://localhost:8080", apiKey: "sk-1" }] });
    const config = await loadAppConfig();
    assert.equal(config.sites[0].apiUrl, "http://localhost:8080");
  });

  test("apiEndpoint 省略前导斜线时自动规范化", async () => {
    setEnv({ sites: [{ name: "测试", apiUrl: "https://api.com/openai", apiKey: "sk-1", apiEndpoint: "v1/models" }] });
    const config = await loadAppConfig();
    assert.equal(config.sites[0].apiEndpoint, "/v1/models");
  });

  test("站点名称大小写重复时抛错", async () => {
    setEnv({
      sites: [
        { name: "Test", apiUrl: "https://a.com", apiKey: "sk-a" },
        { name: "test", apiUrl: "https://b.com", apiKey: "sk-b" },
      ],
    });
    await assert.rejects(() => loadAppConfig(), /站点名称.*重复/);
  });

  test("内置组与多个同名自定义组最终由最后一个覆盖", () => {
    const rules = buildGroupRules([
      { name: "Nvidia", keywords: ["old"], order: 700 },
      { name: "nvidia", keywords: ["middle"], order: 700 },
      { name: "NVIDIA", keywords: ["final"], order: 700 },
    ]);
    const nvidiaRules = rules.filter((rule) => rule.name.toLowerCase() === "nvidia");
    assert.equal(nvidiaRules.length, 1);
    assert.deepEqual(nvidiaRules[0].keywords, ["final"]);
    assert.equal(groupModels(["old-model", "middle-model", "final-model"], rules).get("default")?.length, 2);
    assert.deepEqual(groupModels(["final-model"], rules).get("NVIDIA"), ["final-model"]);
  });

  test("order 数字越小排越前", () => {
    const rules = buildGroupRules([
      { name: "靠前", keywords: ["a"], order: 50 },
      { name: "中间", keywords: ["b"], order: 1650 },
      { name: "靠后", keywords: ["c"], order: 5000 },
    ]);
    const names = rules.map((rule) => rule.name);
    assert.equal(names[0], "靠前");
    assert.ok(names.indexOf("中间") > names.indexOf("LongCat"));
    assert.ok(names.indexOf("中间") < names.indexOf("百灵"));
    assert.ok(names.indexOf("靠后") < names.indexOf("default"), "5000 位于品牌组之后、default(9000) 之前");
    assert.equal(names.at(-1), "default");
  });

  test("自定义组之间 order 重复时报错", () => {
    assert.throws(
      () =>
        buildGroupRules([
          { name: "A组", keywords: ["a"], order: 50 },
          { name: "B组", keywords: ["b"], order: 50 },
        ]),
      /order 50 重复（"A组" 与 "B组"）/,
    );
  });

  test("自定义组与未覆盖的内置组 order 重复时报错", () => {
    assert.throws(
      () => buildGroupRules([{ name: "新分组", keywords: ["x"], order: 1100 }]),
      /order 1100 重复（"DeepSeek" 与 "新分组"）/,
    );
  });

  test("覆盖内置组时填该内置组自己的 order 不算冲突", () => {
    const indexOf = (rules: readonly { name: string }[], name: string) =>
      rules.findIndex((rule) => rule.name.toLowerCase() === name);
    const builtin = buildGroupRules();
    const overridden = buildGroupRules([{ name: "DeepSeek", keywords: ["ds"], order: 1100 }]);
    assert.equal(indexOf(overridden, "deepseek"), indexOf(builtin, "deepseek"));
    assert.ok(indexOf(overridden, "deepseek") < indexOf(overridden, "kimi"));
  });

  test("覆盖内置分组可通过 order 显式调整位置", () => {
    const rules = buildGroupRules([{ name: "DeepSeek", keywords: ["ds"], order: 50 }]);
    assert.equal(rules[0].name, "DeepSeek");
  });

  test("旧 position 字段被当作未知字段拒绝", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["t"], position: { type: "first" } }],
    });
    await assert.rejects(() => loadAppConfig(), /未知字段 "position"/);
  });

  test("order 不是整数时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["t"], order: 1.5 }],
    });
    await assert.rejects(() => loadAppConfig(), /order.*必须是整数/);
  });

  test("自定义分组未填 order 时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["t"] }],
    });
    await assert.rejects(() => loadAppConfig(), /order.*必须是整数且必填/);
  });

  test("配置加载阶段就拒绝重复的 order", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "新分组", keywords: ["t"], order: 1100 }],
    });
    await assert.rejects(() => loadAppConfig(), /order 1100 重复/);
  });

  test("覆盖内置组时沿用其 order 可以正常加载", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "DeepSeek", keywords: ["ds"], order: 1100 }],
    });
    const config = await loadAppConfig();
    assert.equal(config.customGroupRules?.[0].order, 1100);
  });

  test("自定义分组图标只允许 http/https", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["safe"], icon: "javascript:alert(1)" }],
    });
    await assert.rejects(() => loadAppConfig(), /icon 必须是 http:\/\/ 或 https:\/\/ 协议/);
  });
});

describe("内置分组对真实模型 ID 的归属", () => {
  const rules = buildGroupRules();
  const groupOf = (models: string[]) => {
    const groups = groupModels(models, rules);
    const map = new Map<string, string>();
    for (const [name, list] of groups) for (const model of list) map.set(model, name);
    return map;
  };

  test("关键词只在词首命中，不会误伤连写名", () => {
    const map = groupOf([
      "kling-v3",
      "kling-video1",
      "kimi-k2-thinking",
      "notebook-lm",
      "musesteamer-air-image",
      "video1",
      "stepper-3",
      "phind-70b",
      "Ling-1T",
      "Ring-flash-2.0",
      "Ling-3.1-flash",
      "wanx2.1-t2v-turbo",
      "wan2.2-t2v-plus",
      "yiyan",
      "yi-large",
      "chatgpt-4o-latest",
      "chatglm3-6b",
    ]);
    assert.equal(map.get("kling-v3"), "快手");
    assert.equal(map.get("kling-video1"), "快手", "o1 不在词首，不应命中 kling-video1");
    assert.equal(map.get("kimi-k2-thinking"), "Kimi");
    assert.equal(map.get("notebook-lm"), "default");
    assert.equal(map.get("musesteamer-air-image"), "default", "muse- 不会命中 musesteamer");
    assert.equal(map.get("video1"), "default", "o1 不在词首");
    assert.equal(map.get("stepper-3"), "default", "step- 不会命中 stepper");
    assert.equal(map.get("phind-70b"), "default", "phi- 不会命中 phind");
    assert.equal(map.get("Ling-1T"), "百灵");
    assert.equal(map.get("Ring-flash-2.0"), "百灵");
    assert.equal(map.get("Ling-3.1-flash"), "百灵", "任意 Ling 系列都应命中百灵");
    assert.equal(map.get("wanx2.1-t2v-turbo"), "Qwen", "wan 在词首，wanx 系也归 Qwen");
    assert.equal(map.get("wan2.2-t2v-plus"), "Qwen");
    assert.equal(map.get("yiyan"), "文心一言", "yi- 不会抢走 yiyan");
    assert.equal(map.get("yi-large"), "零一万物");
    assert.equal(map.get("chatgpt-4o-latest"), "OpenAI", "gpt 不在词首，靠 chatgpt 命中");
    assert.equal(map.get("chatglm3-6b"), "智谱", "glm 不在词首，靠 chatglm 命中");
  });

  test("托管商组的 order 排在品牌组之前，因此厂商/模型归托管商", () => {
    const map = groupOf([
      "nvidia/llama-3.3-nemotron-super-49b-v1",
      "nvidia/nv-rerankqa-mistral-4b-v3",
      "google/gemma-4-31b-it",
      "groq/llama-3",
      "mistralai/mistral-large-3-675b-instruct-2512",
      "moonshotai/kimi-k3",
      "deepseek-ai/deepseek-v4-pro",
    ]);
    assert.equal(map.get("nvidia/llama-3.3-nemotron-super-49b-v1"), "Nvidia", "Nvidia(700) 先于 Meta(800)");
    assert.equal(map.get("nvidia/nv-rerankqa-mistral-4b-v3"), "Nvidia", "Nvidia(700) 先于 Mistral(1800)");
    assert.equal(map.get("google/gemma-4-31b-it"), "Gemini");
    assert.equal(map.get("groq/llama-3"), "Groq", "Groq(600) 先于 Meta(800)");
    assert.equal(map.get("mistralai/mistral-large-3-675b-instruct-2512"), "Mistral");
    assert.equal(map.get("moonshotai/kimi-k3"), "Kimi");
    assert.equal(map.get("deepseek-ai/deepseek-v4-pro"), "DeepSeek");
  });

  test("Mistral 家族、Cohere、Perplexity、o 系列与中文连写都能命中", () => {
    const map = groupOf([
      "devstral-2512",
      "open-mixtral-8x22b",
      "ministral-8b-2410",
      "voxtral-mini-tts-2603",
      "pixtral-12b-2409",
      "command-r-plus",
      "sonar-deep-research",
      "o1",
      "o3",
      "o4-mini",
      "cogvideox-3",
      "chatglm3-6b",
      "wanx2.1-t2v-turbo",
      "智谱glm-4",
    ]);
    for (const id of [
      "devstral-2512",
      "open-mixtral-8x22b",
      "ministral-8b-2410",
      "voxtral-mini-tts-2603",
      "pixtral-12b-2409",
    ]) {
      assert.equal(map.get(id), "Mistral");
    }
    assert.equal(map.get("command-r-plus"), "Cohere");
    assert.equal(map.get("sonar-deep-research"), "Perplexity");
    for (const id of ["o1", "o3", "o4-mini"]) assert.equal(map.get(id), "OpenAI");
    assert.equal(map.get("cogvideox-3"), "智谱");
    assert.equal(map.get("chatglm3-6b"), "智谱");
    assert.equal(map.get("wanx2.1-t2v-turbo"), "Qwen");
    assert.equal(map.get("智谱glm-4"), "智谱");
  });

  test("同厂商的多模态与连写模型名也能归入本组", () => {
    const map = groupOf([
      "sora-2",
      "whisper-1",
      "imagen-4.0-generate-001",
      "veo-3.0-generate-001",
      "learnlm-2.0-flash-experimental",
      "iFlytekSpark-13B",
      "SenseChat-5",
      "TeleChat-32B",
      "seed-oss-36b",
      "doubao-seedance-1-0-pro",
      "nano-banana",
      "microsoft/phi-4",
      "phi-4-mini-instruct",
    ]);
    assert.equal(map.get("sora-2"), "OpenAI");
    assert.equal(map.get("whisper-1"), "OpenAI");
    assert.equal(map.get("imagen-4.0-generate-001"), "Gemini");
    assert.equal(map.get("veo-3.0-generate-001"), "Gemini");
    assert.equal(map.get("learnlm-2.0-flash-experimental"), "Gemini");
    assert.equal(map.get("iFlytekSpark-13B"), "讯飞");
    assert.equal(map.get("SenseChat-5"), "商汤");
    assert.equal(map.get("TeleChat-32B"), "电信星辰");
    assert.equal(map.get("seed-oss-36b"), "豆包");
    assert.equal(map.get("doubao-seedance-1-0-pro"), "豆包");
    assert.equal(map.get("nano-banana"), "Gemini");
    assert.equal(map.get("microsoft/phi-4"), "Microsoft");
    assert.equal(map.get("phi-4-mini-instruct"), "Microsoft");
  });
});

describe("themes 配置", () => {
  before(() => delete process.env.CONFIG_JSON);
  after(() => {
    if (ORIGINAL_ENV) process.env.CONFIG_JSON = ORIGINAL_ENV;
    else delete process.env.CONFIG_JSON;
  });

  const baseConfig = { sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }] };

  test("themes 未配置时不设置字段", async () => {
    setEnv(baseConfig);
    const config = await loadAppConfig();
    assert.equal(config.themes, undefined);
  });

  test("themes 空数组视为未配置", async () => {
    setEnv({ ...baseConfig, themes: [] });
    const config = await loadAppConfig();
    assert.equal(config.themes, undefined);
  });

  test("themes 合法数组按配置顺序保留", async () => {
    setEnv({ ...baseConfig, themes: ["handdrawn", "classic"] });
    const config = await loadAppConfig();
    assert.deepEqual(config.themes, ["handdrawn", "classic"]);
  });

  test("themes 含无效 id 时抛错", async () => {
    setEnv({ ...baseConfig, themes: ["classic", "not-a-theme"] });
    await assert.rejects(() => loadAppConfig(), /themes 含无效主题 id/);
  });

  test("themes 重复 id 时抛错", async () => {
    setEnv({ ...baseConfig, themes: ["classic", "classic"] });
    await assert.rejects(() => loadAppConfig(), /themes 中主题 "classic" 重复/);
  });

  test("themes 非数组时抛错", async () => {
    setEnv({ ...baseConfig, themes: "classic" });
    await assert.rejects(() => loadAppConfig(), /themes 必须是主题 id 数组/);
  });
});

const DEFAULT_RULES = buildGroupRules();

describe("分组逻辑 - 内置分组", () => {
  // [模型名, 期望分组]：覆盖英文/中文关键词、大小写不敏感与 default 兜底
  const CASES: Array<[string, string]> = [
    ["gpt-4", "OpenAI"],
    ["gpt-3.5-turbo", "OpenAI"],
    ["GPT-4", "OpenAI"],
    ["claude-3-opus", "Claude"],
    ["Claude-3", "Claude"],
    ["gemini-pro", "Gemini"],
    ["deepseek-chat", "DeepSeek"],
    ["DEEPSEEK-chat", "DeepSeek"],
    ["qwen-max", "Qwen"],
    ["qwq-32b", "Qwen"],
    ["通义千问-max", "Qwen"],
    ["glm-4", "智谱"],
    ["codegeex-2", "智谱"],
    ["智谱glm-4", "智谱"],
    ["dots.llm1", "小红书"],
    ["RedNote-v1", "小红书"],
    ["yi-large", "零一万物"],
    ["01-ai/Yi-34B-Chat", "零一万物"],
    ["yiyan", "文心一言"],
    ["Ling-1T", "百灵"],
    ["unknown-model-xyz", "default"],
  ];

  test("模型按关键词归入对应分组", () => {
    const result = groupModels(
      CASES.map(([model]) => model),
      DEFAULT_RULES,
    );
    const groupOf = new Map<string, string>();
    for (const [group, models] of result) {
      for (const model of models) groupOf.set(model, group);
    }
    for (const [model, expected] of CASES) {
      assert.equal(groupOf.get(model), expected, `${model} 应归入 ${expected}`);
    }
  });
});

describe("分组逻辑 - 自定义分组", () => {
  test("order 0 的新分组排在最前", () => {
    const rules = buildGroupRules([{ name: "默认位置", keywords: ["default-pos"], order: 0 }]);
    assert.equal(rules[0].name, "默认位置");
  });

  test("order 可插入内置组之间", () => {
    const rules = buildGroupRules([{ name: "插入OpenAI后", keywords: ["after-openai"], order: 150 }]);
    const idx = rules.findIndex((r) => r.name === "插入OpenAI后");
    const openaiIdx = rules.findIndex((r) => r.name === "OpenAI");
    const geminiIdx = rules.findIndex((r) => r.name === "Gemini");
    assert.equal(openaiIdx + 1, idx, "order 150 应位于 OpenAI(100) 与 Gemini(200) 之间");
    assert.ok(idx < geminiIdx);
  });

  test("order 大于内置品牌组末尾时排在 default 之前", () => {
    const rules = buildGroupRules([{ name: "自定义尾", keywords: ["custom-last"], order: 4000 }]);
    assert.equal(rules.at(-2)?.name, "自定义尾");
    assert.equal(rules.at(-1)?.name, "default");
  });

  test("order 不小于 default 的 9000 时报错", () => {
    assert.throws(
      () => buildGroupRules([{ name: "超出", keywords: ["x"], order: 9500 }]),
      /order 9500 必须小于 default 的 9000（"超出"）/,
    );
  });

  test("icon 缺省时用默认图标", () => {
    const rules = buildGroupRules([{ name: "无图标分组", keywords: ["no-icon"], order: 5000 }]);
    const rule = rules.find((r) => r.name === "无图标分组");
    assert.equal(rule?.icon, DEFAULT_ICON, "全新分组未填 icon 时使用默认图标");
  });

  test("自定义 icon 生效", () => {
    const customIcon = "https://example.com/custom.png";
    const rules = buildGroupRules([{ name: "自定义图标", keywords: ["ci"], icon: customIcon, order: 5000 }]);
    const rule = rules.find((r) => r.name === "自定义图标");
    assert.equal(rule!.icon, customIcon);
  });

  test("自定义分组关键词匹配模型", () => {
    const rules = buildGroupRules([{ name: "Safe分组", keywords: ["safe"], order: 0 }]);
    const result = groupModels(["safe-model", "gpt-4", "unknown"], rules);
    assert.deepEqual(
      [...result],
      [
        ["Safe分组", ["safe-model"]],
        ["OpenAI", ["gpt-4"]],
        ["default", ["unknown"]],
      ],
    );
  });

  test("自定义分组优先于内置分组匹配", () => {
    const rules = buildGroupRules([{ name: "优先分组", keywords: ["gpt"], order: 50 }]);
    const result = groupModels(["gpt-4"], rules);
    assert.deepEqual([...result], [["优先分组", ["gpt-4"]]]);
  });

  test("特殊分组名不会破坏分组结果", () => {
    const rules = buildGroupRules([{ name: "__proto__", keywords: ["special"], order: 6000 }]);
    const result = groupModels(["special-model"], rules);
    assert.deepEqual(result.get("__proto__"), ["special-model"]);
  });
});
