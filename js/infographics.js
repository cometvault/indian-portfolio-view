/**
 * Interactive SVG infographics for portfolio visualisation.
 */

function buildDonut(segments, size) {
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const parts = segments.map(s => {
    const len = (s.pct / 100) * circ;
    const dash = `${len} ${circ - len}`;
    const el = `<circle class="donut-seg" cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="${s.color}" stroke-width="16"
      stroke-dasharray="${dash}" stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"
      data-label="${s.label}" data-pct="${s.pct}">
      <title>${s.label}: ${s.pct}%</title>
    </circle>`;
    offset += len;
    return el;
  }).join('');

  return `
    <svg class="donut-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Allocation donut chart">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="16"/>
      ${parts}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-center-label">Mix</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="donut-center-sub">100%</text>
    </svg>
  `;
}

function buildLifeStageBars() {
  const stages = [
    { age: '20–25', equity: 75, debt: 15, gold: 10 },
    { age: '25–30', equity: 75, debt: 15, gold: 10 },
    { age: '30–40', equity: 60, debt: 25, gold: 15 },
    { age: '40–50', equity: 45, debt: 40, gold: 15 },
    { age: '50+', equity: 30, debt: 55, gold: 15 }
  ];

  return stages.map(s => `
    <div class="stage-row">
      <div class="stage-age">${s.age}</div>
      <div class="stage-bar">
        <div class="stage-fill stage-equity" style="width:${s.equity}%" title="Growth (SIP + Equity) ${s.equity}%">
          <span>${s.equity}%</span>
        </div>
        <div class="stage-fill stage-debt" style="width:${s.debt}%" title="Debt ${s.debt}%">
          <span>${s.debt > 12 ? s.debt + '%' : ''}</span>
        </div>
        <div class="stage-fill stage-gold" style="width:${s.gold}%" title="Gold ${s.gold}%">
          <span>${s.gold > 10 ? s.gold + '%' : ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function buildPyramid() {
  return `
    <div class="pyramid">
      <div class="pyramid-level l1" data-tip="Satellite — higher variability">
        <span>Small Cap</span>
        <small>Satellite</small>
      </div>
      <div class="pyramid-level l2" data-tip="Growth engine of equity sleeve">
        <span>Mid Cap</span>
        <small>Growth core</small>
      </div>
      <div class="pyramid-level l3" data-tip="Stability & liquidity">
        <span>Large Cap</span>
        <small>Ballast</small>
      </div>
      <div class="pyramid-level l4" data-tip="Emergency & near-term goals">
        <span>Debt & Liquid</span>
        <small>Safety net</small>
      </div>
    </div>
  `;
}

function initInfographics() {
  const donutHost = document.getElementById('infographicDonut');
  if (donutHost) {
    const segs = [
      { label: 'Core SIP', pct: 35, color: '#1e40af' },
      { label: 'Direct Equity', pct: 40, color: '#2563eb' },
      { label: 'Debt', pct: 15, color: '#64748b' },
      { label: 'Gold', pct: 10, color: '#b45309' }
    ];
    donutHost.innerHTML = buildDonut(segs, 180) + `
      <ul class="donut-legend">
        ${segs.map(s => `<li><i style="background:${s.color}"></i>${s.label} <strong>${s.pct}%</strong></li>`).join('')}
      </ul>
      <p class="infographic-caption">Example: age 20–25 directional mix (updates when you use the calculator above)</p>
    `;
  }

  const stagesHost = document.getElementById('infographicStages');
  if (stagesHost) {
    stagesHost.innerHTML = `
      <div class="stage-legend">
        <span><i class="swatch-equity"></i> Growth (SIP + Equity)</span>
        <span><i class="swatch-debt"></i> Debt &amp; Emergency</span>
        <span><i class="swatch-gold"></i> Gold</span>
      </div>
      ${buildLifeStageBars()}
      <p class="infographic-caption">How the mix typically shifts as life stage changes — educational only</p>
    `;
  }

  const pyramidHost = document.getElementById('infographicPyramid');
  if (pyramidHost) {
    pyramidHost.innerHTML = buildPyramid() + `
      <p class="infographic-caption">Equity hierarchy: higher layers = higher variability; base = stability</p>
    `;
  }

  document.querySelectorAll('.age-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(syncDonutFromCalculator, 50);
    });
  });
}

function syncDonutFromCalculator() {
  const host = document.getElementById('infographicDonut');
  if (!host || typeof ALLOCATIONS === 'undefined') return;
  const active = document.querySelector('.age-tab.active');
  if (!active) return;
  const a = ALLOCATIONS[active.dataset.age];
  if (!a) return;
  const segs = [
    { label: 'Core SIP', pct: a.sip, color: '#1e40af' },
    { label: 'Direct Equity', pct: a.equity, color: '#2563eb' },
    { label: 'Debt', pct: a.debt, color: '#64748b' },
    { label: 'Gold', pct: a.gold, color: '#b45309' }
  ];
  host.innerHTML = buildDonut(segs, 180) + `
    <ul class="donut-legend">
      ${segs.map(s => `<li><i style="background:${s.color}"></i>${s.label} <strong>${s.pct}%</strong></li>`).join('')}
    </ul>
    <p class="infographic-caption">Live view for selected age bracket · educational only</p>
  `;
}

document.addEventListener('DOMContentLoaded', initInfographics);
