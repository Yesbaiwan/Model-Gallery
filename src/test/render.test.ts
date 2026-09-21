import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildGroupRules } from "../config/groupConfig.ts";
import { renderPage } from "../ui/page.ts";
import { renderHeader, renderSiteSelector, renderRefreshButton, renderStyleSelector } from "../ui/components.ts";
import { THEMES, resolveEnabledThemes } from "../ui/themes.ts";
import { escapeAttribute, escapeHtml, isSafeUrl, sanitizeUrl } from "../ui/escape.ts";
import type { AppConfig, SiteConfig } from "../types.ts";

const DEFAULT_RULES = buildGroupRules();

const SECRET_KEY = "sk-SECRET-KEY-12345-UNIQUE";

const TEST_SITE: SiteConfig = {
  name: "测试站点",
  apiUrl: "https://api.example.com",
  apiKey: SECRET_KEY,
  apiEndpoint: "/v1/models",
  externalUrl: "https://external.example.com",
  iconUrl: "https://icon.example.com/logo.png",
};

const TEST_OTHER_SITE: SiteConfig = {
  name: "其他站点",
  apiUrl: "https://other.com",
  apiKey: "sk-other-key",
  apiEndpoint: "/v1/models",
  externalUrl: "https://other.example.com",
  iconUrl: "https://other.example.com/icon.png",
};

const TEST_CONFIG: AppConfig = {
  sites: [TEST_SITE, TEST_OTHER_SITE],
  defaultSite: "测试站点",
};

describe("渲染字段验证", () => {
  test("site.name 渲染到 header", () => {
    const html = renderHeader(TEST_SITE, 3, 10);
    assert.ok(html.includes("测试站点"), "header 应包含站点名");
  });

  test("groupCount 渲染到 header", () => {
    const html = renderHeader(TEST_SITE, 7, 20);
    assert.ok(html.includes(">7<"), "header 应包含分组数");
  });

  test("modelCount 渲染到 header", () => {
    const html = renderHeader(TEST_SITE, 3, 42);
    assert.ok(html.includes(">42<"), "header 应包含模型数");
  });

  test("site.externalUrl 渲染到 header 链接", () => {
    const html = renderHeader(TEST_SITE, 3, 10);
    assert.ok(html.includes('href="https://external.example.com"'), "header 应包含 externalUrl");
  });

  test("site.iconUrl 渲染到 header 图标", () => {
    const html = renderHeader(TEST_SITE, 3, 10);
    assert.ok(html.includes('src="https://icon.example.com/logo.png"'), "header 应包含 iconUrl");
  });

  test("site selector 多站点时渲染切换链接", () => {
    const html = renderSiteSelector(TEST_CONFIG, "测试站点");
    const currentSiteHref = `/?site=${encodeURIComponent("测试站点")}`;
    const otherSiteHref = `/?site=${encodeURIComponent("其他站点")}`;
    assert.ok(html.includes("其他站点"), "应包含其他站点名");
    assert.ok(html.includes(`href="${otherSiteHref}"`), "应包含其他站点切换链接");
    assert.ok(!html.includes(`href="${currentSiteHref}"`), "当前站点不应出现在下拉列表");
  });

  test("外链增加 noopener 防护", () => {
    const html = renderHeader(TEST_SITE, 1, 1);
    assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  });

  test("完整页面按分组规则顺序渲染，而非按数量排序", () => {
    const rules = buildGroupRules([
      { name: "自定义首", keywords: ["custom"], position: { type: "first" } },
      { name: "自定义尾", keywords: ["tail"], position: { type: "last" } },
    ]);
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-1", "gpt-2", "custom-model", "tail-model"], null, rules);
    assert.ok(html.indexOf("自定义首") < html.indexOf("OpenAI"));
    assert.ok(html.indexOf("自定义尾") > html.indexOf("OpenAI"));
  });

  test("refresh button 包含当前站点精确链接", () => {
    const html = renderRefreshButton("测试站点");
    const encoded = encodeURIComponent("测试站点");
    assert.ok(html.includes(`href="/?site=${encoded}"`));
  });

  test("refresh button 无站点名时链接为根路径", () => {
    const html = renderRefreshButton("");
    assert.ok(html.includes('href="/"'), "无站点名时应链接到根路径");
  });

  test("自定义分组渲染到页面", () => {
    const customRules = buildGroupRules([{ name: "Safe分组", keywords: ["safe"] }]);
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
});

describe("安全性验证 - API Key 不泄露", () => {
  test("renderHeader 不包含 apiKey", () => {
    const html = renderHeader(TEST_SITE, 3, 10);
    assert.ok(!html.includes(SECRET_KEY), "header 不应包含 apiKey");
    assert.ok(!html.includes("SECRET"), "header 不应包含密钥片段");
  });

  test("renderSiteSelector 不包含 apiKey", () => {
    const html = renderSiteSelector(TEST_CONFIG, "测试站点");
    assert.ok(!html.includes(SECRET_KEY), "site selector 不应包含 apiKey");
    assert.ok(!html.includes("SECRET"), "site selector 不应包含密钥片段");
  });

  test("renderRefreshButton 不包含 apiKey", () => {
    const html = renderRefreshButton("测试站点");
    assert.ok(!html.includes(SECRET_KEY), "refresh button 不应包含 apiKey");
  });

  test("renderPage 正常页不包含 apiKey", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES);
    assert.ok(!html.includes(SECRET_KEY), "页面不应包含 apiKey");
    assert.ok(!html.includes("SECRET"), "页面不应包含密钥片段");
  });

  test("renderPage 错误页不包含 apiKey", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, null, "测试错误", DEFAULT_RULES);
    assert.ok(!html.includes(SECRET_KEY), "错误页不应包含 apiKey");
    assert.ok(!html.includes("SECRET"), "错误页不应包含密钥片段");
  });

  test("renderPage 空状态页不包含 apiKey", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, [], null, DEFAULT_RULES);
    assert.ok(!html.includes(SECRET_KEY), "空状态页不应包含 apiKey");
  });

  test("其他站点 apiKey 也不泄露", () => {
    const html = renderPage(TEST_CONFIG, TEST_OTHER_SITE, ["gpt-4"], null, DEFAULT_RULES);
    assert.ok(!html.includes("sk-other-key"), "不应包含其他站点 apiKey");
  });
});

