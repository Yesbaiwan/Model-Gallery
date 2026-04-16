export interface GroupConfig {
  name?: string;
  icon: string;
  keywords?: string[];
}

export interface SiteConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  apiEndpoint: string;
  externalUrl: string;
  iconUrl: string;
}

export interface GroupPosition {
  type: "first" | "last" | "before";
  target?: string;
}

export interface CustomGroupRule {
  name: string;
  icon?: string;
  keywords: string[];
  position?: GroupPosition;
}

export interface AppConfig {
  sites: SiteConfig[];
  defaultSite: string;
  customGroupRules?: CustomGroupRule[];
}

export interface ModelResponse {
  data?: { id: string }[];
}

export interface CacheEntry {
  models: string[] | null;
  error: string | null;
  timestamp: number;
}
