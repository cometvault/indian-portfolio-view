/**
 * Gold rates — 4 city cards from data/gold.json (goodreturns.in)
 */

const GOLD_JSON = 'data/gold.json';

async function loadGoldData(force) {
  const btn = document.getElementById('refreshGoldBtn');
  const icon = document.getElementById('refreshGoldIcon');
  const status = document.getElementById('goldLastUpdated');
  if (btn) btn.disabled = true;
  if (icon) icon.innerHTML = '<span class="spinner"></span>';

  try {
    const url = force ? GOLD_JSON + '?t=' + Date.now() : GOLD_JSON;
    const res = await fetch(url, { cache: force ? 'no-store' : 'default' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderGold(data);
    if (status) {
      status.textContent = 'Updated at ' + (data.updated || '—') +
        (data.source ? ' \u00b7 ' + data.source : '');
    }
  } catch (err) {
    console.warn('Gold fetch failed, using fallback', err);
    const fallback = getFallbackGold();
    renderGold(fallback);
    if (status) status.textContent = 'Updated at ' + fallback.updated + ' \u00b7 sample';
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.textContent = '\u21bb';
  }
}

function renderGold(data) {
  const container = document.getElementById('goldCards');
  if (!container) return;
  const cities = data.cities || [];
  if (!cities.length) {
    container.innerHTML = '<p class="empty-cell">Nothing open right now \u2014 check back tomorrow.</p>';
    return;
  }
  container.innerHTML = cities.map(function (c) {
    const change = c.change24k != null
      ? '<span class="city-change ' + (c.change24k >= 0 ? 'positive' : 'negative') + '">' +
        (c.change24k >= 0 ? '+' : '') + '\u20b9' + formatNum(c.change24k) + '</span>'
      : '';
    return (
      '<div class="gold-card">' +
        '<p class="gold-city">' + escapeHtml(c.city) + '</p>' +
        '<div class="gold-rates">' +
          '<div class="gold-rate-row">' +
            '<span class="gold-label">22K / gram</span>' +
            '<span class="gold-price">\u20b9' + formatNum(c.rate22k) + '</span>' +
          '</div>' +
          '<div class="gold-rate-row">' +
            '<span class="gold-label">24K / gram</span>' +
            '<span class="gold-price">\u20b9' + formatNum(c.rate24k) + '</span>' +
          '</div>' +
        '</div>' +
        (change ? '<p class="gold-change-line">24K ' + change + '</p>' : '') +
      '</div>'
    );
  }).join('');
}

function formatNum(n) {
  return Number(n).toLocaleString('en-IN');
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getFallbackGold() {
  return {
    updated: '2026-09-27',
    source: 'goodreturns.in',
    cities: [
      { city: 'Bangalore', rate24k: 15268, rate22k: 13995, change24k: 0 },
      { city: 'Mumbai', rate24k: 15268, rate22k: 13995, change24k: 0 },
      { city: 'Kolkata', rate24k: 15268, rate22k: 13995, change24k: 0 },
      { city: 'Hyderabad', rate24k: 15268, rate22k: 13995, change24k: 0 }
    ]
  };
}

document.addEventListener('DOMContentLoaded', function () {
  loadGoldData(false);
});
