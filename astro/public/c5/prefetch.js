/* Loads the next page in the background when a visitor hovers (or touches) an internal link, so the click
   feels instant. Chromium: speculation rules (prefetch, "moderate" = on hover); others: <link rel="prefetch">
   after a short hover. Skips slow / data-saver connections, the admin area, the API, downloads and new tabs. */
(function () {
  try {
    var c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return;
    if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
      var s = document.createElement('script'); s.type = 'speculationrules';
      s.textContent = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: '/*' }, { not: { href_matches: ['/admin*', '/api/*', '/wp-content/*', '/media/*'] } }, { not: { selector_matches: '[download], [target=_blank]' } }] }, eagerness: 'moderate' }] });
      document.head.appendChild(s); return;
    }
    var seen = {}, timer;
    function candidate(a) {
      if (!a || !a.href || a.origin !== location.origin || a.hasAttribute('download') || a.target === '_blank') return null;
      if (/^\/(admin|api|wp-content|media)(\/|$)/.test(a.pathname)) return null;
      if (a.pathname === location.pathname && a.search === location.search) return null;
      return a.pathname + a.search;
    }
    function prefetch(url) {
      if (seen[url]) return; seen[url] = 1;
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = url; l.as = 'document'; document.head.appendChild(l);
    }
    document.addEventListener('pointerover', function (e) {
      var u = candidate(e.target.closest && e.target.closest('a[href]')); if (!u) return;
      clearTimeout(timer); timer = setTimeout(function () { prefetch(u); }, 65);
    }, { passive: true });
    document.addEventListener('pointerout', function () { clearTimeout(timer); }, { passive: true });
    document.addEventListener('touchstart', function (e) { var u = candidate(e.target.closest && e.target.closest('a[href]')); if (u) prefetch(u); }, { passive: true });
  } catch (e) { /* never break the page */ }
})();
