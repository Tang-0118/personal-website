/* ==========================================================================
   Personal Website — main.js
   1. 首屏入场  2. 滚动出现  3. 文字轮播  4. 导航高亮
   5. 吸顶堆叠卡  6. 视差  7. 数字与技能条  8. 宝丽来拖拽
   9. 复制 / 跳转  10. 简历下载  11. 进度条 / 光晕 / 回顶  12. 图片灯箱
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 提示条 ---------------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------------- 1. 首屏入场 ---------------- */
  var hero = $('.hero');
  var heroItems = $$('.hero [data-reveal]');
  heroItems.forEach(function (el, i) { el.style.setProperty('--delay', (260 + i * 100) + 'ms'); });

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (hero) hero.classList.add('is-in');
      var nameMask = $('.hero__name .mask');
      if (nameMask) nameMask.classList.add('is-in');
    }, reduce ? 0 : 120);
  });

  /* ---------------- 2. 滚动出现 ---------------- */
  var revealTargets = $$('[data-reveal], .mask, .timeline, .skills');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.classList.contains('skills')) animateSkills(e.target);
        if (e.target.classList.contains('timeline')) { /* 时间轴线条自动展开 */ }
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el, i) {
      if (!el.style.getPropertyValue('--delay')) {
        el.style.setProperty('--delay', ((i % 4) * 90) + 'ms');
      }
      io.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
    $$('.skills').forEach(animateSkills);
  }

  /* ---------------- 3. 首屏文字轮播 ---------------- */
  var rotator = $('#rotatorList');
  if (rotator) {
    var items = $$('.rotator__item', rotator);
    var idx = 0;
    if (items.length > 1 && !reduce) {
      var step = items[0].getBoundingClientRect().height || 30;
      setInterval(function () {
        idx = (idx + 1) % items.length;
        rotator.style.transform = 'translateY(' + (-idx * step) + 'px)';
      }, 3000);
      window.addEventListener('resize', function () {
        step = items[0].getBoundingClientRect().height || 30;
        rotator.style.transform = 'translateY(' + (-idx * step) + 'px)';
      });
    }
  }

  /* ---------------- 4. 左侧导航高亮 ---------------- */
  var navLinks = $$('.dock__item');
  var sections = navLinks.map(function (a) { return document.getElementById(a.dataset.nav); }).filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a.dataset.nav === id); });
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // 平滑滚动（考虑固定导航偏移）
  navLinks.concat($$('.hero__cta a, .scroll-hint, .footer a[href^="#"]')).forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = (a.getAttribute('href') || '').slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      ev.preventDefault();
      var offset = window.innerWidth > 860 ? 24 : 16;
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---------------- 5. 吸顶堆叠卡 ---------------- */
  var stacks = $$('.stack').map(function (stack) {
    var panels = $$(':scope > .panel', stack);
    panels.forEach(function (p, i) { p.style.setProperty('--i', i); });
    return { el: stack, panels: panels };
  }).filter(function (s) { return s.panels.length > 1; });

  function updateStacks() {
    if (window.innerWidth <= 860) return;
    stacks.forEach(function (s) {
      s.panels.forEach(function (p, i) {
        var next = s.panels[i + 1];
        if (!next) { p.style.transform = ''; p.classList.remove('is-covered'); return; }
        // 用「下一张卡片盖住了当前卡片的多少」来驱动缩放与淡出
        var me = p.getBoundingClientRect();
        var covered = (me.bottom - next.getBoundingClientRect().top) / Math.max(1, me.height);
        var prog = covered < 0 ? 0 : covered > 1 ? 1 : covered;
        p.style.transform = 'scale(' + (1 - prog * 0.05).toFixed(4) + ') translateY(' + (-prog * 10).toFixed(2) + 'px)';
        p.classList.toggle('is-covered', prog > 0.5);
      });
    });
  }

  /* ---------------- 6. 视差 ---------------- */
  var parallaxItems = $$('[data-parallax]');
  function updateParallax() {
    if (reduce || window.innerWidth <= 860) return;
    var vh = window.innerHeight;
    parallaxItems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var center = (r.top + r.height / 2 - vh / 2) / vh; // -1 ~ 1
      el.style.transform = 'translateY(' + (center * -16).toFixed(2) + 'px)';
    });
  }

  /* ---------------- 滚动主循环 ---------------- */
  var progressBar = $('#progressBar');
  var ticking = false;
  function onFrame() {
    updateStacks();
    updateParallax();
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.pageYOffset / max) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, p)) + '%';
    }
    ticking = false;
  }
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  window.addEventListener('load', requestFrame);
  onFrame();
  updateStacks();
  updateParallax();

  /* ---------------- 7. 数字与技能条 ---------------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count) || 0;
    if (reduce) { el.textContent = String(target); return; }
    var start = performance.now();
    var dur = 1200;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  function animateSkills(scope) {
    $$('.skill', scope).forEach(function (s, i) {
      var bar = $('.skill__track i', s);
      var level = parseFloat(s.dataset.level) || 60;
      if (bar) bar.style.setProperty('--w', level + '%');
      setTimeout(function () { if (bar) bar.style.width = level + '%'; }, reduce ? 0 : 120 + i * 110);
    });
  }

  /* ---------------- 8. 宝丽来拖拽 ---------------- */
  var suppressZoomUntil = 0;
  $$('[data-drag]').forEach(function (card) {
    var rot = card.style.getPropertyValue('--rot') || '0deg';
    var x = 0, y = 0, sx = 0, sy = 0, dragging = false, moved = false;

    card.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false;
      sx = e.clientX - x; sy = e.clientY - y;
      card.classList.add('is-dragging');
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      x = e.clientX - sx; y = e.clientY - sy;
      if (Math.abs(x) + Math.abs(y) > 4) moved = true;
      // 只改变位移变量，缩放/旋转交给 CSS（悬停时仍能展开）
      card.style.setProperty('--dx', x.toFixed(1) + 'px');
      card.style.setProperty('--dy', y.toFixed(1) + 'px');
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('is-dragging');
      if (e && e.pointerId != null && card.hasPointerCapture && card.hasPointerCapture(e.pointerId)) {
        card.releasePointerCapture(e.pointerId);
      }
      if (moved) { suppressZoomUntil = Date.now() + 400; toast('松手啦，可以继续拖别的照片 ✦'); }
    }
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  });

  /* ---------------- 9. 复制 / 跳转 ---------------- */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { toast(text); }
      document.body.removeChild(ta);
    }
  }

  // 一键复制条
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      copyText(text, function () {
        toast('已复制：' + text);
        btn.classList.add('is-done');
        setTimeout(function () { btn.classList.remove('is-done'); }, 1200);
      });
    });
  });

  /* ---------------- 10. 简历下载 ---------------- */
  var dl = $('#downloadResume');
  var RESUME_URL = 'assets/resume.pdf';
  var RESUME_NAME = '陈可欣-简历.pdf';
  if (dl) {
    dl.addEventListener('click', function () {
      fetch(RESUME_URL, { method: 'HEAD' })
        .then(function (r) {
          if (!r.ok) { missing(); return; }
          /* 直接存成中文文件名，省得 HR 下载到一堆 resume.pdf */
          var a = document.createElement('a');
          a.href = RESUME_URL;
          a.download = RESUME_NAME;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(missing);
      function missing() {
        toast('还没有放简历文件：把 PDF 存成 assets/resume.pdf 即可');
      }
    });
  }

  /* ---------------- 12. 工具箱：滚到视口里时三个文件夹飞进来 ---------------- */
  var toolkit = $('#toolkit');
  if (toolkit) {
    var flyIn = function () { toolkit.classList.add('is-in'); };
    if (reduce || !('IntersectionObserver' in window)) {
      flyIn();
    } else {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          flyIn();
          tio.disconnect();
        });
      }, { threshold: 0.3 });
      tio.observe(toolkit);
    }

    /* 触屏 / 键盘也能把文件夹里的截图转出来：点文件夹切换展开状态 */
    var folders = $$('.folder');
    var setFolderOpen = function (folder, open) {
      folder.classList.toggle('is-open', open);
      folder.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    var closeFolders = function (except) {
      folders.forEach(function (folder) {
        if (folder !== except) setFolderOpen(folder, false);
      });
    };
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    folders.forEach(function (folder) {
      folder.setAttribute('tabindex', '0');
      folder.setAttribute('role', 'button');
      folder.setAttribute('aria-expanded', 'false');

      folder.addEventListener('click', function (e) {
        if (e.target.closest('.folder__item')) return; // 点截图交给灯箱处理
        closeFolders(folder);
        setFolderOpen(folder, !folder.classList.contains('is-open'));
      });
      folder.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        closeFolders(folder);
        setFolderOpen(folder, !folder.classList.contains('is-open'));
      });
      folder.addEventListener('focusout', function (e) {
        if (!folder.contains(e.relatedTarget)) setFolderOpen(folder, false);
      });
      if (canHover) {
        folder.addEventListener('mouseleave', function () { setFolderOpen(folder, false); });
      }
    });

    /* 点空白 / 点另一个文件夹 / 鼠标移出，都不留下展开状态 */
    document.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.folder')) return;
      closeFolders(null);
    });
  }

  /* ---------------- 12. 图片灯箱（点击弹出大图） ---------------- */
  var lightbox = $('#lightbox');
  if (lightbox) {
    var lbImg = $('#lightboxImg');
    var lbCap = $('#lightboxCap');
    var lbClose = $('#lightboxClose');
    var lastFocus = null;
    var ZOOM_SEL = '.media img, .project__media img, .photo-card__img, .gphoto__img, .gphoto, .folder__item img';

    // 照片墙拖拽会做 pointer capture，click 事件的目标会变成 .gphoto 本身，
    // 所以这里统一解析出真正承载图片的节点
    function mediaNode(el) {
      if (el && el.classList && el.classList.contains('gphoto')) {
        return el.querySelector('.gphoto__img') || el;
      }
      return el;
    }
    function srcOf(node) {
      var el = mediaNode(node);
      if (el.tagName === 'IMG') return el.currentSrc || el.src || '';
      var bg = window.getComputedStyle(el).backgroundImage || '';
      var m = /url\(["']?(.*?)["']?\)/.exec(bg);
      return m ? m[1] : '';
    }
    function capOf(el) {
      var fig = el.closest('figure');
      var cap = fig ? fig.querySelector('figcaption') : null;
      if (cap && cap.textContent.trim()) return cap.textContent.trim();
      return el.getAttribute('alt') || '';
    }

    function openLightbox(el) {
      var src = srcOf(el);
      if (!src) return;
      var from = el.getBoundingClientRect();
      lbImg.src = src;
      lbImg.alt = el.getAttribute('alt') || '';
      lbCap.textContent = capOf(el);
      lastFocus = document.activeElement;
      lightbox.hidden = false;
      document.documentElement.classList.add('lb-open');

      var settle = function () {
        // 原图较小的话按上限放大显示，避免弹出来还是一张小图
        var natW = lbImg.naturalWidth || lbImg.width || 0;
        var natH = lbImg.naturalHeight || lbImg.height || 0;
        if (natW && natH) {
          var maxW = Math.min(window.innerWidth * 0.86, 1280);
          var maxH = window.innerHeight * 0.76;
          var fit = Math.min(maxW / natW, maxH / natH, 2.2);
          lbImg.style.width = Math.round(natW * fit) + 'px';
          lbImg.style.height = Math.round(natH * fit) + 'px';
        }
        lightbox.classList.add('is-open');
        if (reduce) return;
        var to = lbImg.getBoundingClientRect();
        if (!to.width || !to.height) return;
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        var s = Math.max(0.06, Math.min(from.width / to.width, from.height / to.height));
        lightbox.classList.add('is-zooming');       // 期间关闭过渡，先摆到起点
        lbImg.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            lightbox.classList.remove('is-zooming');
            lightbox.classList.add('is-settling');
            lbImg.style.transform = 'none';         // 再放大到最终位置
          });
        });
      };

      if (lbImg.complete && lbImg.naturalWidth) requestAnimationFrame(settle);
      else lbImg.onload = function () { requestAnimationFrame(settle); };
      lbClose.focus();
    }

    function closeLightbox() {
      if (lightbox.hidden) return;
      lightbox.classList.remove('is-open', 'is-settling', 'is-zooming');
      lbImg.style.transform = '';
      document.documentElement.classList.remove('lb-open');
      setTimeout(function () {
        lightbox.hidden = true;
        lbImg.removeAttribute('src');
        lbImg.style.width = '';
        lbImg.style.height = '';
      }, reduce ? 0 : 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      if (Date.now() < suppressZoomUntil) return;
      var el = e.target.closest(ZOOM_SEL);
      // 想排除某张图：给它的容器加 data-no-zoom 或 class="no-zoom"
      if (el && !el.closest('[data-no-zoom], .no-zoom')) {
        e.preventDefault();
        openLightbox(el);
        return;
      }
      if (e.target === lightbox) closeLightbox();
    });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------------- 11. 光晕 / 回顶 ---------------- */
  var glow = $('#glow');
  if (glow && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      document.body.classList.add('has-glow');
    }, { passive: true });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  var toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
