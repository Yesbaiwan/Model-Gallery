import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderPage } from "../ui/page.ts";
import { renderStyleSelector } from "../ui/components.ts";
import { THEMES, resolveEnabledThemes } from "../ui/themes.ts";
import { DEFAULT_RULES, TEST_CONFIG, TEST_SITE } from "./fixtures.ts";

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
    assert.ok(classic.includes("@keyframes fadeInUp"), "应内联 classic 皮肤的入场动效");
    assert.ok(classic.includes("--accent-glow"), "应内联 classic 皮肤 token");
    assert.ok(!classic.includes("--wobbly-md"), "不应内联手绘皮肤 token");
    assert.ok(!classic.includes("@keyframes slap-in"), "classic 不应包含共享拍纸动效");
    const handdrawn = renderPage(TEST_CONFIG, TEST_SITE, ["gpt-4"], null, DEFAULT_RULES, "handdrawn");
    assert.ok(handdrawn.includes("--wobbly-md"), "应内联手绘皮肤 token");
    assert.ok(handdrawn.includes("@keyframes slap-in"), "手绘包含共享动效层");
    for (const html of [classic, handdrawn]) {
      assert.ok(html.includes("--grid-min-width"), "必须包含 base 结构层");
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

  test("切换主题链接保留当前站点", () => {
    const selector = renderStyleSelector("classic", THEMES, "测试站点");
    const href = `/?site=${encodeURIComponent("测试站点")}&amp;theme=archive`;
    assert.ok(selector.includes(`href="${href}"`), "主题链接应携带当前站点参数");
  });
});
