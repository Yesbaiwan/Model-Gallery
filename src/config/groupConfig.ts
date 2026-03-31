import type { GroupConfig } from "../types.ts";

export const GROUP_CONFIG: Record<string, GroupConfig> = {
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
    keywords: ["grok", "xai", "x-ai"],
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
    keywords: ["zhipu", "thudm", "glm", "zai", "智谱", "codegeex", "cogview"],
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
    keywords: ["ling", "ring", "百灵", "inclusion", "AntAngelMed"],
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
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/baai.webp",
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

export function getGroupIcon(groupName: string): string {
  return GROUP_CONFIG[groupName]?.icon || GROUP_CONFIG.default.icon;
}

export function getGroupDisplayName(groupName: string): string {
  return GROUP_CONFIG[groupName]?.name || groupName;
}
