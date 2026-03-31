import type { AppState } from "../state.ts";
import { groupModels } from "../services/models.ts";
import {
  renderEmpty,
  renderError,
  renderGroupSection,
  renderHeader,
  renderNotification,
  renderRefreshButton,
  renderSiteSelector,
} from "./components.ts";

const CSS_STYLES = `
  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
    background: linear-gradient(180deg, #f5f5f7 0%, #fafafa 100%);
    min-height: 100vh;
    color: #1d1d1f;
  }
  .logo-container { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .logo-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .group:hover .logo-container {
    transform: scale(1.08) rotate(-2deg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .group:hover .logo-container::before { opacity: 1; }
  .group:active .logo-container { transform: scale(0.95) rotate(0deg); transition: transform 0.1s ease; }
  .notification {
    background: rgba(29, 29, 31, 0.92);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  .notification-hidden { transform: translateX(calc(100% + 2rem)) translateY(-50%); opacity: 0; }
  .notification-visible { transform: translateX(0) translateY(0); opacity: 1; }
  .collapsed { max-height: 0 !important; opacity: 0 !important; }
  .icon-rotated { transform: rotate(-180deg); }
`;

const JS_SCRIPTS = `
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.getElementById('notification');
      notification.classList.remove('notification-hidden');
      notification.classList.add('notification-visible');
      setTimeout(() => {
        notification.classList.remove('notification-visible');
        notification.classList.add('notification-hidden');
      }, 2200);
    }).catch(err => console.error('复制失败:', err));
  }

  function toggleGroup(groupName) {
    const content = document.getElementById('content-' + groupName);
    const icon = document.getElementById('icon-' + groupName);
    content.classList.toggle('collapsed');
    icon.classList.toggle('icon-rotated');
  }

  let siteSelectorOpen = false;

  function toggleSiteSelector() {
    const dropdown = document.getElementById('siteSelectorDropdown');
    siteSelectorOpen = !siteSelectorOpen;
    dropdown.classList.toggle('opacity-0', !siteSelectorOpen);
    dropdown.classList.toggle('invisible', !siteSelectorOpen);
    dropdown.classList.toggle('opacity-100', siteSelectorOpen);
    dropdown.classList.toggle('visible', siteSelectorOpen);
  }

  function switchSite(siteName) {
    fetch('/switch-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: siteName })
    }).then(() => window.location.reload())
      .catch(err => console.error('切换站点失败:', err));
  }

  document.addEventListener('click', (e) => {
    const selector = document.getElementById('siteSelectorBtn');
    const dropdown = document.getElementById('siteSelectorDropdown');
    if (siteSelectorOpen && selector && dropdown && 
        !selector.contains(e.target) && !dropdown.contains(e.target)) {
      toggleSiteSelector();
    }
  });
`;

export function renderPage(
  state: AppState,
  models: string[] | null,
  error: string | null,
): string {
  const groupedModels = models ? groupModels(models) : null;
  const groupNames = groupedModels
    ? Object.keys(groupedModels).sort(
      (a, b) => groupedModels[b].length - groupedModels[a].length,
    )
    : [];

  let content: string;
  if (error) {
    content = renderError(error);
  } else if (groupedModels && groupNames.length > 0) {
    content = groupNames
      .map((name) => renderGroupSection(name, groupedModels[name]))
      .join("");
  } else {
    content = renderEmpty();
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Model Gallery</title>
  <link rel="icon" href="https://gh-proxy.com/https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/Model-Gallery/main/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://registry.npmmirror.com">
  <link rel="preconnect" href="https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${CSS_STYLES}</style>
</head>
<body>
  ${renderSiteSelector(state)}
  ${renderRefreshButton()}
  <div class="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-[1200px] mx-auto">
      ${renderHeader(state, groupNames.length, models?.length || 0)}
      ${renderNotification()}
      ${content}
      <footer class="mt-20 pb-8 text-center">
        <p class="text-[12px] text-[#86868b]">Model Gallery · 探索 AI 的无限可能</p>
      </footer>
    </div>
  </div>
  <script>${JS_SCRIPTS}</script>
</body>
</html>`;
}
