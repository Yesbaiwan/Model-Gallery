import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadAppConfig } from "../config/appConfig.ts";
import { groupModels, buildGroupRules, getGroupDisplayName } from "../config/groupConfig.ts";
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
      customGroupRules: [{ name: "OpenAI", keywords: ["custom"] }],
    });
    const config = await loadAppConfig();
    assert.equal(config.customGroupRules?.[0].name, "OpenAI");
  });

  test("customGroupRules 缺 name 时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ keywords: ["a"] }] as CustomGroupRule[],
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

  test("customGroupRules position.type 无效时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["t"], position: { type: "invalid" as "first" } }],
    });
    await assert.rejects(() => loadAppConfig(), /position\.type/);
  });

  test("customGroupRules position.type=before 缺 target 时抛错", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["t"], position: { type: "before" } }],
    });
    await assert.rejects(() => loadAppConfig(), /position\.target.*必须是非空字符串/);
  });

  test("根配置不是对象时抛出明确错误", async () => {
    setEnv(null);
    await assert.rejects(() => loadAppConfig(), /根配置必须是 JSON 对象/);
  });

  test("apiUrl 使用非 http/https 协议时抛错", async () => {
    setEnv({ sites: [{ name: "测试", apiUrl: "ftp://api.com", apiKey: "sk-1" }] });
    await assert.rejects(() => loadAppConfig(), /apiUrl 必须是 http:\/\/ 或 https:\/\/ 协议/);
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
      { name: "Nvidia", keywords: ["old"], position: { type: "last" } },
      { name: "nvidia", keywords: ["middle"], position: { type: "before", target: "DeepSeek" } },
      { name: "NVIDIA", keywords: ["final"], position: { type: "first" } },
    ]);
    const nvidiaRules = rules.filter((rule) => rule.name.toLowerCase() === "nvidia");
    assert.equal(nvidiaRules.length, 1);
    assert.deepEqual(nvidiaRules[0].keywords, ["final"]);
    assert.equal(rules[0].name, "NVIDIA");
    assert.equal(groupModels(["old-model", "middle-model", "final-model"], rules).get("default")?.length, 2);
    assert.deepEqual(groupModels(["final-model"], rules).get("NVIDIA"), ["final-model"]);
  });

  test("多个 first、last 按配置顺序排列", () => {
    const rules = buildGroupRules([
      { name: "First A", keywords: ["fa"], position: { type: "first" } },
      { name: "First B", keywords: ["fb"], position: { type: "first" } },
      { name: "Last A", keywords: ["la"], position: { type: "last" } },
      { name: "Last B", keywords: ["lb"], position: { type: "last" } },
    ]);
    const names = rules.map((rule) => rule.name);
    assert.ok(names.indexOf("First A") < names.indexOf("First B"));
    assert.ok(names.indexOf("Last A") < names.indexOf("Last B"));
    assert.ok(names.indexOf("Last B") > names.indexOf("default"));
  });

  test("before 关系形成循环时拒绝构建规则", () => {
    assert.throws(
      () =>
        buildGroupRules([
          { name: "A", keywords: ["a"], position: { type: "before", target: "B" } },
          { name: "B", keywords: ["b"], position: { type: "before", target: "A" } },
        ]),
      /循环/,
    );
  });

  test("同一目标的多个 before 按配置顺序排列", () => {
    const rules = buildGroupRules([
      { name: "A", keywords: ["a"], position: { type: "before", target: "DeepSeek" } },
      { name: "B", keywords: ["b"], position: { type: "before", target: "DeepSeek" } },
      { name: "C", keywords: ["c"], position: { type: "before", target: "DeepSeek" } },
    ]);
    const names = rules.map((rule) => rule.name);
    assert.ok(names.indexOf("A") < names.indexOf("B"));
    assert.ok(names.indexOf("B") < names.indexOf("C"));
    assert.ok(names.indexOf("C") < names.indexOf("DeepSeek"));
  });

  test("before 可以指向自定义组", () => {
    const rules = buildGroupRules([
      { name: "目标组", keywords: ["target"], position: { type: "last" } },
      { name: "前置组", keywords: ["before"], position: { type: "before", target: "目标组" } },
    ]);
    const names = rules.map((rule) => rule.name);
    assert.ok(names.indexOf("前置组") < names.indexOf("目标组"));
  });

  test("自定义分组图标只允许 http/https", async () => {
    setEnv({
      sites: [{ name: "测试", apiUrl: "https://api.com", apiKey: "sk-1" }],
      customGroupRules: [{ name: "自定义", keywords: ["safe"], icon: "javascript:alert(1)" }],
    });
    await assert.rejects(() => loadAppConfig(), /icon 必须是 http:\/\/ 或 https:\/\/ 协议/);
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

  test("themes 全组合：任一条目非法即整体报错，全合法才通过", async () => {
    // 3 个合法 id + 1 个非法 id，长度 1~3 的全部排列组合（4+16+64 = 84 种）
    const candidates = ["classic", "archive", "handdrawn", "bad-theme"];
    const combos: string[][] = [];
    for (const a of candidates) {
      combos.push([a]);
      for (const b of candidates) {
        combos.push([a, b]);
        for (const c of candidates) {
          combos.push([a, b, c]);
        }
      }
    }
    assert.equal(combos.length, 84);

    for (const themes of combos) {
      setEnv({ ...baseConfig, themes });
      const hasBad = themes.includes("bad-theme");
      const hasDuplicate = new Set(themes).size !== themes.length;
      if (hasBad || hasDuplicate) {
        // 含坏条目或重复条目都必须整体报错（两类错误抛出先后取决于条目位置）
        await assert.rejects(() => loadAppConfig(), /themes (含无效主题 id "bad-theme"|中主题 .* 重复)/);
      } else {
        const config = await loadAppConfig();
        assert.deepEqual(config.themes, themes);
      }
    }
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
  test("first 位置插入到最前", () => {
    const rules = buildGroupRules([{ name: "自定义首", keywords: ["custom-first"], position: { type: "first" } }]);
    assert.equal(rules[0].name, "自定义首");
  });

  test("last 位置插入到最后", () => {
    const rules = buildGroupRules([{ name: "自定义尾", keywords: ["custom-last"], position: { type: "last" } }]);
    const last = rules[rules.length - 1];
    assert.equal(last.name, "自定义尾");
  });

  test("before 位置插入到目标前", () => {
    const rules = buildGroupRules([
      { name: "插入OpenAI前", keywords: ["before-openai"], position: { type: "before", target: "OpenAI" } },
    ]);
    const idx = rules.findIndex((r) => r.name === "插入OpenAI前");
    const openaiIdx = rules.findIndex((r) => r.name === "OpenAI");
    assert.notEqual(idx, -1);
    assert.notEqual(openaiIdx, -1);
    assert.equal(idx + 1, openaiIdx, "自定义分组应在 OpenAI 前");
  });

  test("无 position 默认 first", () => {
    const rules = buildGroupRules([{ name: "默认位置", keywords: ["default-pos"] }]);
    assert.equal(rules[0].name, "默认位置");
  });

  test("icon 缺省时用默认图标", () => {
    const rules = buildGroupRules([{ name: "无图标分组", keywords: ["no-icon"] }]);
    const rule = rules.find((r) => r.name === "无图标分组");
    assert.ok(rule);
    assert.ok(rule!.icon, "应有默认图标");
  });

  test("自定义 icon 生效", () => {
    const customIcon = "https://example.com/custom.png";
    const rules = buildGroupRules([{ name: "自定义图标", keywords: ["ci"], icon: customIcon }]);
    const rule = rules.find((r) => r.name === "自定义图标");
    assert.equal(rule!.icon, customIcon);
  });

  test("自定义分组关键词匹配模型", () => {
    const rules = buildGroupRules([{ name: "Safe分组", keywords: ["safe"] }]);
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
    const rules = buildGroupRules([{ name: "优先分组", keywords: ["gpt"] }]);
    const result = groupModels(["gpt-4"], rules);
    assert.deepEqual([...result], [["优先分组", ["gpt-4"]]]);
  });

  test("before 目标不存在时拒绝构建规则", () => {
    assert.throws(
      () =>
        buildGroupRules([
          { name: "目标不存在", keywords: ["x"], position: { type: "before", target: "不存在的分组" } },
        ]),
      /无效的分组插入目标/,
    );
  });

  test("特殊分组名不会破坏分组结果", () => {
    const rules = buildGroupRules([{ name: "__proto__", keywords: ["special"] }]);
    const result = groupModels(["special-model"], rules);
    assert.deepEqual(result.get("__proto__"), ["special-model"]);
  });

  test("辅助函数按规范化名称查找", () => {
    const rules = buildGroupRules([{ name: "自定义", keywords: ["custom"], icon: "https://example.com/icon.png" }]);
    assert.equal(getGroupDisplayName("自定义", rules), "自定义");
    assert.equal(getGroupDisplayName("DEFAULT", rules), "其他");
  });
});
