/* Mandatory disclaimer — runs on every new browser session */
(function () {
  function showDisclaimer() {
    try {
      if (sessionStorage.getItem("en_disclaimer_ok") === "1") return;
    } catch (e) {}
    if (document.getElementById("enDisclaimer")) return;

    var overlay = document.createElement("div");
    overlay.id = "enDisclaimer";
    overlay.className = "en-disc";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "enDiscTitle");
    overlay.innerHTML =
      '<div class="en-disc-card">' +
      '<h2 id="enDiscTitle">Before you continue</h2>' +
      '<div class="en-disc-body">' +
      '<p><strong>Easy Nivesh</strong> is an educational guide only.</p>' +
      '<ul>' +
      '<li>This site is <strong>not</strong> investment advice and is <strong>not</strong> SEBI-registered.</li>' +
      '<li>We do not recommend any stock, IPO, fund, or product.</li>' +
      '<li>IPO GMP and market figures come from public sources and can be wrong, delayed, or unofficial.</li>' +
      '<li>Investments involve risk. Past performance does not guarantee future results.</li>' +
      '<li>Always read offer documents and take your own decisions — or speak to a registered adviser.</li>' +
      '</ul>' +
      '<p class="en-disc-note">By continuing you confirm you understand this and accept full responsibility for your decisions.</p>' +
      '</div>' +
      '<label class="en-disc-check">' +
      '<input type="checkbox" id="enDiscCheck" />' +
      '<span>I have read and accept this disclaimer</span>' +
      '</label>' +
      '<button type="button" class="en-disc-btn" id="enDiscAccept" disabled>Continue</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add("en-disc-lock");

    var check = document.getElementById("enDiscCheck");
    var btn = document.getElementById("enDiscAccept");
    check.addEventListener("change", function () {
      btn.disabled = !check.checked;
    });
    btn.addEventListener("click", function () {
      if (!check.checked) return;
      try { sessionStorage.setItem("en_disclaimer_ok", "1"); } catch (e) {}
      overlay.remove();
      document.body.classList.remove("en-disc-lock");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showDisclaimer);
  } else {
    showDisclaimer();
  }
})();
