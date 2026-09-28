/**
 * Site-wide Google auth via Supabase — persistent session + profile in header.
 */
(function (global) {
  var supabaseClient = null;
  var currentUser = null;
  var PREFS_META_KEY = 'pv_prefs';
  var STORAGE_KEY = 'pv-supabase-auth';

  function cfg() {
    return global.PV_SUPABASE || {};
  }

  function configured() {
    var c = cfg();
    return !!(c.url && c.anonKey && String(c.url).indexOf('http') === 0);
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (!configured()) return null;
    if (!global.supabase || !global.supabase.createClient) {
      console.warn('[PVAuth] Supabase JS not loaded');
      return null;
    }
    supabaseClient = global.supabase.createClient(cfg().url, cfg().anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: global.localStorage,
        storageKey: STORAGE_KEY
      }
    });
    return supabaseClient;
  }

  function publicUser(session) {
    if (!session || !session.user) return null;
    var u = session.user;
    var meta = u.user_metadata || {};
    return {
      email: u.email || '',
      name: meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : 'Account'),
      avatar: meta.avatar_url || meta.picture || null,
      id: u.id,
      meta: meta
    };
  }

  function closeMenus() {
    document.querySelectorAll('.profile-menu.is-open').forEach(function (m) {
      m.classList.remove('is-open');
    });
  }

  function paintNav(user) {
    currentUser = user;
    var slots = document.querySelectorAll('[data-auth-nav]');
    slots.forEach(function (el) {
      el.innerHTML = '';
      if (user && (user.email || user.id)) {
        var wrap = document.createElement('div');
        wrap.className = 'profile-menu';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'profile-trigger';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.title = user.email || 'Account';

        if (user.avatar) {
          var img = document.createElement('img');
          img.src = user.avatar;
          img.alt = '';
          img.className = 'profile-avatar';
          img.referrerPolicy = 'no-referrer';
          btn.appendChild(img);
        } else {
          var av = document.createElement('span');
          av.className = 'profile-avatar profile-avatar--letter';
          av.textContent = (user.name || 'U').charAt(0).toUpperCase();
          btn.appendChild(av);
        }

        var name = document.createElement('span');
        name.className = 'profile-name';
        name.textContent = user.name || 'Account';
        btn.appendChild(name);

        var caret = document.createElement('span');
        caret.className = 'profile-caret';
        caret.setAttribute('aria-hidden', 'true');
        caret.textContent = '\u25be';
        btn.appendChild(caret);

        var dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.setAttribute('role', 'menu');

        var emailRow = document.createElement('div');
        emailRow.className = 'profile-email';
        emailRow.textContent = user.email || '';
        dropdown.appendChild(emailRow);

        var linkNtf = document.createElement('a');
        linkNtf.href = 'new-to-finance.html';
        linkNtf.textContent = 'My calculator';
        linkNtf.setAttribute('role', 'menuitem');
        dropdown.appendChild(linkNtf);

        var out = document.createElement('button');
        out.type = 'button';
        out.className = 'profile-logout';
        out.textContent = 'Log out';
        out.setAttribute('role', 'menuitem');
        out.addEventListener('click', function (e) {
          e.preventDefault();
          closeMenus();
          Auth.logout().finally(function () {
            window.location.href = 'index.html';
          });
        });
        dropdown.appendChild(out);

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = wrap.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        wrap.appendChild(btn);
        wrap.appendChild(dropdown);
        el.appendChild(wrap);
      } else {
        var a = document.createElement('a');
        a.href = 'login.html';
        a.className = 'nav-login-link';
        a.textContent = 'Login';
        el.appendChild(a);
      }
    });
  }

  if (!global.__pvAuthClickBound) {
    global.__pvAuthClickBound = true;
    document.addEventListener('click', function () {
      closeMenus();
    });
  }

  var Auth = {
    isConfigured: configured,
    getClient: getClient,

    getSession: async function () {
      var client = getClient();
      if (!client) return null;
      var res = await client.auth.getSession();
      return res.data && res.data.session ? res.data.session : null;
    },

    me: async function () {
      try {
        var session = await Auth.getSession();
        return { ok: !!session, data: { user: publicUser(session) } };
      } catch (e) {
        return { ok: false, data: { user: null } };
      }
    },

    currentUser: function () {
      return currentUser;
    },

    signInWithGoogle: async function () {
      var client = getClient();
      if (!client) {
        return { ok: false, error: 'Supabase is not configured.' };
      }
      var redirectTo = window.location.origin + '/login.html';
      var result = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (result.error) {
        return { ok: false, error: result.error.message || 'Google sign-in failed' };
      }
      return { ok: true, data: result.data };
    },

    logout: async function () {
      var client = getClient();
      if (client) {
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch (e) {}
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
        Object.keys(localStorage).forEach(function (k) {
          if (k.indexOf('sb-') === 0 || k.indexOf('supabase') === 0) {
            localStorage.removeItem(k);
          }
        });
      } catch (e) {}
      paintNav(null);
      return { ok: true };
    },

    loadPrefs: async function () {
      var local = {};
      try {
        var raw = localStorage.getItem('portfolioView_ntf_v1');
        if (raw) local = JSON.parse(raw) || {};
      } catch (e) {}
      try {
        var session = await Auth.getSession();
        if (session && session.user) {
          var meta = session.user.user_metadata || {};
          var cloud = meta[PREFS_META_KEY];
          if (cloud && typeof cloud === 'object') {
            Object.keys(cloud).forEach(function (k) {
              if (local[k] == null || local[k] === '') local[k] = cloud[k];
            });
            try {
              localStorage.setItem('portfolioView_ntf_v1', JSON.stringify(local));
            } catch (e2) {}
          }
        }
      } catch (e) {}
      return local;
    },

    savePrefs: async function (partial) {
      var cur = {};
      try {
        var raw = localStorage.getItem('portfolioView_ntf_v1');
        if (raw) cur = JSON.parse(raw) || {};
      } catch (e) {}
      Object.keys(partial || {}).forEach(function (k) {
        cur[k] = partial[k];
      });
      try {
        localStorage.setItem('portfolioView_ntf_v1', JSON.stringify(cur));
      } catch (e) {}
      try {
        var client = getClient();
        if (!client) return cur;
        var session = await Auth.getSession();
        if (!session || !session.user) return cur;
        var data = {};
        data[PREFS_META_KEY] = cur;
        await client.auth.updateUser({ data: data });
      } catch (e) {
        console.warn('[PVAuth] cloud prefs save skipped', e);
      }
      return cur;
    },

    paintNav: paintNav,

    initNav: async function () {
      var client = getClient();
      if (!client) {
        paintNav(null);
        return;
      }
      try {
        var res = await client.auth.getSession();
        paintNav(publicUser(res.data && res.data.session));
      } catch (e) {
        paintNav(null);
      }
      client.auth.onAuthStateChange(function (event, session) {
        paintNav(publicUser(session));
      });
    }
  };

  global.PVAuth = Auth;

  function boot() {
    if (document.querySelector('[data-auth-nav]')) {
      Auth.initNav();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
