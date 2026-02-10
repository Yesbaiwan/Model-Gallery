// 图标和分组配置
// key 将作为组名，value 包含图标和用于匹配的关键词
const GROUP_CONFIG = {
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
    keywords: ["minimax"],
  },
  Grok: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/grok.webp",
    keywords: ["grok", "xai"],
  },
  Nvidia: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/nvidia-color.webp",
    keywords: ["nvidia"],
  },
  Llama: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/ollama.webp",
    keywords: ["ollama", "llama", "meta"],
  },
  Groq: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/groq.webp",
    keywords: ["groq"],
  },
  Qwen: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/qwen-color.webp",
    keywords: ["qwen", "tongyi", "wan"],
  },
  智谱: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/zhipu-color.webp",
    keywords: ["zhipu", "thudm", "glm", "zai"],
  },
  DeepSeek: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/deepseek-color.webp",
    keywords: ["deepseek"],
  },
  Kimi: {
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/moonshotai_new.png",
    keywords: ["kimi", "moonshot"],
  },
  腾讯混元: {
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
  硅基流动: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/siliconcloud-color.webp",
    keywords: ["silicon", "硅基"],
  },
  LongCat: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/longcat-color.webp",
    keywords: ["longcat"],
  },
  百灵: {
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/ling.png",
    keywords: ["Ling", "Ring", "百灵"],
  },
  Mistral: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/mistral-color.webp",
    keywords: ["mistral", "codestral"],
  },
  豆包: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/doubao-color.webp",
    keywords: ["doubao", "豆包", "seed"],
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
  阶跃星辰: {
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/stepfun-color.webp",
    keywords: ["step", "阶跃星辰"],
  },
  default: {
    name: "其他",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp",
  },
};

// ==================== 工具函数 ====================

function groupModelsByKeywords(models) {
  const groups = {};

  models.forEach((model) => {
    const modelLower = model.toLowerCase();
    let assignedGroupName = null;

    for (const groupName in GROUP_CONFIG) {
      const config = GROUP_CONFIG[groupName];
      if (groupName === "default" || !config.keywords) continue;

      if (config.keywords.some((keyword) => modelLower.includes(keyword.toLowerCase()))) {
        assignedGroupName = groupName;
        break;
      }
    }

    const finalGroupName = assignedGroupName || "default";

    if (!groups[finalGroupName]) {
      groups[finalGroupName] = [];
    }
    groups[finalGroupName].push(model);
  });

  return groups;
}

function getGroupIcon(groupName) {
  return GROUP_CONFIG[groupName]?.icon || GROUP_CONFIG.default.icon;
}

