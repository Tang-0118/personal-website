/* ============================================================
   岳麓书院 · 3D  /  scene.js
   Site plan, landscape, lighting and the explorable world.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL;
  const M = () => YL.M;
  const TAU = Math.PI * 2;

  YL.hotspots = [
    {
      id: 'hexitai', name: '赫曦台', en: 'HEXI TERRACE', group: '中轴', period: '清 · 1790',
      pos: new THREE.Vector3(0, 9.2, 57),
      view: { pos: new THREE.Vector3(0, 14, 88), target: new THREE.Vector3(0, 4.5, 57) },
      text: '南宋乾道三年（1167），朱熹访张栻于岳麓，登山顶观日出，筑台名“赫曦”。后世移建院中，成为书院的迎宾之门与演乐之所。台上“福”“寿”二字，为山长罗典所书。'
    },
    {
      id: 'gate', name: '大门', en: 'MAIN GATE', group: '中轴', period: '清 · 1868',
      pos: new THREE.Vector3(0, 9.6, 44),
      view: { pos: new THREE.Vector3(0, 22, 84), target: new THREE.Vector3(0, 4.8, 43.5) },
      text: '门额“岳麓书院”为宋真宗赐额。两侧名联“惟楚有材，于斯为盛”，由清嘉庆年间山长袁名曜出上联、贡生张中阶对下联，分别典出《左传》与《论语》。'
    },
    {
      id: 'ermen', name: '二门', en: 'SECOND GATE', group: '中轴', period: '清',
      pos: new THREE.Vector3(0, 7.6, 31),
      view: { pos: new THREE.Vector3(-14, 13, 52), target: new THREE.Vector3(0, 4.2, 29) },
      text: '二门门额“纳于大麓，藏之名山”，集《尚书》《史记》句，点出书院依山而建、藏书于斯的格局。穿过此门，便是书院的核心讲学区。'
    },
    {
      id: 'jiangtang', name: '讲堂', en: 'LECTURE HALL', group: '中轴', period: '清',
      pos: new THREE.Vector3(0, 10.2, 19.2),
      view: { pos: new THREE.Vector3(-30, 20, 48), target: new THREE.Vector3(0, 5, 12) },
      text: '书院讲学核心，五间开敞。朱熹、张栻、王阳明等都曾在此讲学。堂上悬“实事求是”“道南正脉”“学达性天”诸匾，两壁嵌朱熹手书“忠孝廉节”碑。'
    },
    {
      id: 'library', name: '御书楼', en: 'IMPERIAL LIBRARY', group: '中轴', period: '清 · 重建',
      pos: new THREE.Vector3(0, 16.4, -13),
      view: { pos: new THREE.Vector3(-30, 24, 28), target: new THREE.Vector3(0, 7.5, -14) },
      text: '书院藏书之所。宋真宗曾赐经书，楼因“御书”得名。现存建筑为20世纪80年代按清代规制重建，重檐楼阁，是全院最高的建筑。'
    },
    {
      id: 'jiaoxue', name: '教学斋', en: 'TEACHING WING', group: '两厢', period: '清',
      pos: new THREE.Vector3(-35, 7.2, 20),
      view: { pos: new THREE.Vector3(-8, 8, 30), target: new THREE.Vector3(-35, 4.5, 20) },
      text: '“教学半”出自《礼记·学记》：“学然后知不足，教然后知困。”南侧教学斋与北侧半学斋东西相望，是生徒居学、自修之所。'
    },
    {
      id: 'banxue', name: '半学斋', en: 'HALF-STUDY WING', group: '两厢', period: '清',
      pos: new THREE.Vector3(35, 7.2, 20),
      view: { pos: new THREE.Vector3(8, 8, 30), target: new THREE.Vector3(35, 4.5, 20) },
      text: '北侧斋舍，与教学斋对称。旧时斋舍以“斋”为单位，生徒分斋而居，师长分斋而教，形成讲学与自修相济的书院生活。'
    },
    {
      id: 'wenchang', name: '文昌阁', en: 'WENCHANG PAVILION', group: '两厢', period: '清',
      pos: new THREE.Vector3(32, 13.5, -7),
      view: { pos: new THREE.Vector3(14, 14, 6), target: new THREE.Vector3(32, 6, -7) },
      text: '供奉文昌帝君的楼阁。旧时科举士子在此祈愿文运。二层重檐，登临可俯瞰讲堂与御书楼之间的院落。'
    },
    {
      id: 'wenmiao', name: '文庙', en: 'CONFUCIAN TEMPLE', group: '两厢', period: '明 · 清',
      pos: new THREE.Vector3(38, 9.5, -36),
      view: { pos: new THREE.Vector3(16, 23, -20), target: new THREE.Vector3(38, 5, -36) },
      text: '书院北侧的祭祀空间，大成殿为核心。书院兼具讲学、藏书、祭祀三大功能，文庙使“学”与“礼”在同一片院落中相成。'
    },
    {
      id: 'baiquan', name: '百泉轩', en: 'HUNDRED SPRINGS', group: '园林', period: '清',
      pos: new THREE.Vector3(-26, 6.4, -31),
      view: { pos: new THREE.Vector3(-8, 4.8, -31), target: new THREE.Vector3(-26, 2.9, -31) },
      text: '书院南侧园林中的临水轩榭，因近“百泉”得名，为山长游憩、会友、读书之所。轩外曲涧、荷池、竹木相映。'
    },
    {
      id: 'aiwan', name: '爱晚亭', en: 'AIWAN PAVILION', group: '院外', period: '清 · 1792',
      pos: new THREE.Vector3(30, 10.5, -88),
      view: { pos: new THREE.Vector3(20, 10, -71), target: new THREE.Vector3(30, 4.5, -88) },
      text: '院外清风峡中，清乾隆五十七年（1792）由山长罗典建，原名红叶亭，后取杜牧“停车坐爱枫林晚，霜叶红于二月花”诗意更名。四周多枫香、三角枫与鸡爪槭，深秋红叶层染，为中国四大名亭之一。'
    },
    {
      id: 'zibei', name: '自卑亭', en: 'ZIBEI PAVILION', group: '院外', period: '清 · 1688',
      pos: new THREE.Vector3(-24, 4.6, 93),
      view: { pos: new THREE.Vector3(-24, 8, 112), target: new THREE.Vector3(-24, 3, 93) },
      text: '位于书院前通往湘江的大道旁，清康熙二十七年（1688）建。名取《中庸》“行远必自迩，登高必自卑”，为进入书院前的一处静心之所。'
    }
  ];

  YL.route = ['hexitai', 'gate', 'ermen', 'jiangtang', 'library', 'jiaoxue', 'banxue', 'wenchang', 'wenmiao', 'baiquan', 'aiwan', 'zibei'];
  // buildings are vertically exaggerated a little; keep the labels above the roofs
  YL.hotspots.forEach(h => { h.pos.y *= 1.14; });

  /* ----------------------------- sky ----------------------------- */
  function makeSky(scene) {
    const uniforms = {
      top: { value: new THREE.Color(0x6b88a4) },
      mid: { value: new THREE.Color(0xc8d4d5) },
      bottom: { value: new THREE.Color(0xf0d8b6) },
      offset: { value: 12 },
      exponent: { value: 0.72 }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
        uniform float offset; uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          vec3 col;
          if (h > 0.08) {
            col = mix(mid, top, pow(clamp((h - 0.08) / 0.92, 0.0, 1.0), exponent));
          } else {
            col = mix(bottom, mid, smoothstep(-0.25, 0.08, h));
          }
          gl_FragColor = vec4(col, 1.0);
        }`
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(460, 32, 20), mat);
    dome.frustumCulled = false;
    dome.renderOrder = -20;
    scene.add(dome);

    // sun
    const c = YL.canvas(128, 128), g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,252,235,1)');
    grd.addColorStop(0.16, 'rgba(255,240,200,.95)');
    grd.addColorStop(0.42, 'rgba(255,208,130,.35)');
    grd.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const sunTex = new THREE.CanvasTexture(c);
    sunTex.encoding = THREE.sRGBEncoding;
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sunTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
    }));
    sun.scale.set(34, 34, 1);
    sun.position.set(-270, 210, 320);
    scene.add(sun);

    // moon
    const mc = YL.canvas(128, 128), mg = mc.getContext('2d');
    const mgr = mg.createRadialGradient(64, 64, 4, 64, 64, 62);
    mgr.addColorStop(0, 'rgba(245,248,255,1)');
    mgr.addColorStop(0.3, 'rgba(220,232,255,.9)');
    mgr.addColorStop(0.55, 'rgba(180,205,245,.18)');
    mgr.addColorStop(1, 'rgba(150,180,230,0)');
    mg.fillStyle = mgr; mg.fillRect(0, 0, 128, 128);
    const moonTex = new THREE.CanvasTexture(mc);
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: moonTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false
    }));
    moon.scale.set(20, 20, 1);
    moon.position.set(190, 240, -260);
    scene.add(moon);

    // stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    const rng = YL.rng(51);
    for (let i = 0; i < 700; i++) {
      const a = rng() * TAU, e = rng() * 0.9 + 0.05, r = 430;
      starPos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xe8f0ff, size: 2.1, transparent: true, opacity: 0, depthWrite: false, fog: false
    }));
    scene.add(stars);

    // clouds
    YL.initTextures();
    const cloudTex = YL.TX.cloud;
    const clouds = [];
    const crng = YL.rng(99);
    for (let i = 0; i < 9; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: cloudTex, transparent: true, opacity: 0.6, depthWrite: false, fog: false,
        color: 0xffffff
      }));
      sp.position.set(-330 + crng() * 660, 105 + crng() * 70, -320 + crng() * 480);
      const s = 70 + crng() * 110;
      sp.scale.set(s, s * 0.36, 1);
      sp.userData.speed = 0.35 + crng() * 0.5;
      scene.add(sp);
      clouds.push(sp);
    }

    return { dome, uniforms, sun, moon, stars, clouds };
  }

  /* ---------------------------- lights ---------------------------- */
  function makeLights(scene) {
    const hemi = new THREE.HemisphereLight(0xd2e2ef, 0x6e6450, 0.42);
    hemi.color.convertSRGBToLinear();
    hemi.groundColor.convertSRGBToLinear();
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe0b0, 3.22);
    sun.color.convertSRGBToLinear();
    sun.position.set(-150, 82, 190);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -115;
    sun.shadow.camera.right = 115;
    sun.shadow.camera.top = 115;
    sun.shadow.camera.bottom = -115;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 430;
    sun.shadow.bias = -0.00045;
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 2;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xaac6dc, 0.18);
    fill.color.convertSRGBToLinear();
    fill.position.set(120, 70, -120);
    scene.add(fill);
    const ambient = new THREE.AmbientLight(0xffffff, 0.08);
    scene.add(ambient);

    const warm = [];
    for (const p of [[0, 5, 38], [0, 7, 10], [0, 10, -13], [-20, 4, -32], [-36, 4, 18], [36, 4, 18], [28, 4, -87]]) {
      const l = new THREE.PointLight(0xffa85c, 0, 22, 2);
      l.color.convertSRGBToLinear();
      l.position.set(p[0], p[1], p[2]);
      scene.add(l);
      warm.push(l);
    }
    // soft fill inside the open lecture hall, so the interior reads in daylight
    const hallLight = new THREE.PointLight(0xffe0bd, 1.25, 17, 2);
    hallLight.color.convertSRGBToLinear();
    hallLight.position.set(0, 4.9, 13);
    scene.add(hallLight);
    const loungeLight = new THREE.PointLight(0xffe0bd, 1.8, 14, 2);
    loungeLight.color.convertSRGBToLinear();
    loungeLight.position.set(-26, 3.4, -31);
    scene.add(loungeLight);
    const loungeFill = new THREE.PointLight(0xffe7c8, 0.8, 11, 2);
    loungeFill.color.convertSRGBToLinear();
    loungeFill.position.set(-22.5, 4.0, -29.5);
    scene.add(loungeFill);
    const libraryLight = new THREE.PointLight(0xffe0bd, 2.0, 16, 2);
    libraryLight.color.convertSRGBToLinear();
    libraryLight.position.set(0, 4.0, -13);
    scene.add(libraryLight);
    const libraryFill = new THREE.PointLight(0xffd9b0, 1.1, 12, 2);
    libraryFill.color.convertSRGBToLinear();
    libraryFill.position.set(0, 3.2, -8.5);
    scene.add(libraryFill);
    return { hemi, sun, fill, ambient, warm, hallLight, loungeLight, loungeFill, libraryLight, libraryFill };
  }

  /* --------------------------- terrain --------------------------- */
  function makeTerrain(scene) {
    const geo = new THREE.PlaneGeometry(620, 540, 124, 108);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = [];
    const cLow = new THREE.Color(0x5a6943).convertSRGBToLinear();
    const cMid = new THREE.Color(0x3a4d31).convertSRGBToLinear();
    const cHigh = new THREE.Color(0x2b3b2b).convertSRGBToLinear();
    const cRock = new THREE.Color(0x625d4e).convertSRGBToLinear();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i) - 70;
      const h = YL.groundHeight(x, z);
      pos.setY(i, h);
      const t = YL.clamp(h / 55, 0, 1);
      if (t < 0.5) c.copy(cLow).lerp(cMid, t * 2);
      else c.copy(cMid).lerp(cHigh, (t - 0.5) * 2);
      const rock = YL.noise2(x * 0.08, z * 0.08);
      if (h > 24 && rock > 0.62) c.lerp(cRock, (rock - 0.62) * 1.7);
      c.offsetHSL(0, 0, (YL.noise2(x * 0.04, z * 0.04) - 0.5) * 0.08);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.99, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = -70;
    mesh.receiveShadow = true;
    mesh.name = 'Yuelu_Mountain';
    scene.add(mesh);
    return mesh;
  }

  /* ---------------------------- paths ---------------------------- */
  function ribbonPath(points, width, mat, lift) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], 0, p[1])));
    const n = 100;
    const samples = curve.getPoints(n);
    const pos = [], uv = [], idx = [];
    let dist = 0;
    for (let i = 0; i <= n; i++) {
      const p = samples[i];
      const prev = samples[Math.max(0, i - 1)];
      const next = samples[Math.min(n, i + 1)];
      let tx = next.x - prev.x, tz = next.z - prev.z;
      const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
      const nx = -tz, nz = tx;
      if (i > 0) dist += Math.hypot(p.x - samples[i - 1].x, p.z - samples[i - 1].z);
      for (const s of [-1, 1]) {
        const x = p.x + nx * width / 2 * s;
        const z = p.z + nz * width / 2 * s;
        const y = YL.groundHeight(x, z) + (lift == null ? 0.055 : lift);
        pos.push(x, y, z);
        uv.push((s + 1) / 2, dist / 2.4);
      }
    }
    for (let i = 0; i < n; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  function pathMaterial(rx, ry) {
    const mat = M().paving.clone();
    mat.map = M().paving.map.clone();
    mat.map.needsUpdate = true;
    mat.map.repeat.set(rx || 1.2, ry || 1.2);
    mat.color = YL.linearColor(0xd9d4c5);
    mat.roughness = 0.96;
    return mat;
  }

  /* --------------------------- grounds --------------------------- */
  function makeGrounds(world) {
    const base = new THREE.Mesh(new THREE.PlaneGeometry(104, 138), M().paving);
    base.rotation.x = -Math.PI / 2;
    base.position.set(0, 0.035, 3);
    base.receiveShadow = true;
    world.add(base);

    // slightly lower stone apron
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(108, 142), M().stoneDark);
    apron.rotation.x = -Math.PI / 2;
    apron.position.set(0, 0.01, 3);
    apron.receiveShadow = true;
    world.add(apron);

    const pathMat = pathMaterial(1.4, 1.4);
    const main = ribbonPath([[0, 69], [0, 30], [0, -25], [0, -62]], 6.4, pathMat, 0.06);
    world.add(main);
    const front = ribbonPath([[0, 70], [0, 88], [0, 108]], 8.0, pathMat, 0.06);
    world.add(front);
    const crossA = ribbonPath([[-47, 37.5], [0, 37.5], [47, 37.5]], 3.6, pathMat, 0.06);
    world.add(crossA);
    const crossB = ribbonPath([[-47, 23], [0, 23], [47, 23]], 3.6, pathMat, 0.06);
    world.add(crossB);
    const crossC = ribbonPath([[-47, -25], [47, -25]], 3.0, pathMat, 0.06);
    world.add(crossC);
    const ringL = ribbonPath([[-46, 62], [-46, -58]], 2.8, pathMat, 0.06);
    world.add(ringL);
    const ringR = ribbonPath([[46, 62], [46, -58]], 2.8, pathMat, 0.06);
    world.add(ringR);

    // grass beds
    const grassMat = M().grass;
    const beds = [
      [-41, 7, 13, 22], [41, 7, 13, 22],
      [-41, -34, 13, 22],
      [-42, 55, 10, 14], [42, 55, 10, 14],
      [-41, -55, 12, 12], [41, -55, 12, 12]
    ];
    for (const b of beds) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(b[2], b[3]), grassMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(b[0], 0.055, b[1]);
      m.receiveShadow = true;
      world.add(m);
    }

    // drainage strips
    for (const x of [-3.5, 3.5]) {
      YL.box(world, 0.16, 0.05, 88, M().stoneDark, x, 0.065, 26, { cast: false });
    }

    // front plaza
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(38, 30), pathMaterial(5, 4));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.045, 87);
    plaza.receiveShadow = true;
    world.add(plaza);

    // curbs along the central path
    for (const x of [-3.35, 3.35]) {
      YL.box(world, 0.22, 0.13, 132, M().stoneLight, x, 0.08, 3.5, { cast: true });
    }

    // a few stone gutters / grates
    for (const z of [64, 50, 25, -2, -22]) {
      YL.box(world, 1.2, 0.04, 0.5, M().iron, 3.35, 0.09, z, { cast: false });
    }
  }

  /* --------------------------- pond --------------------------- */
  function makePond(world, cx, cz, rx, rz, name) {
    const rimShape = new THREE.Shape();
    rimShape.absellipse(0, 0, rx + 0.9, rz + 0.9, 0, TAU, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, rx, rz, 0, TAU, false, 0);
    rimShape.holes.push(hole);
    const rimGeo = new THREE.ShapeGeometry(rimShape, 48);
    rimGeo.rotateX(-Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, M().stoneDark);
    rim.position.set(cx, 0.09, cz);
    rim.receiveShadow = true;
    world.add(rim);

    const waterGeo = new THREE.CircleGeometry(1, 72);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(waterGeo, M().water);
    water.scale.set(rx, 1, rz);
    water.position.set(cx, 0.12, cz);
    water.receiveShadow = true;
    water.name = name || 'water';
    world.add(water);

    // lotus pads
    const padGeo = new THREE.CircleGeometry(0.42, 8);
    padGeo.rotateX(-Math.PI / 2);
    const padMat = new THREE.MeshStandardMaterial({
      color: YL.linearColor(0x4f6f3c), roughness: 0.85, side: THREE.DoubleSide
    });
    const pads = new THREE.InstancedMesh(padGeo, padMat, 28);
    const mtx = new THREE.Matrix4();
    const rng = YL.rng(12 + Math.floor(cx));
    for (let i = 0; i < 28; i++) {
      const a = rng() * TAU, r = Math.sqrt(rng()) * 0.82;
      const x = cx + Math.cos(a) * rx * r, z = cz + Math.sin(a) * rz * r;
      mtx.makeRotationY(rng() * TAU);
      mtx.setPosition(x, 0.145, z);
      pads.setMatrixAt(i, mtx);
    }
    pads.instanceMatrix.needsUpdate = true;
    world.add(pads);

    // rocks around the rim
    const rng2 = YL.rng(41);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + rng2() * 0.3;
      const s = 0.45 + rng2() * 0.7;
      const rock = YL.makeRock({
        x: cx + Math.cos(a) * (rx + 1.0), z: cz + Math.sin(a) * (rz + 1.0),
        scale: s, seed: i, ry: rng2() * TAU
      });
      rock.position.y = 0.05; world.add(rock);
    }
    return water;
  }

  function makeBridge(world, x, z, len, width, alongZ) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    if (!alongZ) g.rotation.y = Math.PI / 2;
    YL.box(g, width, 0.22, len, M().stoneLight, 0, 0.42, 0, { cast: true });
    for (const sx of [-1, 1]) {
      YL.railing(g, sx * (width / 2 - 0.15), 0.5, 0, len - 0.4, Math.PI / 2, { h: 0.75, mat: M().stoneLight });
    }
    YL.box(g, width, 0.3, 0.6, M().stoneDark, 0, 0.15, len / 2 - 0.3);
    YL.box(g, width, 0.3, 0.6, M().stoneDark, 0, 0.15, -len / 2 + 0.3);
    YL.mergeByMaterial(g);
    world.add(g);
  }

  /* ---------------------------- walls ---------------------------- */
  function makeEnclosure(world) {
    // front wall, opening for the entrance gate
    world.add(YL.makeWall({ x: -30, z: 70, len: 44, rotY: 0 }));
    world.add(YL.makeWall({ x: 30, z: 70, len: 44, rotY: 0 }));
    // rear wall with a small gate
    world.add(YL.makeWall({ x: -27.5, z: -64, len: 49, rotY: 0 }));
    world.add(YL.makeWall({ x: 27.5, z: -64, len: 49, rotY: 0 }));
    // side walls
    world.add(YL.makeWall({ x: -52, z: 3, len: 134, rotY: Math.PI / 2 }));
    world.add(YL.makeWall({ x: 52, z: 3, len: 134, rotY: Math.PI / 2 }));

    world.add(YL.makeGate({
      x: 0, z: 70, w: 15, d: 6.2, wallH: 4.2, roofH: 2.2, opening: 4.6,
      name: '前门'
    }));
    world.add(YL.makeGate({
      x: 0, z: -64, w: 8, d: 4.2, wallH: 3.6, roofH: 1.8, opening: 2.8,
      name: '后门'
    }));
  }

  /* ------------------------- 文庙 compound ------------------------- */
  function makeWenmiao(world) {
    const x0 = 27, x1 = 49, z0 = -49, z1 = -24;
    const red = M().redWall;
    // west wall with gate opening at z -37..-33
    world.add(YL.makeWall({ x: x0, z: -43, len: 12, rotY: Math.PI / 2, wallMat: red, h: 3.2 }));
    world.add(YL.makeWall({ x: x0, z: -28.5, len: 9, rotY: Math.PI / 2, wallMat: red, h: 3.2 }));
    world.add(YL.makeWall({ x: (x0 + x1) / 2, z: z0, len: x1 - x0, rotY: 0, wallMat: red, h: 3.2 }));
    world.add(YL.makeWall({ x: (x0 + x1) / 2, z: z1, len: x1 - x0, rotY: 0, wallMat: red, h: 3.2 }));
    world.add(YL.makeWall({ x: x1, z: (z0 + z1) / 2, len: z1 - z0, rotY: Math.PI / 2, wallMat: red, h: 3.2 }));

    world.add(YL.makeGate({
      x: x0, z: -35, w: 8, d: 4.2, wallH: 4.1, roofH: 1.9, opening: 2.6, rotY: -Math.PI / 2,
      plaque: '文庙', plaqueW: 1.8, name: '文庙棂星门'
    }));
    world.add(YL.makeHall({
      x: 39, z: -36.5, rotY: -Math.PI / 2,
      w: 13, d: 8.5, platformH: 0.75, wallH: 5.0, roofH: 2.8, bays: 3,
      plaque: '大成殿', plaqueW: 2.7, name: '大成殿', sideWindows: false, gableVent: true
    }));
    // stone courtyard inside the temple walls
    YL.box(world, x1 - x0 - 2, 0.1, z1 - z0 - 2, M().paving, (x0 + x1) / 2, 0.05, (z0 + z1) / 2, { cast: false });
    for (const p of [[33, -27], [33, -46], [46, -27], [46, -46]]) {
      world.add(YL.makeTree({ x: p[0], z: p[1], type: 'pine', scale: 0.75, seed: p[0] + p[1] }));
    }
    if (YL.furnishTemple) {
      YL.furnishTemple(world, { x: 32.8, z: -36.5, rot: -Math.PI / 2 });
      for (const sz of [-1, 1]) {
        world.add(YL.makeLion({ x: 30.2, z: -36.5 + sz * 3.0, rotY: -Math.PI / 2, scale: 0.62 }));
      }
    }
  }

  /* -------------------------- buildings -------------------------- */
  function makeBuildings(world) {
    // main axis
    world.add(YL.makeStage({
      x: 0, z: 57, w: 12, d: 8, platformH: 1.15, wallH: 4.5, roofH: 2.5,
      rotY: Math.PI, name: '赫曦台'
    }));

    world.add(YL.makeGate({
      x: 0, z: 44, w: 16, d: 7, wallH: 5.0, roofH: 2.7, opening: 4.3,
      plaque: '岳麓书院', plaqueW: 3.5, couplets: ['惟楚有材', '于斯为盛'],
      name: '大门'
    }));

    world.add(YL.makeGate({
      x: 0, z: 31, w: 11, d: 5.2, wallH: 4.2, roofH: 2.2, opening: 3.2,
      plaque: '纳于大麓', plaqueW: 2.4, name: '二门'
    }));

    world.add(YL.makeHall({
      x: 0, z: 13, w: 25, d: 13, platformH: 0.95, wallH: 6.1, roofH: 3.4,
      bays: 5, open: true, lecture: true, enterable: true, plaque: '实事求是', plaqueW: 3.4, plaqueDrop: 1.3,
      lanterns: true, name: '讲堂'
    }));

    world.add(YL.makeLibrary({ x: 0, z: -13 }));

    // side wings
    world.add(YL.makeHall({
      x: -35, z: 20, rotY: Math.PI / 2,
      w: 30, d: 9, platformH: 0.55, wallH: 3.7, roofH: 2.2, bays: 9,
      plaque: '教学斋', plaqueW: 2.4, name: '教学斋'
    }));
    world.add(YL.makeHall({
      x: 35, z: 20, rotY: -Math.PI / 2,
      w: 30, d: 9, platformH: 0.55, wallH: 3.7, roofH: 2.2, bays: 9,
      plaque: '半学斋', plaqueW: 2.4, name: '半学斋'
    }));

    world.add(YL.makeTower({
      x: 32, z: -7, w: 9, d: 8, rotY: -Math.PI / 2, plaque: '文昌阁', name: '文昌阁'
    }));

    world.add(YL.makeHall({
      x: -32, z: -2, rotY: Math.PI / 2,
      w: 9, d: 6, platformH: 0.5, wallH: 3.7, roofH: 2.0, bays: 3,
      plaque: '濂溪祠', plaqueW: 2.1, name: '濂溪祠', sideWindows: false
    }));

    // rear garden
    world.add(YL.makeHall({
      x: -26, z: -31, rotY: Math.PI / 2,
      w: 13, d: 7, platformH: 0.5, wallH: 4.0, roofH: 2.2, bays: 3, open: true, lounge: true,
      enterable: true, plaque: '百泉轩', plaqueW: 2.3, name: '百泉轩', sideWindows: false
    }));
    for (const p of [[-34, 59], [34, 59]]) {
      world.add(YL.makePavilion({
        x: p[0], z: p[1], size: 3.8, colH: 2.8, roofH: 1.65,
        name: '前庭小亭', lanterns: false
      }));
    }
    world.add(YL.makePavilion({
      x: 15.5, z: -25.5, size: 4.6, colH: 3.0, roofH: 1.8,
      plaque: '汲泉亭', name: '汲泉亭', lanterns: false
    }));
    world.add(YL.makePavilion({
      x: -16, z: -47, size: 4.6, colH: 3.0, roofH: 1.8,
      plaque: '拟兰亭', name: '拟兰亭'
    }));
    world.add(YL.makeHall({
      x: -31, z: -53, rotY: Math.PI / 2,
      w: 10, d: 6.5, platformH: 0.5, wallH: 3.8, roofH: 2.1, bays: 3,
      plaque: '屈子祠', plaqueW: 2.2, name: '屈子祠', sideWindows: false
    }));
    world.add(YL.makeHall({
      x: 31, z: -55, rotY: -Math.PI / 2,
      w: 10, d: 6.5, platformH: 0.5, wallH: 3.8, roofH: 2.1, bays: 3,
      plaque: '船山祠', plaqueW: 2.2, name: '船山祠', sideWindows: false
    }));

    makeWenmiao(world);

    // outside the walls
    world.add(YL.makePavilion({
      x: -24, z: 93, size: 4.4, colH: 3.2, roofH: 1.9,
      plaque: '自卑亭', name: '自卑亭'
    }));
    const aiwanY = YL.groundHeight(30, -88);
    world.add(YL.makePavilion({
      x: 30, z: -88, y: aiwanY, size: 6.2, colH: 3.8, roofH: 2.2,
      double: true, plaque: '爱晚亭', plaqueW: 2.2, name: '爱晚亭', table: true,
      lanterns: true
    }));

    // covered corridors along the lecture courtyards
    for (const x of [-21.5, 21.5]) {
      world.add(YL.makeCorridor({ x: x, z: 22, len: 23, width: 3.2, rotY: Math.PI / 2 }));
      world.add(YL.makeCorridor({ x: x, z: 41.5, len: 10, width: 3.0, rotY: Math.PI / 2 }));
    }
  }

  /* --------------------------- garden --------------------------- */
  function makeGarden(world) {
    // the paired pools and pavilions that flank the Hexitai forecourt
    makePond(world, -21, 61.5, 5.4, 3.1, 'West_forecourt_pond');
    makePond(world, 21, 61.5, 5.4, 3.1, 'East_forecourt_pond');

    const pond = makePond(world, 0, -38, 14.5, 8.5, 'Yuelu_pond');
    makeBridge(world, 0, -38, 18.4, 3.2, true);
    for (const p of [[-6, -35.5], [3.5, -40.2], [8.5, -35.8], [-2.0, -41.5], [10.8, -40.5]]) {
      world.add(YL.addLotus(world, p[0], p[1], 0.9, p[0] > 5));
    }
    for (const p of [[-21, 61], [21, 61]]) {
      world.add(YL.addLotus(world, p[0], p[1], 0.8, false));
    }
    world.add(YL.addLotus(world, 18, -81.5, 0.85, true));

    // stream from pond toward the southern wall
    const streamMat = M().water.clone();
    streamMat.opacity = 0.85;
    const stream = ribbonPath([[7, -44], [12, -49], [18, -53], [24, -58]], 2.2, streamMat, 0.1);
    world.add(stream);

    // 百泉轩 terrace
    YL.box(world, 9, 0.24, 4.5, M().stoneLight, -19, 0.12, -31, { cast: true });

    // 碑廊: steles under the south wall
    for (let i = 0; i < 8; i++) {
      const z = -30 + i * 2.3;
      YL.box(world, 1.4, 0.32, 1.0, M().stoneDark, -46.5, 0.16, z);
      const stele = YL.box(world, 0.9, 2.1, 0.26, M().stone, -46.5, 1.35, z, { cast: true });
      stele.rotation.y = Math.PI / 2;
      YL.box(world, 1.1, 0.18, 0.42, M().stoneDark, -46.5, 2.5, z);
    }
    // little tiled shelter over the steles
    const shelterRoof = YL.gableRoof({ w: 19, d: 3.6, h: 1.1, lift: 0.3, gables: false, tileEnds: false });
    shelterRoof.rotation.y = Math.PI / 2;
    shelterRoof.position.set(-47.2, 3.0, -22);
    world.add(shelterRoof);
    for (let i = 0; i < 5; i++) {
      YL.cyl(world, 0.1, 0.12, 3.0, M().redLacquer, -47.2, 1.5, -30 + i * 4.5, { seg: 8 });
    }

    // well
    const well = new THREE.Group();
    well.position.set(-19, 0, -47);
    YL.cyl(well, 1.05, 1.1, 0.8, M().stoneDark, 0, 0.4, 0, { seg: 16 });
    const wg = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x1b2b2c, roughness: 0.2, metalness: 0.2 }));
    wg.position.y = 0.78; well.add(wg);
    YL.mergeByMaterial(well);
    world.add(well);

    // rockery
    for (let i = 0; i < 11; i++) {
      const a = i * 1.7, r = 17 + (i % 3) * 1.4;
      const rock = YL.makeRock({
        x: Math.cos(a) * r, z: -38 + Math.sin(a) * (r * 0.55),
        scale: 0.8 + (i % 4) * 0.5, seed: i, ry: a
      });
      world.add(rock);
    }

    // small pond and approach path by Aiwan Pavilion
    makePond(world, 18, -81, 6.2, 3.8, 'Aiwan_pond');
    makeBridge(world, 18, -81, 8.2, 2.2, true);
    const aiwanPath = ribbonPath(
      [[0, -64], [6, -68], [12, -73], [22, -77], [27, -82], [30, -86]],
      3.0, pathMaterial(1.2, 1.2), 0.06
    );
    world.add(aiwanPath);
    const aiwanSpur = ribbonPath(
      [[18, -70], [23, -74], [27, -79], [29, -83], [30, -86]],
      2.6, pathMaterial(1.2, 1.2), 0.06
    );
    world.add(aiwanSpur);
    // low stone terrace so the pavilion sits in the clearing rather than on the lawn
    YL.box(world, 14, 0.18, 11, M().stone, 30, 0.09, -85.5, { cast: true });
    YL.box(world, 14.5, 0.12, 0.5, M().stoneDark, 30, 0.12, -80.2);
    for (const p of [[24, -86, 0.7], [35, -90, 0.9], [26, -92, 0.6], [35, -84, 0.65]]) {
      world.add(YL.makeRock({ x: p[0], z: p[1], scale: p[2], seed: p[0], ry: p[1] }));
    }
    for (const p of [[23.5, -83.5], [36.5, -83.5]]) {
      world.add(YL.stoneLantern(world, p[0], p[1], 0.72));
    }

    // fallen maple leaves on the clearing around Aiwan
    const leafGeo = new THREE.PlaneGeometry(0.29, 0.29);
    leafGeo.rotateX(-Math.PI / 2);
    const leafMat = M().mapleGround;
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, 140);
    const lrng = YL.rng(88), lm = new THREE.Matrix4();
    const leafCols = [0xa92f1d, 0xc34524, 0xd05b2c, 0x8e2a1c, 0xc78532];
    for (let i = 0; i < 140; i++) {
      const a = lrng() * TAU, r = 3.4 + lrng() * 15;
      const x = 30 + Math.cos(a) * r;
      const z = -88 + Math.sin(a) * r * 0.72;
      lm.makeRotationY(lrng() * TAU);
      lm.setPosition(x, YL.groundHeight(x, z) + 0.035, z);
      leaves.setMatrixAt(i, lm);
      leaves.setColorAt(i, new THREE.Color(leafCols[Math.floor(lrng() * leafCols.length)]).convertSRGBToLinear());
    }
    leaves.instanceMatrix.needsUpdate = true;
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
    leaves.frustumCulled = false;
    leaves.receiveShadow = true;
    world.add(leaves);
  }

  /* --------------------------- trees --------------------------- */
  function makeTrees(world) {
    const trees = [
      // second courtyard ginkgos
      [-11.5, 37.8, 'ginkgo', 0.82, 11], [11.5, 37.8, 'ginkgo', 0.82, 12],
      // before lecture hall, set out to the sides of the sightline
      [-17.2, 24.2, 'ginkgo', 0.95, 21], [17.2, 24.2, 'ginkgo', 0.95, 22],
      // library flanking camphors
      [-18.5, -13, 'camphor', 1.2, 31], [20.5, -17, 'camphor', 1.15, 32],
      // front approach
      [-33, 86, 'camphor', 1.12, 41], [33, 86, 'camphor', 1.08, 42],
      [-44, 92, 'ginkgo', 0.95, 43], [44, 92, 'ginkgo', 0.92, 44],
      [-44, 65, 'camphor', 1.05, 45], [44, 65, 'camphor', 1.0, 46],
      // side gardens
      [-46, 16, 'camphor', 0.9, 51], [-46, -8, 'camphor', 0.85, 52],
      [-46, -44, 'ginkgo', 0.9, 53], [46, 12, 'camphor', 0.88, 54],
      [50, -58, 'ginkgo', 0.9, 55],
      // rear garden
      [-38, -35, 'maple', 0.9, 61], [38, -22, 'maple', 0.82, 62],
      [-22, -57, 'camphor', 0.9, 63], [22, -61, 'camphor', 0.85, 64],
      // Aiwan maple grove (枫香 / 鸡爪槭意象)
      [14, -99, 'maple', 1.12, 71], [46, -97, 'maple', 1.2, 72],
      [7, -93, 'maple', 0.95, 73], [48, -83, 'camphor', 1.0, 74],
      [18, -104, 'maple', 1.05, 91], [38, -105, 'maple', 1.1, 92],
      [10, -84, 'maple', 0.9, 93], [41, -88, 'maple', 1.0, 94],
      [23, -101, 'maple', 0.95, 95], [8, -81, 'maple', 0.82, 96],
      [50, -92, 'maple', 0.95, 97],
      // Zibei
      [-36, 98, 'camphor', 0.95, 81], [-12, 102, 'ginkgo', 0.9, 82]
    ];
    for (const t of trees) {
      world.add(YL.makeTree({
        x: t[0], z: t[1], y: YL.groundHeight(t[0], t[1]),
        type: t[2], scale: t[3], seed: t[4]
      }));
    }
    world.add(YL.makeBamboo({ x: -40, z: -22, count: 22, seed: 5 }));
    world.add(YL.makeBamboo({ x: 47, z: -57, count: 16, seed: 9 }));

    // a few shrubs / flower beds
    const shrubMat = new THREE.MeshStandardMaterial({ color: YL.linearColor(0x4c6b3d), roughness: 0.95 });
    const rng = YL.rng(123);
    for (let i = 0; i < 42; i++) {
      const x = -45 + rng() * 90;
      const z = -58 + rng() * 124;
      if (Math.abs(x) < 15 && z > -24 && z < 52) continue;
      let inBuilding = false;
      for (const c of YL.colliders) {
        if (x > c.minX - 1 && x < c.maxX + 1 && z > c.minZ - 1 && z < c.maxZ + 1) { inBuilding = true; break; }
      }
      if (inBuilding) continue;
      const s = 0.5 + rng() * 0.7;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), shrubMat);
      m.position.set(x, s * 0.55, z);
      m.scale.y = 0.72; m.castShadow = true; m.receiveShadow = true;
      world.add(m);
    }
  }

  /* --------------------------- forest --------------------------- */
  function makeForest(scene) {
    const rng = YL.rng(2048);
    const count = window.innerWidth < 820 ? 560 : 880;
    const trunkGeo = new THREE.CylinderGeometry(0.26, 0.5, 3.2, 5);
    const crownGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: YL.linearColor(0x4a392b), roughness: 1 });
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    if (YL.enableWind) YL.enableWind(crownMat, 0.045, 1.0);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat, count);
    trunks.castShadow = false; crowns.castShadow = false;
    trunks.receiveShadow = true; crowns.receiveShadow = true;
    const mtx = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const pos = new THREE.Vector3();
    const col = new THREE.Color();
    let n = 0;
    let guard = 0;
    while (n < count && guard < 4000) {
      guard++;
      const x = -280 + rng() * 560;
      const z = -310 + rng() * 235;
      if (Math.abs(x) < 60 && z > -70) continue;
      if (x > 20 && x < 45 && z > -100 && z < -76) continue;
      const h = YL.groundHeight(x, z);
      if (h < 0.15) continue;
      const s = 0.55 + rng() * 1.15;
      pos.set(x, h + 1.5 * s, z);
      q.setFromEuler(new THREE.Euler(0, rng() * TAU, 0));
      sc.set(s, s, s);
      mtx.compose(pos, q, sc);
      trunks.setMatrixAt(n, mtx);
      pos.set(x, h + 4.5 * s, z);
      sc.set(s * (0.75 + rng() * 0.55), s * (0.85 + rng() * 0.7), s * (0.75 + rng() * 0.55));
      mtx.compose(pos, q, sc);
      crowns.setMatrixAt(n, mtx);
      const warm = rng();
      col.setHSL(0.255 + rng() * 0.04, 0.30 + rng() * 0.16, 0.14 + rng() * 0.13);
      if (warm > 0.86) col.setHSL(0.09, 0.35, 0.35);
      col.convertSRGBToLinear();
      crowns.setColorAt(n, col);
      n++;
    }
    trunks.count = n; crowns.count = n;
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
    scene.add(trunks); scene.add(crowns);

    // a few exposed crags give the forested slope some structure
    const rrng = YL.rng(913);
    for (let i = 0; i < 28; i++) {
      const x = -200 + rrng() * 400;
      const z = -250 + rrng() * 165;
      const h = YL.groundHeight(x, z);
      if (h < 2.5) continue;
      const rock = YL.makeRock({
        x: x, z: z, y: h - 0.4, scale: 1.6 + rrng() * 2.8,
        seed: i, ry: rrng() * TAU
      });
      scene.add(rock);
    }
    return { trunks, crowns };
  }

  /* --------------------------- details --------------------------- */
  function makeDetails(world) {
    // lions
    world.add(YL.makeLion({ x: -6.2, z: 50.5, rotY: 0.08, scale: 1.05 }));
    world.add(YL.makeLion({ x: 6.2, z: 50.5, rotY: -0.08, scale: 1.05 }));

    // censers
    world.add(YL.makeCenser({ x: 0, z: 23.4, scale: 0.86 }));
    world.add(YL.makeCenser({ x: 0, z: -2.2, scale: 0.78 }));

    // stone lanterns
    for (const p of [[-4.8, 64], [4.8, 64], [-4.8, 20], [4.8, 20], [-4.8, -26], [4.8, -26]]) {
      world.add(YL.stoneLantern(world, p[0], p[1], 0.9));
    }
    // lantern posts
    for (const p of [[-5.2, 54], [5.2, 54], [-5.2, 36], [5.2, 36], [-5.2, 6], [5.2, 6]]) {
      world.add(YL.makeLanternPost({ x: p[0], z: p[1] }));
    }

    // benches in the gardens
    for (const p of [[-39, -28, 0], [39, -28, 0], [-38, -52, Math.PI / 2]]) {
      const b = new THREE.Group();
      b.position.set(p[0], 0, p[1]); b.rotation.y = p[2];
      YL.box(b, 2.4, 0.12, 0.55, M().stoneLight, 0, 0.48, 0);
      for (const sx of [-1, 1]) YL.box(b, 0.22, 0.45, 0.5, M().stoneDark, sx * 0.9, 0.24, 0);
      YL.mergeByMaterial(b); world.add(b);
    }

    // an empty bench beneath the ginkgo; the scene is intentionally unpopulated
    const bench = new THREE.Group();
    bench.position.set(-12.8, 0, 35.5);
    YL.box(bench, 2.4, 0.12, 0.6, M().stoneLight, 0, 0.48, 0);
    for (const sx of [-1, 1]) YL.box(bench, 0.22, 0.46, 0.55, M().stoneDark, sx * 0.9, 0.23, 0);
    // a closed book left on the bench
    YL.box(bench, 0.34, 0.08, 0.24, M().woodDark, 0.45, 0.58, 0.02);
    YL.box(bench, 0.32, 0.05, 0.23, M().paperWhite, 0.45, 0.62, 0.02);
    YL.mergeByMaterial(bench); world.add(bench);

    // potted plants and water vats along the main courtyards
    const plants = [
      [-15.2, 21.5, 'pine', 0.9], [15.2, 21.5, 'orchid', 0.9],
      [-9.0, 50.2, 'orchid', 0.85], [9.0, 50.2, 'pine', 0.85],
      [-9.2, -2.6, 'pine', 0.85], [9.2, -2.6, 'orchid', 0.85],
      [-12.0, 62.5, 'bamboo', 0.8], [12.0, 62.5, 'pine', 0.8],
      [-20.0, 36.5, 'orchid', 0.75], [20.0, 36.5, 'bamboo', 0.75]
    ];
    for (const p of plants) world.add(YL.addPottedPlant(world, p[0], p[1], p[2], p[3]));
    world.add(YL.addWaterVat(world, 10.4, 22.9, 0.82));
    world.add(YL.addWaterVat(world, -10.4, -3.2, 0.78));
    if (YL.addStele) world.add(YL.addStele(world, -29.2, 94.2, '自卑亭', 0));

    // small stone tablet at the entrance
    const st = new THREE.Group();
    st.position.set(7.8, 0, 76);
    YL.box(st, 1.3, 0.4, 1.0, M().stoneDark, 0, 0.2, 0);
    const slab = YL.box(st, 0.8, 2.0, 0.22, M().stoneLight, 0, 1.3, 0, { cast: true });
    YL.mergeByMaterial(st); world.add(st);

    // route marker stones along the visitor path
    for (let i = 0; i < 5; i++) {
      const z = 18 - i * 14;
      YL.box(world, 0.55, 0.12, 0.55, M().stoneDark, -4.2, 0.07, z, { cast: false });
    }
  }

  /* ------------------------- falling leaves ------------------------- */
  function makeFallingLeaves(scene) {
    const tex = YL.TX.mapleLeaf;
    if (!tex) return null;
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const data = [];
    const centers = [
      { x: -17, z: 24, r: 6.5, top: 10, n: 48 },
      { x: 30, z: -88, r: 12, top: 9, n: 110 },
      { x: 11, z: 38, r: 3.5, top: 8, n: 18 },
      { x: 20, z: -17, r: 4, top: 9, n: 12 },
      { x: 42, z: -98, r: 5, top: 8, n: 12 }
    ];
    let idx = 0;
    const rng = YL.rng(404);
    for (const cen of centers) {
      for (let i = 0; i < cen.n && idx < count; i++, idx++) {
        const a = rng() * TAU, r = Math.sqrt(rng()) * cen.r;
        const bx = cen.x + Math.cos(a) * r, bz = cen.z + Math.sin(a) * r;
        const by = 2.5 + rng() * cen.top;
        positions[idx * 3] = bx;
        positions[idx * 3 + 1] = by;
        positions[idx * 3 + 2] = bz;
        const warm = rng();
        const col = new THREE.Color(warm > 0.72 ? 0xd18432 : (warm > 0.42 ? 0xc34524 : (warm > 0.18 ? 0xa92f1d : 0x8a2418))).convertSRGBToLinear();
        colors[idx * 3] = col.r; colors[idx * 3 + 1] = col.g; colors[idx * 3 + 2] = col.b;
        data.push({
          bx: bx, bz: bz, by: by,
          fall: 0.12 + rng() * 0.26,
          amp: 0.35 + rng() * 0.9,
          phase: rng() * TAU,
          spin: 0.35 + rng() * 0.8
        });
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.32, map: tex, transparent: true, alphaTest: 0.18,
      depthWrite: false, vertexColors: true, sizeAttenuation: true, opacity: 0.92
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.name = 'falling_leaves';
    scene.add(points);
    return { points: points, data: data, attr: geo.attributes.position, material: mat };
  }

  /* --------------------------- hot labels --------------------------- */
  // no 3D label sprites; the HTML overlay in app.js projects these positions.

  /* --------------------------- world --------------------------- */
  YL.buildWorld = function (scene) {
    YL.initMaterials();
    const world = new THREE.Group();
    world.name = 'YueluAcademy_Root';
    scene.add(world);

    const sky = makeSky(scene);
    const lights = makeLights(scene);
    const terrain = makeTerrain(scene);
    makeGrounds(world);
    makeEnclosure(world);
    makeBuildings(world);
    makeGarden(world);
    makeTrees(world);
    makeDetails(world);
    const forest = makeForest(scene);
    const leaves = makeFallingLeaves(scene);

    // distant river to the east, under the morning haze
    const riverMat = new THREE.MeshStandardMaterial({
      color: YL.linearColor(0x829da1), roughness: 0.22, metalness: 0.18,
      transparent: true, opacity: 0.55
    });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(900, 160), riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -2.8, 245);
    scene.add(river);

    return { world, sky, lights, terrain, forest, leaves, river };
  };

  /* --------------------------- time of day --------------------------- */
  YL.applyTimeOfDay = function (ctx, night) {
    const { sky, lights } = ctx;
    if (night) {
      sky.uniforms.top.value.setHex(0x0a1424);
      sky.uniforms.mid.value.setHex(0x17263a);
      sky.uniforms.bottom.value.setHex(0x3a3a3c);
      sky.sun.material.opacity = 0;
      sky.moon.material.opacity = 1;
      sky.stars.material.opacity = 0.95;
      for (const c of sky.clouds) { c.material.opacity = 0.16; c.material.color.setHex(0x8a9ab0).convertSRGBToLinear(); }
      lights.sun.intensity = 0.48;
      lights.sun.color.setHex(0x9fb6d8).convertSRGBToLinear();
      lights.sun.position.set(170, 190, -220);
      lights.hemi.intensity = 0.34;
      lights.hemi.color.setHex(0x506b8a).convertSRGBToLinear();
      lights.hemi.groundColor.setHex(0x1f211d).convertSRGBToLinear();
      lights.fill.intensity = 0.12;
      lights.ambient.intensity = 0.12;
      for (const l of lights.warm) l.intensity = 2.4;
      lights.hallLight.intensity = 2.8;
      lights.loungeLight.intensity = 2.5;
      lights.loungeFill.intensity = 1.2;
      lights.libraryLight.intensity = 3.2;
      lights.libraryFill.intensity = 1.6;
      YL.litMats.forEach(m => { m.emissiveIntensity = 1.15; });
      if (YL.lanternMats) YL.lanternMats.forEach(m => { m.emissiveIntensity = 0.9; });
      if (YL.lanternGlowMats) YL.lanternGlowMats.forEach(m => { m.opacity = 0.5; });
      if (YL.lampMats) YL.lampMats.forEach(m => { m.emissiveIntensity = 1.0; });
      if (YL.M && YL.M.water) {
        YL.M.water.envMapIntensity = 0.22;
        YL.M.water.color.setHex(0x0a1717).convertSRGBToLinear();
      }
      if (ctx.leaves) ctx.leaves.material.opacity = 0.35;
    } else {
      sky.uniforms.top.value.setHex(0x6b88a4);
      sky.uniforms.mid.value.setHex(0xc8d4d5);
      sky.uniforms.bottom.value.setHex(0xf0d8b6);
      sky.sun.material.opacity = 1;
      sky.moon.material.opacity = 0;
      sky.stars.material.opacity = 0;
      for (const c of sky.clouds) { c.material.opacity = 0.6; c.material.color.setHex(0xffffff).convertSRGBToLinear(); }
      lights.sun.intensity = 3.22;
      lights.sun.color.setHex(0xffe0b0).convertSRGBToLinear();
      lights.sun.position.set(-150, 82, 190);
      lights.hemi.intensity = 0.42;
      lights.hemi.color.setHex(0xd2e2ef).convertSRGBToLinear();
      lights.hemi.groundColor.setHex(0x6e6450).convertSRGBToLinear();
      lights.fill.intensity = 0.18;
      lights.ambient.intensity = 0.08;
      for (const l of lights.warm) l.intensity = 0;
      lights.hallLight.intensity = 1.25;
      lights.loungeLight.intensity = 1.8;
      lights.loungeFill.intensity = 0.8;
      lights.libraryLight.intensity = 2.0;
      lights.libraryFill.intensity = 1.1;
      YL.litMats.forEach(m => { m.emissiveIntensity = 0; });
      if (YL.lanternMats) YL.lanternMats.forEach(m => { m.emissiveIntensity = 0.2; });
      if (YL.lanternGlowMats) YL.lanternGlowMats.forEach(m => { m.opacity = 0.14; });
      if (YL.lampMats) YL.lampMats.forEach(m => { m.emissiveIntensity = 0; });
      if (YL.M && YL.M.water) {
        YL.M.water.envMapIntensity = 0.55;
        YL.M.water.color.setHex(0x16312e).convertSRGBToLinear();
      }
      if (ctx.leaves) ctx.leaves.material.opacity = 0.9;
    }
  };
})();
