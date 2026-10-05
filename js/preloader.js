/* ============================================================
   STACKLY — preloader.js
   ECG pulse + counter + column wipe exit. Runs once per session.
   ============================================================ */
(function () {
  'use strict';

  var pre = document.querySelector('.preloader');
  if (!pre) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('stackly_pre') === '1'; } catch (e) {}

  function finish(fast) {
    try { sessionStorage.setItem('stackly_pre', '1'); } catch (e) {}
    if (fast || typeof gsap === 'undefined') {
      pre.classList.add('done');
      document.documentElement.classList.add('page-ready');
      window.dispatchEvent(new CustomEvent('stackly:ready'));
      return;
    }
    var cols = pre.querySelectorAll('.preloader-cols i');
    var inner = pre.querySelector('.preloader-inner');
    var tl = gsap.timeline({
      onComplete: function () {
        pre.classList.add('done');
        window.dispatchEvent(new CustomEvent('stackly:ready'));
      }
    });
    tl.to(inner, { opacity: 0, y: -26, duration: .5, ease: 'power2.in' })
      .to(cols, { scaleY: 1, duration: .45, stagger: { each: .035, from: 'start' }, ease: 'power3.inOut' }, '-=.15')
      .set(inner, { display: 'none' })
      .to(cols, { scaleY: 0, transformOrigin: '50% 100%', duration: .55, stagger: { each: .035, from: 'end' }, ease: 'power3.inOut' })
      .add(function () { document.documentElement.classList.add('page-ready'); }, '-=.35');
  }

  /* Skip full preloader when already seen this session */
  if (seen || reduced) { finish(true); return; }

  document.documentElement.classList.add('preloading');

  var countEl = pre.querySelector('[data-count]');
  var ecgPath = pre.querySelector('.preloader-ecg path');
  var logo = pre.querySelector('.preloader-logo');

  if (typeof gsap === 'undefined') { finish(true); return; }

  /* path draw setup */
  var len = 0;
  if (ecgPath) {
    len = ecgPath.getTotalLength();
    ecgPath.style.strokeDasharray = len;
    ecgPath.style.strokeDashoffset = len;
  }

  var progress = { v: 0 };
  var tl = gsap.timeline();
  tl.to(logo, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, .1)
    .to(ecgPath, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, .3)
    .to(progress, {
      v: 100, duration: 1.9, ease: 'power2.inOut',
      onUpdate: function () {
        if (countEl) countEl.textContent = Math.round(progress.v) + '%';
      }
    }, .3)
    .add(function () { finish(false); }, '+=.15');
})();
