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
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/kimi-color.webp",
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
    keywords: ["silicon", "siliconflow", "siliconcloud", "硅基"],
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
  default: {
    // 默认组
    name: "其他",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp",
  },
};

// ==================== 工具函数 ====================

/**
 * 根据关键词对模型进行分组
 * @param models 模型名称数组
 * @returns 分组后的对象，键为组名，值为模型数组
 */
function groupModelsByKeywords(models) {
  const groups = {};

  models.forEach((model) => {
    const modelLower = model.toLowerCase();
    let assignedGroupName = null;

    // 按照定义的顺序遍历组，进行匹配
    for (const groupName in GROUP_CONFIG) {
      const config = GROUP_CONFIG[groupName];
      // 确保 'default' 组不会被关键词匹配
      if (groupName === "default" || !config.keywords) continue;

      if (config.keywords.some((keyword) => modelLower.includes(keyword.toLowerCase()))) {
        assignedGroupName = groupName;
        break; // 匹配成功后，立即停止遍历
      }
    }

    // 如果没有匹配到任何组，则分配给默认组 'default'
    const finalGroupName = assignedGroupName || "default";

    if (!groups[finalGroupName]) {
      groups[finalGroupName] = [];
    }
    groups[finalGroupName].push(model);
  });

  return groups;
}

/**
 * 根据组名获取图标
 * @param groupName 组名
 * @returns 图标URL
 */
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
function generateHeader(CONFIG) {
  return `
        <div class="text-center mb-10">
            <a href="${CONFIG.SITE_LINK}" target="_blank" class="mb-6 inline-block">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-xl hover:scale-105 transition-transform">
                    <img src="${CONFIG.SITE_IMAGE}" 
                         alt="AI助手" 
                         class="w-full h-full rounded-xl object-cover bg-white">
                </div>
            </a>
            <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${CONFIG.SITE_NAME}
            </h1>
        </div>
    `;
}

function generateModelCard(model, groupName) {
  return `
        <div class="group relative bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer" 
             onclick="copyToClipboard('${model}')">
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <img src="${getGroupIcon(groupName)}" 
                         alt="${groupName}" 
                         class="w-8 h-8 rounded-lg object-cover bg-gray-50 border border-gray-200">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 text-sm leading-tight break-all">${model}</div>
                </div>
            </div>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-copy text-gray-400 text-xs"></i>
            </div>
        </div>
    `;
}

function generateGroupSection(groupName, models) {
  const displayName = GROUP_CONFIG[groupName]?.name || groupName;
  return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-5 cursor-pointer hover:bg-gray-50 transition-colors" 
                 onclick="toggleGroup('${groupName}')">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <img src="${getGroupIcon(groupName)}" 
                                 alt="${displayName}" 
                                 class="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-200 shadow-sm">
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${displayName}</h3>
                            <p class="text-sm text-gray-500">${models.length} 个模型</p>
                        </div>
                    </div>
                    <div class="text-gray-400">
                        <i id="icon-${groupName}" class="fas fa-chevron-down transition-transform duration-200"></i>
                    </div>
                </div>
            </div>
            
            <div id="content-${groupName}" class="border-t border-gray-100">
                <div class="p-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        ${models.map((model) => generateModelCard(model, groupName)).join("")}
                    </div>
                </div>
            </div>
        </div>
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <style>
        body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
        .glass-effect { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
        .notification-hidden { transform: translateX(calc(100% + 2rem)); opacity: 0; }
        .notification-visible { transform: translateX(0); opacity: 1; }
    </style>
</head>
<body class="font-sans">
    <div class="min-h-screen py-8 px-4">
        <div class="max-w-7xl mx-auto">
            ${generateHeader(CONFIG)}
            
            ${
              groupedModels
                ? `
            <div class="glass-effect rounded-2xl p-4 mb-8 inline-block mx-auto block text-center shadow-lg">
                <div class="flex items-center justify-center space-x-6 text-sm">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-layer-group text-blue-600"></i>
                        <span class="text-gray-700">${groupNames.length} 个渠道</span>
                    </div>
                    <div class="w-px h-4 bg-gray-300"></div>
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-microchip text-purple-600"></i>
                        <span class="text-gray-700">${models.length} 个模型</span>
                    </div>
                </div>
            </div>
            `
                : ""
            }
            
            <div id="notification" class="notification-hidden fixed top-6 right-6 px-5 py-3 rounded-xl z-50 text-white font-medium bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl transition-all duration-300 ease-out">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check-circle"></i>
                    <span>已复制到剪贴板!</span>
                </div>
            </div>
            
            ${
              error
                ? `
            <div class="bg-white rounded-2xl p-8 text-center max-w-2xl mx-auto mb-8 shadow-lg border border-red-100">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">连接错误</h3>
                <p class="text-gray-600">${error}</p>
            </div>
            `
                : ""
            }
            
            ${
              groupedModels
                ? `
            <div class="space-y-6">
                ${groupNames.map((groupName) => generateGroupSection(groupName, groupedModels[groupName])).join("")}
            </div>
            `
                : `
            <div class="bg-white rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-lg">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-robot text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无模型可用</h3>
                <p class="text-gray-500">请检查API配置或稍后重试</p>
            </div>
            `
            }
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
                }, 2000);
            }).catch(err => console.error('复制失败:', err));
        }

        function toggleGroup(groupName) {
            const content = document.getElementById('content-' + groupName);
            const icon = document.getElementById('icon-' + groupName);
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'none';
                icon.style.transform = 'rotate(-90deg)';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[id^="content-"]').forEach(el => el.style.display = 'block');
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