describe("安全性验证 - HTML 和属性转义", () => {
  test("escapeHtml 转义文本节点危险字符", () => {
    assert.equal(escapeHtml(`<script>alert("x")</script>&`), `&lt;script&gt;alert("x")&lt;/script&gt;&amp;`);
  });

  test("escapeAttribute 转义属性危险字符", () => {
    assert.equal(
      escapeAttribute(`" onmouseover='alert(1)' & <x>`),
      `&quot; onmouseover=&#39;alert(1)&#39; &amp; &lt;x&gt;`,
    );
  });

  test("模型名包含 HTML 时只输出转义文本", () => {
    const modelName = `<script>alert(1)</script>`;
    const html = renderPage(TEST_CONFIG, TEST_SITE, [modelName], null, DEFAULT_RULES);
    assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), "页面应包含转义后的模型名");
    assert.ok(!html.includes(modelName), "页面不应包含原始模型 HTML");
    assert.ok(!html.includes(`copyToClipboard('${modelName}')`), "内联事件不应包含原始模型名");
  });

  test("错误信息包含 HTML 时只输出转义文本", () => {
    const error = `<img src=x onerror=alert(1)>`;
    const html = renderPage(TEST_CONFIG, TEST_SITE, null, error, DEFAULT_RULES);
    assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), "页面应包含转义后的错误信息");
    assert.ok(!html.includes(error), "页面不应包含原始错误 HTML");
  });

  test("站点文本与属性字段会被分别转义", () => {
    const site: SiteConfig = {
      ...TEST_SITE,
      name: `<b onclick="alert(1)">evil</b>`,
      externalUrl: `https://example.com/" onclick="alert(1)`,
      iconUrl: `https://example.com/icon.png" onerror="alert(1)`,
    };
    const html = renderHeader(site, 1, 2);
    assert.ok(html.includes('&lt;b onclick="alert(1)"&gt;evil&lt;/b&gt;'), "站点名应作为文本转义");
    assert.ok(html.includes(`href="https://example.com/&quot; onclick=&quot;alert(1)"`), "外链应作为属性转义");
    assert.ok(
      html.includes(`src="https://example.com/icon.png&quot; onerror=&quot;alert(1)"`),
      "图标 URL 应作为属性转义",
    );
    assert.ok(!html.includes(site.name), "header 不应包含原始站点名 HTML");
  });

  test("站点选择器会转义站点名称文本", () => {
    const maliciousSite: SiteConfig = { ...TEST_OTHER_SITE, name: `<svg onload=alert(1)>` };
    const config: AppConfig = { sites: [TEST_SITE, maliciousSite], defaultSite: TEST_SITE.name };
    const html = renderSiteSelector(config, TEST_SITE.name);
    assert.ok(html.includes("&lt;svg onload=alert(1)&gt;"), "站点选择器应转义站点名称");
    assert.ok(!html.includes(maliciousSite.name), "站点选择器不应包含原始站点名称 HTML");
  });

  test("自定义分组名称和图标属性会被转义", () => {
    const customRules = buildGroupRules([
      {
        name: `<img src=x onerror=alert(1)>`,
        icon: `https://example.com/icon.png" onerror="alert(1)`,
        keywords: ["unsafe"],
      },
    ]);
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["unsafe-model"], null, customRules);
    assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), "自定义分组名应作为文本转义");
    assert.ok(
      html.includes(`src="https://example.com/icon.png&quot; onerror=&quot;alert(1)"`),
      "自定义图标应作为属性转义",
    );
    assert.ok(!html.includes(`<span class="group-title"><img`), "分组标题不应注入 HTML");
  });

  test("isSafeUrl 只允许 http/https 协议", () => {
    assert.equal(isSafeUrl("https://example.com"), true);
    assert.equal(isSafeUrl("http://example.com"), true);
    assert.equal(isSafeUrl("javascript:alert(1)"), false);
    assert.equal(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
  });

  test("sanitizeUrl 将危险 URL fallback 到安全值", () => {
    assert.equal(sanitizeUrl("javascript:alert(1)"), "#");
    assert.equal(sanitizeUrl("https://example.com"), "https://example.com");
    assert.equal(sanitizeUrl("javascript:alert(1)", ""), "");
  });

  test("renderHeader 对 javascript: externalUrl fallback 到 #", () => {
    const site: SiteConfig = { ...TEST_SITE, externalUrl: "javascript:alert(1)" };
    const html = renderHeader(site, 1, 2);
    assert.ok(html.includes('href="#"'), "危险 externalUrl 应被替换为 #");
    assert.ok(!html.includes("javascript:"), "header 不应包含 javascript:");
  });

  test("renderHeader 对 data: iconUrl 不渲染 img 标签", () => {
    const site: SiteConfig = { ...TEST_SITE, iconUrl: "data:image/svg+xml,<svg onload=alert(1)>" };
    const html = renderHeader(site, 1, 2);
    assert.ok(!html.includes("<img"), "危险 iconUrl 不应渲染 img 标签");
    assert.ok(!html.includes("data:image/svg+xml"), "header 不应包含 data: URL");
  });
});

