/* ============================================================
   STACKLY — auth.js : login / register (front-end demo only)
   ============================================================ */
(function () {
  'use strict';

  /* password visibility toggles */
  document.querySelectorAll('.pw-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.closest('.input-wrap').querySelector('input');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('on', show);
    });
  });

  /* password strength */
  var pw = document.querySelector('#regPassword');
  var meter = document.querySelector('.pw-meter');
  var hint = document.querySelector('.pw-hint');
  if (pw && meter) {
    pw.addEventListener('input', function () {
      var v = pw.value, score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      if (!v) score = 0;
      meter.setAttribute('data-level', score);
      var labels = ['Use 8+ characters with mixed case, numbers & symbols.',
        'Weak — add more variety.', 'Fair — getting stronger.',
        'Good password.', 'Excellent password strength.'];
      if (hint) hint.textContent = labels[score];
    });
  }

  /* auth submit (demo — nothing is sent anywhere) */
  function bindAuthForm(formId, redirectFor) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('.field').forEach(function (f) {
        var input = f.querySelector('input, select');
        if (!input) return;
        var v = input.value.trim(), valid = true;
        if (input.hasAttribute('required') && !v) valid = false;
        if (valid && input.type === 'email' && v) valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (valid && input.dataset.min) valid = v.length >= +input.dataset.min;
        if (valid && input.id === 'regConfirm' && pw) valid = v === pw.value;
        f.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { window.stacklyToast('Please review the highlighted fields.', true); return; }
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true; btn.style.opacity = '.7';
      setTimeout(function () {
        var role = form.querySelector('input[name="role"]:checked, input[name="account"]:checked');
        var emailField = form.querySelector('input[type="email"]');
        var email = emailField ? emailField.value.trim() : '';
        var nameField = document.getElementById('regName');
        var user = { email: email, name: nameField ? nameField.value.trim() : '', role: role ? role.value : 'user' };
        try {
          localStorage.setItem('stacklyUser', JSON.stringify(user));
          localStorage.setItem('stacklyEmail', email);
          sessionStorage.setItem('stacklyUser', JSON.stringify(user));
          sessionStorage.setItem('stacklyEmail', email);
        } catch (storageError) {}
        var dest = redirectFor(role ? role.value : 'user');
        window.stacklyToast('Welcome to STACKLY. Redirecting…');
        setTimeout(function () { window.location.href = dest; }, 900);
      }, 700);
    });
  }

  bindAuthForm('loginForm', function (role) {
    return role === 'admin' ? 'seller-dashboard.html' : 'dashboard.html';
  });
  bindAuthForm('registerForm', function (account) {
    return account === 'seller' ? 'seller-dashboard.html' : 'dashboard.html';
  });
})();
