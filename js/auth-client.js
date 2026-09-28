/**
 * Auth via Supabase Google OAuth.
 */
(function (global) {
  var supabaseClient = null;

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
        detectSessionInUrl: true
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
      id: u.id
    };
  }

  var Auth = {
    isConfigured: configured,

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

    signInWithGoogle: async function () {
      var client = getClient();
      if (!client) {
        return { ok: false, error: 'Supabase is not configured. Set url and anonKey in js/supabase-config.js' };
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
      return { ok: true };
    },

    paintNav: function (user) {
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
    },

    initNav: function () {
      Auth.me().then(function (res) {
        Auth.paintNav(res.ok && res.data.user ? res.data.user : null);
      }).catch(function () {
        Auth.paintNav(null);
      });
    }
  };

  global.PVAuth = Auth;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('[data-auth-nav]')) {
      Auth.initNav();
    }
  });
})(typeof window !== 'undefined' ? window : this);
