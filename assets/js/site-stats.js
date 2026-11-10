(function () {
  "use strict";

  var API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000/api/site-stats/"
    : "https://app.kexin.uno/api/site-stats/";
  var VIEW_TTL = 30 * 60 * 1000;
  var PAGE_KEYS = {
    "/": "home",
    "/index.html": "home"
  };

  function pageKey() {
    var widget = document.querySelector("[data-site-stats]");
    if (widget && widget.dataset.page) return widget.dataset.page;
    return PAGE_KEYS[window.location.pathname] || "";
  }

  function request(path, options) {
    return fetch(API_BASE + path, Object.assign({
      credentials: "include",
      mode: "cors",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    }, options || {})).then(function (response) {
      if (!response.ok) throw new Error("stats request failed");
      return response.json();
    });
  }

  function formatCount(value) {
    return new Intl.NumberFormat("zh-CN").format(Number(value) || 0);
  }

  function render(widget, stats) {
    var views = widget.querySelector("[data-stat-views]");
    var likes = widget.querySelector("[data-stat-likes]");
    var likeButton = widget.querySelector("[data-stat-like]");
    var likeLabel = widget.querySelector("[data-stat-like-label]");
    if (views) views.textContent = formatCount(stats.views);
    if (likes) likes.textContent = formatCount(stats.likes);
    if (likeButton) {
      likeButton.classList.toggle("is-liked", Boolean(stats.liked));
      likeButton.setAttribute("aria-pressed", stats.liked ? "true" : "false");
      likeButton.setAttribute("aria-label", stats.liked ? "取消猫爪点赞" : "留下猫爪点赞");
    }
    if (likeLabel) likeLabel.textContent = stats.liked ? "已留猫爪" : "踩个猫爪";
    widget.dataset.state = "ready";
  }

  function bindLikes(widget, key) {
    var button = widget.querySelector("[data-stat-like]");
    if (!button) return;
    button.addEventListener("click", function () {
      if (button.disabled) return;
      var willLike = !button.classList.contains("is-liked");
      button.disabled = true;
      request(key + "/like", { method: willLike ? "POST" : "DELETE" })
        .then(function (stats) {
          render(widget, stats);
          if (willLike) {
            button.classList.remove("is-popping");
            void button.offsetWidth;
            button.classList.add("is-popping");
            window.setTimeout(function () { button.classList.remove("is-popping"); }, 500);
          }
        })
        .catch(function () {
          button.title = "猫爪暂时没有回应，请稍后再试";
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }

  function start() {
    if (window.location.protocol === "file:") return;
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var key = pageKey();
    if (!key) return;

    var widget = document.querySelector("[data-site-stats]");
    var viewKey = "kx-view:" + key;
    var lastView = 0;
    try { lastView = Number(sessionStorage.getItem(viewKey)) || 0; } catch (error) {}
    var shouldCount = Date.now() - lastView > VIEW_TTL;

    var task = shouldCount
      ? request(key + "/view", { method: "POST" })
      : request(key);

    task.then(function (stats) {
      if (shouldCount) {
        try { sessionStorage.setItem(viewKey, String(Date.now())); } catch (error) {}
      }
      if (widget) render(widget, stats);
    }).catch(function () {
      if (!widget) return;
      var views = widget.querySelector("[data-stat-views]");
      var likes = widget.querySelector("[data-stat-likes]");
      var likeLabel = widget.querySelector("[data-stat-like-label]");
      if (views) views.textContent = "—";
      if (likes) likes.textContent = "—";
      if (likeLabel) likeLabel.textContent = "统计暂不可用";
      widget.dataset.state = "error";
    });

    if (widget) bindLikes(widget, key);
  }

  function schedule() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(start, { timeout: 1800 });
    } else {
      window.setTimeout(start, 500);
    }
  }

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
})();
