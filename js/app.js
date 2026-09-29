/**
 * Portfolio View India — shared utilities
 */
(function (global) {
  'use strict';

  function inr(n) {
    n = Math.round(Number(n) || 0);
    return '₹' + n.toLocaleString('en-IN');
  }

  function num(v) {
    if (v == null || v === '') return 0;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    return isFinite(n) && n > 0 ? n : 0;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatIST(isoOrDate) {
    try {
      var d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
      if (isNaN(d.getTime())) return String(isoOrDate || '—');
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch (e) {
      return String(isoOrDate || '—');
    }
  }

  function isStale(iso, hours) {
    hours = hours || 36;
    try {
      var t = new Date(iso).getTime();
      if (isNaN(t)) return true;
      return (Date.now() - t) > hours * 3600 * 1000;
    } catch (e) {
      return true;
    }
  }

  var AGE_MIX = {
    '20-24': { eq: 75, debt: 15, gold: 10 },
    '25-29': { eq: 70, debt: 20, gold: 10 },
    '30-39': { eq: 60, debt: 30, gold: 10 },
    '40-49': { eq: 50, debt: 40, gold: 10 },
    '50+':   { eq: 35, debt: 50, gold: 15 }
  };

  function mixForAge(ageKey, riskShift) {
    riskShift = riskShift || 0;
    var b = AGE_MIX[ageKey] || AGE_MIX['25-29'];
    var eq = clamp(b.eq + riskShift, 10, 90);
    var gold = b.gold;
    var debt = 100 - eq - gold;
    if (debt < 0) {
      eq = clamp(100 - gold, 10, 90);
      debt = 100 - eq - gold;
    }
    return { eq: eq, debt: debt, gold: gold };
  }

  function paintDonut(el, mix) {
    if (!el || !mix) return;
    var e = mix.eq, d = mix.debt, g = mix.gold;
    el.style.background =
      'conic-gradient(var(--equity) 0% ' + e + '%, var(--debt) ' + e + '% ' + (e + d) + '%, var(--gold-chart) ' + (e + d) + '% 100%)';
  }

  function paintLegend(root, mix) {
    if (!root || !mix) return;
    var eq = root.querySelector('[data-leg="eq"]');
    var debt = root.querySelector('[data-leg="debt"]');
    var gold = root.querySelector('[data-leg="gold"]');
    if (eq) eq.textContent = mix.eq + '%';
    if (debt) debt.textContent = mix.debt + '%';
    if (gold) gold.textContent = mix.gold + '%';
  }

  function initNav() {
    var toggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('navDrawer');
    if (!toggle || !drawer) return;
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  async function loadJson(path, opts) {
    opts = opts || {};
    var url = path + (opts.force ? ('?t=' + Date.now()) : '');
    var res = await fetch(url, { cache: opts.force ? 'no-store' : 'default' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  global.PV = {
    inr: inr,
    num: num,
    clamp: clamp,
    escapeHtml: escapeHtml,
    formatIST: formatIST,
    isStale: isStale,
    AGE_MIX: AGE_MIX,
    mixForAge: mixForAge,
    paintDonut: paintDonut,
    paintLegend: paintLegend,
    initNav: initNav,
    loadJson: loadJson
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})(typeof window !== 'undefined' ? window : this);
