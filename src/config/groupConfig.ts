import type { CustomGroupRule, GroupConfig } from "../types.ts";

export interface GroupRule extends GroupConfig {
  name: string;
}

const DEFAULT_ICON = "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp";

export const GROUP_RULES: GroupRule[] = [
  { name: "OpenAI", icon: DEFAULT_ICON, keywords: ["gpt", "dall", "chatgpt", "codex"] },
  {
    name: "Gemini",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/gemini-color.webp",
    keywords: ["gemini", "google", "gemma", "banana"],
  },
  {
    name: "Claude",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/claude-color.webp",
    keywords: ["claude", "anthropic", "opus", "sonnet", "haiku"],
  },
  {
    name: "MiniMax",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/minimax-color.webp",
    keywords: ["minimax", "hailuo"],
  },
  {
    name: "Grok",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/grok.webp",
    keywords: ["grok", "xai", "x-ai"],
  },
  {
    name: "Meta",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/meta-color.webp",
    keywords: ["llama", "meta"],
  },
  {
    name: "Qwen",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/qwen-color.webp",
    keywords: ["qwen", "qvq", "qwq", "wan", "tongyi", "通义"],
  },
  {
    name: "智谱",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/zhipu-color.webp",
    keywords: ["zhipu", "thudm", "glm", "zai", "智谱", "codegeex", "cogview"],
  },
  {
    name: "DeepSeek",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/deepseek-color.webp",
    keywords: ["deepseek"],
  },
  {
    name: "Kimi",
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/moonshotai_new.png",
    keywords: ["kimi", "moonshot"],
  },
  {
    name: "混元",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/hunyuan-color.webp",
    keywords: ["hunyuan", "tencent"],
  },
  {
    name: "Perplexity",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/perplexity-color.webp",
    keywords: ["pplx", "perplexity"],
  },
  {
    name: "零一万物",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/yi-color.webp",
    keywords: ["yi"],
  },
  {
    name: "LongCat",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/longcat-color.webp",
    keywords: ["longcat"],
  },
  {
    name: "百灵",
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/ling.png",
    keywords: ["ling", "ring", "百灵", "inclusion", "AntAngelMed"],
  },
  {
    name: "Mistral",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/mistral-color.webp",
    keywords: ["mistral", "codestral"],
  },
  {
    name: "豆包",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/doubao-color.webp",
    keywords: ["doubao", "豆包", "seed"],
  },
  {
    name: "即梦",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/jimeng-color.webp",
    keywords: ["jimeng", "即梦"],
  },
  {
    name: "BAAI",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/baai.webp",
    keywords: ["baai", "bge"],
  },
  {
    name: "小米",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/xiaomimimo.webp",
    keywords: ["xiaomi", "小米", "mimo"],
  },
  {
    name: "文心一言",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/wenxin-color.webp",
    keywords: ["yiyan", "一言", "wenxin", "文心", "baidu", "百度", "ernie"],
  },
  {
    name: "快手",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/kwaipilot-color.webp",
    keywords: ["kat", "kolors", "kling", "快手", "可图", "可灵"],
  },
  {
    name: "阶跃星辰",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/stepfun-color.webp",
    keywords: ["step", "阶跃星辰"],
  },
  {
    name: "硅基流动",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/siliconcloud-color.webp",
    keywords: ["silicon", "硅基"],
  },
  {
    name: "Groq",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/groq.webp",
    keywords: ["groq"],
  },
  {
    name: "Nvidia",
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/nvidia-color.webp",
    keywords: ["nvidia"],
  },
  { name: "default", icon: DEFAULT_ICON },
];

export const BUILTIN_GROUP_NAMES = GROUP_RULES.map((r) => r.name);

export function getGroupIcon(groupName: string): string {
  const rule = GROUP_RULES.find((r) => r.name === groupName);
  return rule?.icon || DEFAULT_ICON;
}

export function getGroupDisplayName(groupName: string): string {
  if (groupName === "default") return "其他";
  const rule = GROUP_RULES.find((r) => r.name === groupName);
  return rule?.name || groupName;
}

export function applyCustomGroupRules(customRules?: CustomGroupRule[]): void {
  if (!customRules || customRules.length === 0) return;

  const firstRules: GroupRule[] = [];
  const beforeRules: Array<{ rule: GroupRule; target: string }> = [];
  const lastRules: GroupRule[] = [];

  for (const custom of customRules) {
    const rule: GroupRule = {
      name: custom.name,
      icon: custom.icon || DEFAULT_ICON,
      keywords: custom.keywords,
    };

    const positionType = custom.position?.type || "first";

    if (positionType === "first") {
      firstRules.push(rule);
    } else if (positionType === "before") {
      beforeRules.push({ rule, target: custom.position?.target || "" });
    } else {
      lastRules.push(rule);
    }
  }

  if (firstRules.length > 0) {
    GROUP_RULES.unshift(...firstRules);
  }

  for (const { rule, target } of beforeRules) {
    const targetLower = target.toLowerCase();
    const targetIndex = GROUP_RULES.findIndex((r) => r.name.toLowerCase() === targetLower);
    if (targetIndex !== -1) {
      GROUP_RULES.splice(targetIndex, 0, rule);
    } else {
      console.warn(`[警告] 无法找到目标分组 "${target}"，自定义分组 "${rule.name}" 将插入到最前位置`);
      GROUP_RULES.unshift(rule);
    }
  }

  if (lastRules.length > 0) {
    GROUP_RULES.push(...lastRules);
  }
}
