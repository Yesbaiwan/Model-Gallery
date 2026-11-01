// 内置分组规则：内置组一律用 100 的整数倍 order，自定义组用非整百的数即可保证不冲突。
import type { BuiltinGroupRule } from "../types.ts";

export const DEFAULT_ICON = "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/openai.webp";

export const BUILTIN_GROUP_RULES: readonly BuiltinGroupRule[] = [
  {
    name: "OpenAI",
    order: 100,
    icon: DEFAULT_ICON,
    keywords: ["gpt", "dall", "chatgpt", "codex", "o1", "o3", "o4", "sora", "whisper"],
  },
  {
    name: "Gemini",
    order: 200,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/gemini-color.webp",
    keywords: ["gemini", "google", "gemma", "nano-banana", "imagen", "veo", "learnlm"],
  },
  {
    name: "Claude",
    order: 300,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/claude-color.webp",
    keywords: ["claude", "anthropic", "opus", "sonnet", "haiku"],
  },
  {
    name: "MiniMax",
    order: 400,
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/minimax-color.svg",
    keywords: ["minimax", "hailuo"],
  },
  {
    name: "Grok",
    order: 500,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/grok.webp",
    keywords: ["grok", "xai", "x-ai"],
  },
  {
    name: "Groq",
    order: 600,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/groq.webp",
    keywords: ["groq"],
  },
  {
    name: "Nvidia",
    order: 700,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/nvidia-color.webp",
    keywords: ["nvidia", "nemotron"],
  },
  {
    name: "Meta",
    order: 800,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/meta-color.webp",
    keywords: ["llama", "meta", "muse-"],
  },
  {
    name: "Qwen",
    order: 900,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/qwen-color.webp",
    keywords: ["qwen", "qvq", "qwq", "wan", "tongyi", "通义"],
  },
  {
    name: "智谱",
    order: 1000,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/zhipu-color.webp",
    keywords: ["zhipu", "thudm", "glm", "chatglm", "zai", "智谱", "codegeex", "cogview", "cogvideo"],
  },
  {
    name: "DeepSeek",
    order: 1100,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/deepseek-color.webp",
    keywords: ["deepseek"],
  },
  {
    name: "Kimi",
    order: 1200,
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/moonshotai_new.png",
    keywords: ["kimi", "moonshot"],
  },
  {
    name: "混元",
    order: 1300,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/hunyuan-color.webp",
    keywords: ["hunyuan", "tencent"],
  },
  {
    name: "Perplexity",
    order: 1400,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/perplexity-color.webp",
    keywords: ["pplx", "perplexity", "sonar"],
  },
  {
    name: "零一万物",
    order: 1500,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/yi-color.webp",
    keywords: ["yi-", "01-ai", "零一万物"],
  },
  {
    name: "LongCat",
    order: 1600,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/longcat-color.webp",
    keywords: ["longcat"],
  },
  {
    name: "百灵",
    order: 1700,
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/ling.png",
    keywords: ["ling", "ring-", "百灵", "inclusion", "AntAngelMed"],
  },
  {
    name: "Mistral",
    order: 1800,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/mistral-color.webp",
    keywords: ["mistral", "codestral", "mixtral", "ministral", "magistral", "devstral", "voxtral", "pixtral"],
  },
  {
    name: "豆包",
    order: 1900,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/doubao-color.webp",
    keywords: ["doubao", "豆包", "seed-"],
  },
  {
    name: "即梦",
    order: 2000,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/jimeng-color.webp",
    keywords: ["jimeng", "即梦"],
  },
  {
    name: "BAAI",
    order: 2100,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/baai.webp",
    keywords: ["baai", "bge"],
  },
  {
    name: "小米",
    order: 2200,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/xiaomimimo.webp",
    keywords: ["xiaomi", "小米", "mimo"],
  },
  {
    name: "文心一言",
    order: 2300,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/wenxin-color.webp",
    keywords: ["yiyan", "一言", "wenxin", "文心", "baidu", "百度", "ernie"],
  },
  {
    name: "快手",
    order: 2400,
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/kwaipilot-color.svg",
    keywords: ["kat-", "kolors", "kling", "快手", "可图", "可灵"],
  },
  {
    name: "阶跃星辰",
    order: 2500,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/stepfun-color.webp",
    keywords: ["step-", "stepfun", "阶跃星辰"],
  },
  {
    name: "硅基流动",
    order: 2600,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/siliconcloud-color.webp",
    keywords: ["silicon", "硅基"],
  },
  {
    name: "讯飞",
    order: 2700,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/spark-color.webp",
    keywords: ["讯飞", "spark-", "iflytek"],
  },
  {
    name: "商汤",
    order: 2800,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/sensenova-color.webp",
    keywords: ["商汤", "sensenova", "sensechat", "日日新"],
  },
  {
    name: "小红书",
    order: 2900,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/dotsstudio.webp",
    keywords: ["dots", "rednote", "小红书", "xiaohongshu"],
  },
  {
    name: "电信星辰",
    order: 3000,
    icon: "https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/TeleAI.svg",
    keywords: ["xingchen", "星辰", "teleai", "telechat"],
  },
  { name: "Agnes", order: 3100, icon: "https://app.agnes-ai.com/images/home/logo1.svg", keywords: ["agnes"] },
  {
    name: "Cohere",
    order: 3200,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/cohere-color.webp",
    keywords: ["cohere", "command"],
  },
  {
    name: "Microsoft",
    order: 3300,
    icon: "https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/microsoft-color.webp",
    keywords: ["microsoft", "phi-"],
  },
  { name: "default", order: 9000, icon: DEFAULT_ICON },
];

export const BUILTIN_GROUP_NAMES = BUILTIN_GROUP_RULES.map((rule) => rule.name);
