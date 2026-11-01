(() => {
  "use strict";

  // 明暗模式 localStorage 键，与 assets.ts 中 COLOR_MODE_INIT_SCRIPT 共用，修改需两处同步。
  // 存 "auto" / "light" / "dark"；"auto" 表示跟随系统，此时不设置 data-theme 属性。
  const COLOR_MODE_KEY = "color-mode";
  const COLOR_MODE_LABEL_KEYS = { auto: "labelAuto", light: "labelLight", dark: "labelDark" };
  const TOAST_DURATION_MS = 2000;
  const COPY_FEEDBACK_MS = 350;

  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  })();
  const safeGet = (key) => {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  const safeSet = (key, value) => {
    try {
      storage?.setItem(key, value);
    } catch {
      /* storage 不可用 */
    }
  };

  const root = document.documentElement;
  const readColorMode = () => {
    const stored = safeGet(COLOR_MODE_KEY);
    return stored === "light" || stored === "dark" ? stored : "auto";
  };
  // 三态循环：跟随系统 → 浅色 → 深色 → 跟随系统
  const nextColorMode = (mode) => (mode === "auto" ? "light" : mode === "light" ? "dark" : "auto");

  const updateColorModeLabel = (mode) => {
    const button = document.getElementById("colorModeToggleBtn");
    if (!button) return;
    const label = button.dataset[COLOR_MODE_LABEL_KEYS[mode]];
    if (!label) return;
    button.setAttribute("aria-label", label);
    button.title = label;
  };

  const applyColorMode = (mode) => {
    // 跟随系统时不写 data-theme，交给 CSS 的 light-dark() 与 prefers-color-scheme 自动生效
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    safeSet(COLOR_MODE_KEY, mode);
    updateColorModeLabel(mode);
  };

  // 明暗切换：主题注册表声明 data-theme-transition="false"（classic）或不支持 View Transitions 时立即生效
  const setColorMode = (mode) => {
    if (root.getAttribute("data-theme-transition") === "false" || typeof document.startViewTransition !== "function") {
      applyColorMode(mode);
      return;
    }
    document.startViewTransition(() => applyColorMode(mode));
  };

  // 服务端不知道 localStorage，首屏由脚本把按钮文案对齐到已保存的明暗状态
  updateColorModeLabel(readColorMode());

  let siteSelectorOpen = false;
  let styleSelectorOpen = false;

  // 打开下拉后把焦点送入菜单，键盘用户无需再按 Tab 猜测位置
  const focusFirstLink = (dropdown) => dropdown.querySelector("a")?.focus();

  const toggleSiteSelector = (force) => {
    const button = document.getElementById("siteSelectorBtn");
    const dropdown = document.getElementById("siteSelectorDropdown");
    if (!button || !dropdown) return;
    siteSelectorOpen = force !== undefined ? force : !siteSelectorOpen;
    dropdown.hidden = !siteSelectorOpen;
    button.setAttribute("aria-expanded", String(siteSelectorOpen));
    if (siteSelectorOpen) focusFirstLink(dropdown);
  };

  const toggleStyleSelector = (force) => {
    const button = document.getElementById("styleSelectorBtn");
    const dropdown = document.getElementById("styleSelectorDropdown");
    if (!button || !dropdown) return;
    styleSelectorOpen = force !== undefined ? force : !styleSelectorOpen;
    dropdown.hidden = !styleSelectorOpen;
    button.setAttribute("aria-expanded", String(styleSelectorOpen));
    if (styleSelectorOpen) focusFirstLink(dropdown);
  };

  // Esc 关闭已打开的下拉并把焦点还给触发按钮
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (styleSelectorOpen) {
      toggleStyleSelector(false);
      document.getElementById("styleSelectorBtn")?.focus();
    }
    if (siteSelectorOpen) {
      toggleSiteSelector(false);
      document.getElementById("siteSelectorBtn")?.focus();
    }
  });

  // 每张卡片独立的还原定时器：连点不同卡片时互不取消
  const copyTimers = new WeakMap();
  let toastTimer = 0;

  // 非安全上下文（如局域网 HTTP）没有 navigator.clipboard，回退到 execCommand。
  // 采用 clipboard.js 的成熟方案：只做范围选中、不 focus（聚焦会触发 iOS 平移页面导致跳动），
  // readOnly + contentEditable 防键盘弹出，元素绝对定位到当前滚动处（iOS 要求其在视口内）。
  const fallbackCopy = (text) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.readOnly = true;
    area.contentEditable = "true";
    area.style.position = "absolute";
    area.style.top = `${window.scrollY}px`;
    area.style.left = "-9999px";
    area.style.fontSize = "16px";
    document.body.appendChild(area);
    const selection = window.getSelection();
    let copied = false;
    // 选区与复制全程受保护：无论哪一步抛异常，finally 都保证临时元素被清理
    try {
      const range = document.createRange();
      range.selectNodeContents(area);
      selection.removeAllRanges();
      selection.addRange(range);
      area.setSelectionRange(0, text.length);
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      area.remove();
    }
    return copied;
  };

  const showCopiedFeedback = (card) => {
    // 所有主题统一闪现 350ms 的 copied 状态（classic 借此短暂浮现复制箭头，其余主题自行定义该状态的样式）
    if (card) {
      card.classList.add("copied");
      window.clearTimeout(copyTimers.get(card));
      copyTimers.set(
        card,
        window.setTimeout(() => {
          card.classList.remove("copied");
        }, COPY_FEEDBACK_MS),
      );
    }
    const toast = document.getElementById("notification");
    if (!toast) return;
    // live region 只在文本变化时播报：先清空再回填，保证重复复制也有反馈
    const message = toast.dataset.message || toast.textContent;
    toast.textContent = "";
    window.requestAnimationFrame(() => {
      toast.textContent = message;
    });
    // 连点复制时重置同一条定时器，避免上一次的定时提前把新提示收起
    window.clearTimeout(toastTimer);
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-hidden");
    }, TOAST_DURATION_MS);
  };

  const copyModel = (model, card) => {
    const clipboard = navigator.clipboard;
    if (clipboard?.writeText) {
      void clipboard
        .writeText(model)
        .then(() => showCopiedFeedback(card))
        .catch(() => {
          if (fallbackCopy(model)) showCopiedFeedback(card);
        });
    } else if (fallbackCopy(model)) {
      showCopiedFeedback(card);
    }
  };

  const toggleGroup = (header) => {
    // 按钮外层是 heading，内容区是同级的兄弟节点，靠 aria-controls 定位
    const content = document.getElementById(header.getAttribute("aria-controls") || "");
    const icon = header.querySelector('[data-role="group-icon"]');
    if (!content) return;
    const collapsed = content.classList.toggle("collapsed");
    // 折叠后内容不可聚焦，避免 Tab 键进入看不见的卡片
    content.inert = collapsed;
    header.setAttribute("aria-expanded", String(!collapsed));
    icon?.classList.toggle("icon-rotated", collapsed);
  };

  // 移动端滚动时隐藏悬浮按钮，停止滚动后恢复（CSS 仅在 ≤640px 应用隐藏效果）
  let scrollHideTimer = 0;
  document.addEventListener(
    "scroll",
    () => {
      root.classList.add("is-scrolling");
      window.clearTimeout(scrollHideTimer);
      scrollHideTimer = window.setTimeout(() => root.classList.remove("is-scrolling"), 250);
    },
    { passive: true },
  );

  document.addEventListener("click", (event) => {
    const target = event.target?.closest?.("[data-action]") || event.target;
    if (target?.dataset) {
      if (target.dataset.action === "toggle-mode") setColorMode(nextColorMode(readColorMode()));
      if (target.dataset.action === "toggle-site-selector") toggleSiteSelector();
      if (target.dataset.action === "toggle-style-selector") toggleStyleSelector();
      if (target.dataset.action === "copy-model") copyModel(target.dataset.model || "", target);
      if (target.dataset.action === "toggle-group") toggleGroup(target);
    }
    const siteSelector = document.getElementById("siteSelectorBtn");
    const siteDropdown = document.getElementById("siteSelectorDropdown");
    if (
      siteSelectorOpen &&
      siteSelector &&
      siteDropdown &&
      !siteSelector.contains(event.target) &&
      !siteDropdown.contains(event.target)
    ) {
      toggleSiteSelector(false);
    }
    const styleSelector = document.getElementById("styleSelectorBtn");
    const styleDropdown = document.getElementById("styleSelectorDropdown");
    if (
      styleSelectorOpen &&
      styleSelector &&
      styleDropdown &&
      !styleSelector.contains(event.target) &&
      !styleDropdown.contains(event.target)
    ) {
      toggleStyleSelector(false);
    }
  });
})();
