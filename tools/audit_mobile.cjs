/**
 * Mobile overflow audit: loads a page at several phone widths and reports
 * horizontal overflow (document scrollWidth) plus the elements that stick out.
 *
 * node audit_mobile.cjs <url> [widths...]
 */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");

const EXE = path.join(
  process.env.LOCALAPPDATA,
  "ms-playwright",
  "chromium_headless_shell-1248",
  "chrome-headless-shell-win64",
  "chrome-headless-shell.exe",
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });

const PROBE = `(function(){
  var vw = document.documentElement.clientWidth;
  var out = [];
  document.querySelectorAll('body *').forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    var overflowRight = Math.round(r.right - vw);
    var overflowLeft = Math.round(r.left);
    if (overflowRight > 2 || overflowLeft < -2) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 60),
        right: overflowRight,
        left: overflowLeft,
        w: Math.round(r.width)
      });
    }
  });
  return JSON.stringify({
    vw: vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: out.slice(0, 25)
  });
})()`;

async function main() {
  const [url, ...widthArgs] = process.argv.slice(2);
  const widths = widthArgs.length ? widthArgs.map(Number) : [320, 360, 390, 430];
  const port = 9800 + Math.floor(Math.random() * 150);
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-audit-"));
  const chrome = spawn(
    EXE,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDir}`,
      "--window-size=430,900",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    let targets = null;
    for (let i = 0; i < 80; i++) {
      try {
        targets = JSON.parse(await getJson(`http://127.0.0.1:${port}/json/list`));
        if (targets && targets.length) break;
      } catch (e) {
        /* not up yet */
      }
      await sleep(250);
    }
    if (!targets || !targets.length) throw new Error("devtools target never appeared");

    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });

    let nextId = 1;
    const pending = new Map();
    const listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method && listeners.has(msg.method)) {
        const queue = listeners.get(msg.method);
        while (queue.length) queue.shift()(msg.params);
      }
    });
    const send = (method, params = {}) => {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };
    const once = (method) =>
      new Promise((resolve) => {
        if (!listeners.has(method)) listeners.set(method, []);
        listeners.get(method).push(resolve);
      });
    const evaluate = async (expression) =>
      (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;

    await send("Page.enable");
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    await sleep(600);

    // reveal everything so hidden sections are measured too
    await evaluate(
      "(function(){document.querySelectorAll('.hero,.mask,.toolkit,.skills,.timeline,[data-reveal]')" +
        ".forEach(function(el){el.classList.add('is-in');});return true;})()",
    );

    for (const width of widths) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await sleep(700);
      const raw = await evaluate(PROBE);
      const info = JSON.parse(raw);
      const bad = info.scrollWidth - info.vw;
      console.log(
        `\n=== ${width}px === vw=${info.vw} scrollWidth=${info.scrollWidth} (${bad > 1 ? "OVERFLOW +" + bad : "ok"})`,
      );
      info.offenders.forEach((o) =>
        console.log(
          `   ${o.tag}.${o.cls}  w=${o.w}  right=${o.right > 0 ? "+" + o.right : o.right}  left=${o.left}`,
        ),
      );
      if (!info.offenders.length) console.log("   no element sticks out");
    }
    ws.close();
  } finally {
    chrome.kill();
    await sleep(300);
    try {
      fs.rmSync(userDir, { recursive: true, force: true });
    } catch (e) {
      /* best effort */
    }
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
