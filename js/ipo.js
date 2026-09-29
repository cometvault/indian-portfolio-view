/**
 * IPO data loader with Open / Upcoming / Closed filters.
 * Prefers local data/ipo.json (updated by GitHub Action or manual refresh).
 */

const IPO_JSON = 'data/ipo.json';

var currentFilter = 'Open';
var lastIpoData = null;

async function loadIPOData(force) {
  force = !!force;
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
    lastIpoData = clean;
    renderTables(clean);
    if (status) {
      status.textContent = 'Last updated: ' + (clean.updated || 'unknown') +
        (clean.source ? ' · Source: ' + clean.source : '');
    }
  } catch (err) {
    console.warn('IPO JSON fetch failed, using embedded fallback', err);
    const fallback = getFallbackIPO();
    lastIpoData = fallback;
    renderTables(fallback);
    if (status) status.textContent = 'Using cached sample data · ' + fallback.updated;
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.textContent = '↻';
  }
}

function statusBucket(st) {
  var n = normalizeStatus(st);
  if (n === 'Open') return 'Open';
  if (n === 'Upcoming') return 'Upcoming';
  return 'Closed';
}

function filterByStatus(list, filter) {
  if (!list || !list.length) return [];
  return list.filter(function (item) {
    return statusBucket(item.status) === filter;
  });
}

function renderTables(data) {
  data = data || lastIpoData;
  if (!data) return;
  var main = filterByStatus(data.mainboard || [], currentFilter);
  var sme = filterByStatus(data.sme || [], currentFilter);
  var mainBody = document.getElementById('mainboardBody');
  var smeBody = document.getElementById('smeBody');
  if (mainBody) mainBody.innerHTML = rowsHTML(main, currentFilter);
  if (smeBody) smeBody.innerHTML = rowsHTML(sme, currentFilter);
  updateFilterCounts(data);
}

function updateFilterCounts(data) {
  data = data || lastIpoData;
  if (!data) return;
  var all = (data.mainboard || []).concat(data.sme || []);
  var counts = { Open: 0, Upcoming: 0, Closed: 0 };
  all.forEach(function (item) {
    var b = statusBucket(item.status);
    if (counts[b] != null) counts[b]++;
  });
  document.querySelectorAll('.ipo-filter-btn').forEach(function (btn) {
    var st = btn.getAttribute('data-status');
    var label = st;
    if (counts[st] != null) label = st + ' (' + counts[st] + ')';
    btn.textContent = label;
  });
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

function rowsHTML(list, filter) {
  if (!list.length) {
    var msg = filter === 'Open'
      ? 'Nothing open right now — check back tomorrow.'
      : filter === 'Upcoming'
        ? 'No upcoming IPOs in this list right now.'
        : 'No closed IPOs in this list right now.';
    return '<tr><td colspan="7" class="empty-cell">' + msg + '</td></tr>';
  }
  return list.map(function (item) {
    const gmpClass = (item.gmp > 0) ? 'positive' : (item.gmp < 0 ? 'negative' : 'neutral');
    const st = normalizeStatus(item.status);
    const statusClass = st === 'Open' ? 'badge-open'
      : st === 'Upcoming' ? 'badge-upcoming'
      : st === 'Listed' ? 'badge-open'
      : 'badge-closed';
    var opens = (item.opens || '').toString().trim();
    var closes = (item.closes || '').toString().trim();
    if (!opens && !closes && item.dates) {
      var raw = String(item.dates).replace(/\s+/g, ' ').trim();
      var m = raw.match(/^(\d{1,2})\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]{3,9})\.?$/i);
      if (m) {
        opens = m[1] + ' ' + m[3];
        closes = m[2] + ' ' + m[3];
      } else {
        var parts = raw.split(/\s*[-–—]\s*/);
        opens = (parts[0] || '—').trim();
        closes = (parts[1] || parts[0] || '—').trim();
      }
    }
    if (!opens) opens = '—';
    if (!closes) closes = '—';
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
      { name: "Shah Investor's Home", gmp: 12, priceBand: '167', dates: '28-30 Sep', status: 'Upcoming' },
      { name: 'Sample Closed Co', gmp: 5, priceBand: '100', dates: '10-12 Sep', status: 'Closed' }
    ],
    sme: [
      { name: 'Bench Mark Infotech', gmp: 12, priceBand: '110', dates: '25-29 Sep', status: 'Open' },
      { name: 'Roopa Screen', gmp: 8, priceBand: '64', dates: '24-28 Sep', status: 'Open' },
      { name: 'Shree TNB Polymers', gmp: 5, priceBand: '52', dates: '25-29 Sep', status: 'Open' },
      { name: 'Dudani Retail', gmp: 3, priceBand: '29', dates: '25-29 Sep', status: 'Open' },
      { name: 'Liqvd Digital', gmp: 3, priceBand: '54', dates: '23-25 Sep', status: 'Open' },
      { name: 'Past SME Issue', gmp: 2, priceBand: '40', dates: '1-3 Sep', status: 'Closed' }
    ]
  };
}

function initFilters() {
  document.querySelectorAll('.ipo-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var st = btn.getAttribute('data-status');
      if (!st) return;
      currentFilter = st;
      document.querySelectorAll('.ipo-filter-btn').forEach(function (b) {
        var on = b.getAttribute('data-status') === st;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderTables(lastIpoData);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initFilters();
  var btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', function () { loadIPOData(true); });
  loadIPOData(false);
});