describe("现代化标记验证", () => {
  const pageHtml = () => renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES);

  test("页面包含 color-scheme 声明与明暗初始化脚本", () => {
    assert.ok(pageHtml().includes('<meta name="color-scheme" content="light dark">'), "应包含 color-scheme meta");
    assert.ok(pageHtml().includes('localStorage.getItem("theme")'), "head 应包含明暗初始化脚本");
  });

  test("明暗切换按钮是带 aria-label 的原生按钮", () => {
    assert.ok(pageHtml().includes('<button id="themeToggleBtn"'), "明暗切换应为原生按钮");
    assert.ok(pageHtml().includes('aria-label="切换明暗"'), "明暗按钮应带切换明暗标签");
  });

  test("页面包含 main 地标与无障碍 toast", () => {
    assert.ok(pageHtml().includes('<main id="main"'), "应包含 main 地标");
    assert.ok(pageHtml().includes('role="status"'), "toast 应有 status 角色");
    assert.ok(pageHtml().includes('aria-live="polite"'), "toast 应可播报");
  });

  test("分组折叠头是带 aria-expanded 的原生按钮", () => {
    assert.ok(
      pageHtml().includes('<button type="button" class="group-header" data-action="toggle-group" aria-expanded="true"'),
      "分组头应为按钮并声明展开状态",
    );
  });

  test("模型卡片是带 data-model 的原生按钮", () => {
    assert.ok(
      pageHtml().includes('class="model-card" data-action="copy-model" data-model="gpt-4"'),
      "模型卡片应为按钮并携带 data-model",
    );
    assert.ok(pageHtml().includes('aria-label="复制 gpt-4"'), "模型卡片应带复制语义标签");
  });
});

