/**
 * IPO data loader
 * Prefers local data/ipo.json (updated by GitHub Action or manual refresh).
 * Falls back to a CORS-friendly public mirror or embedded sample if fetch fails.
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
    renderTables(data);
    if (status) {
      status.textContent = 'Last updated: ' + (data.updated || 'unknown') +
        (data.source ? ' · Source: ' + data.source : '');
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

function rowsHTML(list) {
  if (!list.length) {
    return '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No data available</td></tr>';
  }
  return list.map(item => {
    const gmpClass = (item.gmp > 0) ? 'positive' : (item.gmp < 0 ? 'negative' : 'neutral');
    const statusClass = item.status === 'Open' ? 'badge-open' :
                        item.status === 'Upcoming' ? 'badge-upcoming' : 'badge-closed';
    return `<tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="num ${gmpClass}">${item.gmp != null ? '₹' + item.gmp : '—'}</td>
      <td class="num">₹${escapeHtml(String(item.priceBand || '—'))}</td>
      <td class="num">${escapeHtml(item.estListing || '—')}</td>
      <td>${escapeHtml(item.dates || '—')}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(item.status || '—')}</span></td>
    </tr>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getFallbackIPO() {
  return {
    updated: '2026-09-25 (sample)',
    source: 'ipowatch.in (snapshot)',
    mainboard: [
      { name: 'Orient Cables', gmp: 113, priceBand: '272', estListing: '₹385 (41.54%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'A-One Steels', gmp: 49, priceBand: '405', estListing: '₹454 (12.10%)', dates: '24-28 Sep', status: 'Open' },
      { name: 'Runwal Enterprises', gmp: 30, priceBand: '305', estListing: '₹335 (9.84%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'German Green Steel', gmp: 28, priceBand: '139', estListing: '₹167 (20.14%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'Moneyview', gmp: 14, priceBand: '34', estListing: '₹48 (41.18%)', dates: '24-28 Sep', status: 'Open' },
      { name: 'Adroit Industries', gmp: 34, priceBand: '134', estListing: '₹168 (25.37%)', dates: '23-25 Sep', status: 'Open' },
      { name: 'SRIT India', gmp: 22, priceBand: '130', estListing: '₹152 (16.92%)', dates: '28-30 Sep', status: 'Upcoming' },
      { name: 'Shah Investor’s Home', gmp: 12, priceBand: '167', estListing: '₹179 (7.19%)', dates: '28-30 Sep', status: 'Upcoming' }
    ],
    sme: [
      { name: 'Bench Mark Infotech', gmp: 12, priceBand: '110', estListing: '₹122 (10.91%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'Roopa Screen', gmp: 8, priceBand: '64', estListing: '₹72 (12.50%)', dates: '24-28 Sep', status: 'Open' },
      { name: 'Shree TNB Polymers', gmp: 5, priceBand: '52', estListing: '₹57 (9.62%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'Dudani Retail', gmp: 3, priceBand: '29', estListing: '₹32 (10.34%)', dates: '25-29 Sep', status: 'Open' },
      { name: 'Liqvd Digital', gmp: 3, priceBand: '54', estListing: '₹57 (5.56%)', dates: '23-25 Sep', status: 'Open' }
    ]
  };
}

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', () => loadIPOData(false));
