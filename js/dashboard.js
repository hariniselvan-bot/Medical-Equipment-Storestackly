/* ============================================================
   STACKLY — dashboard.js
   Sidebar navigation, mobile drawer, canvas sales chart,
   notifications, inventory bars.
   ============================================================ */
(function () {
  'use strict';

  /* ---- sidebar section switching ---- */
  var links = document.querySelectorAll('.dash-link[data-section]');
  var sections = document.querySelectorAll('.dash-section');
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      links.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      var id = link.getAttribute('data-section');
      sections.forEach(function (s) { s.classList.toggle('active', s.id === 'sec-' + id); });
      closeSidebar();
      var title = document.querySelector('.dash-topbar h1');
      if (title) title.textContent = link.getAttribute('data-title') || link.textContent.trim();
    });
  });

  /* ---- mobile drawer ---- */
  var sidebar = document.querySelector('.dash-sidebar');
  var burger = document.querySelector('.dash-burger');
  var overlay = document.querySelector('.dash-overlay');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }
  if (burger) burger.addEventListener('click', function () {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  /* ---- notifications dropdown ---- */
  var bell = document.querySelector('.dt-bell-wrap .dt-icon-btn');
  var drop = document.querySelector('.notif-drop');
  if (bell && drop) {
    bell.addEventListener('click', function (e) {
      e.stopPropagation();
      drop.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) drop.classList.remove('open');
    });
  }

  /* ---- dashboard counters ---- */
  var counters = document.querySelectorAll('.dstat b[data-counter]');
  if (counters.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        obs.unobserve(el);
        var target = parseFloat(el.getAttribute('data-counter'));
        var prefix = el.getAttribute('data-prefix') || '';
        var dur = 1600, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .4 });
    counters.forEach(function (c) { obs.observe(c); });
  }

  /* ---- inventory bars ---- */
  var bars = document.querySelectorAll('.inv-bar i');
  if (bars.length) {
    var bObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          bObs.unobserve(en.target);
        }
      });
    }, { threshold: .4 });
    bars.forEach(function (b) { bObs.observe(b); });
  }

  /* ---- canvas sales chart (no chart library) ---- */
  var canvas = document.getElementById('salesChart');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var revenue = [42, 55, 48, 66, 59, 74, 69, 84, 78, 92, 88, 104];
    var orders = [30, 38, 34, 44, 40, 50, 47, 56, 52, 61, 58, 68];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var progress = 0;

    function draw(p) {
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var padL = 44, padR = 14, padT = 18, padB = 34;
      var cw = w - padL - padR, ch = h - padT - padB;
      var max = 120;

      /* grid */
      ctx.strokeStyle = 'rgba(9,38,61,.07)';
      ctx.fillStyle = '#8395a7';
      ctx.font = '10.5px "IBM Plex Mono", monospace';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var y = padT + ch - (ch * g / 4);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
        ctx.fillText('$' + (max * g / 4) + 'k', 6, y + 3.5);
      }

      function point(arr, i) {
        return [padL + cw * i / (arr.length - 1), padT + ch - (arr[i] / max) * ch * p];
      }
      function line(arr, color, fill) {
        ctx.beginPath();
        var n = Math.max(2, Math.ceil(arr.length * p));
        for (var i = 0; i < n; i++) {
          var pt = point(arr, i);
          if (i === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
        }
        if (fill) {
          var grd = ctx.createLinearGradient(0, padT, 0, padT + ch);
          grd.addColorStop(0, 'rgba(8,124,120,.22)');
          grd.addColorStop(1, 'rgba(8,124,120,0)');
          ctx.save();
          var last = point(arr, n - 1), first = point(arr, 0);
          ctx.lineTo(last[0], padT + ch); ctx.lineTo(first[0], padT + ch); ctx.closePath();
          ctx.fillStyle = grd; ctx.fill();
          ctx.restore();
          ctx.beginPath();
          for (var j = 0; j < n; j++) {
            var q = point(arr, j);
            if (j === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
          }
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2.4;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.stroke();
      }

      line(orders, '#19B8D1', false);
      line(revenue, '#087C78', true);

      /* dots on revenue */
      ctx.fillStyle = '#087C78';
      var nd = Math.ceil(revenue.length * p);
      for (var d = 0; d < nd; d++) {
        var dp = point(revenue, d);
        ctx.beginPath(); ctx.arc(dp[0], dp[1], 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke();
      }

      /* x labels */
      ctx.fillStyle = '#8395a7';
      ctx.font = '10.5px "IBM Plex Mono", monospace';
      months.forEach(function (m, i) {
        if (window.innerWidth < 640 && i % 2) return;
        var x = padL + cw * i / (months.length - 1);
        ctx.fillText(m, x - 10, h - 12);
      });
    }

    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cObs.unobserve(canvas);
        var start = null;
        function anim(ts) {
          if (!start) start = ts;
          progress = Math.min((ts - start) / 1400, 1);
          draw(1 - Math.pow(1 - progress, 3));
          if (progress < 1) requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
      });
    }, { threshold: .3 });
    cObs.observe(canvas);
    window.addEventListener('resize', function () { if (progress) draw(1); });
  }

  /* ---- logout (demo) ---- */
  document.querySelectorAll('[data-logout]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.stacklyToast) window.stacklyToast('Signed out. See you soon.');
      setTimeout(function () { window.location.href = 'login.html'; }, 800);
    });
  });

  /* ---- add product / settings forms (demo) ---- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.stacklyToast) window.stacklyToast(form.getAttribute('data-demo'));
      form.reset();
    });
  });
})();
