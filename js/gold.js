/**
 * Gold rates loader
 * Uses local data/gold.json (updated nightly or on refresh).
 */

const GOLD_JSON = 'data/gold.json';

async function loadGoldData(force = false) {
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
      status.textContent = 'Last updated: ' + (data.updated || 'unknown') +
        (data.note ? ' · ' + data.note : '');
    }
  } catch (err) {
    console.warn('Gold JSON fetch failed, using embedded fallback', err);
    const fallback = getFallbackGold();
    renderGold(fallback);
    if (status) status.textContent = 'Using cached sample data · ' + fallback.updated;
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.textContent = '↻';
  }
}

function renderGold(data) {
  const container = document.getElementById('goldCards');
  if (!container) return;
  const cities = data.cities || [];
  container.innerHTML = cities.map(c => `
    <div class="card">
      <div class="card-title">${escapeHtml(c.city)}</div>
      <div class="city-rate">
        <span class="city-name">24 Carat</span>
        <span class="city-price">₹${formatNum(c.rate24k)} / 10 g</span>
      </div>
      <div class="city-rate">
        <span class="city-name">22 Carat</span>
        <span class="city-price">₹${formatNum(c.rate22k)} / 10 g</span>
      </div>
      ${c.change24k != null ? `<div class="card-sub" style="margin-top:0.75rem">
        24K change: <span class="${c.change24k >= 0 ? 'positive' : 'negative'}">${c.change24k >= 0 ? '+' : ''}₹${c.change24k}</span>
      </div>` : ''}
    </div>
  `).join('');
}

function formatNum(n) {
  return Number(n).toLocaleString('en-IN');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getFallbackGold() {
  // Approximate retail rates around 25 Sep 2026 (illustrative)
  return {
    updated: '2026-09-25 (sample)',
    note: 'Indicative retail quotes; actual rates vary by jeweller',
    cities: [
      { city: 'Mumbai', rate24k: 152840, rate22k: 140100, change24k: 160 },
      { city: 'Bangalore', rate24k: 152840, rate22k: 140100, change24k: 160 },
      { city: 'Hyderabad', rate24k: 152840, rate22k: 140100, change24k: 160 },
      { city: 'Kolkata', rate24k: 152840, rate22k: 140100, change24k: 160 }
    ]
  };
}

document.addEventListener('DOMContentLoaded', () => loadGoldData(false));
