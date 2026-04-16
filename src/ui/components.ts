import type { AppState } from "../state.ts";
import { getCurrentSite } from "../state.ts";
import { getGroupDisplayName, getGroupIcon } from "../config/groupConfig.ts";

export function renderThemeToggle(): string {
  return `
    <button id="themeToggleBtn" onclick="toggleTheme()"
      class="theme-toggle fixed bottom-24 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--bg-card-solid)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] hover:border-[var(--border-strong)] shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-md)] transition-all duration-200 active:scale-95 text-[var(--text-primary)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>`;
}

export function renderSiteSelector(state: AppState): string {
  if (state.appConfig.sites.length <= 1) return "";

  const otherSites = state.appConfig.sites.filter((s) => s.name !== state.currentSiteName);

  return `
    <div class="fixed top-4 left-4 z-50">
      <button id="siteSelectorBtn" onclick="toggleSiteSelector()"
        class="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-card-solid)]/90 hover:bg-[var(--bg-card-solid)] border border-[var(--border-medium)] hover:border-[var(--border-strong)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-[var(--text-primary)]">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div id="siteSelectorDropdown" 
        class="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-card-solid)]/95 backdrop-blur-xl rounded-xl border border-[var(--border-medium)] shadow-[var(--shadow-xl)] opacity-0 invisible transition-all duration-200">
        ${
    otherSites
      .map(
        (site) => `
          <button onclick="switchSite('${site.name}')" 
            class="w-full text-left px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] first:rounded-t-xl last:rounded-b-xl transition-colors">
            ${site.name}
          </button>
        `,
      )
      .join("")
  }
      </div>
    </div>`;
}

export function renderRefreshButton(): string {
  return `
    <a href="/refresh" class="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-gradient-start)] shadow-[var(--shadow-xl)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-200 active:scale-95">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 11-3-6.7"/>
        <path d="M21 3v6h-6"/>
      </svg>
    </a>`;
}

export function renderHeader(state: AppState, groupCount: number, modelCount: number): string {
  const site = getCurrentSite(state);
  if (!site) return "";

  return `
    <header class="animate-in flex items-center justify-between mb-10 rounded-[20px] px-6 py-4 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-white)] shadow-[var(--shadow-lg)]">
      <div class="flex items-center space-x-5">
        <a href="${site.externalUrl}" target="_blank" class="group">
          <div class="logo-container w-16 h-16 rounded-[18px] bg-[var(--bg-card-solid)] p-1 shadow-[var(--logo-shadow)] overflow-hidden relative">
            <img src="${site.iconUrl}" alt="站点图标" loading="lazy" class="w-full h-full rounded-[14px] object-cover">
          </div>
        </a>
        <h1 class="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">${site.name}</h1>
      </div>
      <div class="flex items-center space-x-4 mr-6">
        <div class="text-center">
          <div class="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">${groupCount}</div>
          <div class="text-xs text-[var(--text-secondary)] mt-0.5">渠道</div>
        </div>
        <div class="w-px h-10 bg-[var(--divider)]"></div>
        <div class="text-center">
          <div class="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">${modelCount}</div>
          <div class="text-xs text-[var(--text-secondary)] mt-0.5">模型</div>
        </div>
      </div>
    </header>`;
}

export function renderNotification(): string {
  return `
    <div id="notification" class="notification notification-hidden fixed top-6 right-6 px-5 py-3.5 z-50 text-[var(--bg-gradient-start)] text-sm font-medium rounded-[14px] shadow-[var(--shadow-xl)] transition-all duration-400 ease-out">
      <div class="flex items-center space-x-2.5">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1422 4.85775 16.5 9 16.5C13.1422 16.5 16.5 13.1422 16.5 9C16.5 4.85775 13.1422 1.5 9 1.5ZM12.375 7.125L8.0625 11.4375C7.905 11.595 7.7025 11.6715 7.5 11.6715C7.2975 11.6715 7.095 11.595 6.9375 11.4375L5.625 10.125C5.31 9.81 5.31 9.315 5.625 9C5.94 8.685 6.435 8.685 6.75 9L7.5 9.75L11.25 6C11.565 5.685 12.06 5.685 12.375 6C12.69 6.315 12.69 6.81 12.375 7.125Z" fill="currentColor"/>
        </svg>
        <span>已复制到剪贴板</span>
      </div>
    </div>`;
}

