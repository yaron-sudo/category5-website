/* Category 5 — scroll flow: entrance on load, reveal on scroll down (fail-safe); scrolling up never re-animates */
(function () {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var html = document.documentElement;
  html.classList.add('c5-motion');
  requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('c5-loaded'); }); });
  setTimeout(function () { html.classList.add('c5-loaded'); }, 400); /* safety */

  /* Client 14.11.2026: scroll-reveal is limited to article pages (the paragraph flow the
     client asked to keep). Everywhere else content is simply there — the constant fading
     of sections and grids while scrolling read as the page trembling. */
  var SEL = 'main > article.c5-article > *';
  var GRID = '[style*="display: grid"], .series-grid';
  function show(el) { el.classList.remove('c5-pending'); el.classList.add('c5-in'); }
  function hide(el) { el.classList.remove('c5-in'); el.classList.add('c5-pending'); }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { show(e.target); }
      else {
        /* reset only what dropped below the viewport, so it flows in again on the way down.
           (Deviation from mockups/site.js: content that scrolled past the top keeps its state —
           re-animating it on every scroll up made the page tremble.) */
        var r = e.boundingClientRect, vh = window.innerHeight || 0;
        if (r.top > vh + 40) hide(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

  var order = 0;
  function enter(el, delayMs) {
    el.classList.add('c5-pending');
    el.style.transitionDelay = delayMs + 'ms';
    requestAnimationFrame(function () { requestAnimationFrame(function () { show(el); setTimeout(function () { el.style.transitionDelay = ''; }, delayMs + 1200); }); });
  }
  function prepGrids(root) {
    var grids = root.querySelectorAll(GRID), vh = window.innerHeight || 0;
    for (var g = 0; g < grids.length; g++) {
      var grid = grids[g];
      if (grid.__c5g) continue; grid.__c5g = true;
      grid.classList.add('c5-stagger');
      for (var c = 0; c < grid.children.length; c++) grid.children[c].style.setProperty('--c5-i', String(c));
      var r = grid.getBoundingClientRect();
      io.observe(grid);
      if (!vh || r.top < vh * 0.92) show(grid);
    }
  }
  function scan() {
    var vh = window.innerHeight || 0;
    if (!vh) return;
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.__c5) continue; n.__c5 = true;
      var r = n.getBoundingClientRect();
      io.observe(n);
      if (r.top < vh * 0.9) { enter(n, 120 + order * 110); order++; } else { n.classList.add('c5-pending'); }
    }
    /* grid stagger off (same client decision) */
    var hero = document.querySelector('main > section:first-child img');
    if (hero && !hero.__c5p) { hero.__c5p = true; hero.classList.add('c5-parallax'); if (hero.parentElement) hero.parentElement.style.overflow = 'hidden'; }
  }
  scan();
  var mo = new MutationObserver(function () { scan(); });
  mo.observe(html, { childList: true, subtree: true });

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var hero = document.querySelector('.c5-parallax');
      if (hero) { var y = window.scrollY || 0; hero.style.setProperty('--c5-y', Math.min(y * 0.1, 48) + 'px'); }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* safety net: anything on screen must be visible */
  setInterval(function () {
    var vh = window.innerHeight || 0;
    var hidden = document.querySelectorAll('.c5-pending, .c5-stagger:not(.c5-in)');
    for (var i = 0; i < hidden.length; i++) {
      var r = hidden[i].getBoundingClientRect();
      if (!vh || (r.top < vh && r.bottom > 0)) show(hidden[i]);
    }
  }, 1200);
})();
