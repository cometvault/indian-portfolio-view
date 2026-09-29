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
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
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
    if (s.length > maxLen) s = s.slice(0, maxLen - 1) + '…';
    return s;
  }

  function parseOpenClose(dates, opens, closes) {
    if (opens || closes) {
      return { opens: safeLabel(opens, 16), closes: safeLabel(closes, 16) };
    }
    var s = String(dates == null ? '' : dates).replace(/\s+/g, ' ').trim();
    if (!s) return { opens: '', closes: '' };
    var m = s.match(/^(\d{1,2})\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]{3,9})\.?$/i);
    if (m) {
      return {
        opens: safeLabel(m[1] + ' ' + m[3], 16),
        closes: safeLabel(m[2] + ' ' + m[3], 16)
      };
    }
    m = s.match(/^(\d{1,2}\s+[A-Za-z]{3,9})\.?\s*[-–—]\s*(\d{1,2}\s+[A-Za-z]{3,9})\.?$/i);
    if (m) {
      return { opens: safeLabel(m[1], 16), closes: safeLabel(m[2], 16) };
    }
    return { opens: safeLabel(s, 16), closes: safeLabel(s, 16) };
  }

  function sanitizeIpoData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    function row(item) {
      if (!item || typeof item !== 'object') return null;
      var name = safeLabel(item.name, 60);
      if (!name) return null;
      var oc = parseOpenClose(item.dates, item.opens, item.closes);
      return {
        name: name,
        priceBand: safeLabel(item.priceBand, 24),
        gmp: safeNumber(item.gmp),
        opens: oc.opens,
        closes: oc.closes,
        dates: safeLabel(item.dates, 24),
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
