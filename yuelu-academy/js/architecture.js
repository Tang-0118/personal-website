/* ============================================================
   岳麓书院 · 3D  /  architecture.js
   Building constructors in the local "face +Z" convention.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL;
  const M = () => YL.M;
  const TAU = Math.PI * 2;
  const VS = YL.VS = { hall: 1.16, gate: 1.12, library: 1.15, tower: 1.12, stage: 1.12, pavilion: 1.08 };

  YL.floorZones = YL.floorZones || [];
  YL.lionGroups = YL.lionGroups || [];
  YL.addFloorZone = function (x, z, w, d, y, ry) {
    const c = Math.abs(Math.cos(ry || 0)), s = Math.abs(Math.sin(ry || 0));
    const ex = w / 2 * c + d / 2 * s;
    const ez = w / 2 * s + d / 2 * c;
    YL.floorZones.push({ minX: x - ex, maxX: x + ex, minZ: z - ez, maxZ: z + ez, y: y });
  };
  YL.walkSurfaceY = function (x, z) {
    let y = YL.groundHeight(x, z);
    for (const f of YL.floorZones) {
      if (x > f.minX && x < f.maxX && z > f.minZ && z < f.maxZ && f.y > y) y = f.y;
    }
    return y;
  };

  YL.colliders = YL.colliders || [];
  YL.addCollider = function (x, z, w, d, ry, pad) {
    pad = pad || 0;
    const c = Math.abs(Math.cos(ry || 0)), s = Math.abs(Math.sin(ry || 0));
    const ex = (w / 2 + pad) * c + (d / 2 + pad) * s;
    const ez = (w / 2 + pad) * s + (d / 2 + pad) * c;
    YL.colliders.push({ minX: x - ex, maxX: x + ex, minZ: z - ez, maxZ: z + ez });
  };

  // Thin wall colliders leave the interior of a hall reachable on foot.
  function addWallColliders(g, w, d, frontOpening) {
    const ry = g.rotation.y || 0;
    const cs = Math.cos(ry), sn = Math.sin(ry);
    function put(lx, lz, lw, ld) {
      const wx = g.position.x + lx * cs + lz * sn;
      const wz = g.position.z - lx * sn + lz * cs;
      YL.addCollider(wx, wz, lw, ld, ry, 0.02);
    }
    put(0, -d / 2 + 0.16, w, 0.55);
    put(-w / 2 + 0.16, 0, 0.55, d);
    put(w / 2 - 0.16, 0, 0.55, d);
    if (frontOpening != null) {
      const side = (w - frontOpening) / 2;
      put(-(frontOpening / 2 + side / 2), d / 2 - 0.16, side, 0.55);
      put(frontOpening / 2 + side / 2, d / 2 - 0.16, side, 0.55);
    }
  }

  function stepFlight(parent, width, top, frontZ, n, mat) {
    n = n || 3;
    const rise = top / (n + 0.4);
    const run = 0.62;
    for (let i = 0; i < n; i++) {
      const h = top - i * rise;
      const z = frontZ + run * (i + 0.5);
      YL.box(parent, width - i * 0.24, h, run + 0.04, mat || M().stoneLight, 0, h / 2, z, { cast: true });
    }
    // side stringers
    for (const sx of [-1, 1]) {
      YL.box(parent, 0.28, top + 0.12, 1.0, M().stoneDark, sx * (width / 2 - 0.14), (top + 0.12) / 2, frontZ + 0.35, { cast: true });
    }
  }
  YL.stepFlight = stepFlight;

  function facadePanel(parent, x, y, z, w, h, kind, ry) {
    const g = new THREE.Group();
    g.position.set(x, y + h / 2, z);
    if (ry) g.rotation.y = ry;
    const mat = kind === 'window' ? M().latticeWin : M().lattice;
    YL.plane(g, w, h, mat, 0, 0, 0);
    const f = 0.11;
    YL.box(g, w + f * 2, f, 0.14, M().woodDark, 0, h / 2 + f / 2, 0.04);
    YL.box(g, w + f * 2, f, 0.16, M().woodDark, 0, -h / 2 - f / 2, 0.04);
    YL.box(g, f, h + f * 2, 0.14, M().woodDark, -w / 2 - f / 2, 0, 0.04);
    YL.box(g, f, h + f * 2, 0.14, M().woodDark, w / 2 + f / 2, 0, 0.04);
    YL.box(g, w + 0.1, 0.12, 0.2, M().woodBeam, 0, -h / 2 - 0.16, 0.06);
    parent.add(g);
    return g;
  }
  YL.facadePanel = facadePanel;

  function addColumns(parent, positions, z, y0, h, radius) {
    for (const x of positions) {
      YL.cyl(parent, (radius || 0.23) * 0.9, radius || 0.23, h, M().redLacquer, x, y0 + h / 2, z, { seg: 18 });
      YL.cyl(parent, (radius || 0.23) * 1.5, (radius || 0.23) * 1.65, 0.22, M().stoneDark, x, y0 + 0.11, z, { seg: 10 });
      YL.cyl(parent, (radius || 0.23) * 1.9, (radius || 0.23) * 2.0, 0.12, M().stoneLight, x, y0 + 0.05, z, { seg: 10 });
    }
  }

  /* ---------------------------- hall ---------------------------- */
  YL.makeHall = function (opt) {
    const w = opt.w, d = opt.d, pH = opt.platformH == null ? 0.65 : opt.platformH;
    const wallH = opt.wallH || 5.2, roofH = opt.roofH || 2.8;
    const bays = opt.bays || 3;
    const open = !!opt.open;
    const g = new THREE.Group();
    g.name = opt.name || 'hall';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.hall;

    // platform
    YL.box(g, w + 2.4, pH, d + 2.2, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, w + 2.7, 0.14, d + 2.5, M().stoneLight, 0, pH + 0.02, 0, { cast: true });
    if (opt.steps !== false) stepFlight(g, opt.stepWidth || Math.min(5.4, w * 0.42), pH, d / 2 + 1.0, 3);
    // wood floor
    YL.box(g, w - 0.5, 0.14, d - 0.5, open ? M().wood : M().woodDark, 0, pH + 0.13, 0, { cast: false });

    const y0 = pH + 0.14;
    const yTop = y0 + wallH;

    // walls
    YL.box(g, w - 0.9, wallH, 0.34, opt.backMat || M().plaster, 0, y0 + wallH / 2, -d / 2 + 0.17, { cast: true });
    YL.box(g, w - 0.8, 0.55, 0.4, M().woodDark, 0, y0 + 0.28, -d / 2 + 0.36);
    for (const sx of [-1, 1]) {
      YL.box(g, 0.34, wallH, d - 0.6, opt.sideMat || M().plaster, sx * (w / 2 - 0.17), y0 + wallH / 2, 0, { cast: true });
      YL.box(g, 0.4, 0.55, d - 0.5, M().woodDark, sx * (w / 2 - 0.36), y0 + 0.28, 0);
      // side windows
      if (opt.sideWindows !== false && d > 6) {
        const n = Math.max(1, Math.floor(d / 5));
        for (let i = 0; i < n; i++) {
          const zz = -d / 2 + (i + 0.5) * d / n;
          facadePanel(g, sx * (w / 2 + 0.03), y0 + 0.9, zz, 1.5, Math.min(2.2, wallH * 0.42), 'window', sx * Math.PI / 2);
        }
      }
    }

    const bayX = [];
    for (let i = 0; i <= bays; i++) bayX.push(-w / 2 + w * i / bays);
    const bayCenters = [];
    for (let i = 0; i < bays; i++) bayCenters.push((bayX[i] + bayX[i + 1]) / 2);

    if (open) {
      addColumns(g, bayX, d / 2 - 0.55, y0, wallH, 0.24);
      // inner columns support the rear roof
      addColumns(g, [bayX[0] + 0.3, bayX[bays] - 0.3], -d / 2 + 1.6, y0, wallH, 0.21);
      YL.box(g, w, 0.5, 0.36, M().woodBeam, 0, yTop - 0.25, d / 2 - 0.55, { cast: true });
      YL.box(g, 0.36, 0.45, d, M().woodBeam, -w / 2 + 0.45, yTop - 0.28, 0);
      YL.box(g, 0.36, 0.45, d, M().woodBeam, w / 2 - 0.45, yTop - 0.28, 0);
      // frieze across the open front, carrying the plaque
      YL.box(g, w, 0.82, 0.38, M().woodBeam, 0, yTop - 1.02, d / 2 - 0.58, { cast: true });
      YL.box(g, w + 0.3, 0.12, 0.5, M().woodDark, 0, yTop - 1.46, d / 2 - 0.55, { cast: true });
      // flat coffered ceiling and cross beams
      YL.box(g, w - 1.6, 0.16, d - 2.4, M().woodDark, 0, yTop - 0.62, -0.25, { cast: false });
      for (const zz of [-d * 0.28, 0, d * 0.28]) {
        YL.box(g, w - 1.0, 0.28, 0.28, M().woodBeam, 0, yTop - 0.72, zz, { cast: true });
      }
      for (const xx of [-w * 0.25, 0, w * 0.25]) {
        YL.box(g, 0.24, 0.24, d - 2.2, M().woodBeam, xx, yTop - 0.78, -0.25, { cast: true });
      }
      const sw = Math.min(w * 0.55, 8.6);
      if (opt.lecture) {
        // ornamental inner screen and the lecture dais
        YL.box(g, sw + 0.7, 3.35, 0.22, M().woodDark, 0, y0 + 3.55, -d / 2 + 0.38, { cast: true });
        YL.box(g, sw + 0.9, 0.18, 0.28, M().woodBeam, 0, y0 + 5.24, -d / 2 + 0.44);
        YL.plane(g, sw, 2.55, YL.signMaterial('忠孝廉节', { w: 1024, h: 340, bg: '#241712' }), 0, y0 + 3.5, -d / 2 + 0.50);
        YL.box(g, sw + 0.9, 0.18, 0.3, M().woodBeam, 0, y0 + 2.16, -d / 2 + 0.46);
        // altar table, seat and low desks
        YL.box(g, sw * 0.72, 0.92, 0.95, M().woodBeam, 0, y0 + 0.46, -d / 2 + 1.15, { cast: true });
        YL.box(g, sw * 0.62, 0.1, 0.72, M().woodDark, 0, y0 + 0.96, -d / 2 + 1.15);
        YL.box(g, 2.4, 1.3, 1.0, M().woodDark, 0, y0 + 1.05, -d / 2 + 2.0, { cast: true });
        YL.box(g, 2.1, 0.16, 1.0, M().woodBeam, 0, y0 + 0.44, -d / 2 + 2.55, { cast: true });
        for (const sx of [-1, 1]) {
          YL.box(g, 0.9, 0.12, 0.8, M().woodDark, sx * 2.6, y0 + 0.98, -d / 2 + 2.6);
          YL.box(g, 0.9, 1.1, 0.1, M().woodDark, sx * 2.6, y0 + 1.53, -d / 2 + 2.98);
        }
        for (const sz of [-1, 1]) {
          for (const sx of [-1, 1]) {
            YL.box(g, 2.8, 0.12, 0.9, M().woodBeam, sx * 4.6, y0 + 0.62, sz * 3.1);
            for (const lx of [-1.1, 1.1]) YL.box(g, 0.16, 0.55, 0.7, M().woodDark, sx * 4.6 + lx, y0 + 0.3, sz * 3.1);
          }
        }
        YL.plaque(g, '道南正脉', 2.5, 0.68, -w / 2 + 0.32, y0 + 3.5, 0, { ry: Math.PI / 2, depth: 0.08 });
        YL.plaque(g, '学达性天', 2.5, 0.68, w / 2 - 0.32, y0 + 3.5, 0, { ry: -Math.PI / 2, depth: 0.08 });
        YL.box(g, 7.2, 0.03, 5.0, new THREE.MeshStandardMaterial({
          color: YL.linearColor(0x5b1d18), roughness: 0.98
        }), 0, y0 + 0.17, 1.2, { cast: false });
      }
      // rear elevation, seen from the library courtyard
      facadePanel(g, 0, y0 + 0.55, -d / 2 - 0.02, 3.2, 3.0, 'door', Math.PI);
      for (const sx of [-1, 1]) {
        facadePanel(g, sx * 6.2, y0 + 1.0, -d / 2 - 0.02, 2.8, 2.1, 'window', Math.PI);
      }
      if (opt.lecture && YL.furnishLectureHall) {
        YL.furnishLectureHall(g, { w: w, d: d, y0: y0, yTop: yTop, sw: sw });
      } else if (!opt.lecture && YL.furnishLounge) {
        YL.furnishLounge(g, { w: w, d: d, y0: y0, yTop: yTop, sw: sw });
      }
    } else {
      // closed lattice facade, alternating doors and windows
      for (let i = 0; i < bays; i++) {
        const kind = (bays > 5) ? (i % 2 === 0 ? 'door' : 'window') : (i === Math.floor(bays / 2) ? 'door' : 'door');
        const pw = (bayX[i + 1] - bayX[i]) - 0.36;
        const ph = wallH - 1.1;
        facadePanel(g, bayCenters[i], y0 + 0.62, d / 2 + 0.03, pw, ph, kind, 0);
      }
      YL.box(g, w, 0.55, 0.28, M().woodDark, 0, y0 + 0.28, d / 2 + 0.02);
      YL.box(g, w, 0.5, 0.26, M().plaster, 0, yTop - 0.25, d / 2 + 0.04);
      addColumns(g, bayX, d / 2 + 0.08, y0, wallH, 0.2);
      YL.box(g, w + 0.1, 0.38, 0.32, M().woodBeam, 0, yTop - 0.18, d / 2 + 0.12);
    }

    // eave beam and bracket sets
    YL.box(g, w + 0.6, 0.34, 0.45, M().woodBeam, 0, yTop - 0.05, d / 2 - 0.2, { cast: true });
    YL.box(g, w + 0.6, 0.28, 0.4, M().woodBeam, 0, yTop - 0.05, -d / 2 + 0.2, { cast: true });
    for (const x of bayX) YL.dougong(g, x, yTop - 0.5, d / 2 + 0.02);

    // roof
    const roof = YL.gableRoof({
      w: w + (opt.overhang == null ? 2.8 : opt.overhang * 2),
      d: d + (opt.overhang == null ? 2.6 : opt.overhang * 2),
      h: roofH, lift: opt.lift == null ? 0.7 : opt.lift,
      gables: true, tileEnds: opt.detail !== false,
      gableVent: opt.gableVent || w >= 18
    });
    roof.position.y = yTop;
    g.add(roof);

    // plaques and couplets
    if (opt.plaque) {
      const pz = open ? d / 2 - 0.34 : d / 2 + 0.52;
      const py = open ? yTop - 1.02 : yTop - (opt.plaqueDrop || 1.05);
      YL.plaque(g, opt.plaque, opt.plaqueW || 3.1, opt.plaqueH || 0.86, 0, py, pz, {});
    }
    if (opt.plaqueBack) {
      YL.plaque(g, opt.plaqueBack, opt.plaqueW || 2.8, opt.plaqueH || 0.8,
        0, yTop - 1.0, -d / 2 - 0.52, { ry: Math.PI });
    }
    if (opt.couplets) {
      const cw = 0.56, ch = Math.min(3.5, wallH - 1.3);
      YL.couplet(g, opt.couplets[0], cw, ch, -w * 0.27, yTop - 1.1 - ch / 2, d / 2 + 0.47);
      YL.couplet(g, opt.couplets[1], cw, ch, w * 0.27, yTop - 1.1 - ch / 2, d / 2 + 0.47);
    }
    if (opt.lanterns) {
      for (const sx of [-1, 1]) YL.lantern(g, sx * (w / 2 - 1.1), yTop - 1.15, d / 2 + 0.55, 0.95);
    }

    if (opt.enterable) {
      addWallColliders(g, w, d, opt.frontOpening == null ? null : opt.frontOpening);
      YL.addFloorZone(opt.x || 0, opt.z || 0, w + 2.4, d + 2.2, (pH + 0.2) * VS.hall, opt.rotY || 0);
    } else {
      YL.addCollider(opt.x || 0, opt.z || 0, w + 2.6, d + 2.4, opt.rotY || 0, 0.1);
    }
    if (opt.optimize !== false) YL.mergeByMaterial(g);
    return g;
  };

  /* ---------------------------- gate ---------------------------- */
  YL.makeGate = function (opt) {
    const w = opt.w || 16, d = opt.d || 7, pH = opt.platformH == null ? 0.55 : opt.platformH;
    const wallH = opt.wallH || 5.0, roofH = opt.roofH || 2.6;
    const g = new THREE.Group();
    g.name = opt.name || 'gate';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.gate;

    YL.box(g, w + 2.4, pH, d + 2.0, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, w + 2.7, 0.14, d + 2.3, M().stoneLight, 0, pH + 0.02, 0);
    stepFlight(g, 6.2, pH, d / 2 + 1.0, 3);

    const y0 = pH + 0.14;
    const yTop = y0 + wallH;
    const opening = opt.opening || 4.0;
    const sideW = (w - opening) / 2;
    // side walls
    for (const sx of [-1, 1]) {
      YL.box(g, sideW, wallH, 0.55, M().plaster, sx * (opening / 2 + sideW / 2), y0 + wallH / 2, d / 2 - 0.3, { cast: true });
      YL.box(g, sideW, wallH, 0.55, M().plaster, sx * (opening / 2 + sideW / 2), y0 + wallH / 2, -d / 2 + 0.3, { cast: true });
      YL.box(g, sideW, 0.6, 0.62, M().woodDark, sx * (opening / 2 + sideW / 2), y0 + 0.3, d / 2 - 0.3);
      YL.box(g, 0.55, wallH, d - 0.6, M().plaster, sx * (w / 2 - 0.28), y0 + wallH / 2, 0, { cast: true });
      // doorway jamb
      YL.box(g, 0.32, wallH, 0.7, M().woodDark, sx * (opening / 2 + 0.1), y0 + wallH / 2, d / 2 - 0.1, { cast: true });
    }
    YL.box(g, opening + 0.9, 0.8, 1.7, M().woodDark, 0, yTop - 0.4, 0, { cast: true });
    YL.box(g, opening, 0.4, 0.7, M().stoneDark, 0, y0 + 0.2, 0, { cast: true });

    // open doors, swung inward
    for (const sx of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(sx * (opening / 2 - 0.12), y0 + 0.2, d / 2 - 0.25);
      hinge.rotation.y = sx * 1.15;
      const door = new THREE.Group();
      door.position.x = -sx * opening / 4;
      facadePanel(door, 0, 0, 0, opening / 2 - 0.12, wallH * 0.78, 'door', 0);
      hinge.add(door);
      g.add(hinge);
    }

    // beams, brackets
    YL.box(g, w + 0.8, 0.4, 0.5, M().woodBeam, 0, yTop - 0.2, d / 2 - 0.2);
    for (const x of [-w / 2 + 1.2, -opening / 2 - 0.3, opening / 2 + 0.3, w / 2 - 1.2]) {
      YL.dougong(g, x, yTop - 0.62, d / 2 + 0.02);
    }
    addColumns(g, [-opening / 2 - 0.35, opening / 2 + 0.35], d / 2 + 0.18, y0, wallH, 0.26);
    YL.box(g, w + 0.4, 0.36, 0.38, M().woodBeam, 0, yTop - 0.18, d / 2 + 0.2);

    const roof = YL.gableRoof({
      w: w + 3.0, d: d + 2.8, h: roofH,
      lift: 0.78, gables: true, tileEnds: true, gableVent: true
    });
    roof.position.y = yTop;
    g.add(roof);

    if (opt.plaque) {
      YL.plaque(g, opt.plaque, opt.plaqueW || 3.5, 0.96, 0, yTop - 0.92, d / 2 + 0.62, {});
    }
    if (opt.couplets) {
      const ch = 2.85;
      YL.couplet(g, opt.couplets[0], 0.58, ch, -opening / 2 - 0.75, yTop - 1.0 - ch / 2, d / 2 + 0.55);
      YL.couplet(g, opt.couplets[1], 0.58, ch, opening / 2 + 0.75, yTop - 1.0 - ch / 2, d / 2 + 0.55);
    }
    // drum stones flank the threshold, and red lanterns light the passage
    for (const sx of [-1, 1]) {
      if (YL.addDrumStone) YL.addDrumStone(g, sx * (opening / 2 + 1.05), d / 2 + 0.15, 0);
      YL.lantern(g, sx * (opening / 2 + sideW * 0.5), yTop - 1.15, d / 2 + 0.5, 0.95);
    }
    YL.addFloorZone(opt.x || 0, opt.z || 0, w + 2.4, d + 2.0, (pH + 0.2) * VS.gate, opt.rotY || 0);
    // Keep the central passage walkable: collide only with the two side blocks.
    const ry = opt.rotY || 0;
    const lx = opening / 2 + sideW / 2;
    for (const sx of [-1, 1]) {
      const wx = (opt.x || 0) + sx * lx * Math.cos(ry);
      const wz = (opt.z || 0) - sx * lx * Math.sin(ry);
      YL.addCollider(wx, wz, sideW + 0.5, d + 2.0, ry, 0.05);
    }
    if (opt.optimize !== false) YL.mergeByMaterial(g);
    return g;
  };

  /* --------------------------- stage --------------------------- */
  YL.makeStage = function (opt) {
    const w = opt.w || 12, d = opt.d || 8, pH = opt.platformH || 1.15;
    const wallH = opt.wallH || 4.6, roofH = opt.roofH || 2.4;
    const g = new THREE.Group();
    g.name = opt.name || 'stage';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.stage;

    YL.box(g, w + 2.2, pH, d + 1.8, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, w + 2.5, 0.14, d + 2.1, M().stoneLight, 0, pH + 0.02, 0);
    stepFlight(g, 6.0, pH, d / 2 + 1.0, 4);
    YL.box(g, w, 0.16, d, M().woodDark, 0, pH + 0.1, 0, { cast: false });

    const y0 = pH + 0.16, yTop = y0 + wallH;
    // back wall and short side walls
    YL.box(g, w - 0.7, wallH, 0.35, M().plaster, 0, y0 + wallH / 2, -d / 2 + 0.2, { cast: true });
    YL.box(g, w - 0.6, 0.6, 0.42, M().woodDark, 0, y0 + 0.3, -d / 2 + 0.38);
    for (const sx of [-1, 1]) {
      YL.box(g, 0.35, wallH, d * 0.55, M().plaster, sx * (w / 2 - 0.2), y0 + wallH / 2, -d * 0.225, { cast: true });
      YL.box(g, 0.35, wallH, 0.4, M().woodDark, sx * (w / 2 - 0.2), y0 + wallH / 2, d / 2 - 0.2, { cast: true });
    }
    addColumns(g, [-w / 2 + 0.7, -w / 6, w / 6, w / 2 - 0.7], d / 2 - 0.55, y0, wallH, 0.25);
    YL.box(g, w, 0.45, 0.4, M().woodBeam, 0, yTop - 0.22, d / 2 - 0.55, { cast: true });
    for (const x of [-w / 2 + 0.7, -w / 6, w / 6, w / 2 - 0.7]) YL.dougong(g, x, yTop - 0.55, d / 2 - 0.25);

    const roof = YL.gableRoof({ w: w + 3.0, d: d + 2.8, h: roofH, lift: 0.85, gables: true, tileEnds: true });
    roof.position.y = yTop;
    g.add(roof);

    // doors and windows on the rear wall, which faces the entrance gate
    facadePanel(g, 0, y0 + 0.55, -d / 2 - 0.02, 3.2, wallH * 0.64, 'door', Math.PI);
    for (const sx of [-1, 1]) {
      facadePanel(g, sx * 4.0, y0 + 1.0, -d / 2 - 0.02, 2.0, 2.0, 'window', Math.PI);
    }
    YL.plaque(g, '赫曦台', 2.7, 0.82, 0, yTop - 1.0, d / 2 + 0.42, {});
    YL.plaque(g, '赫曦台', 2.4, 0.72, 0, yTop - 1.05, -d / 2 - 0.45, { ry: Math.PI });
    // Fu / Shou on side walls
    for (const sx of [-1, 1]) {
      const sg = YL.plaque(g, sx < 0 ? '福' : '寿', 1.35, 1.35,
        sx * (w / 2 + 0.04), y0 + 2.4, 0, { ry: sx * Math.PI / 2, depth: 0.1, size: 230 });
    }
    for (const sx of [-1, 1]) YL.lantern(g, sx * (w / 2 - 0.8), yTop - 1.2, d / 2 + 0.4, 1.0);
    YL.addCollider(opt.x || 0, opt.z || 0, w + 2.4, d + 2.0, opt.rotY || 0, 0.05);
    YL.mergeByMaterial(g);
    return g;
  };

  /* -------------------------- pavilion -------------------------- */
  YL.makePavilion = function (opt) {
    const size = opt.size || 6, pH = opt.platformH == null ? 0.55 : opt.platformH;
    const colH = opt.colH || 3.4, double = !!opt.double;
    const g = new THREE.Group();
    g.name = opt.name || 'pavilion';
    g.position.set(opt.x || 0, opt.y || 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.pavilion;

    YL.box(g, size + 1.8, pH, size + 1.8, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, size + 2.1, 0.12, size + 2.1, M().stoneLight, 0, pH + 0.02, 0);
    stepFlight(g, Math.min(3.2, size * 0.55), pH, size / 2 + 0.9, 2);
    YL.box(g, size - 0.2, 0.15, size - 0.2, M().woodDark, 0, pH + 0.08, 0, { cast: false });

    const y0 = pH + 0.15;
    const off = size / 2 - 0.42;
    const pts = [[-off, -off], [off, -off], [off, off], [-off, off]];
    for (const p of pts) {
      YL.cyl(g, 0.17, 0.19, colH, opt.columnMat || M().redLacquer, p[0], y0 + colH / 2, p[1], { seg: 10 });
      YL.cyl(g, 0.26, 0.3, 0.16, M().stoneDark, p[0], y0 + 0.08, p[1], { seg: 8 });
    }
    for (const z of [-off, off]) YL.box(g, size - 0.5, 0.3, 0.24, M().woodBeam, 0, y0 + colH - 0.15, z);
    for (const x of [-off, off]) YL.box(g, 0.24, 0.3, size - 0.5, M().woodBeam, x, y0 + colH - 0.15, 0);
    // railings on three sides
    YL.railing(g, 0, y0 + 0.12, -off, size - 1.0, 0, { h: 0.82 });
    YL.railing(g, -off, y0 + 0.12, 0, size - 1.0, Math.PI / 2, { h: 0.82 });
    YL.railing(g, off, y0 + 0.12, 0, size - 1.0, Math.PI / 2, { h: 0.82 });

    if (opt.table) {
      YL.cyl(g, 0.78, 0.78, 0.14, M().stoneLight, 0, y0 + 0.9, 0, { seg: 18 });
      YL.cyl(g, 0.22, 0.3, 0.82, M().stoneDark, 0, y0 + 0.45, 0, { seg: 10 });
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 + Math.PI / 4;
        YL.cyl(g, 0.34, 0.34, 0.12, M().stoneLight, Math.cos(a) * 1.55, y0 + 0.55, Math.sin(a) * 1.55, { seg: 12 });
        YL.cyl(g, 0.16, 0.2, 0.5, M().stoneDark, Math.cos(a) * 1.55, y0 + 0.28, Math.sin(a) * 1.55, { seg: 8 });
      }
      if (YL.furnishStoneTable) YL.furnishStoneTable(g, { y0: y0 });
    }

    let upperBase = y0 + colH;
    if (double) {
      const lower = YL.skirtRoof({
        w: size + 2.7, d: size + 2.7, h: 1.05, lift: 0.75,
        inner: 0.46, tileMat: M().roof
      });
      lower.position.y = upperBase;
      g.add(lower);
      // drum / upper storey
      const drumH = 1.4;
      YL.box(g, size * 0.78, drumH, size * 0.78, M().woodDark, 0, upperBase + 0.55, 0, { cast: true });
      for (const p of pts) {
        const s = 0.76;
        YL.cyl(g, 0.13, 0.14, drumH, M().redLacquer, p[0] * s, upperBase + 0.55, p[1] * s, { seg: 8 });
      }
      upperBase += 1.35;
    }
    const roofSize = double ? size * 1.08 : size + 2.5;
    const roof = YL.pavilionRoof({
      size: roofSize, h: opt.roofH || 2.3, lift: 0.9,
      tileMat: M().roof, finial: true
    });
    roof.position.y = upperBase;
    g.add(roof);

    if (opt.plaque) {
      YL.plaque(g, opt.plaque, opt.plaqueW || 1.9, 0.62,
        0, y0 + colH - 0.72, size / 2 + 0.28, { depth: 0.1 });
    }
    if (opt.lanterns) {
      for (const sx of [-1, 1]) YL.lantern(g, sx * (size / 3), y0 + colH - 0.45, size / 2 + 0.25, 0.75);
    }
    YL.addCollider(opt.x || 0, opt.z || 0, size + 1.9, size + 1.9, opt.rotY || 0, 0.05);
    YL.mergeByMaterial(g);
    return g;
  };

  /* --------------------------- tower --------------------------- */
  YL.makeTower = function (opt) {
    const w = opt.w || 9, d = opt.d || 8, pH = 0.8;
    const h1 = 4.1, h2 = 3.1;
    const g = new THREE.Group();
    g.name = opt.name || 'tower';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.tower;

    YL.box(g, w + 2.2, pH, d + 2.2, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, w + 2.5, 0.14, d + 2.5, M().stoneLight, 0, pH + 0.02, 0);
    stepFlight(g, 3.6, pH, d / 2 + 1.0, 3);
    const y0 = pH + 0.14;
    // first floor
    YL.box(g, w - 0.6, h1, d - 0.6, M().plaster, 0, y0 + h1 / 2, 0, { cast: true });
    const bays = 3;
    for (let i = 0; i < bays; i++) {
      const pw = (w - 1.4) / bays - 0.25;
      const cx = -w / 2 + 0.7 + (w - 1.4) * (i + 0.5) / bays;
      facadePanel(g, cx, y0 + 0.75, d / 2 - 0.02, pw, h1 - 1.3, i === 1 ? 'door' : 'window', 0);
    }
    for (const sx of [-1, 1]) {
      YL.box(g, 0.3, 0.55, d - 0.5, M().woodDark, sx * (w / 2 - 0.3), y0 + 0.27, 0);
      facadePanel(g, sx * (w / 2 + 0.01), y0 + 1.0, 0, 1.6, 2.0, 'window', sx * Math.PI / 2);
    }
    // balcony
    YL.box(g, w + 2.8, 0.28, d + 2.8, M().woodDark, 0, y0 + h1 + 0.14, 0, { cast: true });
    YL.railing(g, 0, y0 + h1 + 0.28, d / 2 + 1.2, w + 1.8, 0, { h: 0.95 });
    for (const sx of [-1, 1]) YL.railing(g, sx * (w / 2 + 1.2), y0 + h1 + 0.28, 0, d + 1.6, Math.PI / 2, { h: 0.95 });
    // second floor
    const y2 = y0 + h1 + 0.28;
    YL.box(g, w - 1.2, h2, d - 1.2, M().plaster, 0, y2 + h2 / 2, 0, { cast: true });
    for (let i = 0; i < bays; i++) {
      const pw = (w - 1.8) / bays - 0.2;
      const cx = -w / 2 + 0.9 + (w - 1.8) * (i + 0.5) / bays;
      facadePanel(g, cx, y2 + 0.55, d / 2 - 0.58, pw, h2 - 1.0, 'window', 0);
    }
    for (const p of [[-w / 2 + 0.55, d / 2 + 0.7], [w / 2 - 0.55, d / 2 + 0.7], [-w / 2 + 0.55, -d / 2 - 0.7], [w / 2 - 0.55, -d / 2 - 0.7]]) {
      YL.cyl(g, 0.16, 0.17, h2 + 0.8, M().redLacquer, p[0], y2 + (h2 + 0.8) / 2, p[1], { seg: 8 });
    }
    YL.box(g, w + 2.6, 0.3, d + 2.6, M().woodBeam, 0, y2 + h2 + 0.1, 0);
    const lower = YL.skirtRoof({ w: w + 4.0, d: d + 4.0, h: 1.0, lift: 0.8, inner: 0.52 });
    lower.position.y = y2 + h2 + 0.08;
    g.add(lower);
    const roof = YL.pavilionRoof({ size: w + 1.6, h: 2.4, lift: 0.95, finial: true });
    roof.position.y = y2 + h2 + 1.15;
    g.add(roof);
    if (opt.plaque) {
      YL.plaque(g, opt.plaque, 2.1, 0.66, 0, y2 + h2 - 0.55, d / 2 + 0.62, { depth: 0.1 });
    }
    YL.addCollider(opt.x || 0, opt.z || 0, w + 4.0, d + 4.0, opt.rotY || 0, 0.05);
    YL.mergeByMaterial(g);
    return g;
  };

  /* --------------------------- library --------------------------- */
  YL.makeLibrary = function (opt) {
    const w = opt.w || 20, d = opt.d || 13, pH = 1.2;
    const h1 = 4.0, h2 = 3.6;
    const g = new THREE.Group();
    g.name = '御书楼';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    g.scale.y = VS.library;

    YL.box(g, w + 4.0, pH, d + 3.6, M().stone, 0, pH / 2, 0, { cast: true });
    YL.box(g, w + 4.3, 0.16, d + 3.9, M().stoneLight, 0, pH + 0.03, 0);
    stepFlight(g, 7.0, pH, d / 2 + 1.75, 4);
    // balustrade around platform
    for (const sx of [-1, 1]) {
      YL.railing(g, sx * (w / 2 + 1.35), pH + 0.18, 0, d + 2.2, Math.PI / 2, { h: 0.85, mat: M().stoneLight });
    }
    const y0 = pH + 0.16;
    // hollow first floor: back and side walls, a timber floor and a real doorway
    YL.box(g, w - 0.8, h1, 0.35, M().plaster, 0, y0 + h1 / 2, -d / 2 + 0.17, { cast: true });
    for (const sx of [-1, 1]) {
      YL.box(g, 0.35, h1, d - 0.6, M().plaster, sx * (w / 2 - 0.17), y0 + h1 / 2, 0, { cast: true });
      YL.box(g, 0.4, 0.6, d - 0.5, M().woodDark, sx * (w / 2 - 0.36), y0 + 0.3, 0);
    }
    YL.box(g, w - 1.0, 0.16, d - 1.0, M().wood, 0, y0 + 0.08, 0, { cast: false });
    YL.box(g, w - 1.0, 0.14, d - 1.0, M().plaster, 0, y0 + h1 - 0.25, 0, { cast: false });
    for (const zz of [-d * 0.25, 0, d * 0.25]) {
      YL.box(g, w - 1.2, 0.24, 0.24, M().woodBeam, 0, y0 + h1 - 0.36, zz, { cast: true });
    }
    YL.box(g, w - 0.6, 0.6, 0.4, M().woodDark, 0, y0 + 0.3, -d / 2 + 0.35);
    const bays = 5;
    const doorOpening = 2.8;
    for (let i = 0; i < bays; i++) {
      const bw = (w - 1.4) / bays;
      const cx = -w / 2 + 0.7 + bw * (i + 0.5);
      if (i === 2) continue;
      facadePanel(g, cx, y0 + 0.7, d / 2 - 0.02, bw - 0.3, h1 - 1.2, 'window', 0);
    }
    // open central doorway with two inward-swung door leaves
    for (const sx of [-1, 1]) {
      YL.box(g, 0.34, 3.1, 0.6, M().woodDark, sx * (doorOpening / 2 + 0.12), y0 + 1.55, d / 2 - 0.15, { cast: true });
    }
    YL.box(g, doorOpening + 0.9, 0.6, 0.7, M().woodBeam, 0, y0 + 3.25, d / 2 - 0.1);
    YL.box(g, doorOpening, 0.16, 0.9, M().stoneDark, 0, y0 + 0.08, d / 2 - 0.05);
    for (const sx of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(sx * (doorOpening / 2 - 0.08), y0 + 0.18, d / 2 - 0.28);
      hinge.rotation.y = sx * 1.18;
      const door = new THREE.Group();
      door.position.x = -sx * 0.66;
      facadePanel(door, 0, 0, 0, 1.28, 2.7, 'door', 0);
      hinge.add(door);
      g.add(hinge);
    }
    for (const sx of [-1, 1]) {
      YL.box(g, 0.35, 0.6, d - 0.6, M().woodDark, sx * (w / 2 - 0.28), y0 + 0.3, 0);
      facadePanel(g, sx * (w / 2 + 0.01), y0 + 1.1, 0, 2.2, 2.0, 'window', sx * Math.PI / 2);
    }
    // rear elevation, seen from the garden
    facadePanel(g, 0, y0 + 0.75, -d / 2 - 0.02, 3.6, 3.0, 'door', Math.PI);
    for (const sx of [-1, 1]) {
      facadePanel(g, sx * 5.7, y0 + 1.0, -d / 2 - 0.02, 3.2, 2.1, 'window', Math.PI);
    }
    YL.box(g, w + 0.6, 0.3, 0.48, M().woodBeam, 0, y0 + h1 - 0.12, d / 2 - 0.2);
    for (let i = 0; i <= bays; i++) {
      const x = -w / 2 + 0.7 + (w - 1.4) * i / bays;
      YL.dougong(g, x, y0 + h1 - 0.55, d / 2 + 0.05);
    }
    // lower eave skirt
    const lower = YL.skirtRoof({ w: w + 3.4, d: d + 3.2, h: 0.95, lift: 0.78, inner: 0.6 });
    lower.position.y = y0 + h1;
    g.add(lower);
    // balcony at second floor
    YL.box(g, w + 1.4, 0.25, d + 1.4, M().woodDark, 0, y0 + h1 + 0.55, 0, { cast: true });
    YL.railing(g, 0, y0 + h1 + 0.7, d / 2 + 0.62, w + 0.9, 0, { h: 0.88 });
    for (const sx of [-1, 1]) YL.railing(g, sx * (w / 2 + 0.62), y0 + h1 + 0.7, 0, d + 0.9, Math.PI / 2, { h: 0.88 });
    const y2 = y0 + h1 + 0.6;
    // second floor
    YL.box(g, w - 1.4, h2, d - 1.4, M().plaster, 0, y2 + h2 / 2, 0, { cast: true });
    for (let i = 0; i < bays; i++) {
      const bw = (w - 2.0) / bays;
      const cx = -w / 2 + 1.0 + bw * (i + 0.5);
      facadePanel(g, cx, y2 + 0.55, d / 2 - 0.68, bw - 0.28, h2 - 1.0, 'window', 0);
      facadePanel(g, cx, y2 + 0.55, -d / 2 - 0.02, bw - 0.28, h2 - 1.0, 'window', Math.PI);
    }
    for (const sx of [-1, 1]) {
      facadePanel(g, sx * (w / 2 + 0.01), y2 + 0.8, 0, 2.4, 1.9, 'window', sx * Math.PI / 2);
    }
    // columns around balcony
    for (const p of [[-w / 2 + 0.7, d / 2 + 0.65], [w / 2 - 0.7, d / 2 + 0.65], [-w / 2 + 0.7, -d / 2 - 0.65], [w / 2 - 0.7, -d / 2 - 0.65]]) {
      YL.cyl(g, 0.19, 0.2, h2 + 0.6, M().redLacquer, p[0], y2 + (h2 + 0.6) / 2, p[1], { seg: 10 });
    }
    YL.box(g, w + 1.8, 0.36, d + 1.8, M().woodBeam, 0, y2 + h2 + 0.18, 0);
    const roof = YL.gableRoof({
      w: w + 4.4, d: d + 3.8, h: 3.1, lift: 0.9,
      gables: true, tileEnds: true, gableVent: true
    });
    roof.position.y = y2 + h2 + 0.3;
    g.add(roof);
    YL.plaque(g, '御书楼', 3.0, 0.86, 0, y2 + h2 - 0.45, d / 2 + 0.58);
    for (const sx of [-1, 1]) YL.lantern(g, sx * (w / 2 - 1.2), y2 + h2 - 1.2, d / 2 + 0.8, 1.0);
    if (YL.furnishLibrary) YL.furnishLibrary(g, { w: w, d: d, y0: y0, y2: y2, h2: h2 });
    if (YL.furnishLibraryInterior) YL.furnishLibraryInterior(g, { w: w, d: d, y0: y0, h1: h1 });
    addWallColliders(g, w, d, doorOpening);
    YL.addFloorZone(opt.x || 0, opt.z || 0, w + 2.8, d + 2.6, (y0 + 0.14) * VS.library, opt.rotY || 0);
    YL.mergeByMaterial(g);
    return g;
  };

  /* ---------------------------- wall ---------------------------- */
  YL.makeWall = function (opt) {
    const len = opt.len, h = opt.h || 3.2;
    const g = new THREE.Group();
    g.name = 'wall';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    YL.box(g, len, h, 0.55, opt.wallMat || M().plaster, 0, h / 2, 0, { cast: true });
    YL.box(g, len, 0.55, 0.62, M().stoneDark, 0, 0.28, 0);
    YL.box(g, len + 0.1, 0.18, 0.42, M().stoneLight, 0, h + 0.05, 0);
    // tiled cap
    for (const sz of [-1, 1]) {
      const slab = YL.box(g, len + 0.35, 0.12, 0.9, M().roofDark, 0, h + 0.28, sz * 0.22, { cast: true });
      slab.rotation.x = sz * 0.42;
    }
    YL.box(g, len + 0.45, 0.13, 0.2, M().ridge, 0, h + 0.44, 0, { cast: true });
    const piers = Math.max(1, Math.floor(len / 8));
    for (let i = 0; i <= piers; i++) {
      const x = -len / 2 + len * i / piers;
      YL.box(g, 0.8, h + 0.15, 0.78, opt.wallMat || M().plaster, x, (h + 0.15) / 2, 0, { cast: true });
      YL.box(g, 0.9, 0.35, 0.88, M().stoneDark, x, 0.17, 0);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.38, 4), M().roofDark);
      cap.position.set(x, h + 0.5, 0); cap.rotation.y = Math.PI / 4; cap.castShadow = true;
      g.add(cap);
    }
    YL.addCollider(opt.x || 0, opt.z || 0, len, 0.8, opt.rotY || 0, 0.0);
    YL.mergeByMaterial(g);
    return g;
  };

  /* -------------------------- corridor -------------------------- */
  YL.makeCorridor = function (opt) {
    const len = opt.len || 26, width = opt.width || 3.4, colH = opt.colH || 3.1;
    const g = new THREE.Group();
    g.name = 'corridor';
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    YL.box(g, len + 0.6, 0.35, width + 0.8, M().stoneLight, 0, 0.175, 0, { cast: true });
    const bays = Math.max(2, Math.round(len / 3));
    for (let i = 0; i <= bays; i++) {
      const x = -len / 2 + len * i / bays;
      for (const sz of [-1, 1]) {
        YL.cyl(g, 0.12, 0.14, colH, M().redLacquer, x, 0.35 + colH / 2, sz * (width / 2 - 0.25), { seg: 8 });
      }
    }
    for (const sz of [-1, 1]) {
      YL.box(g, len, 0.26, 0.24, M().woodBeam, 0, 0.35 + colH - 0.1, sz * (width / 2 - 0.25));
      if (opt.railing !== false) YL.railing(g, 0, 0.4, sz * (width / 2 - 0.25), len - 0.3, 0, { h: 0.8 });
    }
    const roof = YL.gableRoof({ w: len + 1.4, d: width + 2.2, h: 1.25, lift: 0.45, gables: false, tileEnds: false });
    roof.position.y = 0.35 + colH + 0.1;
    g.add(roof);
    YL.mergeByMaterial(g);
    return g;
  };

  /* --------------------------- trees --------------------------- */
  YL.makeTree = function (opt) {
    const type = opt.type || 'camphor';
    const s = opt.scale || 1;
    const g = new THREE.Group();
    g.name = 'tree_' + type;
    g.position.set(opt.x || 0, opt.y || 0, opt.z || 0);
    g.rotation.y = opt.rot || 0;
    const rng = YL.rng(opt.seed || 1);
    const trunkMat = type === 'ginkgo' ? M().trunkDark : M().trunk;

    if (type === 'pine') {
      YL.cyl(g, 0.18 * s, 0.38 * s, 5.4 * s, trunkMat, 0, 2.7 * s, 0, { seg: 8 });
      for (let i = 0; i < 5; i++) {
        const yy = (2.2 + i * 0.9) * s;
        const rr = (2.4 - i * 0.34) * s;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(rr, 2.1 * s, 9), M().pine);
        cone.position.set((rng() - 0.5) * 0.5, yy, (rng() - 0.5) * 0.5);
        cone.castShadow = true; cone.receiveShadow = true; g.add(cone);
      }
      YL.mergeByMaterial(g);
      return g;
    }

    const h = (type === 'ginkgo' ? 9.5 : type === 'maple' ? 6.8 : 9.0) * s;
    const baseR = (type === 'ginkgo' ? 0.32 : 0.48) * s;
    const lean = (rng() - 0.5) * 0.8;
    YL.cyl(g, baseR * 0.55, baseR, h * 0.62, trunkMat, 0, h * 0.31, 0, { seg: 9 });
    // branches
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + rng();
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.16 * s, h * 0.45, 6), trunkMat);
      br.position.set(Math.cos(a) * h * 0.12 + lean, h * 0.62, Math.sin(a) * h * 0.12);
      br.rotation.z = Math.cos(a) * 0.6;
      br.rotation.x = Math.sin(a) * 0.6;
      br.castShadow = true; g.add(br);
    }

    let mats;
    if (type === 'ginkgo') mats = [M().ginkgo, M().ginkgoLight, M().ginkgo];
    else if (type === 'maple') mats = [M().maple, M().mapleLight, M().maple];
    else mats = [M().leafA, M().leafB, M().leafC, M().leafD];

    const count = type === 'ginkgo' ? 24 : (type === 'maple' ? 22 : 30);
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const rr = (type === 'ginkgo' ? 1.8 : 2.8) * s * (0.22 + rng() * 0.78);
      const yy = h * (0.55 + rng() * 0.42);
      const rad = (type === 'ginkgo' ? (0.42 + rng() * 0.55) : (0.48 + rng() * 0.72)) * s;
      const geo = new THREE.IcosahedronGeometry(rad, 1);
      const mesh = new THREE.Mesh(geo, mats[Math.floor(rng() * mats.length)]);
      mesh.position.set(Math.cos(a) * rr + lean, yy, Math.sin(a) * rr);
      mesh.scale.set(0.82 + rng() * 0.4, (type === 'ginkgo' ? 0.9 : 0.65) + rng() * 0.3, 0.82 + rng() * 0.4);
      mesh.rotation.set(rng(), rng(), rng());
      mesh.castShadow = true; mesh.receiveShadow = true;
      g.add(mesh);
    }
    YL.mergeByMaterial(g);
    return g;
  };

  YL.makeBamboo = function (opt) {
    const g = new THREE.Group();
    g.position.set(opt.x || 0, opt.y || 0, opt.z || 0);
    g.name = 'bamboo';
    const rng = YL.rng(opt.seed || 3);
    const n = opt.count || 16;
    for (let i = 0; i < n; i++) {
      const x = (rng() - 0.5) * 4.4, z = (rng() - 0.5) * 4.4;
      const h = 4.5 + rng() * 4.5;
      YL.cyl(g, 0.035, 0.06, h, M().bamboo, x, h / 2, z, { seg: 5 });
      for (let k = 0; k < 3; k++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.1, 3), M().bambooLeaf);
        leaf.position.set(x + (rng() - 0.5) * 0.7, h * (0.62 + k * 0.12), z + (rng() - 0.5) * 0.7);
        leaf.rotation.set(rng() * 1.2, rng() * 3, rng() * 1.2);
        leaf.castShadow = true; g.add(leaf);
      }
    }
    YL.mergeByMaterial(g);
    return g;
  };

  YL.makeRock = function (opt) {
    const s = opt.scale || 1;
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), M().stoneDark);
    mesh.position.set(opt.x || 0, (opt.y || 0) + s * 0.45, opt.z || 0);
    mesh.scale.set(1, 0.65 + (opt.seed || 0) % 7 * 0.02, 0.85);
    mesh.rotation.set(opt.rx || 0.2, opt.ry || 0.5, opt.rz || 0.1);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  };

  /* --------------------------- lions --------------------------- */
  YL.makeLion = function (opt) {
    const g = new THREE.Group();
    g.position.set(opt.x || 0, 0, opt.z || 0);
    if (opt.rotY) g.rotation.y = opt.rotY;
    const s = opt.scale || 1;
    g.scale.setScalar(s);

    const SL = M().stoneLight, SM = M().stone, SD = M().stoneDark;

    function ell(rx, ry, rz, x, y, z, mat, seg) {
      seg = seg || 14;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(8, seg - 4)), mat);
      m.scale.set(rx, ry, rz); m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    }
    function limb(a, b, r1, r2, mat) {
      const va = new THREE.Vector3(a[0], a[1], a[2]);
      const vb = new THREE.Vector3(b[0], b[1], b[2]);
      const dir = vb.clone().sub(va);
      const len = dir.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 10), mat);
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    }
    function curl(x, y, z, a, sc, mat) {
      // a solid lock with a carved spiral ridge, rather than an open hoop
      const core = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat);
      core.scale.set(sc * 1.04, sc * 1.04, sc * 0.34);
      core.position.set(x, y, z); core.rotation.y = a;
      core.castShadow = true; core.receiveShadow = true; g.add(core);
      const m = new THREE.Mesh(new THREE.TorusGeometry(sc * 0.68, sc * 0.16, 4, 8, Math.PI * 1.55), mat);
      m.position.set(x, y, z); m.rotation.y = a;
      m.castShadow = true; m.receiveShadow = true; g.add(m);
      return m;
    }
    function cone(x, y, z, r, h, mat, rx, rz) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat);
      m.position.set(x, y, z); m.rotation.x = rx || 0; m.rotation.z = rz || 0;
      m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    }
    function spike(x, y, z, dx, dy, dz, r, h, mat) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat);
      m.position.set(x, y, z);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(dx, dy, dz).normalize());
      m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    }
    function paw(x, z, y) {
      YL.box(g, 0.26, 0.14, 0.34, SL, x, y + 0.07, z, { cast: true });
      for (let i = -1; i <= 1; i++) {
        ell(0.055, 0.05, 0.075, x + i * 0.075, y + 0.055, z + 0.18, SL, 10);
        cone(x + i * 0.075, y + 0.055, z + 0.255, 0.022, 0.075, SD, Math.PI / 2, 0);
      }
    }

    // --- carved pedestal ---
    YL.box(g, 1.4, 0.15, 1.78, SD, 0, 0.075, 0, { cast: true });
    YL.box(g, 1.16, 0.56, 1.5, SM, 0, 0.43, 0, { cast: true });
    YL.box(g, 1.26, 0.08, 1.6, SD, 0, 0.73, 0);
    YL.box(g, 1.32, 0.1, 1.66, SL, 0, 0.79, 0, { cast: true });
    // recessed panels with shallow incised cloud scrolls
    for (const sz of [-1, 1]) {
      YL.box(g, 0.94, 0.32, 0.03, SD, 0, 0.43, sz * 0.755);
      // light frame strips around the recessed panel
      YL.box(g, 0.94, 0.025, 0.035, SL, 0, 0.585, sz * 0.765);
      YL.box(g, 0.94, 0.025, 0.035, SL, 0, 0.275, sz * 0.765);
      YL.box(g, 0.025, 0.32, 0.035, SL, -0.465, 0.43, sz * 0.765);
      YL.box(g, 0.025, 0.32, 0.035, SL, 0.465, 0.43, sz * 0.765);
      const med = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 5, 16), SL);
      med.position.set(0, 0.43, sz * 0.775); g.add(med);
      for (const cx of [-0.27, 0.27]) {
        const sc = new THREE.Mesh(new THREE.TorusGeometry(0.040, 0.012, 4, 12, Math.PI * 1.35), SL);
        sc.position.set(cx, 0.43, sz * 0.775); g.add(sc);
      }
    }
    for (const sx of [-1, 1]) {
      YL.box(g, 0.03, 0.32, 0.96, SD, sx * 0.585, 0.43, 0);
      YL.box(g, 0.035, 0.025, 0.96, SL, sx * 0.595, 0.585, 0);
      YL.box(g, 0.035, 0.025, 0.96, SL, sx * 0.595, 0.275, 0);
      YL.box(g, 0.035, 0.32, 0.025, SL, sx * 0.595, 0.43, -0.475);
      YL.box(g, 0.035, 0.32, 0.025, SL, sx * 0.595, 0.43, 0.475);
      const med = new THREE.Mesh(new THREE.TorusGeometry(0.080, 0.015, 5, 16), SL);
      med.position.set(sx * 0.605, 0.43, 0); med.rotation.y = Math.PI / 2; g.add(med);
    }

    // --- continuous seated torso, lofted rather than built from stacked balls ---
    (function () {
      const secs = [
        { y: 0.88, rx: 0.36, rz: 0.42, cz: -0.05 },
        { y: 1.05, rx: 0.42, rz: 0.44, cz: -0.06 },
        { y: 1.25, rx: 0.42, rz: 0.42, cz: -0.03 },
        { y: 1.50, rx: 0.40, rz: 0.38, cz: 0.02 },
        { y: 1.72, rx: 0.35, rz: 0.33, cz: 0.07 },
        { y: 1.90, rx: 0.30, rz: 0.29, cz: 0.11 },
        { y: 2.03, rx: 0.26, rz: 0.26, cz: 0.13 }
      ];
      const seg = 28, pos = [], uv = [], idx = [];
      for (let s = 0; s < secs.length; s++) {
        const c = secs[s];
        for (let i = 0; i <= seg; i++) {
          const a = i / seg * Math.PI * 2;
          pos.push(Math.cos(a) * c.rx, c.y, c.cz + Math.sin(a) * c.rz);
          uv.push(i / seg, s / (secs.length - 1));
        }
      }
      for (let s = 0; s < secs.length - 1; s++) {
        for (let i = 0; i < seg; i++) {
          const a = s * (seg + 1) + i, b = a + seg + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      // caps
      const bottom = pos.length / 3;
      pos.push(0, secs[0].y, secs[0].cz); uv.push(0.5, 0);
      for (let i = 0; i < seg; i++) idx.push(bottom, i, i + 1);
      const top = pos.length / 3;
      const last = (secs.length - 1) * (seg + 1);
      pos.push(0, secs[secs.length - 1].y, secs[secs.length - 1].cz); uv.push(0.5, 1);
      for (let i = 0; i < seg; i++) idx.push(top, last + i + 1, last + i);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      const body = new THREE.Mesh(geo, SL);
      body.castShadow = true; body.receiveShadow = true; g.add(body);
    })();
    // haunches, shoulders and chest break up the torso silhouette
    for (const sx of [-1, 1]) {
      ell(0.16, 0.19, 0.19, sx * 0.24, 1.61, 0.18, SL);
    }
    ell(0.33, 0.27, 0.20, 0, 1.55, 0.18, SL);
    // broad carved chest ruff
    ell(0.38, 0.28, 0.20, 0, 1.73, 0.25, SM);
    for (let i = -1; i <= 1; i++) {
      curl(i * 0.11, 1.58, 0.37, 0.2 * i, 0.055, SM);
    }
    ell(0.22, 0.15, 0.12, 0, 1.49, 0.33, SL);

    // --- front legs: left straight, right forward and resting on a ball ---
    limb([-0.23, 1.60, 0.22], [-0.28, 1.22, 0.38], 0.14, 0.11, SL);
    limb([-0.28, 1.22, 0.38], [-0.28, 0.94, 0.51], 0.11, 0.10, SL);
    ell(0.13, 0.13, 0.13, -0.28, 1.22, 0.38, SL, 14);
    paw(-0.28, 0.52, 0.89);
    limb([0.23, 1.60, 0.24], [0.30, 1.25, 0.49], 0.14, 0.115, SL);
    limb([0.30, 1.25, 0.49], [0.30, 0.96, 0.66], 0.115, 0.10, SL);
    ell(0.13, 0.13, 0.13, 0.30, 1.25, 0.49, SL, 14);
    paw(0.30, 0.66, 0.89);
    // rear paws stepping out slightly from under the haunches
    for (const sx of [-1, 1]) {
      limb([sx * 0.29, 1.08, -0.26], [sx * 0.36, 0.92, -0.38], 0.12, 0.10, SL);
      paw(sx * 0.36, -0.40, 0.86);
    }
    // embroidered ball beneath the right paw
    ell(0.15, 0.15, 0.15, 0.30, 0.81, 0.84, SM, 16);
    for (const rot of [0, Math.PI / 2]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 5, 16), SD);
      band.position.set(0.30, 0.81, 0.84); band.rotation.set(rot, 0, 0); g.add(band);
    }
    cone(0.30, 0.70, 0.96, 0.035, 0.12, SD, Math.PI / 2, 0);

    // --- large mane mass behind the head ---
    ell(0.54, 0.46, 0.34, 0, 2.17, 0.03, SM, 18);

    // --- head: broad, flat and a little angular, like carved stone ---
    const HX = 0, HY = 2.31, HZ = 0.30;
    ell(0.36, 0.32, 0.25, HX, HY, HZ, SL);
    for (const sx of [-1, 1]) {
      ell(0.14, 0.14, 0.10, sx * 0.20, HY - 0.12, HZ + 0.05, SL);
      // broad deep socket and large eye
      ell(0.085, 0.060, 0.030, sx * 0.15, HY + 0.06, HZ + 0.20, SD, 12);
      ell(0.040, 0.040, 0.024, sx * 0.15, HY + 0.06, HZ + 0.225, M().plaster, 12);
      ell(0.021, 0.022, 0.012, sx * 0.15, HY + 0.06, HZ + 0.247, SD, 10);
      ell(0.010, 0.011, 0.008, sx * 0.15, HY + 0.06, HZ + 0.256, SD, 8);
      // heavy angular brow
      const brow = YL.box(g, 0.16, 0.045, 0.055, SD, sx * 0.14, HY + 0.15, HZ + 0.17, { cast: true });
      brow.rotation.z = sx * 0.34;
      // small ears, half hidden by the mane
      cone(sx * 0.31, HY + 0.18, HZ - 0.12, 0.060, 0.13, SM, 0, sx * -0.45);
      cone(sx * 0.31, HY + 0.18, HZ - 0.12, 0.032, 0.08, SD, 0, sx * -0.45);
    }
    // nose bridge, broad flat muzzle, whisker pads and flared nose
    ell(0.07, 0.14, 0.07, 0, HY + 0.04, HZ + 0.11, SL, 14);
    ell(0.18, 0.105, 0.11, 0, HY - 0.12, HZ + 0.17, SL, 16);
    for (const sx of [-1, 1]) ell(0.080, 0.060, 0.07, sx * 0.085, HY - 0.15, HZ + 0.23, SL, 12);
    ell(0.095, 0.055, 0.045, 0, HY - 0.065, HZ + 0.29, SD, 14);
    for (const sx of [-1, 1]) {
      ell(0.030, 0.022, 0.016, sx * 0.045, HY - 0.06, HZ + 0.325, SD, 8);
    }
    // open mouth: wide dark cavity, lower jaw, fangs and teeth
    YL.box(g, 0.22, 0.11, 0.06, SD, 0, HY - 0.285, HZ + 0.285);
    ell(0.18, 0.085, 0.11, 0, HY - 0.355, HZ + 0.245, SL, 14);
    for (const sx of [-1, 1]) {
      cone(sx * 0.082, HY - 0.275, HZ + 0.305, 0.026, 0.11, SD, Math.PI, 0);
      for (let i = 0; i < 2; i++) {
        YL.box(g, 0.021, 0.032, 0.018, SL, sx * (0.030 + i * 0.038), HY - 0.265, HZ + 0.32);
      }
      for (let i = 0; i < 3; i++) {
        YL.box(g, 0.021, 0.028, 0.018, SL, sx * (0.030 + i * 0.032), HY - 0.375, HZ + 0.29);
      }
    }
    YL.box(g, 0.08, 0.022, 0.08, SD, 0, HY - 0.34, HZ + 0.305, { rx: 0.28 });
    // short chin curls instead of a hanging beard
    for (let i = -2; i <= 2; i++) {
      curl(i * 0.052, HY - 0.44, HZ + 0.14, 0, 0.042, SM);
    }

    // --- mane locks: overlapping rows on the ruff, pointed tips at the edge ---
    const rows = [
      { y: 1.98, r: 0.52, n: 14, sc: 0.110, skip: 0.50 },
      { y: 2.16, r: 0.50, n: 12, sc: 0.100, skip: 0.42 },
      { y: 2.34, r: 0.42, n: 10, sc: 0.085, skip: 0.26 },
      { y: 2.49, r: 0.31, n: 7, sc: 0.072, skip: 0.10 }
    ];
    rows.forEach((row, ri) => {
      for (let i = 0; i < row.n; i++) {
        const a = i / row.n * Math.PI * 2 + (ri % 2 ? 0.12 : 0);
        if (Math.cos(a) > row.skip) continue;
        const wx = Math.sin(a) * row.r;
        const wz = HZ - 0.18 + Math.cos(a) * row.r;
        curl(wx, row.y, wz, a, row.sc, ri === 1 || ri === 3 ? SL : SM);
      }
    });
    // radiating pointed locks give the mane a fur-like edge
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2 + 0.08;
      if (Math.cos(a) > 0.05) continue;
      const r = 0.56;
      spike(Math.sin(a) * r, 1.94, HZ - 0.16 + Math.cos(a) * r,
        Math.sin(a) * 0.78, -0.62, Math.cos(a) * 0.78, 0.046, 0.24, i % 2 ? SL : SM);
    }
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        spike(sx * (0.47 - i * 0.028), 2.13 - i * 0.11, HZ + 0.02 + i * 0.05,
          sx * 0.78, -0.60, 0.18, 0.048, 0.26, SM);
        spike(sx * (0.36 - i * 0.02), 1.98 - i * 0.07, HZ + 0.20 + i * 0.05,
          sx * 0.64, -0.72, 0.22, 0.040, 0.22, i % 2 ? SL : SM);
      }
    }
    // forehead fringe curls
    for (const fx of [-0.18, 0, 0.18]) curl(fx, 2.64, HZ + 0.02, 0, 0.055, SL);

    // --- tail curling up behind the haunch ---
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.28, -0.48),
      new THREE.Vector3(0.10, 1.56, -0.67),
      new THREE.Vector3(0.22, 1.78, -0.69),
      new THREE.Vector3(0.31, 1.89, -0.53)
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.06, 7, false), SM);
    tail.castShadow = true; g.add(tail);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      curl(0.31 + Math.sin(a) * 0.09, 1.90 + Math.cos(a) * 0.10, -0.49,
        a, 0.055, i % 2 ? SL : SM);
    }

    // --- collar, bells and tassel ---
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 18), SD);
    collar.position.set(0, 1.92, 0.20); collar.rotation.x = Math.PI / 2; g.add(collar);
    for (const bx of [-0.19, 0, 0.19]) {
      ell(0.040, 0.046, 0.038, bx, 1.84, 0.47, SM, 10);
    }

    YL.mergeByMaterial(g);
    YL.lionGroups.push(g);
    return g;
  };

  /* -------------------------- censer -------------------------- */
  YL.makeCenser = function (opt) {
    const g = new THREE.Group();
    g.position.set(opt.x || 0, 0, opt.z || 0);
    const s = opt.scale || 1;
    g.scale.setScalar(s);
    YL.box(g, 2.2, 0.5, 2.2, M().stone, 0, 0.25, 0, { cast: true });
    YL.box(g, 1.8, 0.12, 1.8, M().stoneLight, 0, 0.55, 0);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2 + 0.5;
      YL.cyl(g, 0.12, 0.16, 0.7, M().bronze, Math.cos(a) * 0.5, 0.95, Math.sin(a) * 0.5, { seg: 6 });
    }
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.55, 0.85, 16), M().bronze);
    bowl.position.y = 1.5; bowl.castShadow = true; g.add(bowl);
    YL.cyl(g, 0.9, 0.9, 0.1, M().bronze, 0, 1.92, 0, { seg: 16 });
    for (const sx of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 5, 10, Math.PI), M().bronze);
      h.position.set(sx * 0.95, 1.7, 0); h.rotation.z = sx * Math.PI / 2; h.castShadow = true; g.add(h);
    }
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.4, 12), M().bronze);
    lid.position.y = 2.1; lid.castShadow = true; g.add(lid);
    YL.mergeByMaterial(g);
    return g;
  };

  /* --------------------------- people --------------------------- */
  YL.makePerson = function (opt) {
    const g = new THREE.Group();
    g.position.set(opt.x || 0, opt.y || 0, opt.z || 0);
    g.rotation.y = opt.rot || 0;
    const s = (opt.scale || 1) * (opt.child ? 0.66 : 1);
    g.scale.setScalar(s);
    g.name = opt.child ? 'child' : 'visitor';

    const robeKey = opt.robe || 'clothIndigo';
    const robe = M()[robeKey] || M().clothIndigo;
    const sashMat = opt.sash || M().clothInk;
    const trim = M().clothCream;
    const skin = M().skin;
    const dark = M().hair;
    const shoe = M().woodDark;
    const seated = opt.pose === 'seated';

    function mesh(geo, mat, x, y, z) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x || 0, y || 0, z || 0);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); return m;
    }

    if (seated) {
      // folded lower robe, then upright torso
      YL.cyl(g, 0.38, 0.42, 0.24, robe, 0, 0.14, 0, { seg: 10 });
      YL.cyl(g, 0.4, 0.4, 0.05, trim, 0, 0.28, 0, { seg: 10 });
      YL.cyl(g, 0.22, 0.25, 0.5, robe, 0, 0.58, 0, { seg: 10 });
      YL.cyl(g, 0.255, 0.255, 0.08, sashMat, 0, 0.42, 0, { seg: 10 });
      for (const sx of [-1, 1]) YL.box(g, 0.13, 0.09, 0.3, shoe, sx * 0.13, 0.06, 0.26, { cast: true });
      // seated legs suggested under the robe
      for (const sx of [-1, 1]) YL.box(g, 0.18, 0.12, 0.55, robe, sx * 0.16, 0.12, 0.22, { cast: true });
      const neckY = 0.89, headY = 1.08;
      YL.cyl(g, 0.06, 0.07, 0.12, skin, 0, neckY, 0.02, { seg: 8 });
      const head = mesh(new THREE.SphereGeometry(0.142, 12, 10), skin, 0, headY, 0.025);
      head.scale.set(0.92, 1.07, 0.92);
      const hair = mesh(new THREE.SphereGeometry(0.147, 12, 8, 0, TAU, 0, Math.PI / 2), dark, 0, headY + 0.025, 0.01);
      hair.scale.set(1, 1.05, 1);
      face(g, headY, 0.025, opt);
      hairStyle(g, headY, opt, dark);
      armsSeated(g, robe, skin, sashMat, opt);
      // cushion under the figure
      YL.cyl(g, 0.36, 0.38, 0.09, M().silkRed, 0, 0.035, 0, { seg: 10 });
    } else {
      // long robe
      YL.cyl(g, 0.205, 0.335, 1.0, robe, 0, 0.59, 0, { seg: 12 });
      YL.cyl(g, 0.338, 0.338, 0.055, trim, 0, 0.11, 0, { seg: 12 });
      // front robe opening
      YL.box(g, 0.06, 0.9, 0.025, trim, -0.065, 0.6, 0.30, { cast: true });
      YL.box(g, 0.06, 0.9, 0.025, trim, 0.065, 0.6, 0.30, { cast: true });
      // shoes and feet
      for (const sx of [-1, 1]) {
        YL.box(g, 0.13, 0.08, 0.3, shoe, sx * 0.12, 0.045, 0.09, { cast: true });
      }
      // torso, sash and crossed collar
      YL.cyl(g, 0.215, 0.25, 0.5, robe, 0, 1.22, 0, { seg: 12 });
      YL.cyl(g, 0.257, 0.257, 0.085, sashMat, 0, 1.0, 0, { seg: 12 });
      const jade = mesh(new THREE.TorusGeometry(0.035, 0.011, 5, 12), M().jade, 0, 0.98, 0.255);
      jade.rotation.x = Math.PI / 2;
      YL.box(g, 0.065, 0.4, 0.03, trim, -0.075, 1.35, 0.225, { rz: 0.35, cast: true });
      YL.box(g, 0.065, 0.4, 0.03, trim, 0.075, 1.35, 0.225, { rz: -0.35, cast: true });
      const shoulders = mesh(new THREE.SphereGeometry(0.24, 10, 8), robe, 0, 1.43, 0);
      shoulders.scale.set(1, 0.45, 0.8);
      // neck and head
      YL.cyl(g, 0.058, 0.07, 0.12, skin, 0, 1.5, 0.02, { seg: 8 });
      const headY = 1.63;
      const head = mesh(new THREE.SphereGeometry(0.142, 12, 10), skin, 0, headY, 0.02);
      head.scale.set(0.92, 1.08, 0.92);
      const hair = mesh(new THREE.SphereGeometry(0.148, 12, 8, 0, TAU, 0, Math.PI / 2), dark, 0, headY + 0.025, 0.005);
      hair.scale.set(1, 1.04, 1);
      face(g, headY, 0.02, opt);
      hairStyle(g, headY, opt, dark);
      // arms, posed
      arms(g, robe, skin, sashMat, opt);
      // umbrella, bag, fan
      if (opt.umbrella) {
        const ux = 0.46;
        YL.cyl(g, 0.012, 0.012, 2.02, M().woodDark, ux, 1.05, 0.08, { seg: 5 });
        const canopyMat = opt.umbrella === 'red' ? M().umbrellaRed : M().umbrellaPaper;
        const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.32, 14, 1, true), canopyMat);
        canopy.position.set(ux, 2.1, 0.08); canopy.castShadow = true; g.add(canopy);
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * TAU;
          const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.78, 4), M().woodDark);
          rib.position.set(ux + Math.cos(a) * 0.39, 1.98, 0.08 + Math.sin(a) * 0.39);
          rib.rotation.z = Math.PI / 2; rib.rotation.y = -a;
          g.add(rib);
        }
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 5, 10, Math.PI), M().woodDark);
        handle.position.set(ux, 0.08, 0.08); handle.rotation.x = Math.PI / 2; g.add(handle);
      }
      if (opt.bag) {
        YL.box(g, 0.28, 0.3, 0.12, M().clothOlive, 0, 1.05, -0.27, { cast: true });
        YL.box(g, 0.03, 0.7, 0.02, M().woodDark, 0.18, 1.28, -0.18);
      }
      if (opt.fan) {
        const fan = new THREE.Mesh(new THREE.CircleGeometry(0.18, 14, 0, Math.PI), M().paperWhite);
        fan.position.set(-0.28, 1.15, 0.28); fan.rotation.x = -0.2; g.add(fan);
      }
      if (opt.book) {
        const bx = opt.book === 'scroll' ? 0.28 : 0;
        if (opt.book === 'scroll') {
          YL.cyl(g, 0.035, 0.035, 0.3, M().paperWhite, -0.06, 1.22, 0.28, { rz: Math.PI / 2, seg: 8 });
          YL.box(g, 0.34, 0.012, 0.22, M().paperWhite, 0.12, 1.2, 0.28, { rz: -0.15, cast: false });
        } else {
          const book = new THREE.Group();
          book.position.set(bx, 1.24, 0.3);
          YL.box(book, 0.32, 0.035, 0.23, M().woodDark, 0, 0, 0);
          const pg = M().paperWhite;
          for (const sz of [-1, 1]) {
            const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.21), pg);
            p.position.set(0, 0.04, sz * 0.105);
            p.rotation.x = sz * 0.22; book.add(p);
          }
          g.add(book);
        }
      }
    }
    YL.mergeByMaterial(g);
    return g;
  };

  function face(g, headY, z, opt) {
    const eyeMat = M().hair;
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 6, 5), eyeMat);
      eye.position.set(sx * 0.046, headY + 0.012, z + 0.128);
      g.add(eye);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.007, 0.012), M().hair);
      brow.position.set(sx * 0.048, headY + 0.043, z + 0.125);
      brow.rotation.z = sx * 0.08; g.add(brow);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), M().skin);
      ear.position.set(sx * 0.13, headY, z + 0.005); ear.scale.set(0.55, 1, 0.75); g.add(ear);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), M().skin);
    nose.position.set(0, headY - 0.015, z + 0.136); nose.scale.set(0.8, 1.1, 0.8); g.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.008, 0.012), M().silkRed);
    mouth.position.set(0, headY - 0.06, z + 0.13); g.add(mouth);
    if (opt.beard) {
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 6), M().hair);
      beard.position.set(0, headY - 0.17, z + 0.08); beard.rotation.x = Math.PI; g.add(beard);
    }
  }

  function hairStyle(g, headY, opt, dark) {
    const hat = opt.hat || 'bun';
    if (hat === 'scholar') {
      YL.box(g, 0.27, 0.1, 0.3, M().clothInk, 0, headY + 0.18, 0.005, { cast: true });
      for (const sx of [-1, 1]) YL.box(g, 0.12, 0.035, 0.2, M().clothInk, sx * 0.19, headY + 0.18, -0.03);
      YL.box(g, 0.05, 0.06, 0.05, M().clothCream, 0, headY + 0.24, 0.12);
    } else if (hat === 'straw') {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.18, 14), M().umbrellaPaper);
      s.position.set(0, headY + 0.16, 0); s.castShadow = true; g.add(s);
    } else if (hat === 'cap') {
      YL.cyl(g, 0.145, 0.16, 0.12, M().clothInk, 0, headY + 0.13, 0.005, { seg: 10 });
    } else {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), dark);
      bun.position.set(0, headY + 0.16, -0.01); bun.castShadow = true; g.add(bun);
      YL.cyl(g, 0.012, 0.012, 0.14, M().jade, 0, headY + 0.25, -0.01, { seg: 4 });
    }
  }

  function arms(g, robe, skin, sashMat, opt) {
    const pose = opt.pose || 'stand';
    for (const sx of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(sx * 0.255, 1.43, 0);
      arm.rotation.z = sx * 0.12;
      arm.rotation.x = 0;
      if (pose === 'talk' && sx > 0) arm.rotation.z = -1.15;
      if (pose === 'talk' && sx > 0) arm.rotation.x = -0.25;
      if (pose === 'walk') arm.rotation.x = sx * 0.35;
      if (opt.umbrella && sx > 0) { arm.rotation.z = -1.25; arm.rotation.x = -0.25; }
      if (opt.book && sx < 0) { arm.rotation.x = -0.55; }
      if (opt.book && sx > 0) { arm.rotation.x = -0.75; }
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.08, 0.4, 7), robe);
      upper.position.y = -0.2; upper.castShadow = true; arm.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.4;
      elbow.rotation.x = -0.18;
      if (opt.book) elbow.rotation.x = -0.9;
      if (opt.umbrella && sx > 0) elbow.rotation.x = -0.6;
      arm.add(elbow);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.34, 7), robe);
      fore.position.y = -0.17; fore.castShadow = true; elbow.add(fore);
      // wide sleeve cuff
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.13, 7), robe);
      cuff.position.y = -0.34; cuff.castShadow = true; elbow.add(cuff);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 7, 6), skin);
      hand.position.y = -0.41; hand.castShadow = true; elbow.add(hand);
      g.add(arm);
    }
  }

  function armsSeated(g, robe, skin, sashMat, opt) {
    for (const sx of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(sx * 0.245, 0.83, 0.02);
      arm.rotation.x = -0.75;
      arm.rotation.z = sx * 0.12;
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.34, 7), robe);
      upper.position.y = -0.17; upper.castShadow = true; arm.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.34; elbow.rotation.x = -0.85;
      arm.add(elbow);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.3, 7), robe);
      fore.position.y = -0.15; fore.castShadow = true; elbow.add(fore);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 7, 6), skin);
      hand.position.y = -0.31; hand.castShadow = true; elbow.add(hand);
      g.add(arm);
    }
  }

  /* -------------------------- lantern post -------------------------- */
  YL.makeLanternPost = function (opt) {
    const g = new THREE.Group();
    g.position.set(opt.x || 0, 0, opt.z || 0);
    YL.cyl(g, 0.06, 0.09, 3.4, M().woodDark, 0, 1.7, 0, { seg: 6 });
    YL.box(g, 0.08, 0.08, 1.0, M().woodDark, 0, 3.3, 0.45);
    YL.lantern(g, 0, 2.95, 0.95, 0.8);
    YL.mergeByMaterial(g);
    return g;
  };
})();
