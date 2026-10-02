/* hdr-align — keep header/nav aligned + mobile-ready */
(function () {
  function fixHeader() {
    var root = document.getElementById("hdr");
    if (!root) return;

    var hdr = root.querySelector("header.hdr") || root;
    var hdrIn = root.querySelector(".hdr-in");
    var nav = document.getElementById("primaryNav") || root.querySelector("nav.nav");
    var toggle = document.getElementById("navToggle");

    if (!hdrIn || !nav) return;

    if (nav.parentElement !== hdrIn) {
      if (toggle && toggle.parentElement === hdrIn) {
        hdrIn.insertBefore(nav, toggle);
      } else {
        hdrIn.appendChild(nav);
      }
    }

    nav.querySelectorAll("a.cta").forEach(function (a) {
      a.classList.add("start");
    });

    if (hdr && hdrIn.parentElement !== hdr) {
      hdr.appendChild(hdrIn);
    }
  }

  function fixRibbon() {
    var root = document.getElementById("hdr");
    if (!root) return;
    var ribbon = root.querySelector(".mkt-ribbon");
    var hdr = root.querySelector("header.hdr");
    if (ribbon && hdr && ribbon.parentElement === hdr) {
      root.insertBefore(ribbon, hdr.nextSibling);
    }
  }

  function run() {
    fixHeader();
    fixRibbon();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      run();
      setTimeout(run, 30);
      setTimeout(run, 120);
    });
  } else {
    run();
    setTimeout(run, 30);
    setTimeout(run, 120);
  }
})();
