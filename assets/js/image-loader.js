(function () {
  "use strict";

  function finish(image, state) {
    image.dataset.imageState = state;
    image.removeAttribute("aria-busy");
  }

  function watch(image) {
    if (image.dataset.noLoader !== undefined) return;
    if (image.classList.contains("photo-card__img")) return;
    if (image.complete && image.naturalWidth > 0) return;

    image.dataset.imageState = "loading";
    image.setAttribute("aria-busy", "true");
    image.addEventListener("load", function () { finish(image, "loaded"); }, { once: true });
    image.addEventListener("error", function () { finish(image, "error"); }, { once: true });
  }

  function init() {
    document.querySelectorAll("img").forEach(watch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
