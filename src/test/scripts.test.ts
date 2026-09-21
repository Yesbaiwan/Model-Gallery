import { test, describe } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { jsScripts, COLOR_MODE_INIT_SCRIPT } from "../ui/assets.ts";

class FakeClassList {
  private values = new Set<string>();
  toggle(name: string, force?: boolean): boolean {
    const next = force === undefined ? !this.values.has(name) : force;
    if (next) this.values.add(name);
    else this.values.delete(name);
    return next;
  }
  add(name: string): void {
    this.values.add(name);
  }
  remove(name: string): void {
    this.values.delete(name);
  }
  has(name: string): boolean {
    return this.values.has(name);
  }
}

class FakeElement {
  classList = new FakeClassList();
  innerHTML = "";
  hidden = false;
  dataset: Record<string, string> = {};
  parentElement: FakeElement | null = null;
  children = new Map<string, FakeElement>();
  private attrs = new Map<string, string>();
  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
  closest(selector: string): FakeElement | null {
    return selector === "[data-action]" && this.dataset.action ? this : null;
  }
  querySelector(selector: string): FakeElement | null {
    return this.children.get(selector) ?? null;
  }
  contains(value: unknown): boolean {
    return value === this;
  }
}

class MemoryStorage {
  private values = new Map<string, string>();
  private readonly fail: boolean;
  constructor(fail = false) {
    this.fail = fail;
  }
  getItem(key: string): string | null {
    if (this.fail) throw new Error("storage blocked");
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.fail) throw new Error("storage blocked");
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    if (this.fail) throw new Error("storage blocked");
    this.values.delete(key);
  }
}

function createContext(storage: unknown, elements: Record<string, FakeElement> = {}) {
  const listeners = new Map<string, (event?: any) => void>();
  const root = {
    attrs: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.attrs.set(name, value);
    },
    removeAttribute(name: string) {
      this.attrs.delete(name);
    },
    getAttribute(name: string) {
      return this.attrs.get(name) ?? null;
    },
  };
  const context = {
    console: { error() {} },
    document: {
      documentElement: root,
      body: {
        appendChild() {},
      },
      createElement() {
        return {
          value: "",
          readOnly: false,
          contentEditable: "",
          style: {} as Record<string, string>,
          setSelectionRange() {},
          remove() {},
        };
      },
      createRange() {
        return { selectNodeContents() {} };
      },
      execCommand() {
        return true;
      },
      getElementById(id: string) {
        return elements[id] ?? null;
      },
      addEventListener(name: string, handler: (event?: any) => void) {
        listeners.set(name, handler);
      },
    },
    localStorage: storage,
    navigator: { clipboard: undefined as { writeText(value: string): Promise<void> } | undefined },
    window: {
      localStorage: storage,
      matchMedia: () => ({ matches: false }),
      getSelection: () => ({ removeAllRanges() {}, addRange() {} }),
      setTimeout,
      clearTimeout,
    },
    setTimeout,
  } as Record<string, any>;
  vm.createContext(context);
  vm.runInContext(jsScripts(), context);
  return { context, listeners, root };
}

function createHeadContext(storage: unknown) {
  const root = {
    attrs: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.attrs.set(name, value);
    },
  };
  const context = {
    document: { documentElement: root },
    localStorage: storage,
  } as Record<string, any>;
  vm.createContext(context);
  vm.runInContext(COLOR_MODE_INIT_SCRIPT, context);
  return root;
}

describe("明暗模式初始化脚本（head）", () => {
  test("恢复已保存的明暗选择", () => {
    const storage = new MemoryStorage();
    storage.setItem("theme", "dark");
    const root = createHeadContext(storage);
    assert.equal(root.attrs.get("data-theme"), "dark");
  });

  test("忽略非法明暗值", () => {
    const storage = new MemoryStorage();
    storage.setItem("theme", "weird");
    const root = createHeadContext(storage);
    assert.equal(root.attrs.has("data-theme"), false);
  });

  test("存储异常时不抛错", () => {
    assert.doesNotThrow(() => createHeadContext(new MemoryStorage(true)));
  });
});

describe("浏览器交互脚本", () => {
  test("初始化时 localStorage 不可用仍能完成脚本注册", () => {
    const { listeners } = createContext(undefined);
    assert.ok(listeners.has("click"));
  });

  test("存储异常不阻止明暗点击处理", () => {
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    const { listeners, root } = createContext(new MemoryStorage(true));
    assert.doesNotThrow(() => listeners.get("click")?.({ target: button }));
    assert.equal(root.getAttribute("data-theme"), "dark");
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

  test("data-theme-transition=false 时明暗切换跳过 View Transitions 立即生效", () => {
    const { listeners, root, context } = createContext(new MemoryStorage());
    root.setAttribute("data-theme-transition", "false");
    let transitions = 0;
    context.document.startViewTransition = () => {
      transitions += 1;
    };
    const button = new FakeElement();
    button.dataset.action = "toggle-mode";
    listeners.get("click")?.({ target: button });
    assert.equal(root.getAttribute("data-theme"), "dark");
    assert.equal(transitions, 0, "classic 不应触发交叉淡入");
  });

  test("其余场景明暗切换走 View Transitions", () => {
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
    assert.equal(root.getAttribute("data-theme"), "dark");
    assert.equal(transitions, 1, "其他主题应经交叉淡入更新");
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

  test("分组与站点选择器通过事件委托切换，并维护 aria-expanded", () => {
    const groupHeader = new FakeElement();
    groupHeader.dataset.action = "toggle-group";
    const content = new FakeElement();
    const icon = new FakeElement();
    const wrapper = new FakeElement();
    wrapper.children.set('[data-role="group-content"]', content);
    wrapper.children.set('[data-role="group-icon"]', icon);
    groupHeader.parentElement = wrapper;
    groupHeader.closest = () => groupHeader;
    const dropdown = new FakeElement();
    const selector = new FakeElement();
    const { listeners } = createContext(new MemoryStorage(), {
      siteSelectorDropdown: dropdown,
      siteSelectorBtn: selector,
    });
    const click = listeners.get("click")!;

    click({ target: groupHeader });
    assert.equal(content.classList.has("collapsed"), true);
    assert.equal(icon.classList.has("icon-rotated"), true);
    assert.equal(groupHeader.getAttribute("aria-expanded"), "false");

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
