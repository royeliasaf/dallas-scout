(function () {
  try {
    var site = null;
    var script = document.currentScript;
    if (script) site = script.getAttribute('data-site');
    if (!site) {
      var found = document.querySelectorAll('script[src$="/t.js"]');
      for (var i = 0; i < found.length; i++) {
        var s = found[i].getAttribute('data-site');
        if (s) { site = s; break; }
      }
    }
    if (!site) site = window.__rvaSite;
    if (!site) return;

    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;

    var vid = localStorage.getItem('_rva_vid');
    if (!vid) {
      vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('_rva_vid', vid);
    }

    var ua = navigator.userAgent;
    var device = /Mobi|Android|iPhone|iPad/i.test(ua)
      ? (/iPad/i.test(ua) ? 'tablet' : 'mobile')
      : 'desktop';

    fetch('https://roy-analytics.vercel.app/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: site,
        path: location.pathname + location.search,
        referrer: document.referrer || null,
        device: device,
        visitor_id: vid,
      }),
      keepalive: true,
    }).catch(function () {});
  } catch (e) {}
})();
