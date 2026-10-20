/* ============================================================
   岳麓书院 · 3D  /  app.js
   Renderer, camera choreography, explorable first-person mode,
   labels, UI and GLB export.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const params = new URLSearchParams(location.search);

  window.__ERRORS__ = [];
  window.addEventListener('error', e => window.__ERRORS__.push(String(e.message || e)));
  window.addEventListener('unhandledrejection', e => window.__ERRORS__.push(String(e.reason)));

  let renderer, scene, camera, controls, ctx;
  let anim = null;
  let labelsOn = false;
  let night = false;
  let infoOpen = false;
  let activeId = null;
  let ready = false;
  let elapsed = 0;
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();

  const walk = {
    active: false, locked: false, yaw: 0, pitch: 0,
    pos: new THREE.Vector3(0, 1.7, 78), keys: {},
    bob: 0, moving: false, saved: null, drag: false, lastX: 0, lastY: 0,
    touch: { x: 0, y: 0 }
  };
  let walkLight;

  const cameraViews = {
    hero: { pos: [-78, 40, 135], target: [0, 8, 5] },
    aerial: { pos: [8, 152, 176], target: [0, 0, -2] },
    gate: { pos: [-30, 13, 108], target: [0, 6, 48] },
    garden: { pos: [-34, 26, -80], target: [0, 3, -30] },
    aiwan: { pos: [2, 14, -68], target: [30, 4.5, -88] },
    interior: { pos: [-10, 5.8, 29], target: [0, 4.2, 4] }
  };

  /* ----------------------------- init ----------------------------- */
  function init() {
    const canvas = $('#scene');
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    const smallScreen = window.innerWidth < 820;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.35 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xd6dcd3, 0.00148);
    scene.fog.color.convertSRGBToLinear();

    camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 1200);
    camera.position.set(-112, 76, 168);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 9, 3);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.7;
    controls.screenSpacePanning = true;
    controls.minDistance = 8;
    controls.maxDistance = 360;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.update();

    walkLight = new THREE.PointLight(0xffb066, 0, 16, 2);
    walkLight.position.set(0, 0.2, 0);
    camera.add(walkLight);
    scene.add(camera);

    setProgress(0.35, '正在铺陈山水…');
    ctx = YL.buildWorld(scene);
    ctx.scene = scene;
    if (smallScreen) {
      ctx.lights.sun.shadow.mapSize.set(1024, 1024);
      ctx.lights.sun.shadow.needsUpdate = true;
    }
    YL.applyTimeOfDay(ctx, false);
    setProgress(0.76, '正在悬挂匾额…');

    buildLabels();
    buildRoute();
    bindUI();

    updateTimeButton();
    if (params.get('night') === '1') setNight(true, true);
    if (params.get('ui') === '0') document.body.classList.add('no-ui');

    const view = params.get('view');
    if (view && cameraViews[view]) {
      camera.position.fromArray(cameraViews[view].pos);
      controls.target.fromArray(cameraViews[view].target);
      controls.update();
    }
    if (isPortrait()) {
      camera.fov = 48;
      camera.updateProjectionMatrix();
      const d = camera.position.clone().sub(controls.target).multiplyScalar(1.28);
      camera.position.copy(controls.target).add(d);
      controls.update();
    }

    window.APP = {
      scene, camera, controls, renderer, ctx, walk,
      setView(pos, target) {
        if (walk.active) exitWalk(false);
        anim = null;
        camera.position.fromArray(pos);
        controls.target.fromArray(target);
        controls.enabled = true;
        controls.update();
      },
      focusHotspot,
      showInfo(id) {
        const h = YL.hotspots.find(x => x.id === id);
        if (h) openInfo(h);
      },
      hideInfo: closeInfo,
      setNight: v => setNight(v),
      enterWalk: () => enterWalk(),
      exitWalk: () => exitWalk(true),
      openRoute: () => toggleRoute(true),
      closeRoute: () => toggleRoute(false),
      exportGLBBase64
    };

    setProgress(0.9, '正在点亮灯火…');
    requestAnimationFrame(() => {
      renderer.render(scene, camera);
      requestAnimationFrame(() => {
        renderer.render(scene, camera);
        ready = true;
        window.__READY__ = true;
        finishLoading();
        if (params.get('nointro') !== '1' && !view) {
          const hp = new THREE.Vector3(-78, 40, 135);
          const ht = new THREE.Vector3(0, 8, 5);
          if (isPortrait()) {
            hp.sub(ht).multiplyScalar(1.28).add(ht);
          }
          anim = {
            t: 0, dur: 2.8,
            p0: camera.position.clone(), p1: hp,
            t0: controls.target.clone(), t1: ht
          };
          controls.enabled = false;
        }
        animate();
      });
    });
  }

  /* --------------------------- loading --------------------------- */
  function setProgress(p, text) {
    const bar = $('#load-progress');
    if (bar) bar.style.width = Math.round(p * 100) + '%';
    if (text) {
      const el = $('#load-status');
      if (el) el.textContent = text;
    }
  }

  function finishLoading() {
    setProgress(1, '入斯门，见千年');
    const el = $('#loading');
    if (!el) return;
    setTimeout(() => el.classList.add('done'), params.get('nointro') === '1' ? 20 : 480);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1800);
    /* the persistent hint bar already explains the controls */
  }

  /* ---------------------------- labels ---------------------------- */
  function buildLabels() {
    const layer = $('#labels');
    layer.innerHTML = '';
    YL.hotspots.forEach((h, i) => {
      const el = document.createElement('button');
      el.className = 'hotspot';
      el.type = 'button';
      el.dataset.id = h.id;
      el.innerHTML = `<span class="hs-dot"></span><span class="hs-name">${h.name}</span>`;
      el.addEventListener('click', ev => {
        ev.stopPropagation();
        focusHotspot(h.id);
      });
      layer.appendChild(el);
      h.el = el;
    });
  }

  function projectLabels() {
    if (walk.active || (camera && camera.position.y < 8)) {
      YL.hotspots.forEach(h => h.el && h.el.classList.add('hidden'));
      return;
    }
    camera.updateMatrixWorld();
    const w = window.innerWidth, hgt = window.innerHeight;
    const placed = [];
    for (const h of YL.hotspots) {
      const el = h.el;
      if (!el) continue;
      const d = camera.position.distanceTo(h.pos);
      tmpV.copy(h.pos).project(camera);
      const behind = tmpV.z > 1 || tmpV.z < -1;
      let x = (tmpV.x * 0.5 + 0.5) * w;
      let y = (-tmpV.y * 0.5 + 0.5) * hgt;
      const off = x < 0 || x > w || y < 0 || y > hgt || behind || d > 265;
      el.classList.toggle('hidden', off);
      if (!off) {
        // nudge overlapping labels upward so the dense courtyard stays legible
        const lw = h.name.length * 13 + 26;
        for (let attempt = 0; attempt < 4; attempt++) {
          let hit = false;
          for (const p of placed) {
            if (Math.abs(x - p.x) < (lw + p.w) * 0.55 && Math.abs(y - p.y) < 23) { hit = true; break; }
          }
          if (!hit) break;
          y -= 21;
        }
        placed.push({ x, y, w: lw });
        el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        el.style.opacity = d > 180 ? String(YL.clamp(1 - (d - 180) / 85, 0.15, 1)) : '1';
      }
    }
  }

  /* ---------------------------- route ---------------------------- */
  function buildRoute() {
    const list = $('#route-list');
    list.innerHTML = '';
    YL.route.forEach((id, i) => {
      const h = YL.hotspots.find(x => x.id === id);
      if (!h) return;
      const li = document.createElement('li');
      li.dataset.id = id;
      li.innerHTML = `<span class="num">${String(i + 1).padStart(2, '0')}</span>
        <span class="rname">${h.name}</span><span class="rgroup">${h.group}</span>`;
      li.addEventListener('click', () => {
        focusHotspot(id);
        if (window.innerWidth < 760) toggleRoute(false);
      });
      list.appendChild(li);
    });
  }

  function markActive(id) {
    activeId = id;
    $$('#route-list li').forEach(li => li.classList.toggle('active', li.dataset.id === id));
    YL.hotspots.forEach(h => h.el && h.el.classList.toggle('active', h.id === id));
  }

  /* --------------------------- info panel --------------------------- */
  function openInfo(h) {
    $('#info-group').textContent = h.group;
    $('#info-period').textContent = h.period;
    $('#info-name').textContent = h.name;
    $('#info-en').textContent = h.en;
    $('#info-text').textContent = h.text;
    $('#info').classList.add('open');
    $('#info').setAttribute('aria-hidden', 'false');
    infoOpen = true;
    markActive(h.id);
  }

  function closeInfo() {
    $('#info').classList.remove('open');
    $('#info').setAttribute('aria-hidden', 'true');
    infoOpen = false;
    activeId = null;
    $$('#route-list li').forEach(li => li.classList.remove('active'));
    YL.hotspots.forEach(h => h.el && h.el.classList.remove('active'));
  }

  function focusHotspot(id, opts) {
    const h = YL.hotspots.find(x => x.id === id);
    if (!h) return;
    if (walk.active) exitWalk(false);
    openInfo(h);
    flyTo(h.view.pos, h.view.target, 1.55);
    if (opts && opts.walk) setTimeout(() => walkToHotspot(h), 100);
  }

  function flyTo(pos, target, dur) {
    controls.enabled = false;
    anim = {
      t: 0, dur: dur || 1.5,
      p0: camera.position.clone(), p1: pos.clone(),
      t0: controls.target.clone(), t1: target.clone()
    };
  }

  function updateFly(dt) {
    if (!anim) return;
    anim.t += dt;
    const t = YL.clamp(anim.t / anim.dur, 0, 1);
    const e = YL.easeInOut(t);
    camera.position.lerpVectors(anim.p0, anim.p1, e);
    controls.target.lerpVectors(anim.t0, anim.t1, e);
    camera.lookAt(controls.target);
    if (t >= 1) {
      anim = null;
      controls.enabled = true;
      controls.update();
    }
  }

  /* --------------------------- time --------------------------- */
  function setNight(v, silent) {
    night = !!v;
    YL.applyTimeOfDay(ctx, night);
    scene.fog.color.setHex(night ? 0x111a26 : 0xd6dcd3).convertSRGBToLinear();
    renderer.toneMappingExposure = night ? 0.92 : 1.12;
    document.body.classList.toggle('night', night);
    updateTimeButton();
    if (walkLight) walkLight.intensity = night ? (walk.active ? 2.2 : 0) : 0;
    if (!silent) {
      const veil = $('#veil');
      veil.classList.remove('flash');
      void veil.offsetWidth;
      veil.classList.add('flash');
      toast(night ? '暮色四合 · 书院灯火渐明' : '晨光初照 · 山色入帘');
    }
  }

  function updateTimeButton() {
    const b = $('#btn-time');
    if (!b) return;
    b.querySelector('.ico').textContent = night ? '☾' : '☀';
    b.querySelector('.txt').textContent = night ? '夜' : '昼';
    b.setAttribute('aria-label', night ? '切换为白天' : '切换为夜晚');
  }

  /* --------------------------- walk mode --------------------------- */
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isPortrait = () => window.innerWidth < 820 && window.innerHeight > window.innerWidth;

  function enterWalk() {
    if (walk.active) return;
    walk.saved = {
      pos: camera.position.clone(),
      target: controls.target.clone(),
      fov: camera.fov
    };
    closeInfo();
    toggleRoute(false);
    anim = null;
    walk.active = true;
    walk.pos.set(0, 1.7, 78);
    walk.yaw = 0;
    walk.pitch = 0;
    walk.bob = 0;
    walk.keys = {};
    walk.touch.x = 0; walk.touch.y = 0;
    controls.enabled = false;
    camera.fov = 66;
    camera.updateProjectionMatrix();
    camera.rotation.order = 'YXZ';
    camera.position.copy(walk.pos);
    camera.rotation.set(0, 0, 0);
    walkLight.intensity = night ? 2.2 : 0.15;
    document.body.classList.add('walking');
    document.body.classList.toggle('touchwalk', coarse);
    $('#walk-tip').textContent = coarse
      ? '左侧摇杆移动 · 拖动画面环视 · 退出'
      : 'W A S D 移动 · 鼠标环视 · Shift 加速 · Esc 退出';
    $('#btn-walk').classList.add('active');
    $('#btn-walk').querySelector('.txt').textContent = '退出';
    if (!coarse) {
      requestLock();
      toast('可从门洞进入讲堂、御书楼和百泉轩');
    } else {
      toast('左侧摇杆移动 · 拖动画面环视');
    }
  }

  function requestLock() {
    const canvas = $('#scene');
    if (!canvas.requestPointerLock) {
      walk.locked = false;
      document.body.classList.remove('locked');
      return;
    }
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => { walk.locked = false; document.body.classList.remove('locked'); });
    } catch (e) {
      walk.locked = false;
      document.body.classList.remove('locked');
    }
  }

  function exitWalk(restore) {
    if (!walk.active) return;
    walk.active = false;
    walk.keys = {};
    if (document.exitPointerLock) document.exitPointerLock();
    walk.locked = false;
    walk.touch.x = 0; walk.touch.y = 0;
    const jk = $('#joystick-knob');
    if (jk) jk.style.transform = '';
    document.body.classList.remove('walking', 'locked', 'touchwalk');
    $('#btn-walk').classList.remove('active');
    $('#btn-walk').querySelector('.txt').textContent = '漫游';
    walkLight.intensity = 0;
    camera.fov = isPortrait() ? 48 : 36;
    camera.updateProjectionMatrix();
    controls.enabled = true;
    if (restore && walk.saved) {
      camera.position.copy(walk.saved.pos);
      controls.target.copy(walk.saved.target);
      controls.update();
    } else {
      camera.lookAt(controls.target);
    }
    walk.saved = null;
  }

  function walkToHotspot(h) {
    if (!walk.active) {
      enterWalk();
      if (!walk.active) return;
    }
    const dir = h.view.pos.clone().sub(h.view.target);
    dir.y = 0;
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    dir.normalize();
    const target = h.view.target;
    let x = target.x + dir.x * 11;
    let z = target.z + dir.z * 11;
    const r = resolveCollision(x, z);
    walk.pos.set(r[0], 1.7, r[1]);
    const dx = target.x - walk.pos.x, dz = target.z - walk.pos.z;
    walk.yaw = Math.atan2(-dx, -dz);
    walk.pitch = 0;
    requestLock();
    toast('已到达 ' + h.name + ' 附近');
  }

  function resolveCollision(nx, nz) {
    let x = YL.clamp(nx, -62, 62);
    let z = YL.clamp(nz, -100, 108);
    const r = 0.55;
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const c of YL.colliders) {
        if (x > c.minX - r && x < c.maxX + r && z > c.minZ - r && z < c.maxZ + r) {
          const dl = x - (c.minX - r);
          const dr = (c.maxX + r) - x;
          const dt = z - (c.minZ - r);
          const db = (c.maxZ + r) - z;
          const m = Math.min(dl, dr, dt, db);
          if (m === dl) x = c.minX - r;
          else if (m === dr) x = c.maxX + r;
          else if (m === dt) z = c.minZ - r;
          else z = c.maxZ + r;
          moved = true;
        }
      }
      if (!moved) break;
    }
    return [YL.clamp(x, -62, 62), YL.clamp(z, -100, 108)];
  }

  function updateWalk(dt) {
    const f = (walk.keys['KeyW'] || walk.keys['ArrowUp'] ? 1 : 0) -
      (walk.keys['KeyS'] || walk.keys['ArrowDown'] ? 1 : 0) - walk.touch.y;
    const r = (walk.keys['KeyD'] || walk.keys['ArrowRight'] ? 1 : 0) -
      (walk.keys['KeyA'] || walk.keys['ArrowLeft'] ? 1 : 0) + walk.touch.x;
    const speed = (walk.keys['ShiftLeft'] || walk.keys['ShiftRight']) ? 10 : 4.6;
    let vx = 0, vz = 0;
    if (f || r) {
      const fx = -Math.sin(walk.yaw), fz = -Math.cos(walk.yaw);
      const rx = Math.cos(walk.yaw), rz = -Math.sin(walk.yaw);
      vx = fx * f + rx * r;
      vz = fz * f + rz * r;
      const len = Math.hypot(vx, vz) || 1;
      vx = vx / len * speed * dt;
      vz = vz / len * speed * dt;
      walk.moving = true;
      walk.bob += speed * dt * 1.8;
    } else {
      walk.moving = false;
    }
    const res = resolveCollision(walk.pos.x + vx, walk.pos.z + vz);
    walk.pos.x = res[0];
    walk.pos.z = res[1];
    const gy = (YL.walkSurfaceY ? YL.walkSurfaceY(walk.pos.x, walk.pos.z) : YL.groundHeight(walk.pos.x, walk.pos.z)) + 1.68;
    const bob = walk.moving ? Math.sin(walk.bob) * 0.028 : 0;
    walk.pos.y += (gy + bob - walk.pos.y) * Math.min(1, dt * 12);
    camera.position.copy(walk.pos);
    camera.rotation.set(walk.pitch, walk.yaw, 0);
  }

  /* --------------------------- UI events --------------------------- */
  function bindUI() {
    $('#btn-time').addEventListener('click', () => setNight(!night));
    $('#btn-labels').addEventListener('click', () => {
      labelsOn = !labelsOn;
      $('#btn-labels').classList.toggle('active', labelsOn);
      document.body.classList.toggle('labels-full', labelsOn);
      toast(labelsOn ? '完整建筑标注已开启' : '已切换为极简标记');
    });
    $('#btn-walk').addEventListener('click', () => {
      if (walk.active) exitWalk(true); else enterWalk();
    });
    $('#btn-route').addEventListener('click', () => toggleRoute());
    $('#btn-export').addEventListener('click', () => exportAndDownload());
    $('#info-close').addEventListener('click', closeInfo);
    $('#info-walk').addEventListener('click', () => {
      const h = YL.hotspots.find(x => x.id === activeId);
      if (h) walkToHotspot(h);
    });
    $('#route-close').addEventListener('click', () => toggleRoute(false));
    $('#walk-exit').addEventListener('click', () => exitWalk(true));

    // touch joystick for mobile walk mode
    const stick = $('#joystick'), knob = $('#joystick-knob');
    let stickId = null;
    function setStick(e) {
      const r = stick.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.38);
      let dy = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.38);
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      walk.touch.x = dx; walk.touch.y = dy;
      knob.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`;
    }
    function resetStick() {
      stickId = null; walk.touch.x = 0; walk.touch.y = 0;
      knob.style.transform = '';
    }
    if (stick) {
      stick.addEventListener('pointerdown', e => {
        if (!walk.active) return;
        e.preventDefault(); e.stopPropagation();
        stickId = e.pointerId;
        if (stick.setPointerCapture) stick.setPointerCapture(e.pointerId);
        setStick(e);
      });
      stick.addEventListener('pointermove', e => {
        if (stickId !== e.pointerId) return;
        e.preventDefault(); e.stopPropagation();
        setStick(e);
      });
      stick.addEventListener('pointerup', e => { if (stickId === e.pointerId) resetStick(); });
      stick.addEventListener('pointercancel', resetStick);
    }

    $('#compass').addEventListener('click', () => {
      if (walk.active) return;
      const v = cameraViews.hero;
      flyTo(new THREE.Vector3().fromArray(v.pos), new THREE.Vector3().fromArray(v.target), 1.5);
    });

    const canvas = $('#scene');
    canvas.addEventListener('click', () => {
      if (walk.active && !walk.locked) requestLock();
    });
    canvas.addEventListener('pointerdown', e => {
      if (!walk.active || walk.locked) return;
      walk.drag = true; walk.lastX = e.clientX; walk.lastY = e.clientY;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (walk.active && walk.drag && !walk.locked) {
        walk.yaw -= (e.clientX - walk.lastX) * 0.0045;
        walk.pitch -= (e.clientY - walk.lastY) * 0.004;
        walk.pitch = YL.clamp(walk.pitch, -1.25, 1.25);
        walk.lastX = e.clientX; walk.lastY = e.clientY;
      }
    });
    canvas.addEventListener('pointerup', () => { walk.drag = false; });
    canvas.addEventListener('pointercancel', () => { walk.drag = false; });

    document.addEventListener('mousemove', e => {
      if (walk.active && walk.locked) {
        walk.yaw -= (e.movementX || 0) * 0.0021;
        walk.pitch -= (e.movementY || 0) * 0.0018;
        walk.pitch = YL.clamp(walk.pitch, -1.25, 1.25);
      }
    });

    document.addEventListener('pointerlockchange', () => {
      walk.locked = document.pointerLockElement === canvas;
      document.body.classList.toggle('locked', walk.locked);
      if (walk.active && !walk.locked && walk.saved !== null) {
        // Esc exits pointer lock; leave the walk mode as well.
        // (A click-to-relock is still possible from the button.)
        const wasActive = walk.active;
        if (wasActive && document.pointerLockElement === null) {
          // small delay avoids firing on transient changes while requesting
          setTimeout(() => {
            if (walk.active && document.pointerLockElement === null) exitWalk(true);
          }, 120);
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (e.code === 'KeyV' && !walk.active && !e.metaKey && !e.ctrlKey) {
        enterWalk();
        return;
      }
      if (walk.active) {
        if (e.code === 'Escape') { exitWalk(true); return; }
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) {
          walk.keys[e.code] = true;
          e.preventDefault();
        }
      } else if (!e.metaKey && !e.ctrlKey) {
        if (e.code === 'KeyN') setNight(!night);
        if (e.code === 'KeyL') $('#btn-labels').click();
        if (e.code === 'KeyR') toggleRoute();
      }
    });
    document.addEventListener('keyup', e => {
      if (walk.keys[e.code] != null) walk.keys[e.code] = false;
    });

    window.addEventListener('resize', onResize);
  }

  function toggleRoute(open) {
    const panel = $('#route-panel');
    const next = open == null ? !panel.classList.contains('open') : open;
    panel.classList.toggle('open', next);
    $('#btn-route').classList.toggle('active', next);
  }

  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  /* --------------------------- compass --------------------------- */
  const dirs = [
    { a: 90, cn: '北', en: 'NORTH' }, { a: 45, cn: '东北', en: 'NORTHEAST' },
    { a: 0, cn: '东', en: 'EAST' }, { a: -45, cn: '东南', en: 'SOUTHEAST' },
    { a: -90, cn: '南', en: 'SOUTH' }, { a: -135, cn: '西南', en: 'SOUTHWEST' },
    { a: 180, cn: '西', en: 'WEST' }, { a: 135, cn: '西北', en: 'NORTHWEST' }
  ];

  function updateCompass() {
    if (!camera) return;
    camera.getWorldDirection(tmpV);
    const theta = Math.atan2(tmpV.x, tmpV.z) * 180 / Math.PI;
    const rot = theta - 90;
    const needle = $('#compass-needle');
    if (needle) needle.style.transform = `translateX(-50%) rotate(${rot.toFixed(1)}deg)`;
    let best = dirs[0], bd = 999;
    for (const d of dirs) {
      let diff = Math.abs(((theta - d.a + 540) % 360) - 180);
      if (diff < bd) { bd = diff; best = d; }
    }
    const el = $('#compass-dir');
    if (el) el.textContent = best.cn + ' · ' + best.en;
  }

  /* --------------------------- toast --------------------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* --------------------------- GLB --------------------------- */
  function buildGLB() {
    return new Promise((resolve, reject) => {
      const exporter = new THREE.GLTFExporter();
      // r128's exporter does not serialize InstancedMesh transforms; hide those
      // helpers so the GLB contains clean merged geometry instead of stray singles.
      const hidden = [];
      const envs = [];
      ctx.world.traverse(o => {
        if ((o.isInstancedMesh || o.isSprite) && o.visible) { o.visible = false; hidden.push(o); }
        if (o.isMesh && o.material && o.material.envMap) {
          envs.push([o.material, o.material.envMap]);
          o.material.envMap = null;
        }
      });
      const restore = () => {
        hidden.forEach(o => { o.visible = true; });
        envs.forEach(p => { p[0].envMap = p[1]; });
      };
      // r128 signature is parse(input, onDone, options); it has no onError callback.
      try {
        exporter.parse(ctx.world, out => { restore(); resolve(out); }, {
          binary: true, onlyVisible: true, maxTextureSize: 2048
        });
      } catch (err) {
        restore();
        reject(err);
      }
    });
  }

  function arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function exportGLBBase64() {
    const out = await buildGLB();
    return arrayBufferToBase64(out);
  }

  async function exportAndDownload() {
    const btn = $('#btn-export');
    btn.disabled = true;
    const old = btn.querySelector('.txt').textContent;
    btn.querySelector('.txt').textContent = '导出中';
    try {
      const out = await buildGLB();
      const blob = new Blob([out], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yuelu-academy.glb';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('GLB 已导出 · 可在 Blender 中继续编辑');
    } catch (err) {
      console.error(err);
      toast('导出失败：' + (err && err.message ? err.message : err));
    } finally {
      btn.disabled = false;
      btn.querySelector('.txt').textContent = old;
    }
  }

  /* --------------------------- animate --------------------------- */
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (YL.windShaders) {
      for (const sh of YL.windShaders) {
        if (sh.uniforms && sh.uniforms.uTime) sh.uniforms.uTime.value = elapsed;
      }
    }
    if (YL.M && YL.M.water && YL.M.water.normalMap) {
      YL.M.water.normalMap.offset.x += dt * 0.018;
      YL.M.water.normalMap.offset.y += dt * 0.011;
    }
    if (ctx.leaves) {
      const L = ctx.leaves, arr = L.attr.array;
      for (let i = 0; i < L.data.length; i++) {
        const d = L.data[i];
        arr[i * 3 + 1] -= d.fall * dt;
        arr[i * 3] = d.bx + Math.sin(elapsed * d.spin + d.phase) * d.amp;
        arr[i * 3 + 2] = d.bz + Math.cos(elapsed * d.spin * 0.8 + d.phase) * d.amp * 0.7;
        if (arr[i * 3 + 1] < 0.15) arr[i * 3 + 1] = d.by;
      }
      L.attr.needsUpdate = true;
    }

    if (anim) updateFly(dt);
    else if (walk.active) updateWalk(dt);
    else controls.update();

    projectLabels();
    updateCompass();

    for (const c of ctx.sky.clouds) {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 370) c.position.x = -370;
    }

    renderer.render(scene, camera);
  }

  /* --------------------------- boot --------------------------- */
  window.addEventListener('load', () => {
    if (params.get('nointro') === '1') {
      const el = $('#loading');
      if (el) el.classList.add('done');
    }
    setTimeout(() => {
      try {
        init();
      } catch (err) {
        console.error(err);
        window.__ERRORS__.push(String(err && err.stack || err));
        const st = $('#load-status');
        if (st) st.textContent = '模型加载失败：' + (err && err.message ? err.message : err);
      }
    }, 80);
  });
})();
