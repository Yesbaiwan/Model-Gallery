import type { AppConfig, GroupRule, SiteConfig } from "../types.ts";
import { groupModels, orderedGroups } from "../config/groupConfig.ts";
import { cssStyles, jsScripts, COLOR_MODE_INIT_SCRIPT } from "./assets.ts";
import { UI_TEXT } from "./messages.ts";
import { DEFAULT_THEME_ID, getTheme, resolveEnabledThemes, type ThemeId } from "./themes.ts";
import {
  renderEmpty,
  renderError,
  renderGroupSection,
  renderHeader,
  renderNotification,
  renderRefreshButton,
  renderSiteSelector,
  renderStyleSelector,
  renderColorModeToggle,
} from "./components.ts";

export function renderPage(
  appConfig: AppConfig,
  site: SiteConfig,
  models: string[] | null,
  error: string | null,
  rules: GroupRule[],
  styleId: ThemeId = DEFAULT_THEME_ID,
): string {
  const theme = getTheme(styleId);
  const fontLinks = theme.fontHref
    ? `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${theme.fontHref}">`
    : "";
  const groupedModels = models ? groupModels(models, rules) : null;
  const groups = groupedModels ? orderedGroups(groupedModels, rules) : [];

  let content: string;
  if (error) content = renderError(error);
  else if (groups.length > 0)
    content = groups
      .map(({ rule, models: groupModels }, index) =>
        renderGroupSection(rule, groupModels, rules, index, theme.copyIcon),
      )
      .join("");
  else content = renderEmpty();

  return `<!DOCTYPE html>
<html lang="zh-CN" data-style="${styleId}" data-theme-transition="${theme.themeTransition}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${UI_TEXT.pageTitle}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">${fontLinks}
  <link rel="preconnect" href="https://registry.npmmirror.com">
  <link rel="preconnect" href="https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com">
  <style>${cssStyles(styleId)}</style>
  <script>${COLOR_MODE_INIT_SCRIPT}</script>
</head>
<body>
  ${renderSiteSelector(appConfig, site.name)}
  ${renderStyleSelector(styleId, resolveEnabledThemes(appConfig.themes))}
  ${renderColorModeToggle()}
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
