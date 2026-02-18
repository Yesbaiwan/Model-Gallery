// ==================== 类型定义 ====================

interface GroupConfig {
  name?: string;
  icon: string;
  keywords?: string[];
}

interface SiteConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  apiEndpoint: string;
  externalUrl: string;
  iconUrl: string;
}

interface AppConfig {
  sites: SiteConfig[];
  defaultSite: string;
}

interface ModelResponse {
  data?: { id: string }[];
}

// ==================== 分组配置 ====================

const GROUP_CONFIG: Record<string, GroupConfig> = {
  OpenAI: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp",
    keywords: ["gpt", "dall", "chatgpt", "codex"],
  },
  Gemini: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/gemini-color.webp",
    keywords: ["gemini", "google", "gemma", "banana"],
  },
  Claude: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/claude-color.webp",
    keywords: ["claude", "anthropic", "opus", "sonnet", "haiku"],
  },
  MiniMax: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/minimax-color.webp",
    keywords: ["minimax", "hailuo"],
  },
  Grok: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/grok.webp",
    keywords: ["grok", "xai"],
  },
  Nvidia: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/nvidia-color.webp",
    keywords: ["nvidia"],
  },
  Meta: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/meta-color.webp",
    keywords: ["llama", "meta"],
  },
  Groq: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/groq.webp",
    keywords: ["groq"],
  },
  Qwen: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/qwen-color.webp",
    keywords: ["qwen", "qvq", "qwq", "wan", "tongyi", "通义"],
  },
  智谱: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/zhipu-color.webp",
    keywords: ["zhipu", "thudm", "glm", "zai", "智谱"],
  },
  DeepSeek: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/deepseek-color.webp",
    keywords: ["deepseek"],
  },
  Kimi: {
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/moonshotai_new.png",
    keywords: ["kimi", "moonshot"],
  },
  混元: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/hunyuan-color.webp",
    keywords: ["hunyuan", "tencent"],
  },
  Perplexity: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/perplexity-color.webp",
    keywords: ["pplx", "perplexity"],
  },
  零一万物: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/yi-color.webp",
    keywords: ["yi"],
  },
  LongCat: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/longcat-color.webp",
    keywords: ["longcat"],
  },
  百灵: {
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/ling.png",
    keywords: ["ling", "ring", "百灵"],
  },
  Mistral: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/mistral-color.webp",
    keywords: ["mistral", "codestral"],
  },
  豆包: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/doubao-color.webp",
    keywords: ["doubao", "豆包", "seed"],
  },
  即梦: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/jimeng-color.webp",
    keywords: ["jimeng", "即梦"],
  },
  BAAI: {
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/BAAI.svg",
    keywords: ["baai", "bge"],
  },
  小米: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/xiaomimimo.webp",
    keywords: ["xiaomi", "小米", "mimo"],
  },
  文心一言: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/wenxin-color.webp",
    keywords: ["yiyan", "一言", "wenxin", "文心", "baidu", "百度", "ernie"],
  },
  快手: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/kwaipilot-color.webp",
    keywords: ["kat", "kolors", "kling", "快手", "可图", "可灵"],
  },
  阶跃星辰: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/stepfun-color.webp",
    keywords: ["step", "阶跃星辰"],
  },
  硅基流动: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/siliconcloud-color.webp",
    keywords: ["silicon", "硅基"],
  },
  default: {
    name: "其他",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp",
  },
};

// ==================== 配置管理 ====================

const DEFAULT_SITE_CONFIG = {
  apiEndpoint: "/v1/models",
  externalUrl: "https://github.com/ZhuBaiwan-oOZZXX/Model-Gallery",
  iconUrl: "https://docs.newapi.pro/assets/logo.png",
};

async function loadConfig(): Promise<AppConfig> {
  const configFromEnv = Deno.env.get("CONFIG_JSON");

  if (configFromEnv) {
    try {
      return JSON.parse(configFromEnv);
    } catch {
      return { sites: [], defaultSite: "" };
    }
  }

  try {
    const configText = await Deno.readTextFile("./config.json");
    return JSON.parse(configText);
  } catch {
    return { sites: [], defaultSite: "" };
  }
}

function normalizeConfig(config: AppConfig): AppConfig {
  const sites = config.sites.map((site) => ({
    ...DEFAULT_SITE_CONFIG,
    ...site,
  }));

  const defaultSite = config.defaultSite && sites.find((s) => s.name === config.defaultSite) ? config.defaultSite : sites[0]?.name ?? "";

  return { sites, defaultSite };
}

