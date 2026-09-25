/**
 * Mandatory disclaimer modal — blocks interaction until accepted.
 * Remembers acceptance in localStorage for this browser.
 */

(function () {
  const STORAGE_KEY = 'portfolioView_disclaimerAccepted_v1';

  function alreadyAccepted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* private mode */ }
    const modal = document.getElementById('disclaimerModal');
    if (modal) {
      modal.classList.add('is-hiding');
      setTimeout(() => {
        modal.classList.remove('is-open', 'is-hiding');
        document.body.classList.remove('modal-open');
      }, 280);
    }
  }

  function show() {
    const modal = document.getElementById('disclaimerModal');
    if (!modal) return;
    document.body.classList.add('modal-open');
    modal.classList.add('is-open');
  }

  function buildModal() {
    if (document.getElementById('disclaimerModal')) return;

    const el = document.createElement('div');
    el.id = 'disclaimerModal';
    el.className = 'disclaimer-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'disclaimerTitle');
    el.innerHTML = `
      <div class="disclaimer-backdrop"></div>
      <div class="disclaimer-panel">
        <div class="disclaimer-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#0f2744" stroke-width="2"/>
            <path d="M20 12v10" stroke="#0f2744" stroke-width="2.2" stroke-linecap="round"/>
            <circle cx="20" cy="28" r="1.6" fill="#0f2744"/>
          </svg>
        </div>
        <h2 id="disclaimerTitle">Important disclaimer</h2>
        <div class="disclaimer-body">
          <p>The information and tools provided on this platform are strictly for <strong>educational and informational purposes only</strong> and do not constitute financial, legal, or investment advice.</p>
          <p>I am <strong>not</strong> a SEBI-registered Research Analyst (RA) or Investment Adviser (IA).</p>
          <p>The portfolio allocation models and market insights shown here are designed to explain basic investing concepts and should <strong>not</strong> be construed as recommendations to buy, sell, or hold any security.</p>
          <p>Investing in stock markets involves risk; please consult a SEBI-registered financial advisor before making any investment decisions.</p>
        </div>
        <label class="disclaimer-check">
          <input type="checkbox" id="disclaimerCheck" />
          <span>I have read and understand this disclaimer</span>
        </label>
        <button type="button" class="btn btn-primary disclaimer-accept" id="disclaimerAccept" disabled>
          Continue to site
        </button>
      </div>
    `;
    document.body.appendChild(el);

    const check = document.getElementById('disclaimerCheck');
    const btn = document.getElementById('disclaimerAccept');
    check.addEventListener('change', () => {
      btn.disabled = !check.checked;
    });
    btn.addEventListener('click', accept);

    el.querySelector('.disclaimer-backdrop').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildModal();
    if (!alreadyAccepted()) {
      show();
    }
  });
})();
