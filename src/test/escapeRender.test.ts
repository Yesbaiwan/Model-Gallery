import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildGroupRules } from "../config/groupConfig.ts";
import { renderPage } from "../ui/page.ts";
import { renderHeader, renderSiteSelector } from "../ui/components.ts";
import { escapeAttribute, escapeHtml, isSafeUrl, sanitizeUrl } from "../ui/escape.ts";
import type { AppConfig, SiteConfig } from "../types.ts";
import { DEFAULT_RULES, TEST_CONFIG, TEST_SITE, TEST_OTHER_SITE } from "./fixtures.ts";

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
        order: 0,
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
