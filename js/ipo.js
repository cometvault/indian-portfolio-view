/**
 * IPO data loader
 * Prefers local data/ipo.json (updated by GitHub Action or manual refresh).
 */

const IPO_JSON = 'data/ipo.json';

async function loadIPOData(force = false) {
  const btn = document.getElementById('refreshBtn');
  const icon = document.getElementById('refreshIcon');
  const status = document.getElementById('lastUpdated');
  if (btn) btn.disabled = true;
  if (icon) icon.innerHTML = '<span class="spinner"></span>';

  try {
    const url = force ? IPO_JSON + '?t=' + Date.now() : IPO_JSON;
    const res = await fetch(url, { cache: force ? 'no-store' : 'default' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const clean = (window.PVSecurity && PVSecurity.sanitizeIpoData)
      ? PVSecurity.sanitizeIpoData(data) : data;
    if (!clean) throw new Error('Invalid IPO payload');
    renderTables(clean);
    if (status) {
      status.textContent = 'Last updated: ' + (clean.updated || 'unknown') +
        (clean.source ? ' · Source: ' + clean.source : '');
    }
  } catch (err) {
    console.warn('IPO JSON fetch failed, using embedded fallback', err);
    const fallback = getFallbackIPO();
    renderTables(fallback);
    if (status) status.textContent = 'Using cached sample data · ' + fallback.updated;
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.textContent = '↻';
  }
}

function renderTables(data) {
  const mainBody = document.getElementById('mainboardBody');
  const smeBody = document.getElementById('smeBody');
  if (mainBody) mainBody.innerHTML = rowsHTML(data.mainboard || []);
  if (smeBody) smeBody.innerHTML = rowsHTML(data.sme || []);
}

function parseUpperPrice(band) {
  if (band == null || band === '') return null;
  const nums = String(band).replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return null;
  return parseFloat(nums[nums.length - 1]);
}

function gmpPercent(gmp, band) {
  const price = parseUpperPrice(band);
  if (price == null || !price || gmp == null) return null;
  return (Number(gmp) / price) * 100;
}

function rowsHTML(list) {
  if (!list.length) {
    return '<tr><td colspan="7" class="empty-cell">Nothing open right now — check back tomorrow.</td></tr>';
  }
  return list.map(function (item) {
    const gmpClass = (item.gmp > 0) ? 'positive' : (item.gmp < 0 ? 'negative' : 'neutral');
    const st = normalizeStatus(item.status);
    const statusClass = st === 'Open' ? 'badge-open'
      : st === 'Upcoming' ? 'badge-upcoming'
      : st === 'Listed' ? 'badge-open'
      : 'badge-closed';
    const dates = String(item.dates || item.opens || '—').split(/[-–—]/);
    const opens = (item.opens || dates[0] || '—').toString().trim();
    const closes = (item.closes || dates[1] || dates[0] || '—').toString().trim();
    const pct = gmpPercent(item.gmp, item.priceBand);
    const pctStr = pct == null ? '—' : (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    return '<tr>' +
      '<td>' + escapeHtml(item.name) + '</td>' +
      '<td class="num">₹' + escapeHtml(String(item.priceBand || '—')) + '</td>' +
      '<td class="num ' + gmpClass + '">' + (item.gmp != null ? '₹' + item.gmp : '—') + '</td>' +
      '<td class="num ' + gmpClass + '">' + pctStr + '</td>' +
      '<td>' + escapeHtml(opens) + '</td>' +
      '<td>' + escapeHtml(closes) + '</td>' +
      '<td><span class="badge ' + statusClass + '">' + escapeHtml(st) + '</span></td>' +
      '</tr>';
  }).join('');
}

function normalizeStatus(s) {
  if (!s) return '—';
  const t = String(s).toLowerCase();
  if (t.includes('open') && !t.includes('up')) return 'Open';
  if (t.includes('upcom')) return 'Upcoming';
  if (t.includes('list')) return 'Listed';
  if (t.includes('close') || t.includes('allot')) return 'Closed';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(str) {
  if (window.PVSecurity) return PVSecurity.escapeHtml(str);
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function getFallbackIPO() {
  return {
    updated: '2026-09-25 (sample)',
    source: 'ipowatch.in (snapshot)',
    mainboard: [
      { name: 'Orient Cables', gmp: 113, priceBand: '272', dates: '25-29 Sep', status: 'Open' },
      { name: 'A-One Steels', gmp: 49, priceBand: '405', dates: '24-28 Sep', status: 'Open' },
      { name: 'Runwal Enterprises', gmp: 30, priceBand: '305', dates: '25-29 Sep', status: 'Open' },
      { name: 'German Green Steel', gmp: 28, priceBand: '139', dates: '25-29 Sep', status: 'Open' },
      { name: 'Moneyview', gmp: 14, priceBand: '34', dates: '24-28 Sep', status: 'Open' },
      { name: 'Adroit Industries', gmp: 34, priceBand: '134', dates: '23-25 Sep', status: 'Open' },
      { name: 'SRIT India', gmp: 22, priceBand: '130', dates: '28-30 Sep', status: 'Upcoming' },
      { name: "Shah Investor's Home", gmp: 12, priceBand: '167', dates: '28-30 Sep', status: 'Upcoming' }
    ],
    sme: [
      { name: 'Bench Mark Infotech', gmp: 12, priceBand: '110', dates: '25-29 Sep', status: 'Open' },
      { name: 'Roopa Screen', gmp: 8, priceBand: '64', dates: '24-28 Sep', status: 'Open' },
      { name: 'Shree TNB Polymers', gmp: 5, priceBand: '52', dates: '25-29 Sep', status: 'Open' },
      { name: 'Dudani Retail', gmp: 3, priceBand: '29', dates: '25-29 Sep', status: 'Open' },
      { name: 'Liqvd Digital', gmp: 3, priceBand: '54', dates: '23-25 Sep', status: 'Open' }
    ]
  };
}

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', function () { loadIPOData(true); });
  loadIPOData(false);
});
