import type { AppConfig, CacheEntry, SiteConfig } from "./types.ts";

export interface AppState {
  appConfig: AppConfig;
  currentSiteName: string;
  modelCache: Map<string, CacheEntry>;
}

export function createAppState(appConfig: AppConfig): AppState {
  return {
    appConfig,
    currentSiteName: appConfig.defaultSite,
    modelCache: new Map<string, CacheEntry>(),
  };
}

export function getCurrentSite(state: AppState): SiteConfig | null {
  return state.appConfig.sites.find((s) => s.name === state.currentSiteName) ||
    state.appConfig.sites[0] || null;
}

export function setCurrentSite(state: AppState, siteName: string): boolean {
  if (state.appConfig.sites.some((s) => s.name === siteName)) {
    state.currentSiteName = siteName;
    return true;
  }
  return false;
}

export const CACHE_TTL = 5 * 60 * 1000;

export function getCachedModels(state: AppState): CacheEntry | null {
  const entry = state.modelCache.get(state.currentSiteName);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    state.modelCache.delete(state.currentSiteName);
    return null;
  }

  return entry;
}

export function setCachedModels(
  state: AppState,
  models: string[] | null,
  error: string | null,
): void {
  state.modelCache.set(state.currentSiteName, {
    models,
    error,
    timestamp: Date.now(),
  });
}

export function clearCurrentCache(state: AppState): void {
  state.modelCache.delete(state.currentSiteName);
}
