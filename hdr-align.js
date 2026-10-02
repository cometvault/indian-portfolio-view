/* hdr-align — header structure, logo text, mobile */
(function () {
  function fixLogoText() {
    var el = document.querySelector(".logo-txt");
    if (!el) return;
    el.innerHTML = "Portfolio View <span>India</span>";
  }

  function fixHeader() {
    var root = document.getElementById("hdr");
    if (!root) return;

    var hdr = root.querySelector("header.hdr") || root;
    var hdrIn = root.querySelector(".hdr-in");
    var nav = document.getElementById("primaryNav") || root.querySelector("nav.nav");
    var toggle = document.getElementById("navToggle");

    if (hdrIn && nav && nav.parentElement !== hdrIn) {
      if (toggle && toggle.parentElement === hdrIn) {
        hdrIn.insertBefore(nav, toggle);
      } else {
        hdrIn.appendChild(nav);
      }
    }

    if (nav) {
      nav.querySelectorAll("a.cta").forEach(function (a) {
        a.classList.add("start");
      });
    }

    if (hdr && hdrIn && hdrIn.parentElement !== hdr) {
      hdr.appendChild(hdrIn);
    }

    var ribbon = root.querySelector(".mkt-ribbon");
    if (ribbon && hdr && ribbon.parentElement === hdr) {
      root.insertBefore(ribbon, hdr.nextSibling);
    }
  }

  function run() {
    fixHeader();
    fixLogoText();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      run();
      setTimeout(run, 40);
      setTimeout(run, 150);
    });
  } else {
    run();
    setTimeout(run, 40);
    setTimeout(run, 150);
  }
})();
