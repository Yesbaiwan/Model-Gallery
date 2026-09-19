import type { AppConfig, GroupRule, SiteConfig } from "../types.ts";
import { groupModels, orderedGroups } from "../config/groupConfig.ts";
import { cssStyles, jsScripts, THEME_INIT_SCRIPT } from "./assets.ts";
import { UI_TEXT } from "./messages.ts";
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

export function renderPage(
  appConfig: AppConfig,
  site: SiteConfig,
  models: string[] | null,
  error: string | null,
  rules: GroupRule[],
): string {
  const groupedModels = models ? groupModels(models, rules) : null;
  const groups = groupedModels ? orderedGroups(groupedModels, rules) : [];

  let content: string;
  if (error) content = renderError(error);
  else if (groups.length > 0)
    content = groups
      .map(({ rule, models: groupModels }, index) => renderGroupSection(rule, groupModels, rules, index))
      .join("");
  else content = renderEmpty();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${UI_TEXT.pageTitle}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://registry.npmmirror.com">
  <link rel="preconnect" href="https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com">
  <style>${cssStyles()}</style>
  <script>${THEME_INIT_SCRIPT}</script>
</head>
<body>
  ${renderSiteSelector(appConfig, site.name)}
  ${renderThemeToggle()}
  ${renderRefreshButton(site.name)}
  <div class="shell">
    <main id="main" class="container">
      ${renderHeader(site, groups.length, models?.length || 0)}
      ${renderNotification()}
      ${content}
    </main>
    <footer class="page-footer">
      <p class="footer-text">${UI_TEXT.footer}</p>
    </footer>
  </div>
  <script>${jsScripts()}</script>
</body>
</html>`;
}
