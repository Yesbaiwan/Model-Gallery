(() => {
  "use strict";

  // 明暗模式 localStorage 键，与 assets.ts 中 COLOR_MODE_INIT_SCRIPT 共用，修改需两处同步。
  const COLOR_MODE_KEY = "theme";
  const TOAST_DURATION_MS = 2200;
  const COPY_FEEDBACK_MS = 350;

  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  })();
  const safeSet = (key, value) => {
    try {
      storage?.setItem(key, value);
    } catch {
      /* storage 不可用 */
    }
  };

  const root = document.documentElement;
  const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentColorMode = () => root.getAttribute("data-theme") || (systemDark() ? "dark" : "light");

  const applyColorMode = (mode) => {
    root.setAttribute("data-theme", mode);
    safeSet(COLOR_MODE_KEY, mode);
  };

  // 明暗切换过渡由主题注册表下发（data-theme-transition="false" 表示立即生效）
  const useColorModeTransition = () => root.getAttribute("data-theme-transition") !== "false";

  // 明暗切换：支持 View Transitions 的浏览器走全页交叉淡入，其余立即生效
  const setColorMode = (mode) => {
    if (!useColorModeTransition() || typeof document.startViewTransition !== "function") {
      applyColorMode(mode);
      return;
    }
    document.startViewTransition(() => applyColorMode(mode));
  };

  let siteSelectorOpen = false;
  let styleSelectorOpen = false;

  const toggleSiteSelector = (force) => {
    const button = document.getElementById("siteSelectorBtn");
    const dropdown = document.getElementById("siteSelectorDropdown");
    if (!button || !dropdown) return;
    siteSelectorOpen = force !== undefined ? force : !siteSelectorOpen;
    dropdown.hidden = !siteSelectorOpen;
    button.setAttribute("aria-expanded", String(siteSelectorOpen));
  };

  const toggleStyleSelector = (force) => {
    const button = document.getElementById("styleSelectorBtn");
    const dropdown = document.getElementById("styleSelectorDropdown");
    if (!button || !dropdown) return;
    styleSelectorOpen = force !== undefined ? force : !styleSelectorOpen;
    dropdown.hidden = !styleSelectorOpen;
    button.setAttribute("aria-expanded", String(styleSelectorOpen));
  };

  // 每张卡片独立的还原定时器：连点不同卡片时互不取消
  const copyTimers = new WeakMap();

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
    const range = document.createRange();
    range.selectNodeContents(area);
    selection.removeAllRanges();
    selection.addRange(range);
    area.setSelectionRange(0, text.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    area.remove();
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
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");
    window.setTimeout(() => {
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
    const section = header.parentElement;
    const content = section?.querySelector?.('[data-role="group-content"]');
    const icon = section?.querySelector?.('[data-role="group-icon"]');
    if (!content) return;
    const collapsed = content.classList.toggle("collapsed");
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
      if (target.dataset.action === "toggle-mode") setColorMode(currentColorMode() === "dark" ? "light" : "dark");
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
