// 集中管理的 UI 文案，避免散落硬编码；修改文案只需改这一处。
// 术语约定：「主题」指皮肤层（经典/档案/手绘，配置 themes 数组、DOM data-style）；
// 「明暗」指亮色/暗色模式（DOM data-theme 属性，CSS light-dark() 依赖它）。

export const UI_TEXT = {
  pageTitle: "Model Gallery",
  colorModeToggleLabel: "切换明暗",
  styleSelectorLabel: "切换主题",
  styleNames: {
    classic: "经典",
    archive: "档案",
    handdrawn: "手绘",
  },
  siteSelectorLabel: "切换站点",
  refreshLabel: "刷新",
  copiedToClipboard: "已复制到剪贴板",
  groupCountLabel: "分组",
  modelCountLabel: "模型",
  modelCount: (count: number) => `${count} 个模型`,
  copyModel: (model: string) => `复制 ${model}`,
  siteHomepage: (name: string) => `${name} 主页`,
  siteIcon: (name: string) => `${name} 图标`,
  fetchFailedTitle: "获取模型失败",
  emptyTitle: "暂无模型可用",
  emptyHint: "请检查 API 配置或稍后重试",
  footer: "Model Gallery · 探索 AI 的无限可能",
} as const;

export const ERROR_PAGE_TEXT = {
  methodNotAllowedTitle: "不支持的请求方法",
  methodNotAllowedMessage: "只支持 GET 和 HEAD 请求",
  notFoundTitle: "页面不存在",
  notFoundMessage: "请求的页面不存在",
  siteNotFoundTitle: "站点不存在",
  siteNotFoundMessage: "请求的站点不存在",
  serverErrorTitle: "服务器错误",
  serverErrorMessage: "服务器暂时无法处理请求",
} as const;
