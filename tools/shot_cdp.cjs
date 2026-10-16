/**
 * Viewport screenshot helper without the playwright npm package.
 *
 * Drives the cached chrome-headless-shell over the DevTools protocol so we can
 * scroll to a specific element before capturing (the portfolio page sizes whole
 * sections with 100vh, so a full-page capture would distort them).
 *
 * node shot_cdp.cjs <url> <out.png> [width] [height] [scrollSelector|scrollY] [dark]
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
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });

async function main() {
  const [url, out, wArg, hArg, scrollArg, darkArg, pageMode] = process.argv.slice(2);
  if (!url || !out) throw new Error("usage: node shot_cdp.cjs <url> <out.png> [w] [h] [sel|y] [dark]");
  const width = Number(wArg || 1440);
  const height = Number(hArg || 1000);
  const scale = Number(process.env.SHOT_SCALE || 1); // 2 → 双倍分辨率，适合做 PDF
  const hide = process.env.SHOT_HIDE || ""; // 截图前隐藏的元素（如 .floating-controls）
  const port = 9400 + Math.floor(Math.random() * 400);
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-shot-"));

  const chrome = spawn(
    EXE,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--force-device-scale-factor=${scale}`,
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDir}`,
      `--window-size=${width},${height}`,
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
    const evaluate = async (expression, awaitPromise = false) =>
      (await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true })).result.value;

    await send("Page.enable");
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    await evaluate("document.fonts.ready.then(() => true)", true).catch(() => {});
    await sleep(400);

    if (darkArg === "dark") {
      await evaluate("document.documentElement.classList.add('dark')");
    }
    if (hide) {
      await evaluate(
        "(function(){var s=document.createElement('style');" +
          `s.textContent=${JSON.stringify(hide + "{display:none !important}")};` +
          "document.head.appendChild(s);return true;})()",
      );
    }
    if (scrollArg && scrollArg !== "full") {
      const expression = /^\d+$/.test(scrollArg)
        ? `window.scrollTo(0, ${scrollArg})`
        : `(function(){var el=document.querySelector(${JSON.stringify(scrollArg)});if(el)el.scrollIntoView({block:'start'});return el?el.getBoundingClientRect().top:-1})()`;
      const top = await evaluate(expression);
      await sleep(1400);
      console.log("scrolled, top =", top, "scrollY =", await evaluate("window.scrollY"));
    }

    // Full-page captures need every scroll-triggered reveal to have fired,
    // otherwise the sections below the fold stay transparent.
    if (scrollArg === "full") {
      const total = await evaluate("document.documentElement.scrollHeight");
      for (let y = 0; y < total; y += 700) {
        await evaluate(`window.scrollTo(0, ${y})`);
        await sleep(220);
      }
      await evaluate("window.scrollTo(0, 0)");
      // Headless throttles rAF, so force the settled end state of the
      // scroll-driven animations (reveal, counters, skill bars, folders).
      await evaluate(
        "(function(){" +
          "document.querySelectorAll('[data-count]').forEach(function(el){el.textContent=el.dataset.count;});" +
          "document.querySelectorAll('.skill').forEach(function(s){var b=s.querySelector('.skill__track i');" +
          "if(b)b.style.width=(parseFloat(s.dataset.level)||60)+'%';});" +
          "document.querySelectorAll('.hero,.mask,.toolkit,.skills,.timeline,[data-reveal]')" +
          ".forEach(function(el){el.classList.add('is-in');});" +
          "return true;})()",
      );
      await sleep(1600);
      console.log("swept", total, "px of content");
    }

    // `out` ending in .pdf → print the page to PDF instead of a screenshot
    if (/\.pdf$/i.test(out)) {
      // 默认沿用页面自带的 @page 尺寸；传 portrait 则覆盖成 A4 竖版
      const portrait = pageMode === "portrait";
      if (portrait) {
        await evaluate(
          "(function(){var s=document.createElement('style');" +
            "s.textContent='@page{size:A4 portrait;margin:10mm 12mm}';" +
            "document.head.appendChild(s);return true;})()",
        );
        await sleep(300);
      }
      const pdf = await send("Page.printToPDF", {
        printBackground: true,
        preferCSSPageSize: true,
        paperWidth: 8.27,
        paperHeight: 11.69,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        // PDF_SCALE<1 → 整页按比例缩小（Chromium 会按 1/scale 加宽布局宽度再缩放，所以仍然铺满页宽）
        scale: Number(process.env.PDF_SCALE || 1),
      });
      fs.writeFileSync(out, Buffer.from(pdf.data, "base64"));
      console.log("wrote", out, fs.statSync(out).size, "bytes");
      ws.close();
      return;
    }

    // captureBeyondViewport keeps the layout viewport (so 100vh sections keep
    // their designed height) and captures the whole document instead.
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: scrollArg === "full",
    });
    fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log("wrote", out, fs.statSync(out).size, "bytes");
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
