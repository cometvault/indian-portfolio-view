/**
 * Client for Netlify Functions auth API (/api/*).
 */
(function (global) {
  var API = {
    signup: '/api/signup',
    login: '/api/login',
    logout: '/api/logout',
    me: '/api/me'
  };

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(async function (res) {
      var data = {};
      try { data = await res.json(); } catch (e) {}
      return { ok: res.ok, status: res.status, data: data };
    });
  }

  function get(url) {
    return fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    }).then(async function (res) {
      var data = {};
      try { data = await res.json(); } catch (e) {}
      return { ok: res.ok, status: res.status, data: data };
    });
  }

  var Auth = {
    signup: function (email, password, name) {
      return post(API.signup, { email: email, password: password, name: name || '' });
    },
    login: function (email, password) {
      return post(API.login, { email: email, password: password });
    },
    logout: function () {
      return post(API.logout, {});
    },
    me: function () {
      return get(API.me);
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
