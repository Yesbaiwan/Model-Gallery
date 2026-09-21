import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { accessSync } from "node:fs";
import { THEMES, DEFAULT_THEME_ID, isThemeId, getTheme, themeName, resolveEnabledThemes } from "../ui/themes.ts";

describe("主题注册表", () => {
  test("主题 id 唯一且包含内置默认", () => {
    const ids = THEMES.map((theme) => theme.id);
    assert.equal(new Set(ids).size, ids.length, "主题 id 不应重复");
    assert.ok(ids.includes(DEFAULT_THEME_ID), "内置默认主题必须在注册表中");
  });

  test("每个主题的皮肤 CSS 文件真实存在", () => {
    for (const theme of THEMES) {
      const file = new URL(`../assets/${theme.cssFile}`, import.meta.url);
      assert.doesNotThrow(() => accessSync(file), `主题 ${theme.id} 的样式文件缺失: ${theme.cssFile}`);
    }
  });

  test("声明了共享动效层的主题，其动效 CSS 文件真实存在", () => {
    for (const theme of THEMES) {
      if (!theme.motionFile) continue;
      const file = new URL(`../assets/${theme.motionFile}`, import.meta.url);
      assert.doesNotThrow(() => accessSync(file), `主题 ${theme.id} 的动效文件缺失: ${theme.motionFile}`);
    }
  });

  test("isThemeId 只接受注册表内的 id", () => {
    assert.equal(isThemeId("classic"), true);
    assert.equal(isThemeId("archive"), true);
    assert.equal(isThemeId("handdrawn"), true);
    assert.equal(isThemeId("not-a-theme"), false);
    assert.equal(isThemeId(undefined), false);
  });

  test("getTheme 返回对应定义，themeName 返回非空显示名", () => {
    assert.equal(getTheme("classic").id, "classic");
    for (const theme of THEMES) {
      assert.ok(themeName(theme.id).length > 0, `主题 ${theme.id} 应有显示名`);
    }
  });
});

describe("启用主题解析", () => {
  test("未配置或空数组时启用全部主题", () => {
    assert.deepEqual(
      resolveEnabledThemes(undefined).map((theme) => theme.id),
      ["classic", "archive", "handdrawn"],
    );
    assert.deepEqual(
      resolveEnabledThemes([]).map((theme) => theme.id),
      ["classic", "archive", "handdrawn"],
    );
  });

  test("按配置顺序返回，第一个即默认主题", () => {
    const enabled = resolveEnabledThemes(["handdrawn", "classic"]);
    assert.deepEqual(
      enabled.map((theme) => theme.id),
      ["handdrawn", "classic"],
    );
    assert.equal(enabled[0].id, "handdrawn");
  });

  test("单主题时长度为 1（渲染层据此隐藏切换按钮）", () => {
    assert.equal(resolveEnabledThemes(["classic"]).length, 1);
  });
});
