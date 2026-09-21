import type { AppConfig, GroupRule, SiteConfig } from "../types.ts";
import { getGroupDisplayName } from "../config/groupConfig.ts";
import { escapeAttribute, escapeHtml, sanitizeUrl } from "./escape.ts";
import {
  ICON_CHEVRON,
  ICON_CHECK,
  ICON_COPY,
  ICON_MENU,
  ICON_MOON,
  ICON_PALETTE,
  ICON_REFRESH,
  ICON_SUN,
} from "./icons.ts";
import { UI_TEXT } from "./messages.ts";
import { themeName, type ThemeDefinition, type ThemeId } from "./themes.ts";

/** 参与错落入场动画的卡片序号上限，超出后延迟封顶，避免长列表末尾等待。 */
const ANIMATED_CARD_LIMIT = 8;

export function renderColorModeToggle(): string {
  return `
    <button id="themeToggleBtn" type="button" data-action="toggle-mode"
      class="icon-btn mode-toggle" aria-label="${UI_TEXT.colorModeToggleLabel}" title="${UI_TEXT.colorModeToggleLabel}">
      <span class="icon-sun">${ICON_SUN}</span>
      <span class="icon-moon">${ICON_MOON}</span>
    </button>`;
}

export function renderSiteSelector(appConfig: AppConfig, currentSiteName: string): string {
  if (appConfig.sites.length <= 1) return "";
  const currentKey = currentSiteName.toLowerCase();
  const otherSites = appConfig.sites.filter((site) => site.name.toLowerCase() !== currentKey);
  return `
    <div class="site-selector">
      <button id="siteSelectorBtn" type="button" data-action="toggle-site-selector"
        class="site-selector-btn" aria-label="${UI_TEXT.siteSelectorLabel}" aria-haspopup="listbox"
        aria-controls="siteSelectorDropdown" aria-expanded="false">
        ${ICON_MENU}
      </button>
      <div id="siteSelectorDropdown" class="site-selector-dropdown" hidden>
        ${otherSites
          .map(
            (site) => `
          <a class="site-selector-link" href="${escapeAttribute(`/?site=${encodeURIComponent(site.name)}`)}">
            ${escapeHtml(site.name)}
          </a>`,
          )
          .join("")}
      </div>
    </div>`;
}

export function renderRefreshButton(currentSiteName: string): string {
  const href = currentSiteName ? `/?site=${encodeURIComponent(currentSiteName)}` : "/";
  return `<a href="${escapeAttribute(href)}" class="icon-btn refresh-btn" aria-label="${UI_TEXT.refreshLabel}" title="${UI_TEXT.refreshLabel}">${ICON_REFRESH}</a>`;
}

export function renderStyleSelector(currentStyle: ThemeId, enabled: readonly ThemeDefinition[]): string {
  // 仅启用一个主题时不渲染切换按钮
  if (enabled.length <= 1) return "";
  const otherStyles = enabled.filter((theme) => theme.id !== currentStyle);
  return `
    <div class="style-selector">
      <button id="styleSelectorBtn" type="button" data-action="toggle-style-selector"
        class="style-toggle-btn" aria-label="${UI_TEXT.styleSelectorLabel}" aria-haspopup="listbox"
        aria-controls="styleSelectorDropdown" aria-expanded="false">
        ${ICON_PALETTE}
      </button>
      <div id="styleSelectorDropdown" class="style-selector-dropdown" hidden>
        ${otherStyles
          .map(
            (theme) => `
          <a class="style-selector-link" href="/?theme=${theme.id}">
            ${escapeHtml(themeName(theme.id))}
          </a>`,
          )
          .join("")}
      </div>
    </div>`;
}

export function renderHeader(site: SiteConfig, groupCount: number, modelCount: number): string {
  const safeExternalUrl = sanitizeUrl(site.externalUrl);
  const safeIconUrl = sanitizeUrl(site.iconUrl, "");
  return `
    <header class="page-header">
      <a href="${escapeAttribute(safeExternalUrl)}" target="_blank" rel="noopener noreferrer"
        class="logo-link" aria-label="${escapeAttribute(UI_TEXT.siteHomepage(site.name))}">
        <span class="logo-badge">${safeIconUrl ? `<img src="${escapeAttribute(safeIconUrl)}" alt="${escapeAttribute(UI_TEXT.siteIcon(site.name))}" loading="lazy" class="logo-img">` : ""}</span>
      </a>
      <h1 class="site-name">${escapeHtml(site.name)}</h1>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">${groupCount}</span>
          <span class="stat-label">${UI_TEXT.groupCountLabel}</span>
        </div>
        <span class="stat-divider" aria-hidden="true"></span>
        <div class="stat">
          <span class="stat-value">${modelCount}</span>
          <span class="stat-label">${UI_TEXT.modelCountLabel}</span>
        </div>
      </div>
    </header>`;
}

export function renderNotification(): string {
  return `<div id="notification" class="toast toast-hidden" role="status" aria-live="polite">${UI_TEXT.copiedToClipboard}</div>`;
}

function renderModelCard(model: string, index: number, icon: string, showCopyIcon: boolean): string {
  return `
    <button type="button" class="model-card" data-action="copy-model" data-model="${escapeAttribute(model)}"
      style="--i:${Math.min(index, ANIMATED_CARD_LIMIT)}"
      aria-label="${escapeAttribute(UI_TEXT.copyModel(model))}">
      ${icon ? `<span class="model-card-icon"><img src="${escapeAttribute(icon)}" alt="" loading="lazy"></span>` : ""}
      <span class="model-name">${escapeHtml(model)}</span>
      ${showCopyIcon ? `<span class="copy-icon" aria-hidden="true"><span class="icon-copy">${ICON_COPY}</span><span class="icon-check">${ICON_CHECK}</span></span>` : ""}
    </button>`;
}

export function renderGroupSection(
  group: GroupRule,
  models: string[],
  rules: readonly GroupRule[],
  index: number,
  showCopyIcon: boolean,
): string {
  const displayName = getGroupDisplayName(group.name, rules);
  const icon = sanitizeUrl(group.icon, "");
  return `
    <section class="group" style="--gi:${index}">
      <button type="button" class="group-header" data-action="toggle-group" aria-expanded="true">
        <span class="group-icon-box">
          ${icon ? `<img src="${escapeAttribute(icon)}" alt="" loading="lazy">` : ""}
        </span>
        <span class="group-heading">
          <span class="group-title">${escapeHtml(displayName)}</span>
          <span class="group-subtitle">${UI_TEXT.modelCount(models.length)}</span>
        </span>
        <span class="group-chevron" data-role="group-icon">${ICON_CHEVRON}</span>
      </button>
      <div data-role="group-content" class="group-content">
        <div class="group-inner">
          <div class="model-grid">
            ${models.map((model, cardIndex) => renderModelCard(model, cardIndex, icon, showCopyIcon)).join("")}
          </div>
        </div>
      </div>
    </section>`;
}

export function renderError(error: string): string {
  return `
    <div class="state-card error-card" role="alert">
      <h3 class="state-title">${UI_TEXT.fetchFailedTitle}</h3>
      <p class="state-text">${escapeHtml(error)}</p>
    </div>`;
}

export function renderEmpty(): string {
  return `
    <div class="state-card empty-card">
      <h3 class="state-title">${UI_TEXT.emptyTitle}</h3>
      <p class="state-text">${UI_TEXT.emptyHint}</p>
    </div>`;
}
