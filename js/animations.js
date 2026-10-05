/* ============================================================
   STACKLY — animations.js
   GSAP + ScrollTrigger choreography: hero intro, line-mask
   reveals, image mask reveals, parallax, horizontal showcase,
   ECG draw, spotlight cards.
   ============================================================ */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    document.documentElement.classList.add('no-anim');
    return;
  }
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { document.documentElement.classList.add('no-anim'); return; }

  /* ----------------------------------------------------------
     HERO INTRO — starts when preloader hands over
  ---------------------------------------------------------- */
  function heroIntro() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-bg-shapes', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)
      .fromTo('.hero-visual .hv-frame',
        { scale: 1.08, opacity: 0, y: 34 },
        { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power3.inOut' }, .05)
      .fromTo('.hero-visual .hv-glow', { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: 1.6 }, .1)
      .to('.hero-copy h1 .mask-line > span',
        { y: 0, duration: 1.05, stagger: .13, ease: 'power4.out' }, .35)
      .fromTo('.hero-copy .eyebrow', { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: .8 }, .4)
      .fromTo('.hero-copy .lead', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9 }, .85)
      .fromTo('.hero-actions .btn', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .75, stagger: .12 }, 1.0)
      .fromTo('.float-card', { opacity: 0, y: 34, scale: .92 }, { opacity: 1, y: 0, scale: 1, duration: .9, stagger: .16, ease: 'back.out(1.6)' }, 1.05)
      .fromTo('.hero-stats .stat', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .8, stagger: .1 }, 1.15)
      .fromTo('.hero-scroll-cue', { opacity: 0 }, { opacity: 1, duration: .8 }, 1.6);

    /* gentle parallax on the hero image + floating cards on pointer */
    var frame = hero.querySelector('.hv-frame');
    if (frame && window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        gsap.to(frame, { x: x * 14, y: y * 10, duration: 1.1, ease: 'power2.out' });
        gsap.to('.fc-1', { x: x * -18, duration: 1.2, ease: 'power2.out' });
        gsap.to('.fc-2', { x: x * 22, y: y * -12, duration: 1.2, ease: 'power2.out' });
      });
    }
  }

  function whenReady(fn) {
    if (document.documentElement.classList.contains('page-ready')) fn();
    else window.addEventListener('stackly:ready', fn, { once: true });
  }
  whenReady(heroIntro);

  /* page-hero (inner pages) intro */
  whenReady(function () {
    var ph = document.querySelector('.page-hero');
    if (!ph) return;
    gsap.to('.page-hero h1 .mask-line > span', { y: 0, duration: 1, stagger: .12, ease: 'power4.out', delay: .15 });
    gsap.fromTo('.page-hero .breadcrumb, .page-hero .eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, delay: .1 });
    gsap.fromTo('.page-hero p', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, delay: .4 });
  });

  if (typeof ScrollTrigger === 'undefined') {
    document.documentElement.classList.add('no-anim');
    return;
  }

  /* ----------------------------------------------------------
     Generic scroll reveals
  ---------------------------------------------------------- */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, y: 44 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
    var items = group.children;
    gsap.fromTo(items, { opacity: 0, y: 44 }, {
      opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 84%', once: true }
    });
  });

  /* mask-line reveals on scroll (section titles etc.) */
  gsap.utils.toArray('[data-mask-scroll] .mask-line > span').forEach(function (span, i) {
    gsap.to(span, {
      y: 0, duration: 1, ease: 'power4.out', delay: (i % 4) * .1,
      scrollTrigger: { trigger: span.closest('[data-mask-scroll]'), start: 'top 84%', once: true }
    });
  });

  /* image mask reveal */
  gsap.utils.toArray('.img-reveal').forEach(function (wrap) {
    var img = wrap.querySelector('img');
    if (wrap.querySelector(':scope')) { /* keep pseudo sweep via CSS */ }
    gsap.fromTo(wrap, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 1.05, ease: 'power3.inOut',
      scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
    });
    if (img) {
      gsap.fromTo(img, { scale: 1.14 }, {
        scale: 1, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
      });
    }
  });

  /* ----------------------------------------------------------
     Horizontal product showcase (desktop pin)
  ---------------------------------------------------------- */
  var hscroll = document.querySelector('.hscroll');
  if (hscroll && window.matchMedia('(min-width: 993px)').matches) {
    var wrap = hscroll.closest('.hscroll-wrap');
    var getAmount = function () { return Math.max(hscroll.scrollWidth - window.innerWidth + 96, 0); };
    if (getAmount() > 0) {
      gsap.to(hscroll, {
        x: function () { return -getAmount(); },
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 12%',
          end: function () { return '+=' + getAmount(); },
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
    }
  } else if (hscroll) {
    /* mobile: native swipe */
    hscroll.parentElement.style.overflowX = 'auto';
    hscroll.style.width = 'max-content';
    hscroll.style.paddingLeft = '20px';
    hscroll.style.paddingRight = '20px';
  }

  /* ----------------------------------------------------------
     Technology section: ECG line draw + pinned parallax feel
  ---------------------------------------------------------- */
  var techPath = document.querySelector('.tech-ecg path');
  if (techPath) {
    var len = techPath.getTotalLength();
    gsap.set(techPath, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(techPath, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.tech-sec', start: 'top 70%', end: 'center 40%', scrub: 1
      }
    });
  }

  /* dark section subtle parallax on image */
  gsap.utils.toArray('[data-parallax]').forEach(function (el) {
    gsap.to(el, {
      yPercent: parseFloat(el.getAttribute('data-parallax')) || -8,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* about timeline draw */
  var tlLine = document.querySelector('.timeline');
  if (tlLine) {
    gsap.fromTo(tlLine, { '--tl': 0 }, {});
    gsap.utils.toArray('.tl-item').forEach(function (item, i) {
      gsap.fromTo(item, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 85%', once: true }
      });
    });
  }

  /* marquee pause on hover */
  var marquee = document.querySelector('.marquee-track');
  if (marquee) {
    marquee.addEventListener('mouseenter', function () { marquee.style.animationPlayState = 'paused'; });
    marquee.addEventListener('mouseleave', function () { marquee.style.animationPlayState = 'running'; });
  }

  /* ----------------------------------------------------------
     Cursor spotlight cards (bento + spot-card)
  ---------------------------------------------------------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.bento-card, .spot-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* refresh triggers after images load */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
