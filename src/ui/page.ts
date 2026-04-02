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
  renderThemeToggle,
} from "./components.ts";
import { CSS_STYLES } from "./styles.ts";
import { JS_SCRIPTS } from "./scripts.ts";

export function renderPage(state: AppState, models: string[] | null, error: string | null): string {
  const groupedModels = models ? groupModels(models) : null;
  const groupNames = groupedModels
    ? Object.keys(groupedModels).sort((a, b) => groupedModels[b].length - groupedModels[a].length)
    : [];

  let content: string;
  if (error) {
    content = renderError(error);
  } else if (groupedModels && groupNames.length > 0) {
    content = groupNames.map((name, index) => renderGroupSection(name, groupedModels[name], index))
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
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://registry.npmmirror.com">
  <link rel="preconnect" href="https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${CSS_STYLES}</style>
</head>
<body>
  ${renderSiteSelector(state)}
  ${renderThemeToggle()}
  ${renderRefreshButton()}
  <div class="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-[1200px] mx-auto">
      ${renderHeader(state, groupNames.length, models?.length || 0)}
      ${renderNotification()}
      ${content}
      <footer class="mt-20 pb-8 text-center">
        <p class="text-[12px] text-[var(--text-secondary)]">Model Gallery · 探索 AI 的无限可能</p>
      </footer>
    </div>
  </div>
  <script>${JS_SCRIPTS}</script>
</body>
</html>`;
}
