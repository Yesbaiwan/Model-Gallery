import type { AppState } from "../state.ts";
import { clearCurrentCache, setCurrentSite } from "../state.ts";
import { fetchModels } from "../services/models.ts";
import { renderPage } from "../ui/page.ts";

type Handler = (req: Request, state: AppState) => Promise<Response> | Response;

interface Route {
  method: string;
  path: string;
  handler: Handler;
}

const routes: Route[] = [
  {
    method: "GET",
    path: "/",
    handler: async (_req, state) => {
      const { models, error } = await fetchModels(state);
      return new Response(renderPage(state, models, error), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  },
  {
    method: "POST",
    path: "/switch-site",
    handler: async (req, state) => {
      try {
        const body = await req.json();
        const success = setCurrentSite(state, body.site);
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
    },
  },
  {
    method: "GET",
    path: "/refresh",
    handler: (_req, state) => {
      clearCurrentCache(state);
      return new Response(null, {
        status: 302,
        headers: { Location: "/" },
      });
    },
  },
  {
    method: "GET",
    path: "/assets/favicon.svg",
    handler: async () => {
      const file = await Deno.readFile("./assets/favicon.svg");
      return new Response(file, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    },
  },
];

export function createRouter(state: AppState) {
  return (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const route = routes.find((r) => r.method === req.method && r.path === url.pathname);

    if (route) {
      return Promise.resolve(route.handler(req, state));
    }
    return Promise.resolve(new Response("未找到页面", { status: 404 }));
  };
}
