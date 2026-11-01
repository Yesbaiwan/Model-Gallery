import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildGroupRules } from "../config/groupConfig.ts";
import { renderPage } from "../ui/page.ts";
import { renderHeader, renderSiteSelector, renderRefreshButton } from "../ui/components.ts";
import { DEFAULT_RULES, SECRET_KEY, TEST_CONFIG, TEST_SITE, TEST_OTHER_SITE } from "./fixtures.ts";

describe("渲染字段验证", () => {
  test("header 渲染站点名、统计数、外链与图标", () => {
    const html = renderHeader(TEST_SITE, 7, 42);
    assert.ok(html.includes("测试站点"), "header 应包含站点名");
    assert.ok(html.includes(">7<"), "header 应包含分组数");
    assert.ok(html.includes(">42<"), "header 应包含模型数");
    assert.ok(html.includes('href="https://external.example.com"'), "header 应包含 externalUrl");
    assert.ok(html.includes('src="https://icon.example.com/logo.png"'), "header 应包含 iconUrl");
    assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'), "外链应有 noopener 防护");
  });

  test("site selector 多站点时渲染切换链接", () => {
    const html = renderSiteSelector(TEST_CONFIG, "测试站点");
    const currentSiteHref = `/?site=${encodeURIComponent("测试站点")}`;
    const otherSiteHref = `/?site=${encodeURIComponent("其他站点")}`;
    assert.ok(html.includes("其他站点"), "应包含其他站点名");
    assert.ok(html.includes(`href="${otherSiteHref}"`), "应包含其他站点切换链接");
    assert.ok(!html.includes(`href="${currentSiteHref}"`), "当前站点不应出现在下拉列表");
  });

  test("完整页面按分组规则顺序渲染，而非按数量排序", () => {
    const rules = buildGroupRules([
      { name: "自定义首", keywords: ["custom"], order: 50 },
      { name: "自定义尾", keywords: ["tail"], order: 4000 },
    ]);
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-1", "gpt-2", "custom-model", "tail-model"], null, rules);
    assert.ok(html.indexOf("自定义首") < html.indexOf("OpenAI"));
    assert.ok(html.indexOf("自定义尾") > html.indexOf("OpenAI"));
  });

  test("refresh button 指向当前站点", () => {
    const html = renderRefreshButton("测试站点");
    const encoded = encodeURIComponent("测试站点");
    assert.ok(html.includes(`href="/?site=${encoded}"`));
  });

  test("refresh button 无站点名时链接为根路径", () => {
    const html = renderRefreshButton("");
    assert.ok(html.includes('href="/"'), "无站点名时应链接到根路径");
  });

  test("分组入场序号封顶，分组再多也不会线性增加延迟", () => {
    const rules = buildGroupRules(
      Array.from({ length: 8 }, (_, i) => ({
        name: `组${i}`,
        keywords: [`kw${i}`],
        order: i * 10,
      })),
    );
    const html = renderPage(
      TEST_CONFIG,
      TEST_SITE,
      Array.from({ length: 8 }, (_, i) => `kw${i}`),
      null,
      rules,
    );
    assert.ok(html.includes("--gi:6"), "序号应封顶到 6");
    assert.ok(!html.includes("--gi:7"), "封顶后的分组不应出现更大序号");
  });

  test("自定义分组渲染到页面", () => {
    const customRules = buildGroupRules([{ name: "Safe分组", keywords: ["safe"], order: 0 }]);
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["safe-model", "gpt-4"], null, customRules);
    assert.ok(html.includes("Safe分组"), "页面应包含自定义分组名");
  });

  test("错误信息渲染到页面", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, null, "API 连接失败", DEFAULT_RULES);
    assert.ok(html.includes("API 连接失败"), "页面应包含错误信息");
    assert.ok(html.includes("获取模型失败"), "页面应包含错误标题");
  });

  test("空模型列表渲染空状态", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, [], null, DEFAULT_RULES);
    assert.ok(html.includes("暂无模型可用"), "页面应显示空状态");
  });

  test("模型名渲染到卡片", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4-turbo"], null, DEFAULT_RULES);
    assert.ok(html.includes("gpt-4-turbo"), "页面应包含模型名");
  });

  test("未命中任何规则的模型归入兜底分组，标题显示为“其他”", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["unmatched-model"], null, DEFAULT_RULES);
    assert.ok(html.includes('<span class="group-title">其他</span>'), "兜底分组标题应为“其他”");
  });
});

