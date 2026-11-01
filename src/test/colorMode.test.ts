import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FakeElement, MemoryStorage, createContext, createHeadContext } from "./fakeDom.ts";

describe("明暗模式初始化脚本（head）", () => {
  test("恢复已保存的明暗选择", () => {
    const storage = new MemoryStorage();
    storage.setItem("color-mode", "dark");
    const root = createHeadContext(storage);
    assert.equal(root.attrs.get("data-theme"), "dark");
  });

  test("忽略非法明暗值", () => {
    const storage = new MemoryStorage();
    storage.setItem("color-mode", "weird");
    const root = createHeadContext(storage);
    assert.equal(root.attrs.has("data-theme"), false);
  });

  test("auto 不设置 data-theme，交给系统偏好", () => {
    const storage = new MemoryStorage();
    storage.setItem("color-mode", "auto");
    const root = createHeadContext(storage);
    assert.equal(root.attrs.has("data-theme"), false);
  });

  test("存储异常时不抛错", () => {
    assert.doesNotThrow(() => createHeadContext(new MemoryStorage(true)));
  });
});

describe("明暗三态切换", () => {
  test("存储异常不阻止明暗点击处理", () => {
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    const { listeners, root } = createContext(new MemoryStorage(true));
    assert.doesNotThrow(() => listeners.get("click")?.({ target: button }));
    assert.equal(root.getAttribute("data-theme"), "light", "无法读取存储时从跟随系统切到浅色");
  });

  test("按钮按跟随系统 → 浅色 → 深色循环，并同步文案", () => {
    const storage = new MemoryStorage();
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    button.dataset.labelAuto = "跟随系统";
    button.dataset.labelLight = "浅色";
    button.dataset.labelDark = "深色";
    const { listeners, root } = createContext(storage, { colorModeToggleBtn: button });
    const click = listeners.get("click")!;

    assert.equal(button.getAttribute("aria-label"), "跟随系统", "首屏文案应反映未设置状态");

    click({ target: button });
    assert.equal(root.getAttribute("data-theme"), "light");
    assert.equal(storage.getItem("color-mode"), "light");
    assert.equal(button.getAttribute("aria-label"), "浅色");

    click({ target: button });
    assert.equal(root.getAttribute("data-theme"), "dark");
    assert.equal(storage.getItem("color-mode"), "dark");
    assert.equal(button.getAttribute("aria-label"), "深色");

    click({ target: button });
    assert.equal(root.getAttribute("data-theme"), null, "回到跟随系统应移除 data-theme");
    assert.equal(storage.getItem("color-mode"), "auto");
    assert.equal(button.getAttribute("aria-label"), "跟随系统");
  });

  test("data-theme-transition=false 时跳过 View Transitions 立即生效", () => {
    const { listeners, root, context } = createContext(new MemoryStorage());
    root.setAttribute("data-theme-transition", "false");
    let transitions = 0;
    context.document.startViewTransition = () => {
      transitions += 1;
    };
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    listeners.get("click")?.({ target: button });
    assert.equal(root.getAttribute("data-theme"), "light");
    assert.equal(transitions, 0, "classic 不应触发交叉淡入");
  });

  test("其余场景走 View Transitions", () => {
    const { listeners, root, context } = createContext(new MemoryStorage());
    root.setAttribute("data-theme-transition", "true");
    let transitions = 0;
    context.document.startViewTransition = (update: () => void) => {
      transitions += 1;
      update();
    };
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    listeners.get("click")?.({ target: button });
    assert.equal(root.getAttribute("data-theme"), "light");
    assert.equal(transitions, 1, "其他主题应经交叉淡入更新");
  });
});
