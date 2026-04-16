import { loadAppConfig } from "./config/appConfig.ts";
import { applyCustomGroupRules } from "./config/groupConfig.ts";
import { createAppState } from "./state.ts";
import { createRouter } from "./server/router.ts";

const appConfig = await loadAppConfig();
applyCustomGroupRules(appConfig.customGroupRules);
const appState = createAppState(appConfig);
const router = createRouter(appState);

Deno.serve(router);
