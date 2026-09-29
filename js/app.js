/**
 * Portfolio View India — shared utilities + data loader
 */
(function (global) {
  'use strict';

  function inr(n) {
    if (n == null || n === '' || !isFinite(Number(n))) return '—';
    return '₹' + Math.round(Number(n)).toLocaleString('en-IN');
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

  function formatIST(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso || '—');
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
      return String(iso || '—');
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
      'conic-gradient(var(--c2) 0% ' + e + '%, var(--c1) ' + e + '% ' + (e + d) + '%, var(--c4) ' + (e + d) + '% 100%)';
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

  async function loadData(opts) {
    opts = opts || {};
    var path = opts.path;
    var statusEl = opts.statusEl;
    var force = !!opts.force;
    var url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();

    if (statusEl) {
      statusEl.className = 'data-status';
      statusEl.innerHTML = '<span class="skeleton" style="width:14rem;display:inline-block">&nbsp;</span>';
    }

    try {
      var res = await fetch(url, { cache: force ? 'no-store' : 'default' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var updated = data.updated_at || data.updated;
      var source = data.source || '—';
      var sourceUrl = data.source_url || data.sourceUrl || '#';
      var stale = isStale(updated, 36);

      if (statusEl) {
        statusEl.className = 'data-status' + (stale ? ' stale' : '');
        statusEl.innerHTML =
          (stale ? 'Data may be out of date · ' : '') +
          'Last updated ' + formatIST(updated) +
          ' · Source: <a href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener">' +
          escapeHtml(source) + ' ↗</a>';
      }

      if (typeof opts.onData === 'function') opts.onData(data);
      return data;
    } catch (err) {
      if (statusEl) {
        statusEl.className = 'data-status error';
        statusEl.innerHTML =
          "Couldn't load data. <button type=\"button\" class=\"btn\" data-retry style=\"min-height:36px;padding:0.3rem 0.75rem;margin-left:0.5rem\">Retry</button>";
        var btn = statusEl.querySelector('[data-retry]');
        if (btn) {
          btn.addEventListener('click', function () {
            loadData(Object.assign({}, opts, { force: true }));
          });
        }
      }
      if (typeof opts.onError === 'function') opts.onError(err);
      throw err;
    }
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
    loadData: loadData,
    loadJson: function (path, o) {
      o = o || {};
      return fetch(path + (o.force ? ('?t=' + Date.now()) : ''), {
        cache: o.force ? 'no-store' : 'default'
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})(typeof window !== 'undefined' ? window : this);
