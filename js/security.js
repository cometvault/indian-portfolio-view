/**
 * Client-side safety helpers for Portfolio View.
 * Static site — no backend. These reduce XSS risk from scraped JSON
 * and tighten runtime behaviour.
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    if (str == null) return '';
    var s = String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value == null ? '' : String(value);
  }

  function safeNumber(v) {
    if (v == null || v === '') return null;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : null;
  }

  function safeStatus(v) {
    var s = String(v || '').trim().toLowerCase();
    var allowed = {
      upcoming: 'Upcoming',
      open: 'Open',
      closed: 'Closed',
      listed: 'Listed',
      active: 'Open'
    };
    return allowed[s] || 'Upcoming';
  }

  function safeLabel(v, maxLen) {
    maxLen = maxLen || 80;
    var s = String(v == null ? '' : v)
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (s.length > maxLen) s = s.slice(0, maxLen - 1) + '\u2026';
    return s;
  }

  function sanitizeIpoData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    function row(item) {
      if (!item || typeof item !== 'object') return null;
      var name = safeLabel(item.name, 60);
      if (!name) return null;
      return {
        name: name,
        priceBand: safeLabel(item.priceBand, 24),
        gmp: safeNumber(item.gmp),
        opens: safeLabel(item.opens, 16),
        closes: safeLabel(item.closes, 16),
        status: safeStatus(item.status)
      };
    }
    function list(arr) {
      if (!Array.isArray(arr)) return [];
      return arr.map(row).filter(Boolean).slice(0, 80);
    }
    return {
      updated: safeLabel(raw.updated, 32),
      source: safeLabel(raw.source, 40),
      mainboard: list(raw.mainboard),
      sme: list(raw.sme)
    };
  }

  function sanitizeGoldData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var citiesIn = Array.isArray(raw.cities) ? raw.cities : [];
    var cities = citiesIn
      .map(function (c) {
        if (!c || typeof c !== 'object') return null;
        var city = safeLabel(c.city, 24);
        if (!city) return null;
        return {
          city: city,
          rate22k: safeNumber(c.rate22k),
          rate24k: safeNumber(c.rate24k),
          change24k: safeNumber(c.change24k) || 0
        };
      })
      .filter(Boolean)
      .slice(0, 8);
    if (!cities.length) return null;
    return {
      updated: safeLabel(raw.updated, 32),
      source: safeLabel(raw.source, 40),
      note: safeLabel(raw.note, 120),
      cities: cities
    };
  }

  function safeDataUrl(path) {
    if (typeof path !== 'string') return null;
    if (path.indexOf('..') !== -1) return null;
    if (!/^data\/[a-z0-9._-]+\.json$/i.test(path)) return null;
    return path;
  }

  global.PVSecurity = {
    escapeHtml: escapeHtml,
    safeText: safeText,
    safeNumber: safeNumber,
    safeStatus: safeStatus,
    safeLabel: safeLabel,
    sanitizeIpoData: sanitizeIpoData,
    sanitizeGoldData: sanitizeGoldData,
    safeDataUrl: safeDataUrl
  };
})(typeof window !== 'undefined' ? window : this);
