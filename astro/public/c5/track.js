/* Category 5 — first-party analytics beacon. No cookies, no storage, no IP kept (see
   src/admin/events.ts). Reports: page view (+ source), active time and scroll depth, clicks that
   leave the site (store links, phone, e-mail, WhatsApp — never the number itself), glossary links,
   and site searches (text sanitised on the server). Does nothing for Do Not Track / Global Privacy
   Control visitors. */
(function () {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    if (/^\/(admin|api)(\/|$)/.test(location.pathname)) return;
    var ENDPOINT = '/api/c5/e';
    var pid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
    function send(o) {
      o.p = pid; o.u = location.pathname;
      var s = JSON.stringify(o);
      try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([s], { type: 'text/plain' }))) return; } catch (e) {}
      try { fetch(ENDPOINT, { method: 'POST', body: s, keepalive: true, headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
    }

    // ---- page view ------------------------------------------------------------------------
    var sp = new URLSearchParams(location.search), sentPv = false;
    function pageview() {
      if (sentPv) return; sentPv = true;
      send({ t: window.__c5Status === 404 ? 'nf' : 'pv', r: document.referrer, w: window.innerWidth,
        us: sp.get('utm_source') || '', um: sp.get('utm_medium') || '', uc: sp.get('utm_campaign') || '', g: sp.get('gclid') ? 1 : 0 });
    }
    if (document.visibilityState === 'visible') pageview();
    else document.addEventListener('visibilitychange', function f() { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', f); pageview(); } });

    // ---- active time + scroll depth ---------------------------------------------------------
    var active = 0, last = Date.now(), maxScroll = 0;
    function touch() { last = Date.now(); }
    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, touch, { passive: true }); });
    window.addEventListener('scroll', function () {
      var h = document.documentElement, total = Math.max(h.scrollHeight, 1);
      maxScroll = Math.max(maxScroll, Math.min(100, Math.round(((window.scrollY || h.scrollTop) + window.innerHeight) / total * 100)));
    }, { passive: true });
    setInterval(function () { if (document.visibilityState === 'visible' && Date.now() - last < 30000) active += 1000; }, 1000);
    function flush() { if (sentPv && active > 0) send({ t: 'eng', d: active, s: maxScroll }); }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
    window.addEventListener('pagehide', flush);

    // ---- clicks ------------------------------------------------------------------------------
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var h = a.getAttribute('href') || '';
      if (/^tel:/i.test(h)) return send({ t: 'out', x: 'tel' });
      if (/^mailto:/i.test(h)) return send({ t: 'out', x: 'mailto' });
      if (a.host && a.host !== location.host && /^https?:$/.test(a.protocol)) {
        if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(a.hostname)) return send({ t: 'out', x: 'whatsapp' });
        return send({ t: 'out', x: a.hostname + (a.pathname || '') });
      }
      if (a.pathname === '/glossary' && a.hash) send({ t: 'gl', x: a.hash.slice(1) });
    }, true);

    // ---- site search (the /search page fires "c5:search") ----------------------------------------
    var st;
    window.addEventListener('c5:search', function (e) {
      var d = e.detail || {}; clearTimeout(st);
      st = setTimeout(function () { if (d.blocked) send({ t: 'srch', b: 1 }); else if (d.q && d.q.length > 1) send({ t: 'srch', x: String(d.q).slice(0, 200), n: d.n | 0 }); }, 2500);
    });
  } catch (e) { /* analytics must never break the page */ }
})();
