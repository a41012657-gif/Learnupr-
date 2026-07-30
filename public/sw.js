// ========== SERVICE WORKER — LearnUpr — MODE HORS LIGNE COMPLET ==========
// Stratégies :
//  • Shell (ce fichier HTML)       → Cache-First  (app disponible hors ligne)
//  • Assets CDN (polices, pdf.js…) → Stale-While-Revalidate (rapide + frais)
//  • Contenus Cloudinary (PDF/docs)→ Cache-First  (lecture offline après 1ère ouverture)
//  • API Turso / Gemini / divers   → Network-Only (données dynamiques, pas de cache)
const CACHE_SHELL   = 'learnupr-shell-v1';
const CACHE_ASSETS  = 'learnupr-assets-v1';
const CACHE_CONTENT = 'learnupr-content-v1';

// Assets CDN à pré-cacher au premier install
const PRECACHE_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// ── Install : pré-cacher le shell et les assets CDN ──────────────────────
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    // 1. Shell : mettre en cache la page HTML elle-même
    const shellCache = await caches.open(CACHE_SHELL);
    try {
      await shellCache.add(new Request(self.location.origin + '/', { cache: 'reload' }));
    } catch(_) {}

    // 2. Assets CDN : best-effort (ne bloque pas l'install si réseau KO)
    const assetCache = await caches.open(CACHE_ASSETS);
    await Promise.allSettled(
      PRECACHE_ASSETS.map(url =>
        fetch(url).then(r => { if (r.ok) assetCache.put(url, r); }).catch(() => {})
      )
    );
    self.skipWaiting();
  })());
});

// ── Activate : nettoyer les anciens caches ────────────────────────────────
self.addEventListener('activate', e => {
  const KEPT = [CACHE_SHELL, CACHE_ASSETS, CACHE_CONTENT];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !KEPT.includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch : routage par stratégie ─────────────────────────────────────────
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;

  // Ignorer les requêtes non-GET
  if (req.method !== 'GET') return;

  // ── API dynamiques → Network-Only (jamais en cache) ──────────────────
  if (
    url.includes('turso.io') ||
    url.includes('libsql') ||
    url.includes('generativelanguage.googleapis.com') || // Gemini
    url.includes('api.groq.com') ||                       // Groq (secours)
    url.includes('api.mistral.ai') ||                     // Mistral (secours photo)
    url.includes('api.deepseek.com') ||
    url.includes('fonts.gstatic.com')                     // binaires polices (lourds, gérés par le browser)
  ) {
    return; // laisser le navigateur gérer sans interception
  }

  // ── Shell HTML → Cache-First ──────────────────────────────────────────
  if (url === self.registration.scope || url === self.registration.scope.replace(/\/$/, '') ||
      url.startsWith(self.registration.scope) && !url.includes('.')) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_SHELL);
      const cached = await cache.match(req);
      if (cached) {
        // Revalider en arrière-plan
        fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); }).catch(() => {});
        return cached;
      }
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch(_) {
        return cached || new Response('<h2>LearnUpr — mode hors ligne</h2><p>Rechargez quand vous serez connecté.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // ── Assets CDN (polices CSS, pdf.js, jszip) → Stale-While-Revalidate ─
  if (
    url.includes('fonts.googleapis.com') ||
    url.includes('cdnjs.cloudflare.com')
  ) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_ASSETS);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then(r => {
        if (r && r.ok) cache.put(req, r.clone());
        return r;
      }).catch(() => null);
      return cached || networkFetch || new Response('', { status: 503 });
    })());
    return;
  }

  // ── Contenus Cloudinary (PDF, docx, images) → Cache-First ───────────
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_CONTENT);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch(_) {
        return new Response('', { status: 503 });
      }
    })());
    return;
  }
  // Tout le reste → réseau sans interception
});

// ── Message : forcer mise à jour du cache shell ───────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'CACHE_SHELL') {
    caches.open(CACHE_SHELL).then(c =>
      fetch(self.registration.scope, { cache: 'reload' }).then(r => { if (r.ok) c.put(self.registration.scope, r); }).catch(() => {})
    );
  }
});