describe("多主题验证", () => {
  test("renderPage 按入参输出 data-style，默认为主题注册表默认值", () => {
    const html = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES);
    assert.ok(html.includes('data-style="classic"'), "默认应渲染经典主题");
    const classic = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "classic");
    assert.ok(classic.includes('data-style="classic"'), "应按入参渲染 classic");
  });

  test("手绘主题注入手写字体链接，classic 不注入字体链接", () => {
    const handdrawn = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "handdrawn");
    assert.ok(handdrawn.includes("fonts.googleapis.com/css2?family=Kalam"), "手绘主题应注入 Kalam 字体");
    const classic = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "classic");
    assert.ok(!classic.includes("fonts.googleapis.com/css2"), "classic 使用系统字体栈，不应有字体链接");
  });

  test("页面内联所选主题的样式而非其他主题", () => {
    const classic = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "classic");
    assert.ok(classic.includes("Classic 经典主题层"), "应内联 classic 皮肤");
    assert.ok(classic.includes("fadeInUp"), "classic 动效随主题文件一并内联");
    assert.ok(!classic.includes("Hand-Drawn 手绘主题层"), "不应内联手绘皮肤");
    assert.ok(!classic.includes("拍墙"), "classic 不应包含共享拍纸动效");
    const handdrawn = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "handdrawn");
    assert.ok(handdrawn.includes("Hand-Drawn 手绘主题层"), "应内联手绘皮肤");
    assert.ok(handdrawn.includes("动效层"), "手绘包含共享动效层");
    for (const html of [classic, handdrawn]) {
      assert.ok(html.includes("基础结构层"), "必须包含 base 结构层");
    }
  });

  test("主题能力经注册表下发：过渡开关与复制箭头标记", () => {
    const classic = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "classic");
    assert.ok(classic.includes('data-theme-transition="false"'), "classic 明暗切换立即生效");
    assert.ok(classic.includes('class="copy-icon"'), "classic 渲染复制箭头");
    const handdrawn = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "handdrawn");
    assert.ok(handdrawn.includes('data-theme-transition="true"'), "手绘启用全页交叉淡入");
    assert.ok(!handdrawn.includes('class="copy-icon"'), "手绘不渲染复制箭头");
  });

  test("主题选择器列出其他主题链接且不含当前主题", () => {
    const selector = renderStyleSelector("handdrawn", THEMES);
    assert.ok(selector.includes('data-action="toggle-style-selector"'), "应带事件委托 action");
    assert.ok(selector.includes('aria-controls="styleSelectorDropdown"'), "应声明下拉归属");
    assert.ok(selector.includes('href="/?theme=classic"'), "应包含 classic 切换链接");
    assert.ok(selector.includes('href="/?theme=archive"'), "应包含 archive 切换链接");
    assert.ok(!selector.includes('href="/?theme=handdrawn"'), "不应包含当前主题链接");
    assert.ok(selector.includes("经典") && selector.includes("档案"), "应使用主题显示名");
  });

  test("仅启用一个主题时不渲染主题选择器", () => {
    const enabled = resolveEnabledThemes(["handdrawn"]);
    assert.equal(renderStyleSelector("handdrawn", enabled), "", "单主题不应渲染切换按钮");
  });

  test("渲染启用主题子集时选择器只含启用主题", () => {
    const enabled = resolveEnabledThemes(["handdrawn", "classic"]);
    const selector = renderStyleSelector("handdrawn", enabled);
    assert.ok(selector.includes('href="/?theme=classic"'), "应包含启用的 classic");
    assert.ok(!selector.includes('href="/?theme=archive"'), "不应包含未启用的 archive");
  });
});
