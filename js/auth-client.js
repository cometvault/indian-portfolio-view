/**
 * Auth via Supabase Google OAuth — shared session + nav on every page.
 */
(function (global) {
  var supabaseClient = null;
  var currentUser = null;
  var PREFS_META_KEY = 'pv_prefs';

  function cfg() {
    return global.PV_SUPABASE || {};
  }

  function configured() {
    var c = cfg();
    return !!(c.url && c.anonKey && c.url.indexOf('http') === 0);
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (!configured()) return null;
    if (!global.supabase || !global.supabase.createClient) {
      console.warn('Supabase JS not loaded');
      return null;
    }
    supabaseClient = global.supabase.createClient(cfg().url, cfg().anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: global.localStorage,
        storageKey: 'pv-supabase-auth'
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
      name: meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : ''),
      avatar: meta.avatar_url || meta.picture || null,
      id: u.id,
      meta: meta
    };
  }

  function paintNav(user) {
    currentUser = user;
    var slots = document.querySelectorAll('[data-auth-nav]');
    slots.forEach(function (el) {
      el.innerHTML = '';
      if (user && user.email) {
        var label = document.createElement('span');
        label.className = 'nav-user';
        label.title = user.email;
        label.textContent = user.name || user.email.split('@')[0];
        var out = document.createElement('a');
        out.href = '#';
        out.textContent = 'Log out';
        out.addEventListener('click', function (e) {
          e.preventDefault();
          Auth.logout().finally(function () {
            window.location.href = 'index.html';
          });
        });
        el.appendChild(label);
        el.appendChild(out);
      } else {
        var a = document.createElement('a');
        a.href = 'login.html';
        a.textContent = 'Login';
        el.appendChild(a);
      }
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
        options: { redirectTo: redirectTo }
      });
      if (result.error) {
        return { ok: false, error: result.error.message || 'Google sign-in failed' };
      }
      return { ok: true, data: result.data };
    },

    logout: async function () {
      var client = getClient();
      if (!client) return { ok: true };
      await client.auth.signOut();
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
        console.warn('Cloud prefs save skipped', e);
      }
      return cur;
    },

    paintNav: paintNav,

    initNav: function () {
      var client = getClient();
      if (!client) {
        paintNav(null);
        return;
      }

      client.auth.getSession().then(function (res) {
        var user = publicUser(res.data && res.data.session);
        paintNav(user);
      }).catch(function () {
        paintNav(null);
      });

      client.auth.onAuthStateChange(function (event, session) {
        paintNav(publicUser(session));
      });
    }
  };

  global.PVAuth = Auth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.querySelector('[data-auth-nav]')) Auth.initNav();
    });
  } else if (document.querySelector('[data-auth-nav]')) {
    Auth.initNav();
  }
})(typeof window !== 'undefined' ? window : this);
