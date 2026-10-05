/* ============================================================
   STACKLY — components.js
   Small shared UI behaviours: external-page routing to 404,
   copy-to-clipboard, year stamps, lazy image guard.
   ============================================================ */
(function () {
  'use strict';

  /* year stamps */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* preserve the originating section when returning from the not-found page */
  var returnKey = 'stackly_404_return';
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href]') : null;
    if (!link || link.target === '_blank') return;
    var destination = new URL(link.href, window.location.href);
    if (destination.pathname.endsWith('/404.html') || link.hasAttribute('data-dead') || link.getAttribute('href') === '#') {
      sessionStorage.setItem(returnKey, JSON.stringify({
        href: window.location.href,
        x: window.scrollX,
        y: window.scrollY
      }));
    }
  }, true);

  window.addEventListener('pageshow', function () {
    var saved = sessionStorage.getItem(returnKey);
    if (!saved) return;
    var returnState = JSON.parse(saved);
    if (returnState.href === window.location.href) {
      sessionStorage.removeItem(returnKey);
      window.setTimeout(function () {
        window.scrollTo(returnState.x, returnState.y);
      }, 100);
    } else if (!window.location.pathname.endsWith('/404.html')) {
      sessionStorage.removeItem(returnKey);
    }
  });

  /* links that intentionally have no destination -> custom 404 */
  document.querySelectorAll('a[href="#"], a[data-dead]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = '404.html';
    });
  });

  /* add width/height safety + lazy loading to non-hero images */
  document.querySelectorAll('img:not([data-eager])').forEach(function (img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  /* image fallback: hide broken images gracefully */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.opacity = '0';
    });
  });
})();