// ==================== API 调用 ====================
async function fetchModels(CONFIG) {
  try {
    const response = await fetch(CONFIG.API_URL, {
      headers: {
        Authorization: `Bearer ${CONFIG.API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取模型失败: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.data && Array.isArray(data.data)) {
      const models = data.data.map((model) => model.id);
      return { models, error: null };
    }

    return { models: null, error: "API响应格式不符合预期" };
  } catch (error) {
    return { models: null, error: error.message };
  }
}

// ==================== HTML 模板生成 ====================
function generateHeader(CONFIG, groupCount, modelCount) {
  return `
        <header class="flex items-center justify-between mb-10 rounded-[20px] px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div class="flex items-center space-x-5">
                <a href="${CONFIG.SITE_LINK}" target="_blank" class="group">
                    <div class="logo-container w-16 h-16 rounded-[18px] bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden relative">
                        <img src="${CONFIG.SITE_IMAGE}" alt="AI助手" class="w-full h-full rounded-[14px] object-cover">
                    </div>
                </a>
                <h1 class="text-2xl font-semibold tracking-tight text-[#1d1d1f]">${CONFIG.SITE_NAME}</h1>
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
        </header>
    `;
}

function generateModelCard(model, groupName) {
  return `
        <div class="group relative bg-white/60 hover:bg-white/95 border border-black/[0.04] hover:border-black/[0.08] rounded-2xl p-4 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-px active:scale-[0.98] transition-all duration-200" 
             onclick="copyToClipboard('${model}')">
            <div class="flex items-center space-x-3">
                <img src="${getGroupIcon(groupName)}" alt="${groupName}" class="w-9 h-9 rounded-[10px] object-cover flex-shrink-0">
                <div class="flex-1 min-w-0 text-[13px] font-medium text-[#1d1d1f] leading-snug break-all tracking-tight">${model}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="absolute top-3 right-3 text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <path d="M4.5 2H11V8.5M11 2L3 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    `;
}

function generateGroupSection(groupName, models) {
  const displayName = GROUP_CONFIG[groupName]?.name || groupName;
  return `
        <section class="mb-6 rounded-[20px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-400">
            <div class="flex items-center justify-between p-5 cursor-pointer select-none rounded-t-[20px] hover:bg-black/[0.02] transition-colors"
                 onclick="toggleGroup('${groupName}')">
                <div class="flex items-center space-x-4">
                    <div class="w-11 h-11 rounded-[14px] bg-[#f5f5f7] flex items-center justify-center overflow-hidden">
                        <img src="${getGroupIcon(groupName)}" alt="${displayName}" class="w-7 h-7 object-cover">
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
                        ${models.map((model) => generateModelCard(model, groupName)).join("")}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function generateHtml(CONFIG, models, error) {
  const groupedModels = models ? groupModelsByKeywords(models) : null;
  const groupNames = groupedModels
    ? Object.keys(groupedModels).sort((a, b) => groupedModels[b].length - groupedModels[a].length)
    : [];

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.SITE_NAME}</title>
    <link rel="icon" href="${CONFIG.SITE_IMAGE}" type="image/x-icon">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', sans-serif;
            background: linear-gradient(180deg, #f5f5f7 0%, #fafafa 100%);
            min-height: 100vh;
            color: #1d1d1f;
        }
        
        .logo-container {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
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
        
        .group:hover .logo-container::before {
            opacity: 1;
        }
        
        .group:active .logo-container {
            transform: scale(0.95) rotate(0deg);
            transition: transform 0.1s ease;
        }
        
        .notification {
            background: rgba(29, 29, 31, 0.92);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
        
        .notification-hidden { 
            transform: translateX(calc(100% + 2rem)) translateY(-50%); 
            opacity: 0; 
        }
        
        .notification-visible { 
            transform: translateX(0) translateY(0); 
            opacity: 1; 
        }
        
        .collapsed {
            max-height: 0 !important;
            opacity: 0 !important;
        }
        
        .icon-rotated {
            transform: rotate(-180deg);
        }
    </style>
</head>
<body>
    <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-[1200px] mx-auto">
            ${generateHeader(CONFIG, groupNames.length, models?.length || 0)}
            
            <div id="notification" class="notification notification-hidden fixed top-6 right-6 px-5 py-3.5 z-50 text-white text-sm font-medium rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-400 ease-out">
                <div class="flex items-center space-x-2.5">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1422 4.85775 16.5 9 16.5C13.1422 16.5 16.5 13.1422 16.5 9C16.5 4.85775 13.1422 1.5 9 1.5ZM12.375 7.125L8.0625 11.4375C7.905 11.595 7.7025 11.6715 7.5 11.6715C7.2975 11.6715 7.095 11.595 6.9375 11.4375L5.625 10.125C5.31 9.81 5.31 9.315 5.625 9C5.94 8.685 6.435 8.685 6.75 9L7.5 9.75L11.25 6C11.565 5.685 12.06 5.685 12.375 6C12.69 6.315 12.69 6.81 12.375 7.125Z" fill="white"/>
                    </svg>
                    <span>已复制到剪贴板</span>
                </div>
            </div>
            
            ${
              error
                ? `
            <div class="rounded-[20px] p-10 text-center max-w-[480px] mx-auto mb-12 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-red-500/15">
                <div class="w-14 h-14 rounded-full bg-[#fff2f2] flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ff3b30"/>
                    </svg>
                </div>
                <h3 class="text-[19px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">连接错误</h3>
                <p class="text-[15px] text-[#86868b] leading-relaxed">${error}</p>
            </div>
            `
                : ""
            }
            
            ${
              groupedModels
                ? `
            <div class="space-y-4">
                ${groupNames.map((groupName) => generateGroupSection(groupName, groupedModels[groupName])).join("")}
            </div>
            `
                : `
            <div class="rounded-[20px] p-16 text-center max-w-[480px] mx-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div class="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-[#86868b]">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/>
                    </svg>
                </div>
                <h3 class="text-[19px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">暂无模型可用</h3>
                <p class="text-[15px] text-[#86868b]">请检查API配置或稍后重试</p>
            </div>
            `
            }
            
            <footer class="mt-20 pb-8 text-center">
                <p class="text-[12px] text-[#86868b]">Model Gallery · 探索 AI 的无限可能</p>
            </footer>
        </div>
    </div>
    
    <script>
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
            
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                icon.classList.remove('icon-rotated');
            } else {
                content.classList.add('collapsed');
                icon.classList.add('icon-rotated');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            // All groups expanded by default
        });
    </script>
</body>
</html>
`;
}

// ==================== Cloudflare Worker 入口 ====================

function buildApiUrl(baseUrl, endpoint) {
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const trimmedEndpoint = endpoint.replace(/^\//, "");
  return `${trimmedBase}/${trimmedEndpoint}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const baseUrl = env.API_URL || "https://api.openai.com";
      const apiEndpoint = env.API_ENDPOINT || "v1/models";

      const CONFIG = {
        API_URL: buildApiUrl(baseUrl, apiEndpoint),
        API_ENDPOINT: apiEndpoint,
        API_KEY: env.API_KEY || "",
        SITE_NAME: env.SITE_NAME || "Model Gallery",
        SITE_LINK: env.SITE_LINK || "https://github.com/ZhuBaiwan-oOZZXX/Model-Gallery",
        SITE_IMAGE: env.SITE_IMAGE || "https://docs.newapi.pro/assets/logo.png",
      };

      const { models, error } = await fetchModels(CONFIG);
      const html = generateHtml(CONFIG, models, error);
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }
    return new Response("未找到页面", { status: 404 });
  },
};
