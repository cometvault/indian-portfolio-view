/**
 * Mandatory disclaimer modal — once per browser.
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
    } catch (e) {}
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
        <p class="disclaimer-tag">Before you continue</p>
        <h2 id="disclaimerTitle">Educational only</h2>
        <p class="disclaimer-one">Figures are directional, not advice.</p>
        <button type="button" class="btn btn-primary disclaimer-accept" id="disclaimerAccept">
          Got it
        </button>
        <p class="disclaimer-full-link"><a href="#faq">Full disclaimer</a></p>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('disclaimerAccept').addEventListener('click', accept);
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