// ==================== 站点状态 ====================

const appConfig = normalizeConfig(await loadConfig());
let currentSiteName = appConfig.defaultSite;

function getCurrentSite(): SiteConfig | null {
  return appConfig.sites.find((s) => s.name === currentSiteName) || appConfig.sites[0] || null;
}

function setCurrentSite(siteName: string): boolean {
  if (appConfig.sites.some((s) => s.name === siteName)) {
    currentSiteName = siteName;
    return true;
  }
  return false;
}

// ==================== 模型分组 ====================

function groupModels(models: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const model of models) {
    const modelLower = model.toLowerCase();
    let groupName = "default";

    for (const [name, config] of Object.entries(GROUP_CONFIG)) {
      if (name === "default") continue;
      if (config.keywords?.some((kw) => modelLower.includes(kw.toLowerCase()))) {
        groupName = name;
        break;
      }
    }

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(model);
  }

  return groups;
}

function getGroupIcon(groupName: string): string {
  return GROUP_CONFIG[groupName]?.icon || GROUP_CONFIG.default.icon;
}

function getGroupDisplayName(groupName: string): string {
  return GROUP_CONFIG[groupName]?.name || groupName;
}

// ==================== API 调用 ====================

async function fetchModels(): Promise<{ models: string[] | null; error: string | null }> {
  const site = getCurrentSite();
  if (!site) {
    return { models: null, error: "没有可用的站点配置" };
  }

  try {
    const url = `${site.apiUrl.replace(/\/$/, "")}/${site.apiEndpoint.replace(/^\//, "")}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${site.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { models: null, error: `获取模型失败: ${response.status} ${response.statusText}` };
    }

    const data: ModelResponse = await response.json();

    if (data?.data && Array.isArray(data.data)) {
      return { models: data.data.map((m) => m.id), error: null };
    }

    return { models: null, error: "API 响应格式不符合预期" };
  } catch (error) {
    return { models: null, error: (error as Error).message };
  }
}

// ==================== HTML 模板 ====================

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

function renderSiteSelector(): string {
  if (appConfig.sites.length <= 1) return "";

  const otherSites = appConfig.sites.filter((s) => s.name !== currentSiteName);

  return `
    <div class="fixed top-4 left-4 z-50">
      <button id="siteSelectorBtn" onclick="toggleSiteSelector()"
        class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 hover:bg-white border border-black/[0.06] hover:border-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-[#1d1d1f]">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div id="siteSelectorDropdown" 
        class="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.12)] opacity-0 invisible transition-all duration-200">
        ${otherSites
          .map(
            (site) => `
          <button onclick="switchSite('${site.name}')" 
            class="w-full text-left px-4 py-3 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] first:rounded-t-xl last:rounded-b-xl transition-colors">
            ${site.name}
          </button>
        `
          )
          .join("")}
      </div>
    </div>`;
}

function renderHeader(groupCount: number, modelCount: number): string {
  const site = getCurrentSite();
  if (!site) return "";

  return `
    <header class="flex items-center justify-between mb-10 rounded-[20px] px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div class="flex items-center space-x-5">
        <a href="${site.externalUrl}" target="_blank" class="group">
          <div class="logo-container w-16 h-16 rounded-[18px] bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden relative">
            <img src="${site.iconUrl}" alt="站点图标" loading="lazy" class="w-full h-full rounded-[14px] object-cover">
          </div>
        </a>
        <h1 class="text-2xl font-semibold tracking-tight text-[#1d1d1f]">${site.name}</h1>
      </div>
      <div class="flex items-center space-x-8">
        <div class="text-right">
          <div class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">${groupCount}</div>
          <div class="text-xs text-[#86868b] mt-0.5">渠道</div>
        </div>
        <div class="w-px h-10 bg-[#d2d2d7]"></div>
        <div class="text-right">
          <div class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">${modelCount}</div>
          <div class="text-xs text-[#86868b] mt-0.5">模型</div>
        </div>
      </div>
    </header>`;
}

function renderModelCard(model: string, groupName: string): string {
  return `
    <div class="group relative bg-white/60 hover:bg-white/95 border border-black/[0.04] hover:border-black/[0.08] rounded-2xl p-4 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-px active:scale-[0.98] transition-all duration-200" 
      onclick="copyToClipboard('${model}')">
      <div class="flex items-center space-x-3">
        <img src="${getGroupIcon(groupName)}" alt="${groupName}" loading="lazy" class="w-9 h-9 rounded-[10px] object-cover flex-shrink-0">
        <div class="flex-1 min-w-0 text-[13px] font-medium text-[#1d1d1f] leading-snug break-all tracking-tight">${model}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="absolute top-3 right-3 text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <path d="M4.5 2H11V8.5M11 2L3 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
}

function renderGroupSection(groupName: string, models: string[]): string {
  const displayName = getGroupDisplayName(groupName);

  return `
    <section class="mb-6 rounded-[20px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-400">
      <div class="flex items-center justify-between p-5 cursor-pointer select-none rounded-t-[20px] hover:bg-black/[0.02] transition-colors"
        onclick="toggleGroup('${groupName}')">
        <div class="flex items-center space-x-4">
          <div class="w-11 h-11 rounded-[14px] bg-[#f5f5f7] flex items-center justify-center overflow-hidden">
            <img src="${getGroupIcon(groupName)}" alt="${displayName}" loading="lazy" class="w-7 h-7 object-cover">
          </div>
          <div>
            <h3 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">${displayName}</h3>
            <p class="text-[13px] text-[#86868b] mt-0.5">${models.length} 个模型</p>
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center transition-all duration-300 hover:bg-[#e8e8ed]">
          <svg id="icon-${groupName}" width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-[#86868b] transition-transform duration-300">
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

function renderError(error: string): string {
  return `
    <div class="rounded-[20px] p-10 text-center max-w-[480px] mx-auto mb-12 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-red-500/15">
      <div class="w-14 h-14 rounded-full bg-[#fff2f2] flex items-center justify-center mx-auto mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ff3b30"/>
        </svg>
      </div>
      <h3 class="text-[19px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">获取模型失败</h3>
      <p class="text-[15px] text-[#86868b]">${error}</p>
    </div>`;
}

function renderEmpty(): string {
  return `
    <div class="rounded-[20px] p-16 text-center max-w-[480px] mx-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div class="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-[#86868b]">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/>
        </svg>
      </div>
      <h3 class="text-[19px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">暂无模型可用</h3>
      <p class="text-[15px] text-[#86868b]">请检查 API 配置或稍后重试</p>
    </div>`;
}

function renderNotification(): string {
  return `
    <div id="notification" class="notification notification-hidden fixed top-6 right-6 px-5 py-3.5 z-50 text-white text-sm font-medium rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-400 ease-out">
      <div class="flex items-center space-x-2.5">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1422 4.85775 16.5 9 16.5C13.1422 16.5 16.5 13.1422 16.5 9C16.5 4.85775 13.1422 1.5 9 1.5ZM12.375 7.125L8.0625 11.4375C7.905 11.595 7.7025 11.6715 7.5 11.6715C7.2975 11.6715 7.095 11.595 6.9375 11.4375L5.625 10.125C5.31 9.81 5.31 9.315 5.625 9C5.94 8.685 6.435 8.685 6.75 9L7.5 9.75L11.25 6C11.565 5.685 12.06 5.685 12.375 6C12.69 6.315 12.69 6.81 12.375 7.125Z" fill="white"/>
        </svg>
        <span>已复制到剪贴板</span>
      </div>
    </div>`;
}

function renderPage(models: string[] | null, error: string | null): string {
  const groupedModels = models ? groupModels(models) : null;
  const groupNames = groupedModels ? Object.keys(groupedModels).sort((a, b) => groupedModels[b].length - groupedModels[a].length) : [];

  let content: string;
  if (error) {
    content = renderError(error);
  } else if (groupedModels && groupNames.length > 0) {
    content = groupNames.map((name) => renderGroupSection(name, groupedModels[name])).join("");
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
  ${renderSiteSelector()}
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-[1200px] mx-auto">
      ${renderHeader(groupNames.length, models?.length || 0)}
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

// ==================== HTTP 服务 ====================

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/switch-site" && req.method === "POST") {
    try {
      const body = await req.json();
      const success = setCurrentSite(body.site);
      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 400,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (url.pathname === "/") {
    const { models, error } = await fetchModels();
    return new Response(renderPage(models, error), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response("未找到页面", { status: 404 });
});
