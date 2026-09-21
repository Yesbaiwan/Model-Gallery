// 主题截图生成脚本：headless Chrome + CDP，为每个主题×明暗组合输出一张截图到 docs/screenshots/
// 用法：node scripts/screenshot-themes.mjs  （需本地 dev 服务器运行在 3000 端口）
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_URL = "http://localhost:3000";
const PORT = 9223;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "screenshots");
const VIEWPORT = { width: 1280, height: 900 };
const THEMES = ["classic", "archive", "handdrawn"];
const MODES = ["light", "dark"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=" + join(tmpdir(), "model-gallery-screenshot-profile"),
  "--no-first-run",
  "--window-size=1280,1000",
  "about:blank",
], { stdio: "ignore" });
process.on("exit", () => chrome.kill());

// 等调试端口就绪
let targets;
for (let i = 0; i < 50; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    if (targets.length) break;
  } catch {}
  await sleep(200);
}
if (!targets) throw new Error("Chrome 调试端口未就绪");
const wsUrl = targets.find((t) => t.type === "page").webSocketDebuggerUrl;

const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evalJs = async (expression) => {
  const res = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails));
  return res.result?.result?.value;
};

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { ...VIEWPORT, deviceScaleFactor: 1, mobile: false });

mkdirSync(OUT_DIR, { recursive: true });
const shots = [];

for (const theme of THEMES) {
  for (const mode of MODES) {
    await send("Page.navigate", { url: `${BASE_URL}/?theme=${theme}` });
    await sleep(2500); // 等字体与入场级联动画完成
    // 深色模式：直接改 DOM 属性，绕过 localStorage（headless 每次冷启动）
    await evalJs(`document.documentElement.setAttribute("data-theme", "${mode}")`);
    // 隐藏滚动条（仅截图用，不改变布局宽度）
    await evalJs(`{
      const s = document.createElement("style");
      s.textContent = "::-webkit-scrollbar { display: none }";
      document.head.appendChild(s);
    }`);
    await sleep(500); // 等过渡与 light-dark() 生效
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const file = join(OUT_DIR, `${theme}-${mode}.png`);
    writeFileSync(file, Buffer.from(shot.result.data, "base64"));
    shots.push(file);
    console.log(`saved ${theme}-${mode}.png`);
  }
}

ws.close();
chrome.kill();
console.log(`done: ${shots.length} screenshots`);