describe("安全性验证 - API Key 不泄露", () => {
  test("组件渲染不包含任何站点 apiKey", () => {
    const header = renderHeader(TEST_SITE, 3, 10);
    assert.ok(!header.includes(SECRET_KEY), "header 不应包含 apiKey");
    const selector = renderSiteSelector(TEST_CONFIG, "测试站点");
    assert.ok(!selector.includes(SECRET_KEY), "站点选择器不应包含当前站点 apiKey");
    assert.ok(!selector.includes("sk-other-key"), "站点选择器不应包含其他站点 apiKey");
  });

  test("正常、错误、空状态页面均不包含任何站点 apiKey", () => {
    const pages = [
      renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES),
      renderPage(TEST_CONFIG, TEST_SITE, null, "测试错误", DEFAULT_RULES),
      renderPage(TEST_CONFIG, TEST_SITE, [], null, DEFAULT_RULES),
      renderPage(TEST_CONFIG, TEST_OTHER_SITE, ["gpt-4"], null, DEFAULT_RULES),
    ];
    for (const html of pages) {
      assert.ok(!html.includes(SECRET_KEY), "页面不应包含当前站点 apiKey");
      assert.ok(!html.includes("sk-other-key"), "页面不应包含其他站点 apiKey");
    }
  });
});

describe("现代化标记验证", () => {
  const pageHtml = () => renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES);

  test("页面包含 color-scheme 声明与明暗初始化脚本", () => {
    assert.ok(pageHtml().includes('<meta name="color-scheme" content="light dark">'), "应包含 color-scheme meta");
    assert.ok(pageHtml().includes('localStorage.getItem("color-mode")'), "head 应包含明暗初始化脚本");
  });

  test("明暗切换按钮是带 aria-label 的原生按钮", () => {
    assert.ok(pageHtml().includes('<button id="colorModeToggleBtn"'), "明暗切换应为原生按钮");
    assert.ok(pageHtml().includes('aria-label="切换明暗"'), "明暗按钮应带切换明暗标签");
    assert.ok(pageHtml().includes('class="icon-auto"'), "明暗按钮应包含跟随系统图标");
  });

  test("页面包含 main 地标与无障碍 toast", () => {
    assert.ok(pageHtml().includes('<main id="main"'), "应包含 main 地标");
    assert.ok(pageHtml().includes('role="status"'), "toast 应有 status 角色");
    assert.ok(pageHtml().includes('aria-live="polite"'), "toast 应可播报");
  });

  test("分组折叠头是带 aria-expanded 的原生按钮", () => {
    assert.ok(pageHtml().includes('<h2 class="group-title-wrap">'), "分组标题应有 heading 语义");
    assert.ok(pageHtml().includes('class="group-header"'), "分组头应有可点击样式");
    assert.ok(pageHtml().includes('data-action="toggle-group"'), "分组头应由脚本委托处理");
    assert.ok(pageHtml().includes('aria-expanded="true"'), "分组头应声明展开状态");
    assert.ok(pageHtml().includes('aria-controls="group-content-0"'), "分组头应关联内容区");
  });

  test("模型卡片是带 data-model 的原生按钮", () => {
    const html = pageHtml();
    assert.ok(html.includes('data-action="copy-model"'), "模型卡片应由脚本委托处理");
    assert.ok(html.includes('data-model="gpt-4"'), "模型卡片应携带 data-model");
    assert.ok(html.includes('aria-label="复制 gpt-4"'), "模型卡片应带复制语义标签");
  });
});
