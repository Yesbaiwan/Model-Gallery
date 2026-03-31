import { loadAppConfig } from "./config/appConfig.ts";
import { createAppState } from "./state.ts";
import { createRouter } from "./server/router.ts";

const appConfig = await loadAppConfig();
const appState = createAppState(appConfig);
const router = createRouter(appState);

Deno.serve(router);
