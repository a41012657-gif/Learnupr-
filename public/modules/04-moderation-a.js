// ========== SERVICE WORKER — MODE HORS LIGNE COMPLET ==========
(function() {
  if (!('serviceWorker' in navigator)) return;

  // ─── Code du Service Worker ───────────────────────────────────────────────
  // Stratégies :
  //  • Shell (ce fichier HTML)       → Cache-First  (app disponible hors ligne)
  //  • Assets CDN (polices, pdf.js…) → Stale-While-Revalidate (rapide + frais)
  //  • Contenus Cloudinary (PDF/docs)→ Cache-First  (lecture offline après 1ère ouverture)
  //  • API Turso / Gemini / divers   → Network-Only (données dynamiques, pas de cache)
  const SW_CODE = `
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
    url.includes('fonts.gstatic.com')                    // binaires polices (lourds, gérés par le browser)
  ) {
    return; // laisser le navigateur gérer sans interception
  }

  // ── Shell HTML → Cache-First ──────────────────────────────────────────
  if (url === self.registration.scope || url === self.registration.scope.replace(/\\/$/, '') ||
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
`;

  try {
    const b64 = btoa(unescape(encodeURIComponent(SW_CODE)));
    const swDataUrl = 'data:application/javascript;base64,' + b64;
    navigator.serviceWorker.register(swDataUrl).then(reg => {
      console.info('✅ Service Worker LearnUpr actif (mode hors ligne)');

      // Notifier le SW de mettre en cache le shell après chaque chargement réussi
      if (reg.active) reg.active.postMessage('CACHE_SHELL');

      // Détecter une mise à jour disponible
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nouvelle version disponible : on force la prise en compte immédiate
            newWorker.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(() => {});
  } catch(e) {}
})();

// ========== FEAT 2 : RÉVISION EXPRESS ==========
function lancerRevisionExpress() {
  if (!checkPremium()) { openPremiumGate("revision"); return; }
  // Mélanger toutes les questions de toutes les matières
  const allBuiltIn = Object.values(QUIZ_QUESTIONS).flat();
  const allCustom = customQuizQuestions || [];
  const allQ = [...allBuiltIn, ...allCustom].sort(() => Math.random() - 0.5).slice(0, 10);

  if (allQ.length === 0) { showToast("❌ Aucune question disponible", "error"); return; }

  quizState.matiere = "";
  quizState.timerVal = 30;
  quizState.score = 0;
  quizState.current = 0;
  quizState.answered = false;
  quizState.label = "⚡ Révision Express";

  // Mélanger les choix de chaque question
  quizState.questions = allQ.map(q => {
    if (!q.c || !Array.isArray(q.c)) return q;
    const indices = [0,1,2,3].sort(() => Math.random() - 0.5);
    return { ...q, c: indices.map(i => q.c[i]), r: indices.indexOf(q.r) };
  });

  document.getElementById("quiz-home").style.display = "none";
  document.getElementById("quiz-result").style.display = "none";
  document.getElementById("quiz-game").style.display = "block";
  afficherQuestion();
  showToast("⚡ Révision Express démarrée !", "success");
}

// ========== FEAT 3 : CONSEILS DE RÉVISION AUTOMATIQUES ==========
const CONSEILS_PAR_MATIERE = {
  math: ["📐 Revois les formules de trigonométrie", "📊 Pratique les suites et séries", "🔢 Travaille les équations différentielles"],
  francais: ["📖 Lis des textes classiques camerounais", "✍️ Entraîne-toi aux dissertations", "📝 Révise les figures de style"],
  physique: ["⚡ Refais les exercices sur les circuits", "🌊 Révise les ondes mécaniques", "🔭 Travaille les lois de Newton"],
  svt: ["🧬 Révise la génétique", "🌱 Travaille la photosynthèse", "🫁 Revois la physiologie humaine"],
  chimie: ["⚗️ Révise l'équilibre des réactions", "🧪 Travaille la stœchiométrie", "🔬 Revois les oxydoréductions"],
  histoire_geo: ["🗺️ Révise la géographie du Cameroun", "📅 Travaille les dates clés", "🌍 Revois la géopolitique africaine"],
  philosophie: ["💭 Lis les grands philosophes", "📚 Entraîne-toi aux dissertations philo", "🤔 Travaille les notions au programme"],
  anglais: ["🗣️ Pratique la grammaire anglaise", "📖 Lis des textes en anglais", "✍️ Entraîne-toi à la rédaction"],
};

function afficherConseilApresQuiz(matiere, pct) {
  if (!checkPremium()) return; // Conseils réservés Premium
  if (pct >= 70) return;
  const conseils = CONSEILS_PAR_MATIERE[matiere] || ["📚 Continue à réviser régulièrement", "🎯 Fixe-toi des objectifs quotidiens"];
  const conseil = conseils[Math.floor(Math.random() * conseils.length)];
  const el = document.getElementById("quiz-result");
  if (!el) return;
  const existingConseil = el.querySelector(".conseil-box");
  if (existingConseil) existingConseil.remove();
  const div = document.createElement("div");
  div.className = "conseil-box";
  div.style.cssText = "background:var(--bg);border-radius:14px;padding:14px;margin-top:12px;border:2px solid var(--gold);";
  div.innerHTML = `<div style="font-size:11px;font-weight:800;color:var(--gold2);margin-bottom:6px">💡 CONSEIL DE RÉVISION</div>
    <div style="font-size:13px;font-weight:700;color:var(--text)">${conseil}</div>`;
  el.appendChild(div);
}

// ========== FEAT 7 : BADGES SPÉCIAUX ==========
const BADGES_SPECIAUX = [
  { id:"bac_pret",    emoji:"🎓", titre:"Prêt pour le BAC",    cond: stats => stats.totalQ >= 200 && stats.avgPct >= 70 },
  { id:"roi_quiz",    emoji:"👑", titre:"Roi des Quiz",        cond: stats => stats.totalPlayed >= 20 },
  { id:"perfectionniste", emoji:"💎", titre:"Perfectionniste", cond: stats => stats.perfect >= 3 },
  { id:"assidu",      emoji:"🔥", titre:"Élève Assidu",        cond: stats => stats.totalPlayed >= 10 },
  { id:"polyvalent",  emoji:"🌟", titre:"Polyvalent",          cond: stats => stats.matieres >= 5 },
  { id:"expert",      emoji:"🏆", titre:"Expert",              cond: stats => stats.totalQ >= 100 && stats.avgPct >= 80 },
  { id:"starter",     emoji:"🚀", titre:"Lanceur",             cond: stats => stats.totalPlayed >= 1 },
  { id:"centenaire",  emoji:"💯", titre:"Centenaire",          cond: stats => stats.totalQ >= 100 },
];

function calculerBadges() {
  const totalPlayed = quizHistory.length;
  const totalQ = Object.values(progData).reduce((s, d) => s + (d.totalQ || 0), 0);
  const totalScore = Object.values(progData).reduce((s, d) => s + (d.totalScore || 0), 0);
  const avgPct = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const perfect = quizHistory.filter(h => h.pct === 100).length;
  const matieres = Object.keys(progData).length;
  const stats = { totalPlayed, totalQ, avgPct, perfect, matieres };
  return BADGES_SPECIAUX.filter(b => b.cond(stats));
}

// Étendre renderProgression pour inclure badges spéciaux
// renderProgression étendue — hook intégré

// terminerQuiz fusionnée — hook supprimé

// Fix: suppression de la fonction dupliquée exporterRelevePDF
function exporterRelevePDF() { exporterReleve(); }

// Fix: ajouterSimMatiere remplace ajouterMatPersonnalisee
function ajouterSimMatiere() { ajouterMatPersonnalisee(); }
