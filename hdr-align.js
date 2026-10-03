/* Force brand logo visible on every page */
(function () {
  function fixLogo() {
    var img = document.getElementById("brandLogo") || document.querySelector(".logo-img");
    if (!img) return;
    img.style.display = "block";
    img.style.visibility = "visible";
    img.style.opacity = "1";
    img.style.background = "transparent";
    img.onerror = function () {
      if (window.PV_LOGO) {
        this.src = window.PV_LOGO;
        this.onerror = null;
      }
    };
    if (!img.complete || img.naturalWidth === 0) {
      if (window.PV_LOGO) img.src = window.PV_LOGO;
      else {
        var s = document.createElement("script");
        s.src = "assets/logo-data.js?v=19";
        s.onload = function () {
          if (window.PV_LOGO) {
            img.src = window.PV_LOGO;
            img.onerror = null;
          }
        };
        document.head.appendChild(s);
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixLogo);
  } else {
    fixLogo();
  }
  window.addEventListener("load", fixLogo);
})();
