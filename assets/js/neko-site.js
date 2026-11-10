/*!
 * neko-site.js — 个人站小猫挂件
 * ------------------------------------------------------------------
 * 基于本地打包的 neko-ts（MIT，见 ./neko-ts/neko-bundle-lite.js，精灵图全部内嵌 base64，
 * 无任何外部 CDN 依赖）。经典脚本，file:// 双击打开、本地服务器、GitHub Pages 均可用。
 *
 * 功能：
 *   1. 一只跟着鼠标跑的小猫（桌面端），触屏端则原地待机；
 *   2. 右下角「换花色」按钮：首次打开时才加载其余花色，点击即换、自动记住选择；
 *   3. 系统开启「减弱动态效果」时，库内部不会创建小猫，选择器也随之隐藏。
 */
(function () {
  "use strict";

  var Neko = window.Neko;
  var NekoSizeVariations = window.NekoSizeVariations;
  if (!Neko || !NekoSizeVariations || !window.nekoBreeds) return; // 库未加载时静默退出

  var STORAGE_KEY = "neko-breed";
  var BREED_CONFIG_KEY = "neko-breed-config";
  var DEFAULT_BREED = "spirit";
  var BREEDS = [
    "ace", "air", "black", "blue", "calico", "colourful", "dave", "dog", "earth", "fancy",
    "fire", "ghetto", "ghost", "jess", "lucky", "lucy", "marmalade", "mermaid", "mike", "moka",
    "neko", "neon", "orange", "peach", "pink", "rainbow", "robot", "royal", "silversky", "socks",
    "spirit", "tabby", "usa", "valentine", "water",
  ];

  function readSaved() {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch (e) { return ""; }
  }
  function writeSaved(name) {
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* 隐私模式等场景忽略 */ }
  }
  function readSavedConfig(name) {
    if (!name) return null;
    try {
      var value = JSON.parse(localStorage.getItem(BREED_CONFIG_KEY) || "null");
      if (!value || value.name !== name || !value.config) return null;
      return value.config;
    } catch (e) {
      return null;
    }
  }
  function writeSavedConfig(name, config) {
    try {
      localStorage.setItem(BREED_CONFIG_KEY, JSON.stringify({ name: name, config: config }));
    } catch (e) { /* 隐私模式等场景忽略 */ }
  }

  var saved = readSaved();
  var savedConfig = readSavedConfig(saved);
  if (saved && savedConfig) window.nekoBreeds[saved] = savedConfig;
  var initial = window.nekoBreeds[saved] ? saved : DEFAULT_BREED;

  // 构造小猫。origin 放在页面右下角附近；系统开启「减弱动态效果」时
  // 库内部不会创建 DOM，此时 document.querySelector("[data-neko]") 为 null。
  var neko = new Neko({
    breed: window.nekoBreeds[initial],
    nekoSize: NekoSizeVariations.MEDIUM,
    speed: 10,
    origin: {
      x: Math.max(160, window.innerWidth - 80),
      y: Math.max(160, window.innerHeight - 80),
    },
  });
  if (!document.querySelector("[data-neko]")) return;

  /* ---------------- 样式（自包含，nk- 前缀避免与站点样式冲突） ---------------- */
  var style = document.createElement("style");
  style.textContent = [
    ".nk-picker{position:fixed;right:18px;bottom:18px;z-index:1500;",
    "font-family:Inter,'Noto Sans SC',system-ui,-apple-system,'Segoe UI',sans-serif;}",
    ".nk-toggle{display:flex;align-items:center;justify-content:center;width:46px;height:46px;",
    "border-radius:50%;border:1px solid rgba(15,23,42,.12);background:#fff;color:#334155;",
    "box-shadow:0 8px 24px -10px rgba(15,23,42,.28);cursor:pointer;padding:0;",
    "transition:transform .18s ease,box-shadow .18s ease,color .18s ease;}",
    ".nk-toggle:hover{transform:translateY(-2px);color:#0f172a;",
    "box-shadow:0 12px 28px -10px rgba(15,23,42,.32);}",
    ".nk-toggle:focus-visible{outline:2px solid rgba(99,102,241,.6);outline-offset:2px;}",
    ".nk-toggle svg{width:22px;height:22px;}",
    ".nk-panel{position:absolute;right:0;bottom:58px;width:320px;max-height:min(58vh,520px);",
    "display:flex;flex-direction:column;background:#fff;border:1px solid rgba(15,23,42,.1);",
    "border-radius:16px;box-shadow:0 24px 60px -20px rgba(15,23,42,.35);overflow:hidden;",
    "transform-origin:bottom right;opacity:0;transform:scale(.92) translateY(6px);",
    "pointer-events:none;transition:opacity .16s ease,transform .16s ease;}",
    ".nk-picker.is-open .nk-panel{opacity:1;transform:none;pointer-events:auto;}",
    ".nk-panel__head{display:flex;align-items:center;justify-content:space-between;gap:8px;",
    "padding:12px 14px;border-bottom:1px solid rgba(15,23,42,.07);background:#fafafa;}",
    ".nk-panel__title{font-size:13px;font-weight:600;color:#0f172a;}",
    ".nk-panel__cur{font-size:12px;color:#64748b;font-variant-numeric:tabular-nums;}",
    ".nk-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;",
    "padding:14px;overflow-y:auto;}",
    ".nk-loading{grid-column:1/-1;padding:22px 10px;text-align:center;font-size:12px;color:#64748b;}",
    ".nk-swatch{position:relative;aspect-ratio:1;border:1px solid rgba(15,23,42,.08);",
    "border-radius:10px;background-color:#f8fafc;cursor:pointer;padding:0;image-rendering:pixelated;",
    "transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;}",
    ".nk-swatch:hover{transform:translateY(-2px);border-color:rgba(99,102,241,.5);",
    "box-shadow:0 6px 14px -6px rgba(15,23,42,.3);}",
    ".nk-swatch.is-active{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.25);}",
    ".nk-swatch.is-active::after{content:'';position:absolute;right:3px;bottom:3px;",
    "width:7px;height:7px;border-radius:50%;background:#6366f1;}",
    ".nk-panel__foot{padding:8px 14px 10px;font-size:11px;color:#94a3b8;",
    "border-top:1px solid rgba(15,23,42,.06);background:#fff;}",
    "@media (max-width:520px){.nk-picker{right:12px;bottom:12px;}",
    ".nk-panel{width:min(78vw,320px);}}",
  ].join("");
  document.head.appendChild(style);

  /* ---------------- DOM ---------------- */
  var picker = document.createElement("div");
  picker.className = "nk-picker";
  picker.id = "nkPicker";
  picker.innerHTML = [
    '<div class="nk-panel" id="nkPanel" role="dialog" aria-label="小猫花色选择">',
    '  <div class="nk-panel__head">',
    '    <span class="nk-panel__title">给小猫换个花色</span>',
    '    <span class="nk-panel__cur" id="nkCur"></span>',
    "  </div>",
    '  <div class="nk-grid" id="nkGrid"></div>',
    '  <div class="nk-panel__foot">点击即换，选择会自动记住</div>',
    "</div>",
    '<button class="nk-toggle" id="nkToggle" type="button" aria-label="打开小猫花色选择"',
    ' aria-expanded="false" aria-controls="nkPanel" title="小猫 · 换花色">',
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
    '<path d="M9 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/',
    '><path d="M5.3 10.6a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Zm13.4 0a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z"/',
    '><path d="M12 9.5a5 5 0 0 1 5 5c0 2.4-2.1 4.3-5 4.3s-5-1.9-5-4.3a5 5 0 0 1 5-5Z"/></svg>',
    "</button>",
  ].join("");
  document.body.appendChild(picker);

  var toggle = document.getElementById("nkToggle");
  var grid = document.getElementById("nkGrid");
  var cur = document.getElementById("nkCur");
  var active = initial;
  cur.textContent = active;

  /* ---------------- 花色缩略图：按精灵图第 0 帧（idle）裁剪 ---------------- */
  function swatchStyle(conf, px) {
    var frames = (conf.spriteSets && conf.spriteSets.idle) || [[0, 0]];
    var pos = frames[0];
    var cols = conf.cols || 8;
    var rows = conf.rows || 4;
    var gap = conf.gap || 0;
    var w = cols * px + (cols - 1) * gap;
    var h = rows * px + (rows - 1) * gap;
    return [
      'background-image:url("' + conf.src + '")',
      "background-size:" + w + "px " + h + "px",
      "background-position:" + -pos[0] * (px + gap) + "px " + -pos[1] * (px + gap) + "px",
    ].join(";");
  }

  function setActiveBreed(name, silent) {
    var conf = window.nekoBreeds[name];
    if (!conf) return;
    neko.setBreed(conf);
    active = name;
    cur.textContent = name;
    if (!silent) {
      writeSaved(name);
      writeSavedConfig(name, conf);
    }
    var swatches = grid.querySelectorAll(".nk-swatch");
    for (var i = 0; i < swatches.length; i++) {
      var el = swatches[i];
      var on = el.getAttribute("data-breed") === name;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function hasFullBreeds() {
    var map = window.nekoBreeds || {};
    return BREEDS.every(function (name) { return Boolean(map[name]); });
  }

  function renderBreedGrid() {
    grid.innerHTML = "";
    var map = window.nekoBreeds || {};
    BREEDS.forEach(function (name) {
      if (!map[name]) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "nk-swatch";
      b.setAttribute("data-breed", name);
      b.title = name;
      b.setAttribute("aria-label", "花色：" + name);
      b.setAttribute("aria-pressed", name === active ? "true" : "false");
      b.style.cssText = swatchStyle(map[name], 32);
      b.addEventListener("click", function () { setActiveBreed(name); });
      grid.appendChild(b);
    });
  }

  var fullBundlePromise = null;
  function loadFullBreeds() {
    if (hasFullBreeds()) return Promise.resolve();
    if (fullBundlePromise) return fullBundlePromise;
    fullBundlePromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "assets/js/neko-ts/neko-bundle.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return fullBundlePromise;
  }

  renderBreedGrid();

  /* ---------------- 开关与关闭逻辑 ---------------- */
  function setOpen(force) {
    var isOpen = picker.classList.toggle("is-open", force);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var opening = !picker.classList.contains("is-open");
    setOpen(opening);
    if (!opening || hasFullBreeds()) return;
    grid.innerHTML = '<span class="nk-loading">正在加载花色…</span>';
    loadFullBreeds().then(renderBreedGrid).catch(function () {
      grid.innerHTML = '<span class="nk-loading">花色加载失败，请稍后再试</span>';
    });
  });
  document.addEventListener("click", function (e) {
    if (!picker.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();
