/**
 * Interactive SVG charts \u2014 pure SVG + CSS transitions (no Chart.js).
 * Hosts: #infographicDonut, #infographicStages, #infographicPyramid
 */

const SEG = {
  sip: '#1e4d8c',
  equity: '#2b6cb0',
  debt: '#5a6a7a',
  gold: '#b8860b',
  mid: '#2b6cb0',
  large: '#1a3355',
  small: '#5b9bd5'
};

const LIFE_STAGES = [
  { age: '20\u201325', equity: 75, debt: 15, gold: 10 },
  { age: '25\u201330', equity: 75, debt: 15, gold: 10 },
  { age: '30\u201340', equity: 60, debt: 25, gold: 15 },
  { age: '40\u201350', equity: 45, debt: 40, gold: 15 },
  { age: '50+', equity: 30, debt: 55, gold: 15 }
];

function buildDonutSVG(segments, size) {
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(function (s) {
    const len = (s.pct / 100) * circ;
    const dash = len + ' ' + (circ - len);
    const el = '<circle class="donut-seg" cx="' + cx + '" cy="' + cy + '" r="' + r +
      '" stroke="' + s.color + '" stroke-width="18" stroke-dasharray="' + dash +
      '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')">' +
      '<title>' + s.label + ': ' + s.pct + '%</title></circle>';
    offset += len;
    return el;
  }).join('');
  return '<div class="donut-wrap"><svg class="donut-svg" width="' + size + '" height="' + size +
    '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Allocation donut">' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e2e8f0" stroke-width="18"/>' +
    arcs + '</svg><div class="donut-center"><span class="donut-center-label">Mix</span>' +
    '<span class="donut-center-sub">100%</span></div></div>';
}

function renderDonut(host, segments) {
  if (!host) return;
  host.innerHTML = buildDonutSVG(segments, 180) +
    '<ul class="donut-legend">' +
    segments.map(function (s) {
      return '<li><i style="background:' + s.color + '"></i>' + s.label +
        '<strong>' + s.pct + '%</strong></li>';
    }).join('') +
    '</ul><p class="infographic-caption">Updates with the age bracket selected above \u00b7 educational only</p>';
}

function renderStages(host) {
  if (!host) return;
  host.innerHTML =
    '<div class="stage-legend">' +
    '<span><i class="swatch-equity"></i> Growth (SIP + Equity)</span>' +
    '<span><i class="swatch-debt"></i> Debt &amp; Emergency</span>' +
    '<span><i class="swatch-gold"></i> Gold</span></div>' +
    LIFE_STAGES.map(function (s) {
      return '<div class="stage-row"><div class="stage-age">' + s.age + '</div>' +
        '<div class="stage-bar">' +
        '<div class="stage-fill stage-equity" style="width:0%" data-w="' + s.equity + '"><span>' + s.equity + '%</span></div>' +
        '<div class="stage-fill stage-debt" style="width:0%" data-w="' + s.debt + '"><span>' + (s.debt > 12 ? s.debt + '%' : '') + '</span></div>' +
        '<div class="stage-fill stage-gold" style="width:0%" data-w="' + s.gold + '"><span>' + (s.gold > 10 ? s.gold + '%' : '') + '</span></div>' +
        '</div></div>';
    }).join('') +
    '<p class="infographic-caption">How the mix typically shifts by life stage \u2014 educational only</p>';
  requestAnimationFrame(function () {
    host.querySelectorAll('.stage-fill').forEach(function (el) {
      el.style.width = el.dataset.w + '%';
    });
  });
}

function renderHierarchy(host) {
  if (!host) return;
  var rows = [
    { cls: 'hierarchy-mid', label: 'Mid Cap', pct: 50 },
    { cls: 'hierarchy-large', label: 'Large Cap', pct: 30 },
    { cls: 'hierarchy-small', label: 'Small Cap', pct: 20 }
  ];
  host.innerHTML = '<div class="hierarchy">' +
    rows.map(function (r) {
      return '<div class="hierarchy-row ' + r.cls + '">' +
        '<span class="hierarchy-label">' + r.label + '</span>' +
        '<div class="hierarchy-track"><div class="hierarchy-fill" style="width:0%" data-w="' + r.pct + '"></div></div>' +
        '<span class="hierarchy-pct">' + r.pct + '%</span></div>';
    }).join('') +
    '</div><p class="infographic-caption">Illustrative equity sleeve \u00b7 Mid 50 \u00b7 Large 30 \u00b7 Small 20</p>';
  requestAnimationFrame(function () {
    host.querySelectorAll('.hierarchy-fill').forEach(function (el) {
      el.style.width = el.dataset.w + '%';
    });
  });
}

function defaultSegments() {
  return [
    { label: 'Core SIP', pct: 35, color: SEG.sip },
    { label: 'Direct Equity', pct: 40, color: SEG.equity },
    { label: 'Debt', pct: 15, color: SEG.debt },
    { label: 'Gold', pct: 10, color: SEG.gold }
  ];
}

function segsFromAlloc(a) {
  return [
    { label: 'Core SIP', pct: a.sip, color: SEG.sip },
    { label: 'Direct Equity', pct: a.equity, color: SEG.equity },
    { label: 'Debt', pct: a.debt, color: SEG.debt },
    { label: 'Gold', pct: a.gold, color: SEG.gold }
  ];
}

function observeCards() {
  var cards = document.querySelectorAll('.infographic-card');
  if (!cards.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(function (c) { io.observe(c); });
}

function initInfographics() {
  var donutHost = document.getElementById('infographicDonut');
  var stagesHost = document.getElementById('infographicStages');
  var pyramidHost = document.getElementById('infographicPyramid');
  renderDonut(donutHost, defaultSegments());
  renderStages(stagesHost);
  renderHierarchy(pyramidHost);
  observeCards();
  document.addEventListener('allocation-change', function (e) {
    if (e.detail && e.detail.alloc) {
      renderDonut(donutHost, segsFromAlloc(e.detail.alloc));
    }
  });
}

document.addEventListener('DOMContentLoaded', initInfographics);
