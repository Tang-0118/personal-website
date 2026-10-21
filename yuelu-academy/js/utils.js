/* ============================================================
   岳麓书院 · 3D  /  utils.js
   Procedural textures, materials, geometry helpers.
   Coordinate convention: +X = north, +Z = east (main gate side),
   -Z = west (Yuelu Mountain), +Y = up. 1 unit ≈ 1 metre.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL = window.YL || {};
  const TAU = Math.PI * 2;

  YL.TAU = TAU;
  YL.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  YL.lerp = (a, b, t) => a + (b - a) * t;
  YL.smoothstep = (a, b, x) => {
    const t = YL.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  YL.easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  YL.linearColor = function (hex) {
    return new THREE.Color(hex).convertSRGBToLinear();
  };

  YL.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  function hash2(x, y) {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return h - Math.floor(h);
  }
  YL.hash2 = hash2;
  YL.noise2 = function (x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy), b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    return YL.lerp(YL.lerp(a, b, ux), YL.lerp(c, d, ux), uy);
  };
  YL.fbm = function (x, y, oct) {
    let v = 0, amp = 0.5, f = 1;
    for (let i = 0; i < (oct || 4); i++) {
      v += amp * YL.noise2(x * f, y * f);
      f *= 2.03; amp *= 0.5;
    }
    return v;
  };

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  YL.canvas = canvas;

  function texture(c, rx, ry) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }
  YL.texture = texture;

  /* -------------------------- textures -------------------------- */

  function plasterCanvas() {
    const c = canvas(1024, 1024), g = c.getContext('2d');
    g.scale(2, 2);
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#f0ecdf');
    grd.addColorStop(0.72, '#e7e1d2');
    grd.addColorStop(1, '#d9d3c2');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
    const rng = YL.rng(21);
    for (let i = 0; i < 5200; i++) {
      const a = rng() * 0.055;
      g.fillStyle = `rgba(${90 + rng() * 40},${85 + rng() * 40},${70 + rng() * 40},${a})`;
      g.fillRect(rng() * 512, rng() * 512, 1 + rng() * 2.4, 1 + rng() * 2.4);
    }
    for (let i = 0; i < 18; i++) {
      const x = rng() * 512, w = 8 + rng() * 50;
      const gg = g.createLinearGradient(x, 300, x, 512);
      gg.addColorStop(0, 'rgba(90,95,80,0)');
      gg.addColorStop(1, `rgba(80,86,72,${0.03 + rng() * 0.05})`);
      g.fillStyle = gg; g.fillRect(x, 300, w, 212);
    }
    return c;
  }

  function roofCanvas() {
    const c = canvas(512, 512), g = c.getContext('2d');
    g.scale(2, 2);
    g.fillStyle = '#3f494f'; g.fillRect(0, 0, 256, 256);
    const rng = YL.rng(8);
    for (let x = 0; x < 256; x += 16) {
      const grd = g.createLinearGradient(x, 0, x + 16, 0);
      grd.addColorStop(0, '#283238');
      grd.addColorStop(0.18, '#4a565c');
      grd.addColorStop(0.46, '#59666c');
      grd.addColorStop(0.62, '#414d53');
      grd.addColorStop(0.82, '#283238');
      grd.addColorStop(1, '#303b41');
      g.fillStyle = grd; g.fillRect(x, 0, 16, 256);
      g.fillStyle = 'rgba(20,26,30,.34)'; g.fillRect(x, 0, 1.4, 256);
    }
    for (let y = 10; y < 256; y += 22) {
      g.strokeStyle = 'rgba(16,22,26,.46)'; g.lineWidth = 2.4;
      g.beginPath();
      for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x * 0.11) * 1.4);
      g.stroke();
      g.strokeStyle = 'rgba(150,165,170,.10)'; g.lineWidth = 1.2;
      g.beginPath();
      for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + 3 + Math.sin(x * 0.11) * 1.2);
      g.stroke();
    }
    for (let i = 0; i < 220; i++) {
      const x = rng() * 256, y = rng() * 256;
      g.fillStyle = `rgba(120,135,118,${rng() * 0.14})`;
      g.beginPath(); g.ellipse(x, y, 2 + rng() * 7, 1 + rng() * 3, 0, 0, TAU); g.fill();
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${160 + rng() * 40},${170 + rng() * 40},${170 + rng() * 40},${rng() * 0.05})`;
      g.fillRect(rng() * 256, rng() * 256, 1, 1);
    }
    return c;
  }

  function stoneCanvas() {
    const c = canvas(1024, 1024), g = c.getContext('2d');
    g.scale(2, 2);
    g.fillStyle = '#9b988c'; g.fillRect(0, 0, 512, 512);
    const rng = YL.rng(31);
    const cell = 128;
    for (let y = 0; y < 512; y += cell) {
      for (let x = 0; x < 512; x += cell) {
        const off = (Math.floor(y / cell) % 2) * 64;
        const px = x + off;
        const v = 140 + Math.floor(rng() * 34);
        g.fillStyle = `rgb(${v},${v - 2},${v - 12})`;
        g.fillRect(px + 2, y + 2, cell - 4, cell - 4);
        g.fillStyle = 'rgba(255,255,255,.05)';
        g.fillRect(px + 4, y + 4, cell - 8, 3);
        for (let k = 0; k < 70; k++) {
          g.fillStyle = `rgba(50,50,44,${rng() * 0.09})`;
          g.fillRect(px + rng() * cell, y + rng() * cell, 1 + rng() * 2, 1 + rng() * 2);
        }
      }
    }
    g.strokeStyle = 'rgba(58,56,48,.5)'; g.lineWidth = 3;
    for (let y = 0; y <= 512; y += cell) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    for (let y = 0; y < 512; y += cell) {
      const off = (Math.floor(y / cell) % 2) * 64;
      for (let x = 0; x <= 512; x += cell) {
        g.beginPath(); g.moveTo(x + off, y); g.lineTo(x + off, y + cell); g.stroke();
      }
    }
    return c;
  }

  function woodCanvas() {
    const c = canvas(512, 1024), g = c.getContext('2d');
    g.scale(2, 2);
    const grd = g.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, '#4b211a'); grd.addColorStop(0.5, '#632d23'); grd.addColorStop(1, '#481d16');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 512);
    const rng = YL.rng(4);
    for (let i = 0; i < 90; i++) {
      const x = rng() * 256;
      g.strokeStyle = `rgba(${30 + rng() * 30},${12 + rng() * 12},${8 + rng() * 10},${0.08 + rng() * 0.16})`;
      g.lineWidth = 0.6 + rng() * 1.8;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 24) g.lineTo(x + Math.sin(y * 0.02 + i) * 3.5, y);
      g.stroke();
    }
    return c;
  }

  function latticeCanvases(kind) {
    const w = 256, h = kind === 'door' ? 512 : 256;
    const c = canvas(w * 2, h * 2), g = c.getContext('2d');
    const e = canvas(w * 2, h * 2), ge = e.getContext('2d');
    g.scale(2, 2); ge.scale(2, 2);
    g.fillStyle = '#2b1912'; g.fillRect(0, 0, w, h);
    ge.fillStyle = '#000'; ge.fillRect(0, 0, w, h);
    // paper behind lattice
    const paper = g.createLinearGradient(0, 0, 0, h);
    paper.addColorStop(0, '#d8c8a6'); paper.addColorStop(0.55, '#cdbb94'); paper.addColorStop(1, '#b9a77e');
    g.fillStyle = paper;
    g.fillRect(16, 16, w - 32, h - 32);
    // warm glow map
    const warm = ge.createRadialGradient(w / 2, h * 0.45, 8, w / 2, h * 0.45, h * 0.65);
    warm.addColorStop(0, '#ffb35e'); warm.addColorStop(1, '#7d3f12');
    ge.fillStyle = warm;
    ge.fillRect(16, 16, w - 32, h - 32);
    // lattice
    g.strokeStyle = '#6b4028'; ge.strokeStyle = '#000';
    const topH = kind === 'door' ? h * 0.62 : h - 34;
    const cols = 4, rows = kind === 'door' ? 7 : 5;
    const x0 = 26, y0 = 26, x1 = w - 26, y1 = topH;
    g.lineWidth = 7; ge.lineWidth = 7;
    for (let i = 0; i <= cols; i++) {
      const x = x0 + (x1 - x0) * i / cols;
      g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
      ge.beginPath(); ge.moveTo(x, y0); ge.lineTo(x, y1); ge.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const y = y0 + (y1 - y0) * j / rows;
      g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      ge.beginPath(); ge.moveTo(x0, y); ge.lineTo(x1, y); ge.stroke();
    }
    // pierced corner ornaments
    g.strokeStyle = '#8a5a37'; g.lineWidth = 4;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = x0 + (x1 - x0) * (i + 0.5) / cols;
        const y = y0 + (y1 - y0) * (j + 0.5) / rows;
        g.strokeRect(x - 12, y - 12, 24, 24);
      }
    }
    // frame
    g.strokeStyle = '#3b2117'; g.lineWidth = 20; g.strokeRect(10, 10, w - 20, h - 20);
    g.strokeStyle = '#8a5a37'; g.lineWidth = 4; g.strokeRect(20, 20, w - 40, h - 40);
    // lower panel
    if (kind === 'door') {
      const py = h * 0.68;
      g.fillStyle = '#4b281c'; g.fillRect(24, py, w - 48, h - py - 24);
      g.strokeStyle = '#9b6a42'; g.lineWidth = 3; g.strokeRect(36, py + 12, w - 72, h - py - 48);
      g.strokeStyle = 'rgba(190,145,90,.55)'; g.lineWidth = 2;
      g.strokeRect(48, py + 24, w - 96, h - py - 72);
    }
    return { map: c, emissive: e };
  }

  function signCanvas(text, opt) {
    opt = opt || {};
    const w = opt.w || 1024, h = opt.h || 320;
    const c = canvas(w, h), g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, opt.bgTop || '#211a14');
    bg.addColorStop(0.5, opt.bg || '#15100c');
    bg.addColorStop(1, opt.bgBot || '#241b13');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // lacquer sheen
    const sheen = g.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, 'rgba(255,220,150,.10)');
    sheen.addColorStop(0.45, 'rgba(255,220,150,0)');
    sheen.addColorStop(1, 'rgba(255,220,150,.06)');
    g.fillStyle = sheen; g.fillRect(0, 0, w, h);
    // border
    g.strokeStyle = opt.frame || '#b9924e'; g.lineWidth = 12;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.strokeStyle = 'rgba(255,225,160,.35)'; g.lineWidth = 2;
    g.strokeRect(30, 30, w - 60, h - 60);
    const size = opt.size || Math.min(h * 0.55, w * 0.82 / Math.max(1, text.length));
    g.font = `700 ${size}px "STKaiti","KaiTi","Kaiti SC","FangSong","Microsoft YaHei",serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const gap = opt.gap == null ? size * 0.13 : opt.gap;
    const total = text.length * size + (text.length - 1) * gap;
    let x = w / 2 - total / 2 + size / 2;
    for (let i = 0; i < text.length; i++) {
      g.save();
      g.shadowColor = 'rgba(255,180,70,.55)'; g.shadowBlur = 14;
      g.fillStyle = opt.fg || '#e3c27d';
      g.fillText(text[i], x, h / 2 + size * 0.03);
      g.restore();
      x += size + gap;
    }
    return c;
  }

  function coupletCanvas(text) {
    const w = 220, h = Math.max(760, text.length * 150 + 90);
    const c = canvas(w, h), g = c.getContext('2d');
    g.fillStyle = '#16110d'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#a98448'; g.lineWidth = 7; g.strokeRect(10, 10, w - 20, h - 20);
    g.strokeStyle = 'rgba(255,228,170,.25)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
    const size = 112;
    g.font = `700 ${size}px "STKaiti","KaiTi","Kaiti SC","FangSong",serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#dfc07a';
    const step = (h - 90) / text.length;
    for (let i = 0; i < text.length; i++) {
      g.fillText(text[i], w / 2, 55 + step * (i + 0.5));
    }
    return c;
  }

  function cloudCanvas() {
    const c = canvas(256, 128), g = c.getContext('2d');
    g.clearRect(0, 0, 256, 128);
    const rng = YL.rng(77);
    for (let i = 0; i < 26; i++) {
      const x = 30 + rng() * 196, y = 48 + rng() * 40, r = 18 + rng() * 34;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,.20)');
      grd.addColorStop(0.55, 'rgba(255,255,255,.10)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    return c;
  }

  YL.initTextures = function () {
    if (YL.texReady) return;
    YL.texReady = true;
    YL.TX = {
      plaster: texture(plasterCanvas(), 1.5, 1.5),
      roof: texture(roofCanvas(), 1, 1),
      stone: texture(stoneCanvas(), 1, 1),
      wood: texture(woodCanvas(), 1, 1),
      cloud: texture(cloudCanvas(), 1, 1)
    };
    YL.TX.cloud.wrapS = YL.TX.cloud.wrapT = THREE.ClampToEdgeWrapping;
    const gc = YL.canvas(128, 128), gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,240,205,0.95)');
    gr.addColorStop(0.22, 'rgba(255,208,132,0.5)');
    gr.addColorStop(0.55, 'rgba(255,178,90,0.13)');
    gr.addColorStop(1, 'rgba(255,160,70,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    YL.TX.glow = new THREE.CanvasTexture(gc);
    YL.TX.glow.encoding = THREE.sRGBEncoding;

    // tiling water normal map, generated from two octaves of value noise
    const wn = YL.canvas(512, 512), wc = wn.getContext('2d');
    const wimg = wc.createImageData(512, 512);
    const hs = new Float32Array(512 * 512);
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        hs[y * 512 + x] = YL.fbm(x * 0.026 + 3.1, y * 0.026 + 1.7, 4);
      }
    }
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const xm = (x + 511) % 512, xp = (x + 1) % 512;
        const ym = (y + 511) % 512, yp = (y + 1) % 512;
        const dx = (hs[y * 512 + xp] - hs[y * 512 + xm]) * 9.0;
        const dy = (hs[yp * 512 + x] - hs[ym * 512 + x]) * 9.0;
        const i = (y * 512 + x) * 4;
        wimg.data[i] = Math.max(0, Math.min(255, 128 + dx * 128));
        wimg.data[i + 1] = Math.max(0, Math.min(255, 128 + dy * 128));
        wimg.data[i + 2] = 255;
        wimg.data[i + 3] = 255;
      }
    }
    wc.putImageData(wimg, 0, 0);
    YL.TX.waterN = texture(wn, 5, 5);
    YL.TX.waterN.encoding = THREE.LinearEncoding;

    // a soft sky cubemap just for water reflections
    const envFaces = [];
    for (let i = 0; i < 6; i++) {
      const ec = YL.canvas(64, 64), eg = ec.getContext('2d');
      const g0 = eg.createLinearGradient(0, 0, 0, 64);
      if (i === 2) { g0.addColorStop(0, '#6b88a4'); g0.addColorStop(1, '#cfdadd'); }
      else if (i === 3) { g0.addColorStop(0, '#6b7353'); g0.addColorStop(1, '#444a38'); }
      else { g0.addColorStop(0, '#dce4e2'); g0.addColorStop(0.55, '#cdd9d9'); g0.addColorStop(1, '#e7cfaa'); }
      eg.fillStyle = g0; eg.fillRect(0, 0, 64, 64);
      envFaces.push(ec);
    }
    const envCube = new THREE.CubeTexture(envFaces);
    envCube.needsUpdate = true;
    envCube.encoding = THREE.sRGBEncoding;
    YL.TX.env = envCube;

    // Detailed maple leaf silhouettes: five-lobed Acer palmatum / Chinese
    // red maple, and three-lobed Liquidambar formosana (枫香). Veins are drawn
    // in light grey so instance colours still tint the whole leaf.
    function mapleLeafCanvas(lobes) {
      const c = YL.canvas(256, 256), g = c.getContext('2d');
      g.clearRect(0, 0, 256, 256);
      g.save();
      g.translate(128, 132);
      g.fillStyle = '#ffffff';
      g.strokeStyle = 'rgba(255,255,255,.96)';
      g.lineWidth = 2.4;
      if (lobes === 3) {
        g.beginPath();
        g.moveTo(0, -116);
        g.quadraticCurveTo(35, -82, 96, -34);
        g.quadraticCurveTo(58, -22, 45, -18);
        g.quadraticCurveTo(40, 20, 0, 88);
        g.quadraticCurveTo(-40, 20, -45, -18);
        g.quadraticCurveTo(-58, -22, -96, -34);
        g.quadraticCurveTo(-35, -82, 0, -116);
        g.closePath();
      } else {
        g.beginPath();
        g.moveTo(0, -116);
        g.quadraticCurveTo(28, -82, 86, -52);
        g.quadraticCurveTo(57, -36, 35, -27);
        g.quadraticCurveTo(72, -3, 102, 36);
        g.quadraticCurveTo(62, 23, 36, 29);
        g.quadraticCurveTo(25, 65, 0, 88);
        g.quadraticCurveTo(-25, 65, -36, 29);
        g.quadraticCurveTo(-62, 23, -102, 36);
        g.quadraticCurveTo(-72, -3, -35, -27);
        g.quadraticCurveTo(-57, -36, -86, -52);
        g.quadraticCurveTo(-28, -82, 0, -116);
        g.closePath();
      }
      g.fill();
      g.stroke();
      // stem
      g.fillStyle = '#ffffff';
      g.fillRect(-2.5, 84, 5, 38);
      // main veins
      g.strokeStyle = 'rgba(198,198,198,.9)';
      g.lineWidth = 2.1;
      g.beginPath(); g.moveTo(0, 86); g.lineTo(0, -100); g.stroke();
      const tips = lobes === 3 ? [[0, -108], [88, -34], [-88, -34]] :
        [[0, -108], [80, -47], [94, 31], [-80, -47], [-94, 31]];
      for (const tip of tips) {
        g.beginPath();
        g.moveTo(0, 82);
        g.quadraticCurveTo(tip[0] * 0.25, tip[1] * 0.55, tip[0] * 0.82, tip[1] * 0.82);
        g.stroke();
      }
      // fine tertiary veins
      g.strokeStyle = 'rgba(210,210,210,.55)';
      g.lineWidth = 0.9;
      for (let i = 0; i < 12; i++) {
        const a = -1.0 + i * 0.17;
        g.beginPath();
        g.moveTo(Math.cos(a) * 12, 60 - Math.abs(Math.sin(a)) * 20);
        g.lineTo(Math.cos(a) * 58, 60 - Math.abs(Math.sin(a)) * 82);
        g.stroke();
      }
      g.restore();
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.anisotropy = 4;
      return t;
    }
    YL.TX.mapleLeaf = mapleLeafCanvas(5);
    YL.TX.mapleLeaf3 = mapleLeafCanvas(3);

    const door = latticeCanvases('door');
    const win = latticeCanvases('window');
    YL.TX.door = texture(door.map, 1, 1);
    YL.TX.doorE = texture(door.emissive, 1, 1);
    YL.TX.window = texture(win.map, 1, 1);
    YL.TX.windowE = texture(win.emissive, 1, 1);
  };

  YL.initMaterials = function () {
    if (YL.M) return;
    YL.initTextures();
    const std = (o) => new THREE.MeshStandardMaterial(o);
    const M = YL.M = {};
    M.plaster = std({
      map: YL.TX.plaster, bumpMap: YL.TX.plaster, bumpScale: 0.025,
      color: 0xe1dacb, roughness: 0.96, metalness: 0
    });
    M.plasterWarm = std({
      map: YL.TX.plaster, bumpMap: YL.TX.plaster, bumpScale: 0.025,
      color: 0xdccdb0, roughness: 0.95
    });
    M.stone = std({
      map: YL.TX.stone, bumpMap: YL.TX.stone, bumpScale: 0.045,
      color: 0xc3beaf, roughness: 0.92
    });
    M.stoneDark = std({ color: 0x5c5a52, roughness: 0.94 });
    M.stoneLight = std({ color: 0xa8a393, roughness: 0.9 });
    M.paving = std({
      map: YL.TX.stone.clone(), bumpMap: YL.TX.stone, bumpScale: 0.035,
      color: 0xb8b3a5, roughness: 0.96
    });
    M.paving.map.repeat.set(18, 18);
    M.gravel = std({ color: 0xa49b87, roughness: 1 });
    M.wood = std({
      map: YL.TX.wood, bumpMap: YL.TX.wood, bumpScale: 0.018,
      color: 0xffffff, roughness: 0.78
    });
    M.woodDark = std({ color: 0x2e1712, roughness: 0.8 });
    M.woodBeam = std({ color: 0x4a2018, roughness: 0.72 });
    M.roof = std({
      map: YL.TX.roof, bumpMap: YL.TX.roof, bumpScale: 0.09,
      color: 0xffffff, roughness: 0.86, metalness: 0.02, side: THREE.DoubleSide
    });
    M.roofDark = std({ color: 0x2d363b, roughness: 0.84, side: THREE.DoubleSide });
    M.ridge = std({ color: 0x262e32, roughness: 0.78 });
    M.tileEnd = std({ color: 0x4f5859, roughness: 0.9 });
    M.gold = std({ color: 0xc9a252, metalness: 0.62, roughness: 0.33 });
    M.bronze = std({ color: 0x6e5c3a, metalness: 0.58, roughness: 0.46 });
    M.iron = std({ color: 0x2a2c2b, metalness: 0.5, roughness: 0.55 });
    M.paper = std({ color: 0xcdbb94, roughness: 0.95 });
    M.paperWhite = std({ color: 0xefe6d2, roughness: 0.94 });
    M.ink = std({ color: 0x171513, roughness: 0.6 });
    M.celadon = std({ color: 0x90ad9b, roughness: 0.34, metalness: 0.04 });
    M.porcelain = std({ color: 0xe6e2d5, roughness: 0.28 });
    M.porcelainBlue = std({ color: 0xd8e0e2, roughness: 0.3 });
    M.terracotta = std({ color: 0x97593c, roughness: 0.88 });
    M.soil = std({ color: 0x302319, roughness: 1 });
    M.tea = std({ color: 0x53331e, roughness: 0.4 });
    M.candle = std({ color: 0xe6d6ae, roughness: 0.82 });
    M.flame = std({
      color: 0xffc46b, emissive: 0xff7a1e, emissiveIntensity: 1.4, roughness: 0.4
    });
    M.clothIndigo = std({ color: 0x33465b, roughness: 0.92 });
    M.clothInk = std({ color: 0x2c2b28, roughness: 0.92 });
    M.clothCream = std({ color: 0xd6c8ae, roughness: 0.92 });
    M.clothRust = std({ color: 0x7a3528, roughness: 0.92 });
    M.clothOlive = std({ color: 0x596044, roughness: 0.92 });
    M.clothPale = std({ color: 0xb8bfb4, roughness: 0.92 });
    M.skin = std({ color: 0xc8a47d, roughness: 0.86 });
    M.hair = std({ color: 0x1b1714, roughness: 0.9 });
    M.umbrellaPaper = std({ color: 0xc7a15e, roughness: 0.76, side: THREE.DoubleSide });
    M.umbrellaRed = std({ color: 0x8e3628, roughness: 0.8, side: THREE.DoubleSide });
    M.jade = std({ color: 0x7ea58f, roughness: 0.26, metalness: 0.08 });
    M.lacquer = std({ color: 0x571d17, roughness: 0.42 });
    M.silkRed = std({ color: 0x8a2d23, roughness: 0.86 });
    M.bambooGreen = std({ color: 0x5c763b, roughness: 0.86 });
    M.lotusPink = std({ color: 0xd08a94, roughness: 0.85 });
    M.lotusWhite = std({ color: 0xe8ddcf, roughness: 0.85 });
    M.wicker = std({ color: 0x8b6d45, roughness: 0.9 });
    M.trunk = std({ color: 0x5a4433, roughness: 0.96 });
    M.trunkDark = std({ color: 0x3e3026, roughness: 0.98 });
    M.leafA = std({ color: 0x7d5c2c, roughness: 0.88, flatShading: false });
    M.leafB = std({ color: 0x93682c, roughness: 0.88, flatShading: false });
    M.leafC = std({ color: 0xa97a31, roughness: 0.88, flatShading: false });
    M.leafD = std({ color: 0x634f2b, roughness: 0.88, flatShading: false });
    M.ginkgo = std({ color: 0xd6a126, roughness: 0.86, flatShading: false });
    M.ginkgoLight = std({ color: 0xe4b83a, roughness: 0.86, flatShading: false });
    M.maple = std({ color: 0x8c2318, roughness: 0.86, flatShading: false });
    M.mapleLight = std({ color: 0xb43a1f, roughness: 0.86, flatShading: false });
    M.pine = std({ color: 0x2b3a2a, roughness: 0.92, flatShading: false });
    M.bamboo = std({ color: 0x536b37, roughness: 0.88 });
    M.bambooLeaf = std({ color: 0x6f7d3b, roughness: 0.88, flatShading: false });
    M.mapleCard = new THREE.MeshStandardMaterial({
      map: YL.TX.mapleLeaf, color: 0xffffff,
      transparent: true, alphaTest: 0.35, depthWrite: true,
      side: THREE.DoubleSide, roughness: 0.88, metalness: 0
    });
    M.mapleCard3 = new THREE.MeshStandardMaterial({
      map: YL.TX.mapleLeaf3, color: 0xffffff,
      transparent: true, alphaTest: 0.35, depthWrite: true,
      side: THREE.DoubleSide, roughness: 0.88, metalness: 0
    });
    M.mapleGround = new THREE.MeshStandardMaterial({
      map: YL.TX.mapleLeaf, color: 0xffffff,
      alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.92, metalness: 0
    });
    M.mapleGround3 = new THREE.MeshStandardMaterial({
      map: YL.TX.mapleLeaf3, color: 0xffffff,
      alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.92, metalness: 0
    });
    M.grass = std({ color: 0x5c5c30, roughness: 1 });
    M.water = new THREE.MeshStandardMaterial({
      color: 0x16312e, roughness: 0.3, metalness: 0.08,
      normalMap: YL.TX.waterN,
      normalScale: new THREE.Vector2(0.55, 0.55),
      envMap: YL.TX.env, envMapIntensity: 0.55,
      transparent: true, opacity: 0.92
    });
    M.redLacquer = std({ color: 0x65231b, roughness: 0.58 });
    M.redWall = std({ color: 0x8a3a2a, roughness: 0.92 });
    M.white = std({ color: 0xece7da, roughness: 0.95 });
    M.black = std({ color: 0x14100d, roughness: 0.7 });
    M.lattice = std({
      map: YL.TX.door, emissiveMap: YL.TX.doorE, emissive: 0xffa94d,
      emissiveIntensity: 0, roughness: 0.8
    });
    M.latticeWin = std({
      map: YL.TX.window, emissiveMap: YL.TX.windowE, emissive: 0xffa94d,
      emissiveIntensity: 0, roughness: 0.8
    });
    YL.litMats = [M.lattice, M.latticeWin];

    // The renderer writes sRGB. Material and light hex values are authored in
    // sRGB, so move them into linear space exactly once.
    for (const key of Object.keys(M)) {
      const m = M[key];
      if (m.color) m.color.convertSRGBToLinear();
      if (m.emissive) m.emissive.convertSRGBToLinear();
    }

    // A light vertex-shader wind for foliage. The same material is shared by
    // many merged canopies, so the motion costs almost nothing at runtime.
    YL.windShaders = [];
    YL.enableWind = function (mat, amplitude, speed) {
      mat.onBeforeCompile = function (shader) {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uWind = { value: amplitude };
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nuniform float uWind;'
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float windPh = uTime * ${speed.toFixed(2)} + (modelMatrix[3].x + modelMatrix[3].z) * 0.31 + position.y * 0.34;
          float windW = smoothstep(0.0, 3.5, position.y);
          transformed.x += (sin(windPh) + 0.45 * sin(windPh * 1.73)) * uWind * windW;
          transformed.z += cos(windPh * 0.83) * uWind * 0.55 * windW;`
        );
        mat.userData.shader = shader;
        YL.windShaders.push(shader);
      };
      mat.customProgramCacheKey = function () { return 'ylwind' + amplitude + speed; };
    };
    ['leafA', 'leafB', 'leafC', 'leafD', 'ginkgo', 'ginkgoLight', 'maple', 'mapleLight', 'pine', 'bambooLeaf']
      .forEach(function (k) {
        if (M[k]) YL.enableWind(M[k], k === 'bambooLeaf' ? 0.12 : 0.075, 1.15);
      });
  };

  /* -------------------------- primitives -------------------------- */

  YL.box = function (parent, w, h, d, mat, x, y, z, opt) {
    opt = opt || {};
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (opt.ry) m.rotation.y = opt.ry;
    if (opt.rx) m.rotation.x = opt.rx;
    if (opt.rz) m.rotation.z = opt.rz;
    m.castShadow = opt.cast !== false;
    m.receiveShadow = opt.receive !== false;
    parent.add(m);
    return m;
  };

  YL.cyl = function (parent, rt, rb, h, mat, x, y, z, opt) {
    opt = opt || {};
    const seg = opt.seg || 12;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (opt.rx) m.rotation.x = opt.rx;
    if (opt.rz) m.rotation.z = opt.rz;
    if (opt.ry) m.rotation.y = opt.ry;
    m.castShadow = opt.cast !== false;
    m.receiveShadow = opt.receive !== false;
    parent.add(m);
    return m;
  };

  YL.plane = function (parent, w, h, mat, x, y, z, opt) {
    opt = opt || {};
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, opt.sx || 1, opt.sy || 1), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (opt.ry) m.rotation.y = opt.ry;
    if (opt.rx) m.rotation.x = opt.rx;
    m.castShadow = false;
    m.receiveShadow = opt.receive !== false;
    parent.add(m);
    return m;
  };

  YL.tube = function (parent, points, radius, mat, seg, radial) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, seg || 32, radius, radial || 6, false);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  YL.ensureUpNormals = function (geo) {
    geo.computeVertexNormals();
    const n = geo.attributes.normal;
    let sum = 0;
    for (let i = 0; i < n.count; i++) sum += n.getY(i);
    if (sum < 0) {
      for (let i = 0; i < n.count; i++) n.setY(i, -n.getY(i));
      n.needsUpdate = true;
    }
    return geo;
  };

  /* -------------------------- roofs -------------------------- */

  // Gable roof with concave slopes and lifted corners. Ridge runs along X.
  YL.gableRoof = function (opt) {
    const w = opt.w, d = opt.d, h = opt.h, lift = opt.lift == null ? 0.62 : opt.lift;
    const tileMat = opt.tileMat || YL.M.roof;
    const ridgeMat = opt.ridgeMat || YL.M.ridge;
    const gableMat = opt.gableMat || YL.M.plaster;
    const g = new THREE.Group();
    g.name = 'roof';
    const segX = opt.segX || 42, segT = opt.segT || 16;
    for (const sign of [1, -1]) {
      const pos = [], uv = [], idx = [];
      for (let i = 0; i <= segX; i++) {
        const x = -w / 2 + w * i / segX;
        for (let j = 0; j <= segT; j++) {
          const t = j / segT;
          const z = sign * (d / 2) * t;
          const y = h * Math.pow(1 - t, 1.55) +
            lift * Math.pow(Math.abs(x) / (w / 2), 4.2) * Math.pow(t, 3.0);
          pos.push(x, y, z);
          uv.push((x + w / 2) / 2.5, t * (d / 2) / 2.5);
        }
      }
      for (let i = 0; i < segX; i++) {
        for (let j = 0; j < segT; j++) {
          const a = i * (segT + 1) + j;
          const b = (i + 1) * (segT + 1) + j;
          const c = b + 1, dd = a + 1;
          if (sign > 0) idx.push(a, dd, c, a, c, b);
          else idx.push(a, b, c, a, c, dd);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      YL.ensureUpNormals(geo);
      const mesh = new THREE.Mesh(geo, tileMat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      g.add(mesh);
    }
    // triangular gable ends
    if (opt.gables !== false) {
      const shape = new THREE.Shape();
      shape.moveTo(-d / 2, 0); shape.lineTo(d / 2, 0); shape.lineTo(0, h * 0.98); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.26, bevelEnabled: false });
      geo.rotateY(Math.PI / 2);
      geo.translate(0, 0, 0);
      for (const sx of [-1, 1]) {
        const m = new THREE.Mesh(geo, gableMat);
        m.position.x = sx * (w / 2 - 0.16) - (sx > 0 ? 0 : 0.26);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
    }
    // gable vent / 悬鱼
    if (opt.gableVent) {
      for (const sx of [-1, 1]) {
        const gx = sx * (w / 2 + 0.14);
        YL.box(g, 0.14, 0.22, d * 0.72, YL.M.woodDark, gx, h * 0.19, 0, { cast: true });
        const disc = new THREE.Mesh(new THREE.CircleGeometry(h * 0.19, 18), YL.M.woodDark);
        disc.position.set(gx, h * 0.47, 0);
        disc.rotation.y = sx * Math.PI / 2;
        disc.castShadow = true; g.add(disc);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(h * 0.19, 0.055, 6, 20), YL.M.woodBeam);
        ring.position.set(gx + sx * 0.02, h * 0.47, 0);
        ring.rotation.y = Math.PI / 2;
        g.add(ring);
      }
    }
    // ridge
    YL.box(g, w * 0.98, 0.34, 0.5, ridgeMat, 0, h + 0.1, 0, { cast: true });
    for (const sx of [-1, 1]) {
      const orn = YL.box(g, 0.32, 0.62, 0.38, ridgeMat, sx * (w / 2 - 0.1), h + 0.4, 0, { cast: true });
      orn.rotation.z = sx * -0.35;
      const tip = YL.box(g, 0.16, 0.34, 0.24, YL.M.gold, sx * (w / 2 - 0.02), h + 0.74, 0, { cast: true });
      tip.rotation.z = sx * -0.35;
    }
    // curved eave trim + tile ends
    for (const sign of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const x = -w / 2 + w * i / 20;
        const y = lift * Math.pow(Math.abs(x) / (w / 2), 4.2);
        pts.push(new THREE.Vector3(x, y - 0.03, sign * (d / 2 + 0.02)));
      }
      YL.tube(g, pts, 0.105, opt.trimMat || YL.M.woodBeam, 28, 5);
      // exposed rafter ends under the eave, a strong close-up detail
      if (opt.rafters !== false && w > 13) {
        const rn = Math.max(8, Math.floor(w / 0.78));
        for (let i = 0; i < rn; i++) {
          const rx = -w / 2 + w * (i + 0.5) / rn;
          const ry = lift * Math.pow(Math.abs(rx) / (w / 2), 4.2);
          YL.box(g, 0.11, 0.13, 0.7, opt.trimMat || YL.M.woodBeam,
            rx, ry - 0.22, sign * (d / 2 - 0.38), { cast: true });
        }
      }
      if (opt.tileEnds !== false) {
        const count = Math.max(8, Math.floor(w / 0.62));
        const geo = new THREE.CylinderGeometry(0.085, 0.085, 0.09, 8);
        geo.rotateX(Math.PI / 2);
        const inst = new THREE.InstancedMesh(geo, YL.M.tileEnd, count * 2);
        inst.castShadow = true;
        const mtx = new THREE.Matrix4();
        let k = 0;
        for (const s of [1, -1]) {
          for (let i = 0; i < count; i++) {
            const x = -w / 2 + w * (i + 0.5) / count;
            const y = lift * Math.pow(Math.abs(x) / (w / 2), 4.2);
            mtx.makeTranslation(x, y + 0.015, s * (d / 2 + 0.08));
            inst.setMatrixAt(k++, mtx);
          }
        }
        inst.instanceMatrix.needsUpdate = true;
        g.add(inst);
      }
    }
    return g;
  };

  // Square hip / pyramid roof with concave slopes and upturned corners.
  YL.pavilionRoof = function (opt) {
    const size = opt.size, h = opt.h, lift = opt.lift == null ? 0.55 : opt.lift;
    const inner = opt.inner || 0;
    const g = new THREE.Group();
    const segA = 96, segT = 16;
    const pos = [], uv = [], idx = [];
    for (let a = 0; a <= segA; a++) {
      const th = a / segA * TAU;
      const ca = Math.cos(th), sa = Math.sin(th);
      const rmax = (size / 2) / Math.max(Math.abs(ca), Math.abs(sa));
      const r0 = rmax * inner;
      const corner = Math.pow(Math.abs(Math.sin(2 * th)), 5);
      for (let j = 0; j <= segT; j++) {
        const t = j / segT;
        const r = r0 + (rmax - r0) * t;
        const y = h * Math.pow(1 - t, 1.45) + lift * corner * Math.pow(t, 5.2) + (opt.yBase || 0);
        pos.push(r * ca, y, r * sa);
        uv.push(th / TAU * (size / 2.1), t * (rmax / 2.1));
      }
    }
    for (let a = 0; a < segA; a++) {
      for (let j = 0; j < segT; j++) {
        const p = a * (segT + 1) + j;
        const q = (a + 1) * (segT + 1) + j;
        idx.push(p, q, q + 1, p, q + 1, p + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    YL.ensureUpNormals(geo);
    const mesh = new THREE.Mesh(geo, opt.tileMat || YL.M.roof);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    // hip ridges along diagonals
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const pts = [];
        for (let j = 0; j <= 12; j++) {
          const t = j / 12;
          const x = sx * (size / 2) * t, z = sz * (size / 2) * t;
          const y = h * Math.pow(1 - t, 1.45) + lift * Math.pow(t, 5.2) + (opt.yBase || 0) + 0.05;
          pts.push(new THREE.Vector3(x, y, z));
        }
        YL.tube(g, pts, 0.1, YL.M.ridge, 18, 5);
      }
    }
    // eave trim (square, lifted at corners)
    const per = [];
    const cornerY = lift + (opt.yBase || 0);
    per.push(new THREE.Vector3(-size / 2, cornerY, -size / 2));
    per.push(new THREE.Vector3(0, (opt.yBase || 0), -size / 2));
    per.push(new THREE.Vector3(size / 2, cornerY, -size / 2));
    per.push(new THREE.Vector3(size / 2, (opt.yBase || 0), 0));
    per.push(new THREE.Vector3(size / 2, cornerY, size / 2));
    per.push(new THREE.Vector3(0, (opt.yBase || 0), size / 2));
    per.push(new THREE.Vector3(-size / 2, cornerY, size / 2));
    per.push(new THREE.Vector3(-size / 2, (opt.yBase || 0), 0));
    per.push(new THREE.Vector3(-size / 2, cornerY, -size / 2));
    const curve = new THREE.CatmullRomCurve3(per, false, 'catmullrom', 0.15);
    const trim = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.1, 5, false), YL.M.woodBeam);
    trim.castShadow = true; g.add(trim);
    // finial
    if (opt.finial !== false) {
      const fy = h + (opt.yBase || 0);
      YL.cyl(g, 0.06, 0.16, 1.1, YL.M.gold, 0, fy + 0.55, 0, { seg: 8 });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), YL.M.gold);
      ball.position.y = fy + 1.1; ball.castShadow = true; g.add(ball);
      YL.cyl(g, 0.3, 0.34, 0.16, YL.M.ridge, 0, fy + 0.15, 0, { seg: 12 });
    }
    return g;
  };

  // Rectangular ring roof ("skirt") for double-eave buildings.
  YL.skirtRoof = function (opt) {
    const w = opt.w, d = opt.d, h = opt.h, lift = opt.lift == null ? 0.5 : opt.lift;
    const inner = opt.inner || 0.55;
    const g = new THREE.Group();
    const segA = 96, segT = 8;
    const pos = [], uv = [], idx = [];
    for (let a = 0; a <= segA; a++) {
      const th = a / segA * TAU;
      const ca = Math.cos(th), sa = Math.sin(th);
      const rmax = 0.5 / Math.max(Math.abs(ca) / w, Math.abs(sa) / d);
      const r0 = rmax * inner;
      const corner = Math.pow(Math.abs(Math.sin(2 * th)), 4);
      for (let j = 0; j <= segT; j++) {
        const t = j / segT;
        const r = r0 + (rmax - r0) * t;
        const y = h * Math.pow(1 - t, 1.35) + lift * corner * Math.pow(t, 4);
        pos.push(r * ca, y, r * sa);
        uv.push(th / TAU * (Math.max(w, d) / 2.1), t * 2.0);
      }
    }
    for (let a = 0; a < segA; a++) {
      for (let j = 0; j < segT; j++) {
        const p = a * (segT + 1) + j, q = (a + 1) * (segT + 1) + j;
        idx.push(p, q, q + 1, p, q + 1, p + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    YL.ensureUpNormals(geo);
    const mesh = new THREE.Mesh(geo, opt.tileMat || YL.M.roof);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    // perimeter eave trim
    const pts = [];
    const n = 12;
    const hw = w / 2, hd = d / 2;
    for (let i = 0; i <= n; i++) pts.push(new THREE.Vector3(-hw + 2 * hw * i / n, (i === 0 || i === n) ? lift : 0, -hd));
    for (let i = 1; i <= n; i++) pts.push(new THREE.Vector3(hw, (i === n) ? lift : 0, -hd + 2 * hd * i / n));
    for (let i = 1; i <= n; i++) pts.push(new THREE.Vector3(hw - 2 * hw * i / n, (i === n) ? lift : 0, hd));
    for (let i = 1; i <= n; i++) pts.push(new THREE.Vector3(-hw, (i === n) ? lift : 0, hd - 2 * hd * i / n));
    YL.tube(g, pts, 0.1, YL.M.woodBeam, 80, 5);
    return g;
  };

  /* -------------------------- signs -------------------------- */

  YL.signMaterial = function (text, opt) {
    opt = opt || {};
    const c = signCanvas(text, opt);
    const t = texture(c, 1, 1);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return new THREE.MeshStandardMaterial({
      map: t, roughness: 0.55, metalness: 0.05,
      emissive: YL.linearColor(0xffb35e), emissiveMap: t, emissiveIntensity: 0.08
    });
  };

  YL.plaque = function (parent, text, w, h, x, y, z, opt) {
    opt = opt || {};
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (opt.ry) g.rotation.y = opt.ry;
    const depth = opt.depth || 0.13;
    YL.box(g, w + 0.24, h + 0.24, depth, YL.M.woodDark, 0, 0, -depth / 2, { cast: true });
    const mat = YL.signMaterial(text, opt);
    YL.plane(g, w, h, mat, 0, 0, 0.015);
    const frame = YL.M.gold;
    YL.box(g, w + 0.28, 0.055, depth + 0.05, frame, 0, h / 2 + 0.13, 0.01, { cast: true });
    YL.box(g, w + 0.28, 0.055, depth + 0.05, frame, 0, -h / 2 - 0.13, 0.01, { cast: true });
    YL.box(g, 0.055, h + 0.3, depth + 0.05, frame, -w / 2 - 0.13, 0, 0.01, { cast: true });
    YL.box(g, 0.055, h + 0.3, depth + 0.05, frame, w / 2 + 0.13, 0, 0.01, { cast: true });
    if (opt.angle) g.rotation.z = opt.angle;
    parent.add(g);
    return g;
  };

  YL.couplet = function (parent, text, w, h, x, y, z, opt) {
    opt = opt || {};
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (opt.ry) g.rotation.y = opt.ry;
    const depth = 0.09;
    YL.box(g, w + 0.1, h + 0.1, depth, YL.M.woodDark, 0, 0, -depth / 2);
    const c = coupletCanvas(text);
    const tx = texture(c, 1, 1);
    tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping;
    const mat = new THREE.MeshStandardMaterial({
      map: tx, roughness: 0.6, emissive: YL.linearColor(0xffb35e),
      emissiveMap: tx, emissiveIntensity: 0.06
    });
    YL.plane(g, w, h, mat, 0, 0, 0.012);
    parent.add(g);
    return g;
  };

  /* -------------------------- details -------------------------- */

  YL.dougong = function (parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    YL.box(g, 1.15, 0.14, 0.34, YL.M.woodBeam, 0, 0, 0);
    YL.box(g, 0.28, 0.22, 0.5, YL.M.woodDark, -0.45, 0.18, 0.08);
    YL.box(g, 0.28, 0.22, 0.5, YL.M.woodDark, 0.45, 0.18, 0.08);
    YL.box(g, 0.8, 0.12, 0.28, YL.M.woodBeam, 0, 0.34, 0.12);
    YL.box(g, 0.22, 0.2, 0.42, YL.M.woodDark, 0, 0.5, 0.15);
    parent.add(g);
    return g;
  };

  YL.lantern = function (parent, x, y, z, scale, color) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale || 1);
    const mat = color === 'warm'
      ? new THREE.MeshStandardMaterial({ color: YL.linearColor(0xc45a32), emissive: YL.linearColor(0xff6a2a), emissiveIntensity: 0.15, roughness: 0.6 })
      : new THREE.MeshStandardMaterial({ color: YL.linearColor(0xa53528), emissive: YL.linearColor(0xff5a2a), emissiveIntensity: 0.2, roughness: 0.55 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8), mat);
    body.scale.y = 1.22; body.castShadow = true; g.add(body);
    YL.cyl(g, 0.12, 0.12, 0.08, YL.M.gold, 0, 0.31, 0);
    YL.cyl(g, 0.12, 0.12, 0.08, YL.M.gold, 0, -0.31, 0);
    YL.cyl(g, 0.018, 0.018, 0.42, YL.M.woodDark, 0, 0.55, 0);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      YL.cyl(g, 0.01, 0.01, 0.34, YL.M.gold, Math.cos(a) * 0.22, -0.48, Math.sin(a) * 0.22, { seg: 4 });
    }
    if (!YL.lanternMats) YL.lanternMats = [];
    YL.lanternMats.push(mat);
    if (YL.TX && YL.TX.glow) {
      const glowMat = new THREE.SpriteMaterial({
        map: YL.TX.glow, color: 0xffb36a, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.14
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(2.2, 2.2, 1);
      g.add(glow);
      if (!YL.lanternGlowMats) YL.lanternGlowMats = [];
      YL.lanternGlowMats.push(glowMat);
    }
    parent.add(g);
    return g;
  };

  YL.railing = function (parent, x, y, z, len, ry, opt) {
    opt = opt || {};
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry || 0;
    const mat = opt.mat || YL.M.woodBeam;
    const h = opt.h || 1.0;
    const n = Math.max(2, Math.round(len / 1.15));
    YL.box(g, len, 0.1, 0.12, mat, 0, h, 0, { cast: true });
    YL.box(g, len, 0.08, 0.1, mat, 0, h * 0.55, 0, { cast: true });
    for (let i = 0; i <= n; i++) {
      const px = -len / 2 + len * i / n;
      YL.box(g, 0.09, h, 0.09, mat, px, h / 2, 0, { cast: true });
    }
    parent.add(g);
    return g;
  };

  YL.stoneLantern = function (parent, x, z, s) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(s);
    YL.box(g, 0.7, 0.28, 0.7, YL.M.stoneDark, 0, 0.14, 0);
    YL.cyl(g, 0.13, 0.18, 1.25, YL.M.stoneLight, 0, 0.88, 0, { seg: 8 });
    YL.box(g, 0.55, 0.1, 0.55, YL.M.stoneDark, 0, 1.5, 0);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.42),
      new THREE.MeshStandardMaterial({
        color: YL.linearColor(0xcbbf9e), roughness: 0.7,
        emissive: YL.linearColor(0xffa94d), emissiveIntensity: 0
      }));
    lamp.position.y = 1.78; lamp.castShadow = true; g.add(lamp);
    if (!YL.lampMats) YL.lampMats = [];
    YL.lampMats.push(lamp.material);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.34, 4), YL.M.stoneDark);
    cap.position.y = 2.16; cap.rotation.y = Math.PI / 4; cap.castShadow = true; g.add(cap);
    parent.add(g);
    return g;
  };

  /* -------------------------- merge -------------------------- */

  YL.mergeByMaterial = function (root) {
    if (!THREE.BufferGeometryUtils) return root;
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map();
    const remove = [];
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.userData.noMerge) return;
      if (Array.isArray(o.material)) return;
      if (o.material.transparent) return;
      if (!o.geometry || !o.geometry.attributes.position) return;
      const key = o.material.uuid;
      if (!buckets.has(key)) buckets.set(key, { mat: o.material, list: [], cast: false, receive: false });
      const b = buckets.get(key);
      // Merge only non-indexed geometry: ExtrudeGeometry and ShapeGeometry
      // are not consistently indexed, and mergeBufferGeometries requires
      // every input to agree on the index attribute.
      const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      geo.applyMatrix4(m);
      if (!geo.attributes.normal) geo.computeVertexNormals();
      if (!geo.attributes.uv) {
        const n = geo.attributes.position.count;
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
      }
      b.list.push(geo);
      b.cast = b.cast || o.castShadow;
      b.receive = b.receive || o.receiveShadow;
      remove.push(o);
    });
    remove.forEach(o => { if (o.parent) o.parent.remove(o); });
    buckets.forEach(b => {
      if (!b.list.length) return;
      const merged = THREE.BufferGeometryUtils.mergeBufferGeometries(b.list, false);
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, b.mat);
      mesh.castShadow = b.cast; mesh.receiveShadow = b.receive;
      mesh.name = 'merged_' + (b.mat.name || b.mat.uuid.slice(0, 6));
      root.add(mesh);
      b.list.forEach(g => g.dispose());
    });
    return root;
  };

  /* -------------------------- terrain -------------------------- */

  YL.groundHeight = function (x, z) {
    let h = 0;
    // Yuelu Mountain rises to the west (-Z)
    const d = (-z - 66);
    if (d > 0) {
      const t = YL.smoothstep(0, 130, d);
      h += t * (10 + 34 * YL.fbm(x * 0.012 + 5.2, z * 0.012 + 9.1, 4));
      h += YL.smoothstep(60, 210, d) * (18 + 28 * YL.fbm(x * 0.008 + 2.0, z * 0.008, 3));
    }
    // northern ridge
    const dn = x - 58;
    if (dn > 0) {
      const t = YL.smoothstep(0, 100, dn);
      h += t * (5 + 20 * YL.fbm(x * 0.014 + 11, z * 0.014 + 4, 3));
    }
    // flatten the immediate academy platform
    const platform = YL.smoothstep(74, 60, Math.abs(x)) * YL.smoothstep(72, 58, Math.abs(z + 5));
    h *= (1 - platform * 0.98);
    // flatten a small pad around Aiwan Pavilion
    const pd = Math.hypot(x - 30, z + 88);
    h *= YL.smoothstep(9, 24, pd);
    return h;
  };
})();
