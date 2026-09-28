/**
 * New To Finance — emergency fund, IPO bucket, localStorage.
 */
(function () {
  var KEY = 'portfolioView_ntf_v1';

  function formatINR(n) {
    if (!isFinite(n) || n < 0) n = 0;
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function positive(v) {
    var n = parseFloat(v);
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : {};
    } catch (e) {
      return {};
    }
  }

  function saveState(partial) {
    try {
      var cur = loadState();
      Object.keys(partial).forEach(function (k) {
        cur[k] = partial[k];
      });
      localStorage.setItem(KEY, JSON.stringify(cur));
    } catch (e) {}
  }

  function updateEmergency() {
    var expEl = document.getElementById('monthlyExpenses');
    var monthsEl = document.getElementById('coverMonths');
    var curEl = document.getElementById('currentEmergency');
    var targetEl = document.getElementById('efTarget');
    var wrap = document.getElementById('efProgressWrap');
    var fill = document.getElementById('efFill');
    var bar = document.getElementById('efBar');
    var gapLabel = document.getElementById('efGapLabel');
    var progLabel = document.getElementById('efProgressLabel');

    var expenses = positive(expEl && expEl.value);
    var months = parseInt(monthsEl && monthsEl.value, 10) || 3;
    if (months < 3) months = 3;
    if (months > 6) months = 6;
    var target = expenses * months;
    var current = positive(curEl && curEl.value);

    if (targetEl) {
      targetEl.textContent = expenses > 0 ? formatINR(target) : '—';
    }

    if (wrap && fill && bar) {
      if (expenses > 0 && (current > 0 || (curEl && curEl.value !== ''))) {
        wrap.hidden = false;
        var pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
        fill.style.width = pct.toFixed(1) + '%';
        bar.setAttribute('aria-valuenow', String(Math.round(pct)));
        var gap = Math.max(0, target - current);
        if (progLabel) progLabel.textContent = Math.round(pct) + '% funded';
        if (gapLabel) {
          gapLabel.textContent = gap > 0 ? formatINR(gap) + ' to go' : 'Target met';
        }
      } else {
        wrap.hidden = true;
      }
    }

    saveState({
      monthlyExpenses: expEl ? expEl.value : '',
      coverMonths: String(months),
      currentEmergency: curEl ? curEl.value : ''
    });
  }

  function updateIpo() {
    var balEl = document.getElementById('ipoBalance');
    var appEl = document.getElementById('ipoAppAmount');
    var display = document.getElementById('ipoBalanceDisplay');
    var coverage = document.getElementById('ipoCoverage');

    var bal = positive(balEl && balEl.value);
    var app = positive(appEl && appEl.value) || 15000;
    if (app < 1000) app = 1000;

    if (display) display.textContent = 'IPO Savings Balance: ' + formatINR(bal);
    if (coverage) {
      var n = app > 0 ? Math.floor(bal / app) : 0;
      coverage.textContent =
        'Covers about ' + n + ' application' + (n === 1 ? '' : 's') +
        ' at ' + formatINR(app) + ' each. Application size varies per IPO.';
    }

    saveState({
      ipoBalance: balEl ? balEl.value : '30000',
      ipoAppAmount: appEl ? appEl.value : '15000'
    });
  }

  function restore() {
    var s = loadState();
    var map = {
      monthlyExpenses: 'monthlyExpenses',
      coverMonths: 'coverMonths',
      currentEmergency: 'currentEmergency',
      ipoBalance: 'ipoBalance',
      ipoAppAmount: 'ipoAppAmount'
    };
    Object.keys(map).forEach(function (k) {
      var el = document.getElementById(map[k]);
      if (el && s[k] != null && s[k] !== '') el.value = s[k];
    });
    var bal = document.getElementById('ipoBalance');
    if (bal && !bal.value) bal.value = '30000';
    var app = document.getElementById('ipoAppAmount');
    if (app && !app.value) app.value = '15000';
  }

  function bindPrefill() {
    var exp = document.getElementById('monthlyExpenses');
    var amount = document.getElementById('monthlyAmount');
    if (!exp || !amount) return;
    exp.addEventListener('change', function () {
      if (!amount.value && positive(exp.value) > 0) {
        try {
          if (sessionStorage.getItem('ntf_prefilled_amount') === '1') return;
          amount.value = String(Math.round(positive(exp.value)));
          sessionStorage.setItem('ntf_prefilled_amount', '1');
          amount.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {}
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('emergency')) return;
    restore();
    updateEmergency();
    updateIpo();

    ['monthlyExpenses', 'coverMonths', 'currentEmergency'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateEmergency);
        el.addEventListener('change', updateEmergency);
      }
    });
    ['ipoBalance', 'ipoAppAmount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateIpo);
        el.addEventListener('change', updateIpo);
      }
    });

    bindPrefill();
  });
})();