function renderModelCard(model: string, groupName: string): string {
  return `
    <div class="group relative bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-light)] hover:border-[var(--border-medium)] rounded-2xl p-4 cursor-pointer shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px active:scale-[0.98] transition-all duration-200" 
      onclick="copyToClipboard('${model}')">
      <div class="flex items-center space-x-3">
        <img src="${
    getGroupIcon(groupName)
  }" alt="${groupName}" loading="lazy" class="w-9 h-9 rounded-[10px] object-cover flex-shrink-0">
        <div class="flex-1 min-w-0 text-[13px] font-medium text-[var(--text-primary)] leading-snug break-all tracking-tight">${model}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="absolute top-3 right-3 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <path d="M4.5 2H11V8.5M11 2L3 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
}

export function renderGroupSection(groupName: string, models: string[], index: number = 0): string {
  const displayName = getGroupDisplayName(groupName);
  const delayClass = index < 5 ? `delay-${index + 1}` : "";

  return `
    <section class="animate-in ${delayClass} mb-6 rounded-[20px] bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-white)] shadow-[var(--shadow-lg)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-400">
      <div class="flex items-center justify-between p-5 cursor-pointer select-none rounded-t-[20px] hover:bg-[var(--hover-bg)] transition-colors"
        onclick="toggleGroup('${groupName}')">
        <div class="flex items-center space-x-4">
          <div class="w-11 h-11 rounded-[14px] bg-[var(--bg-input)] flex items-center justify-center overflow-hidden">
            <img src="${getGroupIcon(groupName)}" alt="${displayName}" loading="lazy" class="w-7 h-7 object-cover">
          </div>
          <div>
            <h3 class="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">${displayName}</h3>
            <p class="text-[13px] text-[var(--text-secondary)] mt-0.5">${models.length} 个模型</p>
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center transition-all duration-300 hover:bg-[var(--bg-input-hover)]">
          <svg id="icon-${groupName}" width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-[var(--text-secondary)] transition-transform duration-300">
            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div id="content-${groupName}" class="overflow-hidden transition-all duration-400 ease-out max-h-[2000px] opacity-100">
        <div class="px-5 pb-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            ${models.map((model) => renderModelCard(model, groupName)).join("")}
          </div>
        </div>
      </div>
    </section>`;
}

export function renderError(error: string): string {
  return `
    <div class="animate-in delay-2 rounded-[20px] p-10 text-center max-w-[480px] mx-auto mb-12 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-white)] shadow-[var(--shadow-lg)] border-red-500/15">
      <div class="w-14 h-14 rounded-full bg-[#fff2f2] flex items-center justify-center mx-auto mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ff3b30"/>
        </svg>
      </div>
      <h3 class="text-[19px] font-semibold text-[var(--text-primary)] mb-2 tracking-tight">获取模型失败</h3>
      <p class="text-[15px] text-[var(--text-secondary)]">${error}</p>
    </div>`;
}

export function renderEmpty(): string {
  return `
    <div class="animate-in delay-2 rounded-[20px] p-16 text-center max-w-[480px] mx-auto bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-white)] shadow-[var(--shadow-lg)]">
      <div class="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-[var(--text-secondary)]">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/>
        </svg>
      </div>
      <h3 class="text-[19px] font-semibold text-[var(--text-primary)] mb-2 tracking-tight">暂无模型可用</h3>
      <p class="text-[15px] text-[var(--text-secondary)]">请检查 API 配置或稍后重试</p>
    </div>`;
}
