/* ============================================================
   岳麓书院 · 3D  /  furnishings.js
   Scholarly props, tea sets, books, plants, ritual vessels and
   the detailed interior dressing of the halls.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL;
  const M = () => YL.M;
  const TAU = Math.PI * 2;

  function box(parent, w, h, d, mat, x, y, z, opt) {
    return YL.box(parent, w, h, d, mat, x, y, z, opt || {});
  }
  function cyl(parent, rt, rb, h, mat, x, y, z, opt) {
    return YL.cyl(parent, rt, rb, h, mat, x, y, z, opt || {});
  }

  function addBook(parent, x, y, z, ry, open) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry || 0;
    if (open) {
      box(g, 0.46, 0.035, 0.32, M().woodDark, 0, 0, 0);
      for (const sz of [-1, 1]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), M().paperWhite);
        p.position.set(0, 0.035, sz * 0.15);
        p.rotation.x = sz * 0.18;
        p.castShadow = false; g.add(p);
      }
      // a few brush-written lines on the open pages
      for (let i = 0; i < 4; i++) {
        box(g, 0.17, 0.002, 0.012, M().ink, -0.1 + (i % 2) * 0.02, 0.04, -0.06 + i * 0.04);
      }
    } else {
      box(g, 0.34, 0.12, 0.24, M().woodDark, 0, 0, 0);
      box(g, 0.33, 0.09, 0.23, M().paperWhite, 0, 0.012, 0);
      box(g, 0.025, 0.1, 0.24, M().silkRed, 0.16, 0.015, 0);
    }
    parent.add(g);
    return g;
  }

  function addScroll(parent, x, y, z, ry) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry || 0;
    cyl(g, 0.035, 0.035, 0.38, M().woodDark, -0.1, 0, 0, { rz: Math.PI / 2, seg: 8 });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), M().paperWhite);
    paper.position.set(0.16, 0.0, 0.01);
    paper.rotation.x = -Math.PI / 2;
    g.add(paper);
    box(g, 0.54, 0.014, 0.03, M().woodDark, 0.16, -0.02, 0.16);
    parent.add(g);
    return g;
  }

  YL.addTeaSet = function (parent, x, y, z, s, celadon) {
    s = s || 1;
    const mat = celadon ? M().celadon : M().porcelain;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    cyl(g, 0.62, 0.62, 0.035, M().woodBeam, 0, 0.02, 0, { seg: 16 });
    // teapot
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), mat);
    body.position.set(-0.12, 0.16, 0); body.scale.y = 0.78; body.castShadow = true; g.add(body);
    cyl(g, 0.07, 0.1, 0.05, mat, -0.12, 0.29, 0, { seg: 10 });
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat);
    knob.position.set(-0.12, 0.33, 0); g.add(knob);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.04, 0.24, 6), mat);
    spout.position.set(0.06, 0.19, 0); spout.rotation.z = -0.9; g.add(spout);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 5, 12, Math.PI * 1.25), mat);
    handle.position.set(-0.27, 0.18, 0); handle.rotation.y = Math.PI / 2; g.add(handle);
    // cups
    for (const p of [[0.23, 0.08], [0.27, -0.13], [0.05, 0.22]]) {
      cyl(g, 0.052, 0.04, 0.07, mat, p[0], 0.06, p[1], { seg: 10 });
      cyl(g, 0.04, 0.04, 0.008, M().tea, p[0], 0.098, p[1], { seg: 10 });
    }
    // small plate of cakes
    cyl(g, 0.1, 0.1, 0.018, mat, -0.05, 0.05, -0.23, { seg: 12 });
    for (let i = 0; i < 3; i++) {
      const cake = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M().wicker);
      cake.position.set(-0.09 + i * 0.04, 0.08, -0.23);
      cake.scale.y = 0.6; g.add(cake);
    }
    parent.add(g);
    return g;
  };

  YL.addVase = function (parent, x, y, z, s, pale) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    const mat = pale ? M().porcelain : M().celadon;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 9), mat);
    body.position.y = 0.18; body.scale.y = 1.15; body.castShadow = true; g.add(body);
    cyl(g, 0.055, 0.1, 0.13, mat, 0, 0.33, 0, { seg: 10 });
    cyl(g, 0.09, 0.07, 0.03, mat, 0, 0.4, 0, { seg: 10 });
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU;
      cyl(g, 0.006, 0.006, 0.5 + i * 0.08, M().bambooGreen, Math.cos(a) * 0.05, 0.62, Math.sin(a) * 0.05, { rz: Math.cos(a) * 0.3, rx: Math.sin(a) * 0.25, seg: 4 });
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), i === 1 ? M().lotusWhite : M().lotusPink);
      flower.position.set(Math.cos(a) * 0.15, 0.82 + i * 0.08, Math.sin(a) * 0.15);
      flower.scale.set(1, 0.7, 1); g.add(flower);
    }
    parent.add(g);
    return g;
  };

  YL.addCandle = function (parent, x, y, z, h) {
    h = h || 0.2;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    cyl(g, 0.07, 0.1, 0.04, M().bronze, 0, 0.02, 0, { seg: 10 });
    cyl(g, 0.022, 0.028, 0.18, M().gold, 0, 0.11, 0, { seg: 8 });
    cyl(g, 0.026, 0.028, h, M().candle, 0, 0.2 + h / 2, 0, { seg: 8 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 6), M().flame);
    flame.position.y = 0.2 + h + 0.045; g.add(flame);
    parent.add(g);
    return g;
  };

  YL.addIncense = function (parent, x, y, z, s) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + 0.4;
      cyl(g, 0.018, 0.025, 0.26, M().bronze, Math.cos(a) * 0.09, 0.13, Math.sin(a) * 0.09, { seg: 5 });
    }
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 7, 0, TAU, 0, Math.PI / 2), M().bronze);
    bowl.position.y = 0.27; bowl.scale.y = 0.6; bowl.castShadow = true; g.add(bowl);
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.13, 10), M().bronze);
    lid.position.y = 0.38; g.add(lid);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M().gold);
    knob.position.y = 0.47; g.add(knob);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU;
      cyl(g, 0.006, 0.006, 0.3, M().wicker, Math.cos(a) * 0.04, 0.55, Math.sin(a) * 0.04, { rz: Math.cos(a) * 0.18, rx: Math.sin(a) * 0.18, seg: 4 });
    }
    parent.add(g);
    return g;
  };

  YL.addPottedPlant = function (parent, x, z, variant, s, baseY) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, baseY || 0, z);
    g.scale.setScalar(s);
    cyl(g, 0.26, 0.2, 0.34, M().terracotta, 0, 0.17, 0, { seg: 10 });
    cyl(g, 0.28, 0.28, 0.05, M().stoneDark, 0, 0.35, 0, { seg: 10 });
    cyl(g, 0.24, 0.24, 0.03, M().soil, 0, 0.36, 0, { seg: 10 });
    variant = variant || 'pine';
    if (variant === 'pine') {
      cyl(g, 0.025, 0.04, 0.6, M().trunkDark, 0, 0.65, 0, { seg: 5 });
      for (let i = 0; i < 3; i++) {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.3 - i * 0.07, 0.34, 7), M().pine);
        c.position.y = 0.78 + i * 0.22;
        c.rotation.y = i * 0.6; c.castShadow = true; g.add(c);
      }
    } else if (variant === 'orchid') {
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.55, 3), M().bambooLeaf);
        leaf.position.set(Math.cos(a) * 0.1, 0.6, Math.sin(a) * 0.1);
        leaf.rotation.z = Math.cos(a) * 0.55;
        leaf.rotation.x = Math.sin(a) * 0.55;
        g.add(leaf);
      }
      cyl(g, 0.008, 0.008, 0.55, M().bambooGreen, 0.05, 0.68, 0, { seg: 4 });
      for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), M().lotusWhite);
        f.position.set(0.05 + (i - 1) * 0.05, 0.9 - i * 0.04, (i - 1) * 0.03);
        g.add(f);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * TAU;
        cyl(g, 0.018, 0.022, 0.95, M().bambooGreen, Math.cos(a) * 0.1, 0.78, Math.sin(a) * 0.1, { seg: 5 });
        for (let k = 0; k < 4; k++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.34, 3), M().bambooLeaf);
          leaf.position.set(Math.cos(a) * 0.1 + (k - 1.5) * 0.05, 0.8 + k * 0.1, Math.sin(a) * 0.1);
          leaf.rotation.z = (k - 1.5) * 0.5; leaf.rotation.x = Math.cos(a) * 0.5;
          g.add(leaf);
        }
      }
    }
    parent.add(g);
    return g;
  };

  YL.addWaterVat = function (parent, x, z, s) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(s);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.38, 0.72, 14), M().terracotta);
    jar.position.y = 0.36; jar.castShadow = true; g.add(jar);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.055, 6, 16), M().stoneDark);
    rim.position.y = 0.72; rim.rotation.x = Math.PI / 2; g.add(rim);
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.45, 18), M().water);
    water.rotation.x = -Math.PI / 2; water.position.y = 0.68; g.add(water);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.16, 8), M().bambooLeaf);
    pad.rotation.x = -Math.PI / 2; pad.position.set(0.12, 0.7, -0.05); g.add(pad);
    parent.add(g);
    return g;
  };

  YL.addLotus = function (parent, x, z, s, white) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, 0.1, z);
    g.scale.setScalar(s);
    cyl(g, 0.012, 0.015, 0.5, M().bambooGreen, 0, 0.25, 0, { seg: 5 });
    const mat = white ? M().lotusWhite : M().lotusPink;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), mat);
      petal.position.set(Math.cos(a) * 0.08, 0.52, Math.sin(a) * 0.08);
      petal.scale.set(0.55, 1.25, 0.4);
      petal.rotation.z = Math.cos(a) * 0.6;
      petal.rotation.x = Math.sin(a) * 0.6;
      g.add(petal);
    }
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), M().gold);
    heart.position.y = 0.53; g.add(heart);
    parent.add(g);
    return g;
  };

  YL.addLandscape = function (parent, w, h, x, y, z, ry) {
    const c = YL.canvas(1024, 512), g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#c9c0a6'); grd.addColorStop(0.55, '#b5b59d'); grd.addColorStop(1, '#8d9680');
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
    // distant ink mountains
    const rng = YL.rng(77);
    for (let layer = 0; layer < 3; layer++) {
      g.fillStyle = ['rgba(62,76,68,.55)', 'rgba(47,63,56,.68)', 'rgba(33,48,42,.82)'][layer];
      g.beginPath();
      g.moveTo(0, 360 - layer * 22);
      for (let i = 0; i <= 16; i++) {
        const xx = i / 16 * 1024;
        const yy = 270 - layer * 28 + Math.sin(i * 1.3 + layer) * (35 + rng() * 55);
        g.lineTo(xx, yy);
      }
      g.lineTo(1024, 512); g.lineTo(0, 512); g.closePath(); g.fill();
    }
    // mist
    for (let i = 0; i < 3; i++) {
      const m = g.createLinearGradient(0, 300 + i * 30, 0, 380 + i * 30);
      m.addColorStop(0, 'rgba(225,220,203,0)');
      m.addColorStop(0.5, 'rgba(225,220,203,.55)');
      m.addColorStop(1, 'rgba(225,220,203,0)');
      g.fillStyle = m; g.fillRect(0, 290 + i * 30, 1024, 100);
    }
    // river / bank
    g.fillStyle = 'rgba(88,107,101,.45)';
    g.beginPath(); g.moveTo(0, 430); g.quadraticCurveTo(500, 395, 1024, 440); g.lineTo(1024, 512); g.lineTo(0, 512); g.fill();
    // pines on the near bank
    for (let i = 0; i < 9; i++) {
      const xx = 70 + i * 110 + rng() * 40;
      g.strokeStyle = 'rgba(44,54,44,.75)'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(xx, 470); g.lineTo(xx, 380 - rng() * 50); g.stroke();
      g.fillStyle = 'rgba(52,72,48,.65)';
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.ellipse(xx + (k - 1) * 12, 390 - rng() * 50 + k * 14, 24, 9, 0, 0, TAU);
        g.fill();
      }
    }
    // seal and title
    g.fillStyle = 'rgba(120,40,30,.82)';
    g.fillRect(930, 430, 44, 44);
    g.fillStyle = '#e8dcc5';
    g.font = '26px "STKaiti","KaiTi",serif'; g.textAlign = 'center';
    g.fillText('岳', 952, 460);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, side: THREE.DoubleSide });
    const g3 = new THREE.Group();
    g3.name = 'landscape_painting';
    g3.position.set(x, y, z);
    if (ry) g3.rotation.y = ry;
    YL.plane(g3, w, h, mat, 0, 0, 0.08);
    box(g3, w + 0.18, h + 0.18, 0.08, M().woodDark, 0, 0, -0.04);
    box(g3, w + 0.26, 0.06, 0.1, M().woodBeam, 0, h / 2 + 0.1, 0.04);
    box(g3, w + 0.26, 0.06, 0.1, M().woodBeam, 0, -h / 2 - 0.1, 0.04);
    parent.add(g3);
    return g3;
  };

  YL.addPalaceLantern = function (parent, x, y, z, s) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    cyl(g, 0.012, 0.012, 0.9, M().bronze, 0, 0.9, 0, { seg: 4 });
    cyl(g, 0.3, 0.34, 0.07, M().woodDark, 0, 0.46, 0, { seg: 6 });
    cyl(g, 0.34, 0.3, 0.07, M().woodDark, 0, -0.15, 0, { seg: 6 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      cyl(g, 0.018, 0.018, 0.55, M().woodDark, Math.cos(a) * 0.3, 0.16, Math.sin(a) * 0.3, { seg: 4 });
    }
    const paperMat = new THREE.MeshStandardMaterial({
      color: YL.linearColor(0xe2cda3), emissive: YL.linearColor(0xffa95a),
      emissiveIntensity: 0, roughness: 0.86, side: THREE.DoubleSide
    });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.32, 0.54, 6, 1, true), paperMat);
    shade.position.y = 0.16; g.add(shade);
    if (!YL.litMats) YL.litMats = [];
    YL.litMats.push(paperMat);
    if (YL.TX && YL.TX.glow) {
      const gm = new THREE.SpriteMaterial({
        map: YL.TX.glow, color: 0xffc077, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.18
      });
      const sp = new THREE.Sprite(gm);
      sp.position.y = 0.16; sp.scale.set(2.6, 2.6, 1); g.add(sp);
      if (!YL.lanternGlowMats) YL.lanternGlowMats = [];
      YL.lanternGlowMats.push(gm);
    }
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU;
      cyl(g, 0.006, 0.006, 0.34, M().gold, Math.cos(a) * 0.05, -0.34, Math.sin(a) * 0.05, { seg: 3 });
    }
    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), M().silkRed);
    tassel.position.y = -0.47; g.add(tassel);
    parent.add(g);
    return g;
  };

  YL.addGuqin = function (parent, x, y, z, ry) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry || 0;
    box(g, 1.6, 0.09, 0.3, M().lacquer, 0, 0, 0, { cast: true });
    box(g, 1.55, 0.02, 0.26, M().woodDark, 0, 0.055, 0);
    for (let i = 0; i < 7; i++) {
      box(g, 1.48, 0.004, 0.003, M().gold, 0, 0.07, -0.11 + i * 0.036);
    }
    for (const sx of [-1, 1]) {
      box(g, 0.04, 0.08, 0.32, M().woodDark, sx * 0.6, 0.03, 0);
    }
    parent.add(g);
    return g;
  };

  YL.addDrumStone = function (parent, x, z, ry) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry || 0;
    box(g, 0.9, 0.35, 0.65, M().stoneDark, 0, 0.175, 0, { cast: true });
    box(g, 0.74, 0.18, 0.52, M().stoneLight, 0, 0.42, 0);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.42, 14), M().stone);
    drum.rotation.x = Math.PI / 2; drum.position.set(0, 0.78, 0.16); drum.castShadow = true; g.add(drum);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 5, 16), M().stoneDark);
    ring.position.set(0, 0.78, 0.38); g.add(ring);
    parent.add(g);
    return g;
  };

  YL.addStele = function (parent, x, z, text, ry) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry || 0;
    box(g, 1.35, 0.35, 1.0, M().stoneDark, 0, 0.175, 0, { cast: true });
    box(g, 0.95, 1.85, 0.22, M().stone, 0, 1.25, 0, { cast: true });
    // carved inscription
    const c = YL.canvas(256, 640), cg = c.getContext('2d');
    cg.fillStyle = '#a9a494'; cg.fillRect(0, 0, 256, 640);
    cg.fillStyle = '#4d4a40';
    cg.font = '700 74px "STKaiti","KaiTi",serif';
    cg.textAlign = 'center'; cg.textBaseline = 'middle';
    const chars = (text || '岳麓书院').split('');
    chars.forEach((ch, i) => cg.fillText(ch, 128, 80 + i * 90));
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 });
    YL.plane(g, 0.72, 1.55, mat, 0, 1.27, 0.115);
    box(g, 1.05, 0.14, 0.34, M().stoneDark, 0, 2.25, 0);
    parent.add(g);
    return g;
  };

  YL.addRitualSet = function (parent, x, y, z, s) {
    s = s || 1;
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    // long altar
    box(g, 4.2, 0.72, 1.25, M().woodBeam, 0, 0.36, 0, { cast: true });
    box(g, 4.5, 0.12, 1.5, M().woodDark, 0, 0.76, 0);
    // central ding
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + 0.4;
      cyl(g, 0.05, 0.07, 0.35, M().bronze, Math.cos(a) * 0.26, 0.95, Math.sin(a) * 0.26, { seg: 6 });
    }
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.25, 0.34, 12), M().bronze);
    bowl.position.set(0, 1.24, 0); bowl.castShadow = true; g.add(bowl);
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 12), M().bronze);
    lid.position.set(0, 1.48, 0); g.add(lid);
    for (const sx of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 5, 10, Math.PI), M().bronze);
      h.position.set(sx * 0.38, 1.36, 0); h.rotation.z = sx * Math.PI / 2; g.add(h);
    }
    // gui vessels
    for (const sx of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.22, 10), M().bronze);
      b.position.set(sx * 1.4, 1.02, 0); b.castShadow = true; g.add(b);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.08, 10), M().bronze);
      base.position.set(sx * 1.4, 0.88, 0); g.add(base);
    }
    // candles and incense
    YL.addCandle(g, -1.8, 0.82, 0, 0.3);
    YL.addCandle(g, 1.8, 0.82, 0, 0.3);
    YL.addIncense(g, 0.0, 1.55, 0, 0.7);
    parent.add(g);
    return g;
  };

  /* --------------------------- room dressing --------------------------- */
  YL.furnishLectureHall = function (g, o) {
    const y0 = o.y0, d = o.d;
    // lectern
    const lx = 0, lz = -2.1;
    box(g, 2.2, 0.82, 0.9, M().woodBeam, lx, y0 + 0.41, lz, { cast: true });
    box(g, 2.4, 0.08, 1.05, M().woodDark, lx, y0 + 0.86, lz);
    addBook(g, lx, y0 + 0.92, lz, 0, true);
    cyl(g, 0.02, 0.025, 0.35, M().woodDark, lx + 0.8, y0 + 1.0, lz - 0.2, { rz: 0.7, seg: 4 });
    YL.addCandle(g, lx - 0.85, y0 + 0.9, lz - 0.2, 0.14);
    // desk props
    for (const z of [3.1, -3.1]) {
      for (const x of [-4.6, 4.6]) {
        addBook(g, x - 0.55, y0 + 0.7, z, 0.1, true);
        box(g, 0.3, 0.06, 0.22, M().ink, x + 0.65, y0 + 0.71, z + 0.1);
        cyl(g, 0.012, 0.02, 0.32, M().woodDark, x + 0.25, y0 + 0.85, z - 0.1, { rz: 0.5, seg: 4 });
        box(g, 0.2, 0.02, 0.28, M().paperWhite, x + 0.75, y0 + 0.68, z - 0.2);
      }
    }
    // altar still life
    const az = -d / 2 + 1.15;
    YL.addIncense(g, 0, y0 + 0.98, az, 0.75);
    YL.addCandle(g, -1.85, y0 + 0.98, az, 0.42);
    YL.addCandle(g, 1.85, y0 + 0.98, az, 0.42);
    YL.addVase(g, -2.9, y0 + 0.98, az, 0.9, false);
    YL.addVase(g, 2.9, y0 + 0.98, az, 0.9, true);
    addBook(g, 3.6, y0 + 1.0, az + 0.05, 0.3, false);
    // hanging palace lantern on the axis
    YL.addPalaceLantern(g, 0, o.yTop - 1.35, 0, 1.0);
    // side tables and vases
    for (const sx of [-1, 1]) {
      box(g, 1.1, 0.85, 0.9, M().woodBeam, sx * 10.2, y0 + 0.42, -4.3);
      box(g, 1.25, 0.08, 1.0, M().woodDark, sx * 10.2, y0 + 0.88, -4.3);
      YL.addVase(g, sx * 10.2, y0 + 0.93, -4.3, 1.0, sx > 0);
      YL.addPottedPlant(g, sx * 10.8, 4.0, 'orchid', 0.8);
    }
    // bronze bell on a stand, at the south side of the room
    const bg = new THREE.Group();
    bg.position.set(-10.2, y0, 3.2);
    box(bg, 0.9, 0.12, 0.9, M().woodDark, 0, 0.06, 0);
    box(bg, 0.14, 2.0, 0.14, M().woodDark, -0.32, 1.0, 0);
    box(bg, 0.14, 2.0, 0.14, M().woodDark, 0.32, 1.0, 0);
    box(bg, 0.8, 0.14, 0.16, M().woodDark, 0, 2.0, 0);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.55, 12, 1, true), M().bronze);
    bell.position.set(0, 1.62, 0); bell.castShadow = true; bg.add(bell);
    YL.mergeByMaterial(bg); g.add(bg);
  };

  YL.furnishLounge = function (g, o) {
    const y0 = o.y0, d = o.d, w = o.w;
    // landscape hanging screen on the rear wall
    YL.addLandscape(g, Math.min(7.2, w * 0.62), 2.2, 0, y0 + 2.2, -d / 2 + 0.64, 0);
    // long bookshelf on the south wall
    const bg = new THREE.Group();
    bg.position.set(-w / 2 + 0.62, y0, -1.6);
    bg.rotation.y = Math.PI / 2;
    box(bg, 3.4, 2.4, 0.45, M().woodDark, 0, 1.2, 0);
    for (let i = 0; i < 3; i++) {
      box(bg, 3.2, 0.05, 0.5, M().woodBeam, 0, 0.42 + i * 0.72, 0.03);
      for (let j = 0; j < 12; j++) {
        const h = 0.24 + (j % 3) * 0.04;
        box(bg, 0.16, h, 0.3, j % 2 ? M().paperWhite : M().clothCream, -1.45 + j * 0.26, 0.42 + i * 0.72 + h / 2 + 0.03, 0.02);
      }
    }
    YL.mergeByMaterial(bg); g.add(bg);
    // low table, tea, books, qin
    box(g, 2.6, 0.65, 1.25, M().woodBeam, 0, y0 + 0.33, 0.5, { cast: true });
    box(g, 2.85, 0.1, 1.45, M().woodDark, 0, y0 + 0.7, 0.5);
    YL.addTeaSet(g, 0.1, y0 + 0.74, 0.55, 0.9, true);
    addBook(g, -1.0, y0 + 0.78, 0.45, 0.2, true);
    addScroll(g, 0.9, y0 + 0.78, 0.25, 0.3);
    // side qin table
    box(g, 2.2, 0.52, 0.85, M().woodBeam, 2.6, y0 + 0.26, -0.6, { cast: true });
    box(g, 2.4, 0.08, 0.95, M().woodDark, 2.6, y0 + 0.56, -0.6);
    YL.addGuqin(g, 2.6, y0 + 0.66, -0.6, 0);
    // cushions around the low table
    for (const p of [[-1.4, 1.6], [1.4, 1.6], [-1.4, -0.2], [1.4, -0.2]]) {
      cyl(g, 0.34, 0.38, 0.1, M().silkRed, p[0], y0 + 0.05, p[1], { seg: 12 });
    }
    YL.addPottedPlant(g, w / 2 - 0.9, -d / 2 + 0.8, 'pine', 0.9);
    YL.addPottedPlant(g, -w / 2 + 0.9, d / 2 - 1.1, 'orchid', 0.8);
  };

  YL.furnishLibrary = function (g, o) {
    const y2 = o.y2, d = o.d;
    // balcony plants and a reading table
    for (const sx of [-1, 1]) {
      YL.addPottedPlant(g, sx * (o.w / 2 - 1.0), d / 2 + 0.55, sx < 0 ? 'orchid' : 'pine', 0.72, y2);
    }
    const bx = 4.8, bz = d / 2 + 0.55;
    box(g, 1.6, 0.55, 0.65, M().woodBeam, bx, y2 + 0.27, bz, { cast: true });
    box(g, 1.75, 0.07, 0.8, M().woodDark, bx, y2 + 0.58, bz);
    addBook(g, bx - 0.3, y2 + 0.64, bz, 0.2, true);
    addScroll(g, bx + 0.35, y2 + 0.64, bz, 0);
    YL.addCandle(g, bx - 0.68, y2 + 0.62, bz + 0.12, 0.12);
    // book chests and a scroll rack on the balcony
    for (const p of [[-4.6, d / 2 + 0.5], [-5.8, d / 2 + 0.5]]) {
      box(g, 1.0, 0.55, 0.62, M().woodDark, p[0], y2 + 0.28, p[1], { cast: true });
      box(g, 0.9, 0.06, 0.55, M().woodBeam, p[0], y2 + 0.58, p[1]);
    }
    for (let i = 0; i < 3; i++) {
      addScroll(g, -6.3 + i * 0.4, y2 + 0.75, d / 2 + 0.48, 0.1);
    }
    // ground-level book chests by the entrance
    for (const sx of [-1, 1]) {
      box(g, 1.2, 0.62, 0.7, M().woodDark, sx * 5.2, 0.31, d / 2 + 1.0, { cast: true });
      box(g, 1.05, 0.05, 0.58, M().woodBeam, sx * 5.2, 0.64, d / 2 + 1.0);
    }
  };

  YL.furnishLibraryInterior = function (g, o) {
    const w = o.w, d = o.d, y0 = o.y0;
    box(g, 5.6, 0.03, 4.4, M().silkRed, 0, y0 + 0.18, -1.4, { cast: false });
    for (const sx of [-1, 1]) {
      const bg = new THREE.Group();
      bg.position.set(sx * (w / 2 - 0.7), y0, -1.8);
      bg.rotation.y = sx * Math.PI / 2;
      // open shelf carcass: back panel and side frames, not a solid block
      box(bg, 4.6, 2.9, 0.08, M().woodDark, 0, 1.45, -0.22);
      for (const bx of [-2.3, 2.3]) box(bg, 0.12, 2.9, 0.5, M().woodDark, bx, 1.45, 0);
      for (const by of [0.02, 2.88]) box(bg, 4.6, 0.1, 0.5, M().woodDark, 0, by, 0);
      for (let i = 0; i < 4; i++) {
        box(bg, 4.44, 0.055, 0.48, M().woodBeam, 0, 0.35 + i * 0.68, 0.02);
        for (let j = 0; j < 14; j++) {
          const bh = 0.22 + (j % 4) * 0.035;
          box(bg, 0.18, bh, 0.32,
            j % 3 === 0 ? M().clothRust : (j % 3 === 1 ? M().paperWhite : M().clothCream),
            -2.0 + j * 0.31, 0.35 + i * 0.68 + bh / 2 + 0.03, 0.04);
        }
      }
      YL.mergeByMaterial(bg); g.add(bg);
    }
    const back = new THREE.Group();
    back.position.set(0, y0, -d / 2 + 0.7);
    box(back, 7.2, 2.7, 0.08, M().woodDark, 0, 1.35, -0.24);
    for (const bx of [-3.6, 3.6]) box(back, 0.12, 2.7, 0.56, M().woodDark, bx, 1.35, 0);
    for (const by of [0.02, 2.68]) box(back, 7.2, 0.1, 0.56, M().woodDark, 0, by, 0);
    for (let i = 0; i < 3; i++) {
      box(back, 7.0, 0.055, 0.54, M().woodBeam, 0, 0.35 + i * 0.74, 0.02);
      for (let j = 0; j < 20; j++) {
        const bh = 0.2 + (j % 5) * 0.03;
        box(back, 0.17, bh, 0.34, j % 2 ? M().paperWhite : M().clothCream,
          -3.2 + j * 0.34, 0.35 + i * 0.74 + bh / 2 + 0.03, 0.06);
      }
    }
    YL.mergeByMaterial(back); g.add(back);
    YL.addLandscape(g, 4.6, 1.2, 0, y0 + 3.45, -d / 2 + 0.9, 0);
    box(g, 3.1, 0.72, 1.45, M().woodBeam, 0, y0 + 0.36, -1.6, { cast: true });
    box(g, 3.35, 0.09, 1.65, M().woodDark, 0, y0 + 0.77, -1.6);
    addBook(g, -0.5, y0 + 0.84, -1.65, 0.15, true);
    addBook(g, 0.55, y0 + 0.84, -1.5, -0.25, false);
    addScroll(g, 0.15, y0 + 0.85, -1.95, 0);
    YL.addTeaSet(g, 1.0, y0 + 0.83, -1.3, 0.62, true);
    YL.addCandle(g, -1.2, y0 + 0.82, -1.5, 0.2);
    for (const p of [[-1.5, -0.55], [1.5, -0.55], [-1.5, -2.7], [1.5, -2.7]]) {
      box(g, 0.65, 0.42, 0.65, M().woodDark, p[0], y0 + 0.21, p[1]);
      cyl(g, 0.3, 0.32, 0.08, M().silkRed, p[0], y0 + 0.46, p[1], { seg: 10 });
    }
    YL.addPalaceLantern(g, 0, y0 + o.h1 - 0.95, -1.2, 0.85);
    YL.addPottedPlant(g, -w / 2 + 0.9, d / 2 - 1.1, 'orchid', 0.8);
    YL.addPottedPlant(g, w / 2 - 0.9, d / 2 - 1.1, 'pine', 0.8);
  };

  YL.furnishStoneTable = function (g, o) {
    const y = o.y0 + 0.92;
    YL.addTeaSet(g, 0, y, 0, 0.9, true);
    addBook(g, 0.0, y + 0.08, -0.35, 0.2, true);
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + Math.PI / 4;
      const sx = Math.cos(a) * 1.55, sz = Math.sin(a) * 1.55;
      cyl(g, 0.3, 0.33, 0.06, i % 2 ? M().clothCream : M().silkRed, sx, o.y0 + 0.6, sz, { seg: 10 });
    }
  };

  YL.furnishTemple = function (parent, o) {
    const g = new THREE.Group();
    g.position.set(o.x, 0, o.z);
    g.rotation.y = o.rot || 0;
    YL.addRitualSet(g, 0, 0, 0, 1.0);
    // a stone stele and flanking vases
    YL.addStele(g, -3.8, -2.2, '大成至圣', Math.PI / 2);
    for (const p of [[-3.2, 0], [3.2, 0]]) {
      YL.addVase(g, p[0], 0, p[1], 0.75, p[0] < 0);
    }
    YL.mergeByMaterial(g);
    parent.add(g);
    return g;
  };
})();
