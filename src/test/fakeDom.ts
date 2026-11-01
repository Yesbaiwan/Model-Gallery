import vm from "node:vm";
import { jsScripts, COLOR_MODE_INIT_SCRIPT } from "../ui/assets.ts";

/** 供脚本测试复用的最小 DOM / storage 替身，不模拟真实浏览器行为。 */

export class FakeClassList {
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

export class FakeElement {
  classList = new FakeClassList();
  innerHTML = "";
  textContent = "";
  hidden = false;
  inert = false;
  dataset: Record<string, string> = {};
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

export class MemoryStorage {
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

/** 在 vm 沙箱里执行 app.js，返回 click 监听与可断言的 root。 */
export function createContext(storage: unknown, elements: Record<string, FakeElement> = {}) {
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
      getSelection: () => ({ removeAllRanges() {}, addRange() {} }),
      requestAnimationFrame: (callback: () => void) => callback(),
      setTimeout,
      clearTimeout,
    },
    setTimeout,
  } as Record<string, any>;
  vm.createContext(context);
  vm.runInContext(jsScripts(), context);
  return { context, listeners, root };
}

/** 只执行 head 里的明暗初始化脚本，返回 html 元素的属性表。 */
export function createHeadContext(storage: unknown) {
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
