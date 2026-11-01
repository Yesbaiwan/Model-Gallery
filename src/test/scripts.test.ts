import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FakeElement, MemoryStorage, createContext } from "./fakeDom.ts";

describe("浏览器交互脚本", () => {
  test("初始化时 localStorage 不可用仍能完成脚本注册", () => {
    const { listeners } = createContext(undefined);
    assert.ok(listeners.has("click"));
  });

  test("剪贴板缺失时回退 execCommand 并标记卡片已复制", async () => {
    const { listeners } = createContext(new MemoryStorage());
    const card = new FakeElement();
    card.dataset.action = "copy-model";
    card.dataset.model = "model";
    assert.doesNotThrow(() => listeners.get("click")?.({ target: card }));
    assert.equal(card.classList.has("copied"), true);

    // 350ms 反馈窗口结束后卡片还原
    await new Promise((resolve) => setTimeout(resolve, 450));
    assert.equal(card.classList.has("copied"), false);
  });

  test("安全上下文优先走 clipboard API 并写入模型名", async () => {
    const { listeners, context } = createContext(new MemoryStorage());
    let written = "";
    context.navigator.clipboard = {
      writeText: (value: string) => {
        written = value;
        return Promise.resolve();
      },
    };
    const card = new FakeElement();
    card.dataset.action = "copy-model";
    card.dataset.model = "gpt-4o";
    listeners.get("click")?.({ target: card });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(written, "gpt-4o", "应通过 writeText 写入模型名");
    assert.equal(card.classList.has("copied"), true);
  });

  test("writeText 被拒时回退 execCommand 兜底", async () => {
    const { listeners, context } = createContext(new MemoryStorage());
    let execCalls = 0;
    context.navigator.clipboard = { writeText: () => Promise.reject(new Error("denied")) };
    context.document.execCommand = () => {
      execCalls += 1;
      return true;
    };
    const card = new FakeElement();
    card.dataset.action = "copy-model";
    card.dataset.model = "model";
    listeners.get("click")?.({ target: card });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(execCalls, 1, "拒绝后应执行一次 execCommand 兜底");
    assert.equal(card.classList.has("copied"), true);
  });

  test("execCommand 抛异常时清理临时元素且不标记已复制", () => {
    const { listeners, context } = createContext(new MemoryStorage());
    let removed = 0;
    context.document.createElement = () => ({
      value: "",
      readOnly: false,
      contentEditable: "",
      style: {} as Record<string, string>,
      setSelectionRange() {},
      remove() {
        removed += 1;
      },
    });
    context.document.execCommand = () => {
      throw new Error("copy blocked");
    };
    const card = new FakeElement();
    card.dataset.action = "copy-model";
    card.dataset.model = "model";
    assert.doesNotThrow(() => listeners.get("click")?.({ target: card }));
    assert.equal(removed, 1, "临时 textarea 必须被移除");
    assert.equal(card.classList.has("copied"), false, "复制失败不应触发已复制反馈");
  });

  test("复制后弹出提示并带对应文案", () => {
    const toast = new FakeElement();
    toast.dataset.message = "已复制模型名";
    const { listeners } = createContext(new MemoryStorage(), { notification: toast });
    const card = new FakeElement();
    card.dataset.action = "copy-model";
    card.dataset.model = "gpt-4";
    listeners.get("click")?.({ target: card });
    assert.equal(toast.textContent, "已复制模型名", "提示应显示复制结果");
    assert.equal(toast.classList.has("toast-visible"), true, "提示应进入可见状态");
    assert.equal(toast.classList.has("toast-hidden"), false, "可见时不应保留隐藏状态");
  });

  test("分组与站点选择器通过事件委托切换，并维护 aria-expanded", () => {
    const groupHeader = new FakeElement();
    groupHeader.dataset.action = "toggle-group";
    const content = new FakeElement();
    const icon = new FakeElement();
    groupHeader.setAttribute("aria-controls", "group-content-0");
    groupHeader.children.set('[data-role="group-icon"]', icon);
    groupHeader.closest = () => groupHeader;
    const dropdown = new FakeElement();
    const selector = new FakeElement();
    const { listeners } = createContext(new MemoryStorage(), {
      "group-content-0": content,
      siteSelectorDropdown: dropdown,
      siteSelectorBtn: selector,
    });
    const click = listeners.get("click")!;

    click({ target: groupHeader });
    assert.equal(content.classList.has("collapsed"), true);
    assert.equal(content.inert, true, "折叠后内容应设为 inert，键盘无法进入");
    assert.equal(icon.classList.has("icon-rotated"), true);
    assert.equal(groupHeader.getAttribute("aria-expanded"), "false");
    click({ target: groupHeader });
    assert.equal(content.classList.has("collapsed"), false);
    assert.equal(content.inert, false, "展开后应解除 inert");

    selector.dataset.action = "toggle-site-selector";
    selector.closest = () => selector;
    click({ target: selector });
    assert.equal(dropdown.hidden, false);
    assert.equal(selector.getAttribute("aria-expanded"), "true");

    click({ target: new FakeElement() });
    assert.equal(dropdown.hidden, true);
    assert.equal(selector.getAttribute("aria-expanded"), "false");
  });

  test("主题选择器通过事件委托切换，并在点击外部时收起", () => {
    const dropdown = new FakeElement();
    const selector = new FakeElement();
    const { listeners } = createContext(new MemoryStorage(), {
      styleSelectorDropdown: dropdown,
      styleSelectorBtn: selector,
    });
    const click = listeners.get("click")!;

    selector.dataset.action = "toggle-style-selector";
    selector.closest = () => selector;
    click({ target: selector });
    assert.equal(dropdown.hidden, false);
    assert.equal(selector.getAttribute("aria-expanded"), "true");

    click({ target: new FakeElement() });
    assert.equal(dropdown.hidden, true);
    assert.equal(selector.getAttribute("aria-expanded"), "false");
  });
});
