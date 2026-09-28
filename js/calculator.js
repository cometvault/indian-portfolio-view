/**
 * Age-based portfolio allocation calculator
 * Interactive pie chart: data left, chart right.
 */

const SEG = {
  sip:    { color: '#2563eb', soft: '#dbeafe', label: 'SIP' },
  equity: { color: '#06b6d4', soft: '#cffafe', label: 'Equity' },
  debt:   { color: '#8b5cf6', soft: '#ede9fe', label: 'Debt' },
  gold:   { color: '#f59e0b', soft: '#fef3c7', label: 'Gold' }
};

const ALLOCATIONS = {
  '20-25': {
    focus: 'Aggressive compounding & wealth foundation',
    notes: 'Maximum risk capacity. Zero big financial dependents.',
    sip: 35, sipDetail: 'Nifty 50 + Flexi-Cap style core (category-level)',
    equity: 40, equityDetail: '50% Mid · 30% Small · 20% Large within satellite',
    debt: 15, debtDetail: '3-6 months liquid corpus',
    gold: 10, goldDetail: 'Gold ETF / SGB style exposure'
  },
  '25-30': {
    focus: 'Career scaling, marriage, house down-payment',
    notes: 'Protect short-term goal money in liquid funds ~2 years prior.',
    sip: 40, sipDetail: 'Flexi-Cap + Large-Cap style core',
    equity: 35, equityDetail: '40% Mid · 30% Small · 30% Large within satellite',
    debt: 15, debtDetail: 'Expand corpus for short-term goals',
    gold: 10, goldDetail: 'Gold ETF style exposure'
  },
  '30-40': {
    focus: "Kids' education, family security, home loan",
    notes: 'Shift focus from stock picking to systematic index accumulation.',
    sip: 40, sipDetail: 'Flexi-Cap + Multi-Cap style core',
    equity: 20, equityDetail: 'Quality Mid / Large focus within satellite',
    debt: 25, debtDetail: '6 mo emergency + debt funds / PPF style',
    gold: 15, goldDetail: 'Portfolio cushion'
  },
  '40-50': {
    focus: 'Retirement readiness, higher education funding',
    notes: 'De-risk as dependents enter higher education. Rebalance annually.',
    sip: 35, sipDetail: 'Large-Cap / Hybrid style core',
    equity: 10, equityDetail: 'High-quality dividend / large-cap style stocks',
    debt: 40, debtDetail: 'Debt mutual funds, PPF, Sukanya / PF style',
    gold: 15, goldDetail: 'Hedge'
  },
  '50+': {
    focus: 'Capital preservation, SWP, legacy planning',
    notes: 'Transition to Systematic Withdrawal Plans (SWP) for monthly income.',
    sip: 25, sipDetail: 'Conservative Hybrid / Multi-Asset style',
    equity: 5, equityDetail: 'Large-cap blue chips only',
    debt: 55, debtDetail: 'Senior Citizen Savings, FD, SWP style',
    gold: 15, goldDetail: 'Legacy asset'
  }
};

function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function buildPieSVG(segments, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const inner = r * 0.58;
  let angle = 0;
  const paths = [];
  segments.forEach(function (s) {
    const sweep = (s.pct / 100) * 360;
    if (sweep <= 0) return;
    const start = angle;
    const end = angle + sweep;
    const large = sweep > 180 ? 1 : 0;
    const p1 = polar(cx, cy, r, start);
    const p2 = polar(cx, cy, r, end);
    const p3 = polar(cx, cy, inner, end);
    const p4 = polar(cx, cy, inner, start);
    const d = ['M', p1.x, p1.y, 'A', r, r, 0, large, 1, p2.x, p2.y, 'L', p3.x, p3.y, 'A', inner, inner, 0, large, 0, p4.x, p4.y, 'Z'].join(' ');
    paths.push('<path class="pie-slice" data-key="' + s.key + '" d="' + d + '" fill="' + s.color + '" stroke="#fff" stroke-width="3"><title>' + s.label + ': ' + s.pct + '%</title></path>');
    angle = end;
  });
  return '<svg class="pie-svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="Allocation pie">' + paths.join('') + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (inner - 2) + '" fill="#fff"/><text class="pie-center-label" x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle">Mix</text><text class="pie-center-pct" x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle">100%</text></svg>';
}

