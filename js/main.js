/* ============================================================
   STACKLY — main.js
   Counters, testimonial slider, FAQ accordion, blog
   filter/search/pagination, magnetic buttons, forms, toast.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- toast ---------------- */
  window.stacklyToast = function (msg, isError) {
    var t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span></span>';
      document.body.appendChild(t);
    }
    t.classList.toggle('error', !!isError);
    t.querySelector('span').textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, 3600);
  };

  /* ---------------- animated counters ---------------- */
  var counters = document.querySelectorAll('[data-counter]:not(.dstat b)');
  if (counters.length) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cObs.unobserve(el);
        var target = parseFloat(el.getAttribute('data-counter'));
        var decimals = (el.getAttribute('data-counter').split('.')[1] || '').length;
        var dur = 1900, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = (target * eased).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    counters.forEach(function (c) { cObs.observe(c); });
  }

  /* ---------------- testimonial slider ---------------- */
  var testi = document.querySelector('.testi-shell');
  if (testi) {
    var track = testi.querySelector('.testi-track');
    var slides = testi.querySelectorAll('.testi-slide');
    var dotsWrap = testi.querySelector('.testi-dots');
    var prev = testi.querySelector('[data-testi-prev]');
    var next = testi.querySelector('[data-testi-next]');
    var idx = 0, timer;

    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      if (i === 0) d.classList.add('active');
      d.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(d);
    });
    var dots = dotsWrap.querySelectorAll('button');

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + idx * 100 + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === idx); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6500); }
    if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });

    /* touch swipe */
    var sx = null;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 48) go(idx + (dx < 0 ? 1 : -1));
      sx = null; restart();
    }, { passive: true });
    restart();
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* faq category filter */
  var faqCats = document.querySelectorAll('.faq-cats .filter-btn');
  if (faqCats.length) {
    faqCats.forEach(function (btn) {
      btn.addEventListener('click', function () {
        faqCats.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-cat');
        document.querySelectorAll('.faq-item').forEach(function (item) {
          item.style.display = (cat === 'all' || item.getAttribute('data-cat') === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ---------------- blog: filter + search + pagination ---------------- */
  var blogGrid = document.querySelector('.blog-page-grid');
  if (blogGrid) {
    var cards = Array.prototype.slice.call(blogGrid.querySelectorAll('.blog-card'));
    var filterBtns = document.querySelectorAll('.blog-filters .filter-btn');
    var searchInput = document.querySelector('.blog-search input');
    var pagWrap = document.querySelector('.pagination');
    var emptyMsg = document.querySelector('.blog-empty');
    var PER = 6, curCat = 'all', curQ = '', curPage = 1;

    function visible() {
      return cards.filter(function (c) {
        var okCat = curCat === 'all' || c.getAttribute('data-cat') === curCat;
        var okQ = !curQ || c.textContent.toLowerCase().indexOf(curQ) !== -1;
        return okCat && okQ;
      });
    }
    function render() {
      var list = visible();
      var pages = Math.max(Math.ceil(list.length / PER), 1);
      curPage = Math.min(curPage, pages);
      cards.forEach(function (c) { c.style.display = 'none'; });
      list.slice((curPage - 1) * PER, curPage * PER).forEach(function (c) { c.style.display = ''; });
      if (emptyMsg) emptyMsg.style.display = list.length ? 'none' : 'block';
      if (pagWrap) {
        pagWrap.innerHTML = '';
        if (pages > 1) {
          for (var p = 1; p <= pages; p++) {
            (function (p) {
              var b = document.createElement('button');
              b.className = 'page-btn' + (p === curPage ? ' active' : '');
              b.textContent = p;
              b.addEventListener('click', function () {
                curPage = p; render();
                blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
              });
              pagWrap.appendChild(b);
            })(p);
          }
        }
      }
    }
    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        filterBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        curCat = b.getAttribute('data-cat'); curPage = 1; render();
      });
    });
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        curQ = searchInput.value.trim().toLowerCase(); curPage = 1; render();
      });
    }
    render();
  }

  /* ---------------- magnetic buttons ---------------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * .16 + 'px,' + y * .22 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------------- form validation (contact etc.) ---------------- */
  function validateField(f) {
    var input = f.querySelector('input, textarea, select');
    if (!input) return true;
    var v = input.value.trim();
    var ok = true;
    if (input.hasAttribute('required') && !v) ok = false;
    if (ok && input.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (ok && input.getAttribute('data-min') && v) ok = v.length >= parseInt(input.getAttribute('data-min'), 10);
    f.classList.toggle('invalid', !ok);
    return ok;
  }
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.querySelectorAll('.field input, .field textarea, .field select').forEach(function (inp) {
      inp.addEventListener('blur', function () { validateField(inp.closest('.field')); });
      inp.addEventListener('input', function () {
        var f = inp.closest('.field');
        if (f.classList.contains('invalid')) validateField(f);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('.field').forEach(function (f) {
        if (!validateField(f)) ok = false;
      });
      var consent = form.querySelector('input[type="checkbox"][required]');
      if (consent && !consent.checked) {
        ok = false;
        consent.focus();
      }
      if (!ok) {
        window.stacklyToast('Please review the highlighted fields.', true);
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
      var redirect = form.getAttribute('data-redirect');
      if (redirect) {
        sessionStorage.setItem('stackly_404_return', JSON.stringify({
          href: window.location.href,
          x: window.scrollX,
          y: window.scrollY
        }));
        window.location.href = redirect;
        return;
      }
      setTimeout(function () {
        window.stacklyToast(form.getAttribute('data-success') || 'Message sent successfully. Our team will respond within 24 hours.');
        form.reset();
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      }, 700);
    });
  });

  /* ---------------- newsletter (footer) ---------------- */
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = form.querySelector('input');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim())) {
        window.stacklyToast('Please enter a valid email address.', true);
        return;
      }
      window.stacklyToast('Subscribed — welcome to the STACKLY briefing.');
      form.reset();
    });
  });
})();
