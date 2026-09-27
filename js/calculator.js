/**
 * Age-based portfolio allocation calculator
 * Bars tween via CSS flex transition when age bracket changes.
 */

const ALLOCATIONS = {
  '20-25': {
    focus: 'Aggressive compounding & wealth foundation',
    notes: 'Maximum risk capacity. Zero big financial dependents.',
    sip: 35, sipDetail: 'Nifty 50 + Flexi-Cap style core (category-level)',
    equity: 40, equityDetail: '50% Mid \u00b7 30% Small \u00b7 20% Large within satellite',
    debt: 15, debtDetail: '3\u20136 months liquid corpus',
    gold: 10, goldDetail: 'Gold ETF / SGB style exposure'
  },
  '25-30': {
    focus: 'Career scaling, marriage, house down-payment',
    notes: 'Protect short-term goal money in liquid funds ~2 years prior.',
    sip: 40, sipDetail: 'Flexi-Cap + Large-Cap style core',
    equity: 35, equityDetail: '40% Mid \u00b7 30% Small \u00b7 30% Large within satellite',
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
  return '\u20b9' + Math.round(n).toLocaleString('en-IN');
}

function renderAllocation(key) {
  const a = ALLOCATIONS[key];
  if (!a) return;

  const result = document.getElementById('calcResult');
  const focus = document.getElementById('calcFocus');
  const notes = document.getElementById('calcNotes');
  const bar = document.getElementById('calcBar');
  const legend = document.getElementById('calcLegend');
  const details = document.getElementById('calcDetails');
  const amountEl = document.getElementById('monthlyAmount');
  const breakdown = document.getElementById('amountBreakdown');

  if (focus) focus.textContent = a.focus;
  if (notes) notes.textContent = a.notes;

  if (bar) {
    let segs = bar.querySelectorAll('.alloc-segment');
    if (segs.length !== 4) {
      bar.innerHTML =
        '<div class="alloc-segment alloc-sip" style="flex:' + a.sip + '">' + a.sip + '%</div>' +
        '<div class="alloc-segment alloc-equity" style="flex:' + a.equity + '">' + a.equity + '%</div>' +
        '<div class="alloc-segment alloc-debt" style="flex:' + a.debt + '">' + a.debt + '%</div>' +
        '<div class="alloc-segment alloc-gold" style="flex:' + a.gold + '">' + a.gold + '%</div>';
    } else {
      const vals = [a.sip, a.equity, a.debt, a.gold];
      const labels = ['SIP', 'Equity', 'Debt', 'Gold'];
      segs.forEach(function (el, i) {
        el.style.flex = vals[i];
        el.textContent = vals[i] + '% ' + labels[i];
      });
    }
  }

  if (legend) {
    legend.innerHTML =
      '<span class="legend-sip">SIP ' + a.sip + '%</span>' +
      '<span class="legend-equity">Equity ' + a.equity + '%</span>' +
      '<span class="legend-debt">Debt ' + a.debt + '%</span>' +
      '<span class="legend-gold">Gold ' + a.gold + '%</span>';
  }

  if (details) {
    details.innerHTML =
      '<div class="calc-detail"><h4>SIP</h4><div class="pct">' + a.sip + '%</div><p>' + a.sipDetail + '</p></div>' +
      '<div class="calc-detail"><h4>Equity</h4><div class="pct">' + a.equity + '%</div><p>' + a.equityDetail + '</p></div>' +
      '<div class="calc-detail"><h4>Debt</h4><div class="pct">' + a.debt + '%</div><p>' + a.debtDetail + '</p></div>' +
      '<div class="calc-detail"><h4>Gold</h4><div class="pct">' + a.gold + '%</div><p>' + a.goldDetail + '</p></div>';
  }

  const amount = parseFloat(amountEl && amountEl.value) || 0;
  if (breakdown) {
    if (amount > 0) {
      breakdown.innerHTML =
        'Of <span>' + formatINR(amount) + '</span> / month \u2192 ' +
        'SIP <span>' + formatINR(amount * a.sip / 100) + '</span> \u00b7 ' +
        'Equity <span>' + formatINR(amount * a.equity / 100) + '</span> \u00b7 ' +
        'Debt <span>' + formatINR(amount * a.debt / 100) + '</span> \u00b7 ' +
        'Gold <span>' + formatINR(amount * a.gold / 100) + '</span>';
    } else {
      breakdown.textContent = '';
    }
  }

  if (result) result.classList.add('visible');
  document.dispatchEvent(new CustomEvent('allocation-change', { detail: { key: key, alloc: a } }));
}

function initCalculator() {
  const tabs = document.querySelectorAll('.age-tab');
  const amountInput = document.getElementById('monthlyAmount');
  let current = null;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      current = tab.dataset.age;
      renderAllocation(current);
    });
  });

  if (amountInput) {
    amountInput.addEventListener('input', function () {
      if (current) renderAllocation(current);
    });
  }

  if (tabs.length) tabs[0].click();
}

document.addEventListener('DOMContentLoaded', initCalculator);
