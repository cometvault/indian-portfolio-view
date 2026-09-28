/* Auto-load Supabase auth on every page */
(function () {
  if (window.__pvAuthLoading) return;
  window.__pvAuthLoading = true;
  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = cb || function () {};
    s.onerror = function () { console.warn('Failed to load', src); };
    document.head.appendChild(s);
  }
  function ensureCss() {
    if (document.querySelector('link[href*="auth.css"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/auth.css';
    document.head.appendChild(l);
  }
  function ensureSlot() {
    if (document.querySelector('[data-auth-nav]')) return;
    var nav = document.querySelector('header nav');
    if (!nav) return;
    var span = document.createElement('span');
    span.className = 'nav-auth';
    span.setAttribute('data-auth-nav', '');
    nav.appendChild(span);
  }
  ensureCss();
  ensureSlot();
  if (window.supabase && window.PV_SUPABASE && window.PVAuth) return;
  load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', function () {
    load('js/supabase-config.js', function () {
      load('js/auth-client.js', function () {
        ensureSlot();
        if (window.PVAuth && typeof window.PVAuth.initNav === 'function') {
          window.PVAuth.initNav();
        }
      });
    });
  });
})();

