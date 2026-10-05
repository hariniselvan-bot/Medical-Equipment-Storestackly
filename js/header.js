/* ============================================================
   STACKLY — header.js
   Glass header on scroll, mobile menu, search overlay,
   scroll progress, back-to-top.
   ============================================================ */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var progressBar = document.querySelector('.scroll-progress span');
  var toTop = document.querySelector('.to-top');

  /* ---- scroll state ---- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (progressBar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
      }
      if (toTop) toTop.classList.toggle('show', y > 700);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.hamburger');
  var menu = document.querySelector('.mobile-menu');
  var menuClose = menu ? menu.querySelector('.mm-close') : null;
  var menuOpen = false;

  function setMenu(open) {
    if (!menu || !burger) return;
    menuOpen = open;
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (typeof gsap !== 'undefined') {
      if (open) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.to(menu, { opacity: 1, duration: .4, ease: 'power2.out' });
        gsap.fromTo(menu.querySelectorAll('.mm-link'),
          { y: 44, opacity: 0 },
          { y: 0, opacity: 1, duration: .65, stagger: .07, delay: .1, ease: 'power3.out' });
        gsap.fromTo(menu.querySelector('.mm-foot'),
          { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, delay: .5, ease: 'power3.out' });
      } else {
        gsap.to(menu, {
          opacity: 0, duration: .35, ease: 'power2.in',
          onComplete: function () { gsap.set(menu, { visibility: 'hidden' }); }
        });
      }
    } else {
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.opacity = open ? '1' : '0';
    }
  }

  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) setMenu(false);
    });
  }

  /* ---- search overlay ---- */
  var searchOverlay = document.querySelector('.search-overlay');
  var searchOpeners = document.querySelectorAll('[data-search-open]');
  var searchClose = document.querySelector('.search-close');
  var searchInput = searchOverlay ? searchOverlay.querySelector('input') : null;

  function toggleSearch(open) {
    if (!searchOverlay) return;
    searchOverlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && searchInput) setTimeout(function () { searchInput.focus(); }, 120);
  }
  searchOpeners.forEach(function (b) {
    b.addEventListener('click', function () { toggleSearch(true); });
  });
  if (searchClose) searchClose.addEventListener('click', function () { toggleSearch(false); });
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) toggleSearch(false);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('open')) toggleSearch(false);
    });
  }

  /* ---- active nav link ---- */
  var page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-link, .mm-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) link.classList.add('active');
  });
})();
