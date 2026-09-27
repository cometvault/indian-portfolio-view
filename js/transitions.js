/**
 * Soft page transitions + data-refreshed stamp.
 */

(function () {
  document.documentElement.classList.add('js');
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-enter');
  });

  if (document.startViewTransition) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (href.includes('://')) return;
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = a.href;
      });
    });
  }

  async function stampData() {
    let targets = document.querySelectorAll('[data-stamp]');
    if (!targets.length) {
      const header = document.querySelector('.page-header');
      if (!header) return;
      const el = document.createElement('div');
      el.className = 'data-stamp';
      el.setAttribute('data-stamp', '');
      el.textContent = 'Checking data\u2026';
      header.insertBefore(el, header.firstChild);
      targets = document.querySelectorAll('[data-stamp]');
    }

    let updated = null;
    try {
      const r = await fetch('data/ipo.json', { cache: 'no-cache' });
      if (r.ok) {
        const j = await r.json();
        updated = j.updated || null;
      }
    } catch (_) {}
    if (!updated) {
      try {
        const r = await fetch('data/gold.json', { cache: 'no-cache' });
        if (r.ok) {
          const j = await r.json();
          updated = j.updated || null;
        }
      } catch (_) {}
    }

    const label = updated
      ? 'Data refreshed ' + formatDate(updated) + ' \u00b7 next pull ~12:00 IST'
      : 'Data refreshes daily ~12:00 IST';

    targets.forEach(el => { el.textContent = label; });
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso + (iso.length <= 10 ? 'T12:00:00+05:30' : ''));
      return d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
      });
    } catch (_) {
      return iso;
    }
  }

  document.addEventListener('DOMContentLoaded', stampData);
})();
