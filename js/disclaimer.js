/**
 * Mandatory full disclaimer gate.
 * Shows on every page load. User must scroll the full text and check the box
 * before the Continue button unlocks. Protects the developer educational-only position.
 */
(function () {
  var SCROLL_THRESHOLD = 12;

  function accept() {
    var modal = document.getElementById('disclaimerModal');
    if (!modal) return;
    modal.classList.add('is-hiding');
    setTimeout(function () {
      modal.classList.remove('is-open', 'is-hiding');
      document.body.classList.remove('modal-open');
    }, 280);
  }

  function updateButton() {
    var body = document.getElementById('disclaimerScroll');
    var check = document.getElementById('disclaimerCheck');
    var btn = document.getElementById('disclaimerAccept');
    var hint = document.getElementById('disclaimerHint');
    if (!body || !check || !btn) return;

    var scrolled =
      body.scrollHeight - body.scrollTop - body.clientHeight <= SCROLL_THRESHOLD;
    if (scrolled) body.classList.add('is-scrolled');
    else body.classList.remove('is-scrolled');

    var ok = scrolled && check.checked;
    btn.disabled = !ok;
    if (hint) {
      if (!scrolled) hint.textContent = 'Scroll to the end of the disclaimer to continue.';
      else if (!check.checked) hint.textContent = 'Confirm you understand before continuing.';
      else hint.textContent = '';
    }
  }

  function show() {
    var modal = document.getElementById('disclaimerModal');
    if (!modal) return;
    document.body.classList.add('modal-open');
    void modal.offsetWidth;
    modal.classList.add('is-open');
    var body = document.getElementById('disclaimerScroll');
    if (body) body.focus();
    updateButton();
  }

  function buildModal() {
    if (document.getElementById('disclaimerModal')) return;

    var el = document.createElement('div');
    el.id = 'disclaimerModal';
    el.className = 'disclaimer-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'disclaimerTitle');
    el.innerHTML =
      '<div class="disclaimer-backdrop" aria-hidden="true"></div>' +
      '<div class="disclaimer-panel">' +
        '<p class="disclaimer-tag">Before you continue</p>' +
        '<h2 id="disclaimerTitle">Full disclaimer</h2>' +
        '<div class="disclaimer-scroll" id="disclaimerScroll" tabindex="0" role="region" aria-label="Full disclaimer text">' +
          '<p><strong>Educational reference only.</strong> This website is a public informational tool. It does not provide investment advice, portfolio management, or personalised recommendations of any kind.</p>' +
          '<p>All allocation percentages, life-stage mixes, equity sleeve proportions, IPO grey-market premiums (GMP), gold rates, and category frameworks shown here are <strong>directional illustrations</strong> drawn from public sources. They are not forecasts, guarantees, or suggestions to buy, sell, or hold any security, fund, metal, or product.</p>' +
          '<p><strong>No scheme or ticker names.</strong> Mutual fund and ETF content is category-level only. You must do your own research and consult a SEBI-registered investment adviser before acting on any idea.</p>' +
          '<p><strong>Data can be wrong or stale.</strong> IPO GMP is unofficial and moves quickly. Gold rates are city-level retail references and exclude making charges and taxes. Tables and cards may lag the market. Always verify independently.</p>' +
          '<p><strong>Not SEBI-registered.</strong> The operator of this site is not registered with the Securities and Exchange Board of India as an adviser, intermediary, or research analyst. Nothing on this site creates a client relationship.</p>' +
          '<p><strong>No liability.</strong> To the fullest extent permitted by law, the developers and operators of this site accept no liability for any loss, cost, or damage arising from use of or reliance on any content here. Markets involve risk of capital loss.</p>' +
          '<p><strong>Your responsibility.</strong> By continuing you confirm that you understand the above, that you will not treat this site as advice, and that any investment decision you make is solely your own.</p>' +
          '<div class="disclaimer-scroll-end" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="disclaimer-fade" aria-hidden="true"></div>' +
        '<label class="disclaimer-check" for="disclaimerCheck">' +
          '<input type="checkbox" id="disclaimerCheck" />' +
          '<span>I have read the full disclaimer and understand this is educational only, not advice.</span>' +
        '</label>' +
        '<p class="disclaimer-hint" id="disclaimerHint">Scroll to the end of the disclaimer to continue.</p>' +
        '<button type="button" class="btn btn-primary disclaimer-accept" id="disclaimerAccept" disabled>Continue to site</button>' +
      '</div>';
    document.body.appendChild(el);

    var body = document.getElementById('disclaimerScroll');
    var check = document.getElementById('disclaimerCheck');
    var btn = document.getElementById('disclaimerAccept');

    body.addEventListener('scroll', updateButton, { passive: true });
    check.addEventListener('change', updateButton);
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      accept();
    });

    el.querySelector('.disclaimer-backdrop').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e) {
      if (!el.classList.contains('is-open')) return;
      if (e.key === 'Escape') e.preventDefault();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      localStorage.removeItem('portfolioView_disclaimerAccepted_v1');
      sessionStorage.removeItem('portfolioView_disclaimerAccepted_v1');
    } catch (e) {}

    buildModal();
    show();
  });
})();