function renderAllocation(key) {
  const a = ALLOCATIONS[key];
  if (!a) return;
  const result = document.getElementById('calcResult');
  const focus = document.getElementById('calcFocus');
  const notes = document.getElementById('calcNotes');
  const pieHost = document.getElementById('calcPie');
  const legend = document.getElementById('calcLegend');
  const details = document.getElementById('calcDetails');
  const amountEl = document.getElementById('monthlyAmount');
  const breakdown = document.getElementById('amountBreakdown');
  if (focus) focus.textContent = a.focus;
  if (notes) notes.textContent = a.notes;
  const segments = [
    { key: 'sip', label: SEG.sip.label, pct: a.sip, color: SEG.sip.color, soft: SEG.sip.soft, detail: a.sipDetail },
    { key: 'equity', label: SEG.equity.label, pct: a.equity, color: SEG.equity.color, soft: SEG.equity.soft, detail: a.equityDetail },
    { key: 'debt', label: SEG.debt.label, pct: a.debt, color: SEG.debt.color, soft: SEG.debt.soft, detail: a.debtDetail },
    { key: 'gold', label: SEG.gold.label, pct: a.gold, color: SEG.gold.color, soft: SEG.gold.soft, detail: a.goldDetail }
  ];
  if (pieHost) {
    pieHost.innerHTML = buildPieSVG(segments, 220);
    pieHost.querySelectorAll('.pie-slice').forEach(function (slice) {
      slice.addEventListener('mouseenter', function () {
        pieHost.querySelectorAll('.pie-slice').forEach(function (s) { s.classList.remove('is-active'); s.classList.add('is-dim'); });
        slice.classList.add('is-active'); slice.classList.remove('is-dim');
        const k = slice.getAttribute('data-key');
        if (legend) legend.querySelectorAll('.pie-row').forEach(function (row) { row.classList.toggle('is-active', row.getAttribute('data-key') === k); });
      });
      slice.addEventListener('mouseleave', function () {
        pieHost.querySelectorAll('.pie-slice').forEach(function (s) { s.classList.remove('is-active', 'is-dim'); });
        if (legend) legend.querySelectorAll('.pie-row').forEach(function (row) { row.classList.remove('is-active'); });
      });
    });
  }
  if (legend) {
    const amount = parseFloat(amountEl && amountEl.value) || 0;
    legend.innerHTML = segments.map(function (s) {
      const rupee = amount > 0 ? '<span class="pie-rupee">' + formatINR(amount * s.pct / 100) + '</span>' : '';
      return '<div class="pie-row" data-key="' + s.key + '" style="--seg:' + s.color + ';--soft:' + s.soft + '"><span class="pie-dot"></span><span class="pie-label">' + s.label + '</span><span class="pie-pct">' + s.pct + '%</span>' + rupee + '</div>';
    }).join('');
    legend.querySelectorAll('.pie-row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        const k = row.getAttribute('data-key');
        if (pieHost) pieHost.querySelectorAll('.pie-slice').forEach(function (s) { const match = s.getAttribute('data-key') === k; s.classList.toggle('is-active', match); s.classList.toggle('is-dim', !match); });
        row.classList.add('is-active');
      });
      row.addEventListener('mouseleave', function () {
        if (pieHost) pieHost.querySelectorAll('.pie-slice').forEach(function (s) { s.classList.remove('is-active', 'is-dim'); });
        row.classList.remove('is-active');
      });
    });
  }
  if (details) {
    details.innerHTML = segments.map(function (s) {
      return '<div class="calc-detail" style="border-left:3px solid ' + s.color + '"><h4>' + s.label + '</h4><div class="pct">' + s.pct + '%</div><p>' + s.detail + '</p></div>';
    }).join('');
  }
  const amount = parseFloat(amountEl && amountEl.value) || 0;
  if (breakdown) {
    if (amount > 0) {
      breakdown.innerHTML = 'Of <span>' + formatINR(amount) + '</span> / month → ' + segments.map(function (s) { return s.label + ' <span>' + formatINR(amount * s.pct / 100) + '</span>'; }).join(' · ');
    } else {
      breakdown.textContent = '';
    }
  }
  if (result) result.classList.add('visible');
}

function loadCalcState() {
  try {
    var raw = localStorage.getItem('portfolioView_ntf_v1');
    if (!raw) return {};
    var o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : {};
  } catch (e) {
    return {};
  }
}

function saveCalcState(partial) {
  try {
    var cur = loadCalcState();
    Object.keys(partial).forEach(function (k) { cur[k] = partial[k]; });
    localStorage.setItem('portfolioView_ntf_v1', JSON.stringify(cur));
  } catch (e) {}
  if (window.PVAuth && typeof window.PVAuth.savePrefs === 'function') {
    window.PVAuth.savePrefs(partial);
  }
}

function initCalculator() {
  const tabs = document.querySelectorAll('.age-tab');
  const amountInput = document.getElementById('monthlyAmount');
  if (!tabs.length) return;
  let current = null;
  const saved = loadCalcState();
  if (amountInput && saved.monthlyAmount != null && saved.monthlyAmount !== '') {
    amountInput.value = saved.monthlyAmount;
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      current = tab.dataset.age;
      saveCalcState({ ageBracket: current });
      renderAllocation(current);
    });
  });
  if (amountInput) {
    amountInput.addEventListener('input', function () {
      saveCalcState({ monthlyAmount: amountInput.value });
      if (current) renderAllocation(current);
    });
  }
  var start = saved.ageBracket || null;
  var matched = false;
  if (start) {
    tabs.forEach(function (tab) {
      if (tab.dataset.age === start) {
        tab.click();
        matched = true;
      }
    });
  }
  if (!matched && tabs.length) tabs[0].click();
}

document.addEventListener('DOMContentLoaded', function () {
  initCalculator();
  if (window.PVAuth && typeof window.PVAuth.loadPrefs === 'function') {
    window.PVAuth.loadPrefs().then(function (prefs) {
      if (!prefs) return;
      var amountInput = document.getElementById('monthlyAmount');
      if (amountInput && prefs.monthlyAmount != null && prefs.monthlyAmount !== '') {
        amountInput.value = prefs.monthlyAmount;
      }
      if (prefs.ageBracket) {
        document.querySelectorAll('.age-tab').forEach(function (tab) {
          if (tab.dataset.age === prefs.ageBracket) tab.click();
        });
      } else if (amountInput && amountInput.value) {
        amountInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }).catch(function () {});
  }
});
