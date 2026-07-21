// ========== CONFIGURATION SÉCURISÉE ==========
// ⚠️ AUCUNE clé secrète dans le code source.
// Les credentials sont chiffrés et stockés dans localStorage par l'admin au premier lancement.
// Pour initialiser : ouvre l'app en tant qu'admin → Paramètres → Configurer les clés.

const _CFG_KEY = "learnupr_cfg_v2"; // clé localStorage pour la config chiffrée

// ========== CHIFFREMENT AES-256-GCM (Web Crypto API) ==========
// Le token ne circule jamais en clair dans le code
const _SALT = "Educ-LyceeManengouba-2025";
const _UNIVERSAL_KEY = "Educ-SharedConfig-Manengouba";

async function _getAESKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password + _SALT), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(_SALT), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function _encryptAES(str, password) {
  try {
    const key = await _getAESKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(str));
    const buf = new Uint8Array(iv.length + encrypted.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...buf));
  } catch(e) { return _encodeFallback(str); }
}

async function _decryptAES(b64, password) {
  try {
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = buf.slice(0, 12);
    const data = buf.slice(12);
    const key = await _getAESKey(password);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch(e) { return _decodeFallback(b64); }
}

// --- Clé unique par appareil (fingerprint) ---
function _getDeviceKey() {
  let fp = localStorage.getItem("_lu_fp");
  if (!fp) {
    fp = btoa([
      navigator.userAgent.slice(0,20),
      screen.width, screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Math.random().toString(36).slice(2,10)
    ].join("|")).slice(0, 32);
    localStorage.setItem("_lu_fp", fp);
  }
  return fp;
}

// --- Fallback XOR renforcé (si AES non dispo) ---
function _xorStrV2(str, key = "LU-Manengouba-2025!@#$%") {
  return str.split("").map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join("");
}
function _encodeFallback(str) {
  try { return btoa(encodeURIComponent(_xorStrV2(str))); } catch(e) { return btoa(_xorStrV2(str)); }
}
function _decodeFallback(b64) {
  try { return _xorStrV2(decodeURIComponent(atob(b64))); } catch(e) { return ""; }
}

// --- encode/decode utilisent AES (async) ---
async function _encode(str) { return await _encryptAES(str, _getDeviceKey()); }
async function _decode(b64) { return await _decryptAES(b64, _getDeviceKey()); }
async function _decodeEmbedded(b64) { return await _decryptAES(b64, _UNIVERSAL_KEY); }
async function _encodeEmbedded(str) { return await _encryptAES(str, _UNIVERSAL_KEY); }

// =====================================================================
// CONFIG UNIVERSELLE — fonctionne pour TOUS les utilisateurs
// Priorité : 1) Config embarquée dans le HTML (définie par l'admin)
//            2) Config localStorage (fallback si embarquée absente)
//            3) Vide (app en mode dégradé)
// =====================================================================

// Config embarquée dans le HTML (remplie automatiquement quand l'admin sauvegarde)
// L'admin n'a besoin de configurer QU'UNE SEULE FOIS — tous les utilisateurs en bénéficient.
const _EMBEDDED_CFG_TAG = document.getElementById("learnup-embedded-cfg");
let _embeddedCfg = null;
// Le déchiffrement de la config embarquée est async — on initialise Turso après
async function _loadEmbeddedConfig() {
  // Toujours relire depuis le DOM (pas de mise en cache — contourne les caches navigateur)
  const tag = document.getElementById("learnup-embedded-cfg");
  if (tag && tag.textContent.trim()) {
    try {
      const decoded = await _decodeEmbedded(tag.textContent.trim());
      _embeddedCfg = JSON.parse(decoded);
    } catch(e) {
      // Fallback : ancienne config XOR (rétrocompatibilité)
      try { _embeddedCfg = JSON.parse(_decodeFallback(tag.textContent.trim())); } catch(e2) {}
    }
  }
}

// --- Sauvegarder la config ---
// Sauvegarde dans localStorage ET met à jour la balise embarquée dans le DOM
// (la balise embarquée est lue par tous les visiteurs du fichier HTML)
async function saveSecureConfig(cfg) {
  const encodedLocal = await _encode(JSON.stringify(cfg));
  const encodedShared = await _encodeEmbedded(JSON.stringify(cfg));
  // 1. Sauvegarder en localStorage (chiffré avec clé appareil)
  localStorage.setItem(_CFG_KEY, encodedLocal);
  // 2. Mettre à jour la balise embarquée (chiffrée avec clé universelle)
  const tag = document.getElementById("learnup-embedded-cfg");
  if (tag) tag.textContent = encodedShared;
  // 3. Config sauvegardée — juste notifier, pas de téléchargement
  showToast("✅ Clés sauvegardées avec succès !", "success");
  const m = document.getElementById("secureConfigModal");
  if (m) m.classList.remove("show");
}

// --- Charger la config (embarquée en priorité, localStorage en fallback) ---
async function loadSecureConfig() {
  // Priorité 1 : config embarquée dans le HTML (toujours relue depuis le DOM)
  await _loadEmbeddedConfig();
  if (_embeddedCfg) return _embeddedCfg;
  // Priorité 2 : config locale (admin uniquement, chiffrée avec clé appareil)
  const raw = localStorage.getItem(_CFG_KEY);
  if (!raw) return null;
  try { return JSON.parse(await _decode(raw)); } catch(e) { return null; }
}

// --- Vérifier si la config est déjà enregistrée ---
function hasSecureConfig() {
  return !!(_embeddedCfg || localStorage.getItem(_CFG_KEY));
}

// --- Lire les valeurs (async — initialisé dans _initConfig) ---
let TURSO_URL = "";
let TURSO_TOKEN = "";
let CLOUDINARY_URL = "";
let CLOUDINARY_PRESET = "";
let WHATSAPP_GROUP_LINK = "";
let WHATSAPP_PAIEMENT_NUM = ""; // numéro Orange Money / WhatsApp pour preuves de paiement Premium — voir bouton flottant "📸 Envoyer ma preuve de paiement"
// ── Clés Gemini — 3 usages séparés, chacune pouvant contenir plusieurs clés
// séparées par des virgules (rotation automatique si plusieurs sont fournies). ──
let GEMINI_KEYS_ZIP      = [];  // 1) Analyse ZIP (classe/matière/lycée/année)
let GEMINI_KEYS_DOUBLON  = [];  // 2) Détection de doublons (contributions élèves)
let GEMINI_KEYS_CONTRIB  = [];  // 3) Analyse des fichiers soumis par les élèves
// Compteurs de rotation (un par usage), remis à zéro à chaque rechargement de page
const _geminiRotationIdx = { zip: 0, doublon: 0, contrib: 0 };

// Découpe une chaîne "AIza...,AIza..." en tableau de clés propres (sans espaces, sans entrées vides)
function _parseGeminiKeys(raw) {
  return (raw || "").split(",").map(k => k.trim()).filter(Boolean);
}

// Retourne la prochaine clé à utiliser pour un usage donné ("zip","doublon","contrib"),
// en tournant entre les clés disponibles si plusieurs ont été fournies. Retourne ""
// si aucune clé n'est configurée pour cet usage (l'appelant doit alors ne pas appeler l'API).
function getGeminiKey(usage) {
  const map = { zip: GEMINI_KEYS_ZIP, doublon: GEMINI_KEYS_DOUBLON, contrib: GEMINI_KEYS_CONTRIB };
  const arr = map[usage] || [];
  if (!arr.length) return "";
  const idx = _geminiRotationIdx[usage] % arr.length;
  _geminiRotationIdx[usage] = (_geminiRotationIdx[usage] + 1) % arr.length;
  return arr[idx];
}

// Rétrocompatibilité : ancien code/anciennes configs n'utilisant qu'une seule
// clé Gemini générique. Si seule "geminiApiKey" existe (config pré-migration),
// elle est réutilisée pour les 3 usages tant que l'admin n'a pas renseigné les
// clés spécifiques dans le panel.
let GEMINI_API_KEY = ""; // conservé pour compatibilité avec d'anciens appels externes éventuels
let DEEPSEEK_API_KEY = ""; // utilisée uniquement par l'outil de diagnostic admin pour corriger les classes non reconnues

// ⚠️ SÉCURITÉ : ces identifiants permettent de SUPPRIMER des fichiers sur
// Cloudinary. Ils sont volontairement codés en dur ici à la demande du
// modérateur, en connaissance du risque : n'importe qui ouvrant le code
// source de cette page (clic droit → Afficher le code source, ou F12) peut
// les lire et les utiliser pour supprimer N'IMPORTE QUEL fichier du compte
// Cloudinary associé — pas seulement via les boutons de cette app.
// Pour une protection réelle, ces clés devraient être gardées côté serveur
// (ex: une fonction Cloudflare Worker) plutôt qu'exposées ici.
const CLOUDINARY_CLOUD_NAME = "dixyyrich";
const CLOUDINARY_API_KEY    = "698578525192821";
const CLOUDINARY_API_SECRET = "SYFYB42rwT_G5D_CWzvBE_yhjrw";

async function _initConfig() {
  await _loadEmbeddedConfig();
  const _cfg = (await loadSecureConfig()) || {};
  TURSO_URL         = _cfg.tursoUrl         || "";
  TURSO_TOKEN       = _cfg.tursoToken       || "";
  CLOUDINARY_URL    = _cfg.cloudinaryUrl    || "";
  CLOUDINARY_PRESET = _cfg.cloudinaryPreset || "";
  WHATSAPP_GROUP_LINK = _cfg.whatsappLink   || "";
  WHATSAPP_PAIEMENT_NUM = _cfg.whatsappPaiement || "";
  // Rétrocompatibilité : si l'ancienne clé unique "geminiApiKey" existe et
  // qu'aucune clé spécifique n'a encore été définie, elle sert de valeur par
  // défaut pour les 3 usages (l'admin peut ensuite les différencier).
  const ancienneCleUnique = _cfg.geminiApiKey || "";
  GEMINI_KEYS_ZIP     = _parseGeminiKeys(_cfg.geminiKeyZip     || ancienneCleUnique);
  GEMINI_KEYS_DOUBLON = _parseGeminiKeys(_cfg.geminiKeyDoublon || ancienneCleUnique);
  GEMINI_KEYS_CONTRIB = _parseGeminiKeys(_cfg.geminiKeyContrib || ancienneCleUnique);
  GEMINI_API_KEY      = ancienneCleUnique || GEMINI_KEYS_ZIP[0] || "";
  DEEPSEEK_API_KEY     = _cfg.deepseekKey || localStorage.getItem("_lu_deepseek_key") || "";
}

function _appliquerVisibiliteTD() {
  const btn = document.getElementById("ttabTravauxDiriges");
  if (btn) btn.style.display = TD_MASQUE ? "none" : "";
  // Si l'onglet masqué était actuellement affiché, on bascule sur Cours pour
  // ne pas laisser l'utilisateur bloqué sur un onglet devenu inaccessible.
  if (TD_MASQUE && activeType === "travaux_diriges") {
    const coursBtn = document.querySelector('.ttab[onclick*="setType(\'cours\'"]');
    if (coursBtn) setType("cours", coursBtn);
  }
}

// Bascule le masquage de l'onglet Travaux Dirigés — réservé à l'admin.
// Utile temporairement le temps de nettoyer des catégories mal classées
// (via l'outil de diagnostic) sans que les élèves voient un onglet en vrac.
async function toggleVisibiliteTravauxDiriges() {
  const roleLocal = localStorage.getItem("userRole") || "";
  const caller = localStorage.getItem("userPhone") || "";
  let isAdmin = roleLocal === "admin";
  if (!isAdmin) { try { isAdmin = await isAdminPhone(caller); } catch(e) { isAdmin = false; } }
  if (!isAdmin) { showToast("⛔ Réservé à l'administrateur", "error"); return; }

  TD_MASQUE = !TD_MASQUE;
  localStorage.setItem("td_masque", TD_MASQUE ? "1" : "0");
  _appliquerVisibiliteTD();
  _majLabelBoutonTD();
  if (turso) {
    try {
      await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '')", args: [] });
      await turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('td_masque', ?)", args: [TD_MASQUE ? "1" : "0"] });
    } catch(e) { showToast("⚠️ Appliqué en local, mais pas synchronisé sur les autres appareils : " + e.message, "info"); }
  }
  showToast(TD_MASQUE ? "🙈 Onglet Travaux Dirigés masqué pour tout le monde" : "👁️ Onglet Travaux Dirigés réaffiché", "success");
}

function _majLabelBoutonTD() {
  const b = document.getElementById("btnToggleTD");
  if (b) b.textContent = TD_MASQUE ? "👁️ Réafficher l'onglet Travaux Dirigés" : "🙈 Masquer l'onglet Travaux Dirigés (temporaire)";
}
window.toggleVisibiliteTravauxDiriges = toggleVisibiliteTravauxDiriges;


// après l'init Turso pour s'assurer que la variable est à jour sur tous les
// appareils, même ceux qui ont un HTML non redéployé.
async function _chargerSettingsTurso() {
  if (typeof turso === "undefined" || !turso) return;
  try {
    await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '')", args: [] });
    const res = await turso.execute({ sql: "SELECT key, value FROM app_settings", args: [] });
    if (res.rows) {
      res.rows.forEach(r => {
        if (r.key === "td_masque") {
          TD_MASQUE = r.value === "1";
          localStorage.setItem("td_masque", TD_MASQUE ? "1" : "0");
          _appliquerVisibiliteTD();
          _majLabelBoutonTD();
        }
        if (r.key === "whatsapp_paiement" && r.value) {
          WHATSAPP_PAIEMENT_NUM = r.value;
          const el = document.getElementById("aboNumeroPaiement");
          if (el && !el.textContent.includes(r.value.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4"))) {
            el.textContent = r.value.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
          }
        }
        // Les clés Gemini ne dépendent pas de la balise embarquée (qui se
        // réinitialise au redémarrage de l'app) — Turso est la source de
        // vérité persistante une fois connecté.
        if (r.key === "gemini_zip" && r.value) {
          GEMINI_KEYS_ZIP = _parseGeminiKeys(r.value);
          localStorage.setItem("_lu_gemini_zip", r.value); // cache local
        }
        if (r.key === "gemini_doublon" && r.value) {
          GEMINI_KEYS_DOUBLON = _parseGeminiKeys(r.value);
          localStorage.setItem("_lu_gemini_doublon", r.value);
        }
        if (r.key === "gemini_contrib" && r.value) {
          GEMINI_KEYS_CONTRIB = _parseGeminiKeys(r.value);
          localStorage.setItem("_lu_gemini_contrib", r.value);
        }
        // Clé DeepSeek — même logique que les clés Gemini ci-dessus : Turso
        // est la source de vérité persistante, la balise embarquée/localStorage
        // ne suffisent pas seuls car ils se réinitialisent au redémarrage.
        if (r.key === "deepseek_key" && r.value) {
          DEEPSEEK_API_KEY = r.value;
          localStorage.setItem("_lu_deepseek_key", r.value);
        }
        // Mot de passe admin — restaurer sur tout nouvel appareil admin
        if (r.key === "admin_pwd_hash" && r.value && !localStorage.getItem("adminPwdHash")) {
          localStorage.setItem("adminPwdHash", r.value);
        }
        // Numéro admin — restaurer si absent localement
        if (r.key === "admin_phone" && r.value) {
          if (!localStorage.getItem("userPhone")) localStorage.setItem("userPhone", r.value);
          if (!ADMIN_PHONES.includes(r.value)) ADMIN_PHONES.push(r.value);
        }
        // Classes masquées aux élèves — stockées en JSON (ex: ["Tle_TI","1ère_TI"])
        if (r.key === "classes_masquees" && r.value) {
          try {
            const liste = JSON.parse(r.value);
            if (Array.isArray(liste)) {
              CLASSES_MASQUEES = liste.filter(c => CLASSES.includes(c));
              localStorage.setItem("_lu_classes_masquees", JSON.stringify(CLASSES_MASQUEES)); // cache local
              // Rafraîchir les sélecteurs déjà affichés à l'écran, le cas échéant
              if (typeof renderClasses === "function") renderClasses();
              if (typeof initForumClasseTabs === "function") initForumClasseTabs();
            }
          } catch(e) { console.warn("[classes_masquees] JSON invalide:", e.message); }
        }
      });
      if (GEMINI_KEYS_ZIP[0]) GEMINI_API_KEY = GEMINI_KEYS_ZIP[0];
    }
  } catch(e) { console.warn("[_chargerSettingsTurso]", e.message); }
}

// ⚠️ Admin pré-enregistré — numéro encodé (ne pas modifier)
const _A = (s,k="LU-MNG")=>{let r="";for(let i=0;i<s.length;i++)r+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return r;};
let ADMIN_PHONES = [];
try { ADMIN_PHONES = [_A(atob("emIZfH5xeGQd"), "LU-MNG")]; } catch(e) {}
if (localStorage.getItem("userRole") === "admin") {
  const _p = localStorage.getItem("userPhone");
  if (_p && !ADMIN_PHONES.includes(_p)) ADMIN_PHONES.push(_p);
}

// ── Restauration immédiate des clés Gemini depuis localStorage (cache local) ──
// Turso répond de façon asynchrone — si les clés sont absentes de la balise
// embarquée (HTML non redéployé), on les récupère ici instantanément avant
// que _chargerSettingsTurso() soit appelé, pour éviter un démarrage à vide.
(function _chargerGeminiDepuisCache() {
  const z = localStorage.getItem("_lu_gemini_zip");
  const d = localStorage.getItem("_lu_gemini_doublon");
  const c = localStorage.getItem("_lu_gemini_contrib");
  if (z && !GEMINI_KEYS_ZIP.length)     GEMINI_KEYS_ZIP     = _parseGeminiKeys(z);
  if (d && !GEMINI_KEYS_DOUBLON.length) GEMINI_KEYS_DOUBLON = _parseGeminiKeys(d);
  if (c && !GEMINI_KEYS_CONTRIB.length) GEMINI_KEYS_CONTRIB = _parseGeminiKeys(c);
  if (GEMINI_KEYS_ZIP[0] && !GEMINI_API_KEY) GEMINI_API_KEY = GEMINI_KEYS_ZIP[0];
})();

// ── Constantes IA Gemini / anti-doublons (déclarées ici, tout en haut, plutôt
// que près de leur premier usage, pour garantir qu'elles sont définies avant
// que toute fonction puisse être appelée — peu importe l'ordre des sections
// plus bas dans ce fichier). ──
const GEMINI_CLASSES_VALIDES = ["6ème","5ème","4ème","3ème","2nde_A","2nde_C","1ère_A","1ère_C","1ère_D","1ère_TI","Tle_A","Tle_C","Tle_D","Tle_TI"];
const GEMINI_TYPES_VALIDES   = ["cours","sequencielle","examen_officiel","la_zone","competences"];
// Types de fichiers que Gemini sait analyser en multimodal (image/PDF). Un
// .docx n'est pas un format que l'API "generateContent" peut lire comme
// inline_data — on saute silencieusement l'appel pour ce cas plutôt que de
// faire un appel API voué à échouer.
const GEMINI_MIME_SUPPORTES = ["application/pdf", "image/jpeg", "image/png"];
// Seuils de détection de doublons par similarité de titre (Clé 2 Gemini) :
// ≥80% → rejet automatique (doublon quasi-certain) ; 55-80% → zone grise,
// mise en file d'attente modérateur pour décision manuelle.
const SEUIL_DOUBLON_AUTO  = 0.80;
const SEUIL_ZONE_GRISE    = 0.55;
// Clé localStorage de la file d'attente "doublons à vérifier" (panel modérateur)
const CLE_FILE_VERIF_DOUBLONS = "file_verification_doublons";

let turso = null;
// Masquage temporaire de l'onglet "Travaux Dirigés" (contrôlable par l'admin
// depuis le panel admin). Persisté en local + Turso (app_settings) pour
// s'appliquer à tous les appareils, pas seulement celui de l'admin.
let TD_MASQUE = localStorage.getItem("td_masque") === "1";
// L'admin se connecte normalement via le formulaire — aucun pré-enregistrement forcé
let isPremium = localStorage.getItem("isPremium") === "true";
let activeClasse = "3ème";
let activeType = "cours";
let currentChapterId = null;
let db = null;
let searchFilter = "all";
let searchFiltreClasse = "";
let searchFiltreDate = "";
let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
// Liste dynamique des modérateurs (chargée depuis Turso)
let MODERATORS_PHONES = JSON.parse(localStorage.getItem("moderators") || "[]");
// Type de contribution sélectionné
let cfTypeActuel = "sequencielle";

const DB_NAME = "EducOffline";
const STORE_NAME = "chapitres";
const MAX_STORAGE = 100 * 1024 * 1024;

// ── Structure exacte du ZIP learnUp/ ──────────────────────────────────────
// Lycée principal : cours/ + sequencielles/ + examens/
// Autres lycées  : autres_lycees/COURS/ + autres_lycees/sequencielles/

const CLASSES = ["6ème","5ème","4ème","3ème","2nde_A","2nde_C","1ère_A","1ère_C","1ère_D","1ère_TI","Tle_A","Tle_C","Tle_D","Tle_TI"];
// Classes cachées aux élèves (ex: classe pas encore prête). Reste visible dans
// les panels admin/modérateur pour continuer à y publier du contenu en coulisses.
let CLASSES_MASQUEES = [];
// Classes réellement affichées aux élèves (exclut celles masquées par l'admin).
// À utiliser dans tout sélecteur/onglet destiné aux ÉLÈVES. Les panels
// admin/modérateur continuent d'utiliser CLASSES directement (liste complète).
function classesVisibles() {
  return CLASSES.filter(c => !CLASSES_MASQUEES.includes(c));
}
// Restauration immédiate depuis le cache local (Turso répond de façon
// asynchrone) — évite un flash où une classe masquée réapparaît brièvement
// au chargement avant que _chargerSettingsTurso() ne réponde.
(function _chargerClassesMasqueesDepuisCache() {
  try {
    const cache = localStorage.getItem("_lu_classes_masquees");
    if (cache) {
      const liste = JSON.parse(cache);
      if (Array.isArray(liste)) CLASSES_MASQUEES = liste.filter(c => CLASSES.includes(c));
    }
  } catch(e) {}
})();

// Matières exactes par classe (fidèles aux dossiers du ZIP)
const MATIERES_PAR_CLASSE = {
  "6ème":   ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature","LCN"],
  "5ème":   ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature","LCN"],
  "4ème":   ["anglais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","allemand","arabe","espagnol","chinois","LCN","Dictee","Etude"],
  "3ème":   ["anglais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","allemand","arabe","espagnol","chinois","LCN","Dictee","Etude"],
  "2nde_A": ["anglais","math","svt","histoire_geo","informatique","ecm","langue","litterature","allemand","arabe","espagnol","chinois","LCN","Philosophie"],
  "2nde_C": ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "1ère_A": ["anglais","math","svt","histoire_geo","informatique","ecm","langue","litterature","allemand","arabe","espagnol","chinois","LCN","Philosophie"],
  "1ère_C": ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "1ère_D": ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "1ère_TI": ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "Tle_A":  ["anglais","math","svt","histoire_geo","informatique","ecm","langue","litterature","allemand","arabe","espagnol","chinois","LCN","Philosophie"],
  "Tle_C":  ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "Tle_D":  ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"],
  "Tle_TI": ["anglais","francais","math","physique","chimie","svt","histoire_geo","informatique","ecm","langue","litterature"]
};

// Toutes les matières uniques (union de toutes les classes)
const MATIERES = [...new Set(Object.values(MATIERES_PAR_CLASSE).flat())];

// ── Noms lisibles des matières pour l'élève ──────────────────────────────────
const NOMS_MATIERES = {
  math:         "Mathématiques",
  francais:     "Français",
  anglais:      "Anglais",
  physique:     "Physique",
  chimie:       "Chimie",
  svt:          "SVT — Sciences de la Vie",
  histoire_geo:"Histoire-Géographie",
  informatique: "Informatique",
  ecm:          "Éducation à la Citoyenneté",
  langue:       "Langues Nationales",
  litterature:  "Littérature",
  LCN:          "Langue & Culture Nationales",
  allemand:     "Allemand",
  arabe:        "Arabe",
  espagnol:     "Espagnol",
  chinois:      "Chinois",
  Philosophie:  "Philosophie",
  Dictee:       "Dictée",
  Etude:        "Étude de Textes"
};

// ══════════════════════════════════════════════════════════════════════════
// NORMALISATION TOLÉRANTE — utilisée par l'import CSV des quiz
// Accepte casse, accents, espaces/tirets/underscores, abréviations,
// et lettres A/B/C/D pour les réponses (en plus de 0-3).
// ══════════════════════════════════════════════════════════════════════════
function _normKeyCSV(s) {
  return (s || "").toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retirer accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // ne garder que lettres/chiffres (ignore espaces, -, _, ', etc.)
}

const CSV_CLASSE_ALIASES = {
  "6e":"6ème","6eme":"6ème","sixieme":"6ème",
  "5e":"5ème","5eme":"5ème","cinquieme":"5ème",
  "4e":"4ème","4eme":"4ème","quatrieme":"4ème",
  "3e":"3ème","3eme":"3ème","troisieme":"3ème",
  "2nde":"2nde_A","2nd":"2nde_A","seconde":"2nde_A",
  "2ndea":"2nde_A","2nda":"2nde_A","secondea":"2nde_A",
  "2ndec":"2nde_C","2ndc":"2nde_C","secondec":"2nde_C",
  "1ere":"1ère_A","1e":"1ère_A","premiere":"1ère_A",
  "1erea":"1ère_A","1ea":"1ère_A","premierea":"1ère_A",
  "1erec":"1ère_C","1ec":"1ère_C","premierec":"1ère_C",
  "1ered":"1ère_D","1ed":"1ère_D","premiered":"1ère_D",
  "tle":"Tle_C","terminale":"Tle_C",
  "tlea":"Tle_A","terminalea":"Tle_A",
  "tlec":"Tle_C","terminalec":"Tle_C",
  "tled":"Tle_D","terminaled":"Tle_D",
};

const CSV_MAT_ALIASES = {
  "math":"math","maths":"math","mathematiques":"math","mth":"math",
  "francais":"francais","fr":"francais","fran":"francais",
  // ⚠️ "en" retiré : trop ambigu ("en attente", "en classe", etc.)
  "anglais":"anglais","ang":"anglais","angl":"anglais","english":"anglais",
  "physique":"physique","phys":"physique","phy":"physique","pc":"physique",
  "chimie":"chimie","chim":"chimie","chi":"chimie",
  "svt":"svt","biologie":"svt","bio":"svt","sn":"svt",
  "histoiregeo":"histoire_geo","histgeo":"histoire_geo","hg":"histoire_geo",
  "geographie":"histoire_geo","geog":"histoire_geo","geo":"histoire_geo","histoire":"histoire_geo",
  "philosophie":"Philosophie","philo":"Philosophie","phi":"Philosophie",
  "informatique":"informatique","info":"informatique","tic":"informatique",
  "ecm":"ecm","civique":"ecm","educationcivique":"ecm",
  "espagnol":"espagnol","esp":"espagnol","es":"espagnol",
  "langue":"langue","langues":"langue","languesnationales":"langue",
  "ln":"langue","langnat":"langue","lnat":"langue",
  "litterature":"litterature","litt":"litterature",
  "lcn":"LCN","langueculture":"LCN","langcult":"LCN",
  "allemand":"allemand","all":"allemand",
  "arabe":"arabe",
  "chinois":"chinois",
  "dictee":"Dictee","dicte":"Dictee",
  "etude":"Etude","etudedetextes":"Etude",
};

function normaliserClasseCSV(raw) {
  const key = _normKeyCSV(raw);
  if (!key) return "";
  if (CSV_CLASSE_ALIASES[key]) return CSV_CLASSE_ALIASES[key];
  const direct = CLASSES.find(c => _normKeyCSV(c) === key);
  return direct || "";
}

function normaliserMatiereCSV(raw) {
  const key = _normKeyCSV(raw);
  if (!key) return "";
  if (CSV_MAT_ALIASES[key]) return CSV_MAT_ALIASES[key];
  const direct = MATIERES.find(m => _normKeyCSV(m) === key);
  return direct || "";
}

// Accepte 0/1/2/3 OU A/B/C/D (majuscule ou minuscule)
function normaliserReponseCSV(raw) {
  const s = (raw || "").toString().trim().toUpperCase();
  if (s === "") return NaN;
  if (["A","B","C","D"].includes(s)) return s.charCodeAt(0) - 65;
  const n = parseInt(s, 10);
  return isNaN(n) ? NaN : n;
}

// Une question quiz peut être partagée entre plusieurs classes : son champ "classe"
// est alors une liste séparée par des virgules, ex: "1ère_C,1ère_D".
function _quizClasseMatch(qClasse, targetClasse) {
  if (!targetClasse) return true;
  if (!qClasse) return false;
  return qClasse.split(",").map(s => s.trim()).includes(targetClasse);
}

function _quizClasseAffichage(qClasse) {
  return (qClasse || "").split(",").map(s => s.trim()).filter(Boolean).join(" + ");
}

// Même principe pour le contenu (cours, examens, vidéos…) : un contenu publié peut être
// partagé entre plusieurs classes via son champ "classe" séparé par des virgules.
function _classeMatch(champClasse, targetClasse) {
  if (!targetClasse) return true;
  if (!champClasse) return false;
  return champClasse.split(",").map(s => s.trim()).includes(targetClasse);
}

function _classeAffichage(champClasse) {
  return (champClasse || "").split(",").map(s => s.trim()).filter(Boolean).join(" + ");
}

// ── Noms lisibles des types pour l'élève ─────────────────────────────────────
const NOMS_TYPES = {
  cours:         "📚 Cours",
  sequencielle:  "📋 Séquentielle",
  examen_officiel:"🏆 Épreuve officielle",
  la_zone:       "🔥 Fiche de révision",
  competences:   "🎯 Exercice de compétence"
};

// ── Descriptions des onglets pour guider l'élève ─────────────────────────────
const DESC_TYPES = {
  cours:         "Tes cours organisés par matière et chapitre",
  sequencielle:  "Les évaluations séquentielles (Séq. 1, 2, 3…)",
  examen:        "BAC · BEPC · Probatoire · Séquentielles (filtrable)",
  autres_lycees: "Ressources d'autres établissements",
  la_zone:       "Fiches express & astuces pour réviser vite",
  competences:   "Exercices pratiques pour maîtriser les compétences",
  travaux_diriges: "Fiches de révision express & exercices par compétence",
  video:         "Toutes les vidéos explicatives, classées par matière"
};

// Examens officiels (dossiers examens/ du ZIP)
const EXAMENS_TYPES = ["BAC_A","BAC_C_D","BAC_TI","BEPC","PROBATOIRE_A","PROBATOIRE_C_D","PROBATOIRE_TI"];

// Emojis par matière (clés = noms exacts des dossiers ZIP)
const EMOJIS = {
  math:"📐", francais:"📖", anglais:"🇬🇧",
  physique:"⚗️", chimie:"🧪", svt:"🌿",
  histoire_geo:"🗺️", informatique:"💻", ecm:"⚖️",
  langue:"🗣️", litterature:"✍️", LCN:"🌍",
  allemand:"🇩🇪", arabe:"📜", espagnol:"🇪🇸", chinois:"🇨🇳",
  Philosophie:"🧠", Dictee:"📝", Etude:"🔍"
};

// Couleurs par matière
const COLORS = {
  math:"#10B981", francais:"#F43F5E", anglais:"#3B82F6",
  physique:"#A855F7", chimie:"#D946EF", svt:"#22C55E",
  histoire_geo:"#FB923C", informatique:"#64748B", ecm:"#A8825A",
  langue:"#14B8A6", litterature:"#EC4899", LCN:"#06B6D4",
  allemand:"#6366F1", arabe:"#FB7185", espagnol:"#F97316", chinois:"#EF4444",
  Philosophie:"#8B7FE8", Dictee:"#A1887F", Etude:"#2DD4BF"
};

// ========== TURSO INIT + CRÉATION AUTO DES TABLES ==========
async function initTurso() {
  // Toujours forcer un rechargement de la config embarquée (anti-cache)
  if (!_embeddedCfg) await _loadEmbeddedConfig();
  // Re-synchroniser TURSO_URL/TOKEN depuis la config en mémoire à chaque appel
  const _freshCfg = _embeddedCfg || (await loadSecureConfig()) || {};
  if (_freshCfg.tursoUrl) TURSO_URL = _freshCfg.tursoUrl;
  if (_freshCfg.tursoToken) TURSO_TOKEN = _freshCfg.tursoToken;

  if (!TURSO_URL || !TURSO_TOKEN || TURSO_URL === "") {
    console.warn("⚠️ Turso non configuré — mode local uniquement");
    return;
  }
  try {
    // Créer un client Turso basé sur l'API REST (pas de librairie externe)
    turso = {
      _url: TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline",
      _token: TURSO_TOKEN,
      execute: async function(stmt) {
        const sql = typeof stmt === "string" ? stmt : stmt.sql;
        const args = (stmt.args || []).map(v =>
          typeof v === "number" ? { type: "integer", value: String(v) } : { type: "text", value: String(v) }
        );
        const res = await fetch(this._url, {
          method: "POST",
          headers: { "Authorization": "Bearer " + this._token, "Content-Type": "application/json" },
          body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql, args } }, { type: "close" }] })
        });
        if (!res.ok) throw new Error("Turso HTTP " + res.status);
        const data = await res.json();
        const result = data.results?.[0]?.response?.result;
        if (!result) throw new Error("Turso: pas de résultat");
        const cols = result.cols.map(c => c.name);
        const rows = result.rows.map(row => {
          const obj = {};
          cols.forEach((c, i) => {
            const cell = row[i];
            if (cell && typeof cell === "object" && "value" in cell) {
              // Convertir les entiers/flottants Turso (renvoyés en string) en vrais nombres
              if (cell.type === "integer" || cell.type === "float") {
                obj[c] = cell.value === null ? null : Number(cell.value);
              } else {
                obj[c] = cell.value;
              }
            } else {
              obj[c] = cell;
            }
          });
          return obj;
        });
        return { rows, cols };
      }
    };
    console.log("✅ Turso connecté");
    // Créer les tables si elles n'existent pas
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      nom TEXT DEFAULT 'Utilisateur',
      role TEXT DEFAULT 'user',
      password_hash TEXT DEFAULT '',
      is_premium INTEGER DEFAULT 0,
      premium_until INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT 0,
      device_id TEXT DEFAULT '',
      sms_sent INTEGER DEFAULT 0,
      first_login INTEGER DEFAULT 0
    )`, args: [] });
    // Migrations colonnes manquantes
    try { await turso.execute({ sql: "ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''", args: [] }); } catch(e) {}
    try { await turso.execute({ sql: "ALTER TABLE users ADD COLUMN device_id TEXT DEFAULT ''", args: [] }); } catch(e) {}
    try { await turso.execute({ sql: "ALTER TABLE users ADD COLUMN sms_sent INTEGER DEFAULT 0", args: [] }); } catch(e) {}
    try { await turso.execute({ sql: "ALTER TABLE users ADD COLUMN first_login INTEGER DEFAULT 0", args: [] }); } catch(e) {}
    // Table des sessions d'appareils autorisés
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS device_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      device_id TEXT NOT NULL,
      device_label TEXT DEFAULT '',
      trusted INTEGER DEFAULT 0,
      last_seen INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT 0,
      UNIQUE(phone, device_id)
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mat TEXT, classe TEXT, titre TEXT, nom_fichier TEXT,
      type_fichier TEXT, contenu TEXT, fichier_url TEXT,
      auteur TEXT, date INTEGER, statut TEXT DEFAULT 'en_attente'
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS contenu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT, type_fichier TEXT, mat TEXT, classe TEXT,
      titre TEXT, numero INTEGER, contenu TEXT, fichier_url TEXT,
      fichier_type TEXT, fichier_nom TEXT, lycee TEXT DEFAULT 'principal',
      premium INTEGER DEFAULT 0, auteur TEXT, date INTEGER
    )`, args: [] });
    // Migration : ajouter colonne lycee si absente
    try { await turso.execute({ sql: "ALTER TABLE contenu ADD COLUMN lycee TEXT DEFAULT 'principal'", args: [] }); } catch(e) {}
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS premium_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE, utilise INTEGER DEFAULT 0
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classe TEXT NOT NULL,
      matiere TEXT NOT NULL,
      chapitre TEXT NOT NULL,
      question TEXT NOT NULL,
      choix TEXT NOT NULL,
      reponse INTEGER NOT NULL,
      auteur TEXT DEFAULT '',
      date TEXT DEFAULT ''
    )`, args: [] });
    try { await turso.execute({ sql: "ALTER TABLE quiz_questions ADD COLUMN source TEXT DEFAULT ''", args: [] }); } catch(e) {}
    try { await turso.execute({ sql: "ALTER TABLE contenu ADD COLUMN description TEXT DEFAULT ''", args: [] }); } catch(e) {}
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS signalements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contenu_id INTEGER, type_signal TEXT, message TEXT,
      auteur TEXT, date TEXT
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      pseudo TEXT DEFAULT '',
      date_inscription TEXT DEFAULT '',
      nb_contributions INTEGER DEFAULT 0
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS planning_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      matiere TEXT NOT NULL,
      duree INTEGER DEFAULT 30,
      jours TEXT DEFAULT '[]',
      date_creation TEXT DEFAULT ''
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS progression_quiz (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      label TEXT NOT NULL,
      played INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      UNIQUE(phone, label)
    )`, args: [] });
    // ⚠️ Le numéro admin est inséré dans Turso manuellement (pas en dur dans le code)
    // Synchroniser le contenu publié depuis Turso au lancement
    await syncContenuDepuisTurso();
    await syncQuizDepuisTurso();
    await syncPlanningDepuisTurso();
    await syncProgressionDepuisTurso();
    // Reconnexion automatique si numéro déjà en mémoire
    const savedPhone = localStorage.getItem("userPhone");
    if (savedPhone) {
      setTimeout(() => verifierAdmin(), 300);
    }
  } catch(e) {
    console.warn("Turso non disponible:", e);
    turso = null;
    // Fallback : charger depuis localStorage uniquement
    console.info("Mode hors ligne activé — données locales utilisées");
    // Notifier l'utilisateur seulement si l'app est déjà affichée
    setTimeout(() => {
      const mainVisible = document.getElementById("main")?.classList.contains("active");
      if (mainVisible) showToast("📡 Mode hors ligne — synchronisation indisponible", "info");
    }, 2000);
  }
}

// FIX #9 : Synchronisation Turso → localStorage
async function syncContenuDepuisTurso() {
  if (!turso) return;
  try {
    const res = await turso.execute({
      sql: "SELECT id, type, type_fichier, mat, classe, titre, numero, contenu, fichier_url, fichier_type, fichier_nom, lycee, premium, auteur, date, description FROM contenu ORDER BY date DESC LIMIT 200",
      args: []
    });
    if (res.rows && res.rows.length > 0) {
      // CORRECTION BUG SYNC : préserver les fichierUrl locaux si Turso n'en a pas
      const _locaux = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
      const _locauxMap = {};
      _locaux.forEach(p => { _locauxMap[String(p.id)] = p; });
      const mapped = res.rows.map(r => {
        const _tid = String(r.id || r[0]);
        const _loc = _locauxMap[_tid] || {};
        return {
          id:          r.id           || r[0],
          type:        r.type         || r[1],
          typeFichier: r.type_fichier || r[2],
          mat:         r.mat          || r[3],
          classe:      r.classe       || r[4],
          titre:       r.titre        || r[5],
          numero:      r.numero       || r[6],
          contenu:     r.contenu      || r[7],
          fichierUrl:  r.fichier_url  || r[8]  || _loc.fichierUrl  || null,
          fichierType: r.fichier_type || r[9]  || _loc.fichierType || null,
          fichierNom:  r.fichier_nom  || r[10] || _loc.fichierNom  || null,
          lycee:       r.lycee        || r[11] || "principal",
          premium:     Number(r.premium ?? r[12]) === 1,
          auteur:      r.auteur       || r[13],
          date:        r.date         || r[14],
          description: r.description  || _loc.description || ""
        };
      });
      // Fusion (pas écrasement) : on garde aussi les entrées locales qui n'existent
      // PAS encore côté Turso (ex: insert Turso échoué — réseau coupé, colonne manquante, etc.)
      // pour ne pas perdre du contenu publié uniquement parce que sa sync serveur a raté.
      const idsTurso = new Set(mapped.map(p => String(p.id)));
      const localsOrphelins = _locaux.filter(p => !idsTurso.has(String(p.id)));
      localStorage.setItem("contenu_publie", JSON.stringify([...mapped, ...localsOrphelins]));
    }
    // Sync contributions aussi
    const resCon = await turso.execute({ sql: "SELECT * FROM contributions ORDER BY date DESC LIMIT 100", args: [] });
    if (resCon.rows && resCon.rows.length > 0) {
      const existing = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
      const existingIds = new Set(existing.map(c => String(c.id)));
      const newItems = resCon.rows
        .filter(r => !existingIds.has(String(r.id)))
        .map(r => ({
          id: r.id, mat: r.mat, classe: r.classe, titre: r.titre,
          nomFichier: r.nom_fichier, typeFichier: r.type_fichier,
          contenu: r.contenu, fichierUrl: r.fichier_url,
          auteur: r.auteur, date: r.date, statut: r.statut
        }));
      if (newItems.length > 0) {
        localStorage.setItem("contributions_locales", JSON.stringify([...existing, ...newItems]));
      }
    }
  } catch(e) { console.warn("Sync Turso:", e); }
}

// ========== FIX 15 : SYNC PLANNING TURSO ==========
async function syncPlanningDepuisTurso() {
  const phone = localStorage.getItem("userPhone");
  if (!turso || !phone) return;
  try {
    const res = await turso.execute({
      sql: "SELECT * FROM planning_sessions WHERE phone=? ORDER BY id DESC",
      args: [phone]
    });
    if (res.rows?.length > 0) {
      const mapped = res.rows.map(r => ({
        id: r.id,
        matiere: r.matiere,
        duree: r.duree,
        jours: JSON.parse(r.jours || "[]"),
        done: []
      }));
      planningData = mapped;
      localStorage.setItem("planningData", JSON.stringify(mapped));
    }
  } catch(e) { console.warn("Sync planning Turso:", e); }
}

async function sauvegarderPlanningTurso(item) {
  const phone = localStorage.getItem("userPhone");
  if (!turso || !phone) return null;
  try {
    await turso.execute({
      sql: "INSERT INTO planning_sessions (phone,matiere,duree,jours,date_creation) VALUES (?,?,?,?,?)",
      args: [phone, item.matiere, item.duree, JSON.stringify(item.jours), new Date().toLocaleDateString("fr-FR")]
    });
    const res = await turso.execute({ sql: "SELECT last_insert_rowid() as id", args: [] });
    return res.rows?.[0]?.id || null;
  } catch(e) { console.warn("Save planning Turso:", e); return null; }
}

async function supprimerPlanningTurso(id) {
  if (!turso) return;
  try { await turso.execute({ sql: "DELETE FROM planning_sessions WHERE id=?", args: [id] }); }
  catch(e) { console.warn("Delete planning Turso:", e); }
}

// ========== FIX 15 : SYNC PROGRESSION TURSO ==========
async function syncProgressionDepuisTurso() {
  const phone = localStorage.getItem("userPhone");
  if (!turso || !phone) return;
  try {
    const res = await turso.execute({
      sql: "SELECT * FROM progression_quiz WHERE phone=?",
      args: [phone]
    });
    if (res.rows?.length > 0) {
      const newProgData = {};
      res.rows.forEach(r => {
        newProgData[r.label] = {
          played: r.played,
          totalScore: r.total_score,
          totalQ: r.total_questions
        };
      });
      // Merger avec données locales (garder le max)
      Object.entries(newProgData).forEach(([k, v]) => {
        if (!progData[k] || progData[k].played < v.played) {
          progData[k] = v;
        }
      });
      localStorage.setItem("progData", JSON.stringify(progData));
    }
  } catch(e) { console.warn("Sync progression Turso:", e); }
}

async function sauvegarderProgressionTurso(label, score, total) {
  const phone = localStorage.getItem("userPhone");
  if (!turso || !phone) return;
  try {
    await turso.execute({
      sql: `INSERT INTO progression_quiz (phone,label,played,total_score,total_questions)
            VALUES (?,?,1,?,?)
            ON CONFLICT(phone,label) DO UPDATE SET
            played=played+1, total_score=total_score+?, total_questions=total_questions+?`,
      args: [phone, label, score, total, score, total]
    });
  } catch(e) { console.warn("Save progression Turso:", e); }
}

// ========== FIX 27 : PAGINATION DU CONTENU ==========
const PAGE_SIZE = 20;
let contentPage = 0;
let contentAllItems = [];
let examenPage = 1;


function _renderPage(container) {
  const start = contentPage * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = contentAllItems.slice(start, end);
  const hasMore = end < contentAllItems.length;

  // Garder uniquement les cartes existantes du HTML, ne pas vider si déjà des items
  const existingCards = container.querySelectorAll(".resource-item, .exam-card");
  if (contentPage === 0) container.innerHTML = "";

  pageItems.forEach(item => {
    const el = document.createElement("div");
    el.innerHTML = item._html || "";
    if (el.firstElementChild) container.appendChild(el.firstElementChild);
  });

  // Supprimer le bouton "Voir plus" existant
  const oldBtn = container.querySelector(".load-more-btn");
  if (oldBtn) oldBtn.remove();

  if (hasMore) {
    const btn = document.createElement("button");
    btn.className = "load-more-btn";
    btn.style.cssText = "width:100%;background:var(--bg);border:2px solid var(--border);border-radius:14px;padding:13px;font-weight:800;font-size:13px;cursor:pointer;color:var(--p);margin-top:8px";
    btn.textContent = `Voir plus (${contentAllItems.length - end} restants)`;
    btn.onclick = () => { contentPage++; _renderPage(container); };
    container.appendChild(btn);
  }
}


// Initialisation async : charger la config chiffrée AVANT de connecter Turso

// ========== TURSO — QUIZ ==========
async function syncQuizDepuisTurso() {
  if (!turso) return;
  try {
    const res = await turso.execute({ sql: "SELECT * FROM quiz_questions ORDER BY id DESC", args: [] });
    if (res.rows && res.rows.length > 0) {
      const mapped = res.rows.map(r => ({
        id: r.id, classe: r.classe, matiere: r.matiere, chapitre: r.chapitre,
        q: r.question, c: JSON.parse(r.choix), r: Number(r.reponse),
        auteur: r.auteur || "", date: r.date || "", source: r.source || ""
      }));
      customQuizQuestions = mapped;
      localStorage.setItem("customQuizQuestionsV2", JSON.stringify(mapped));
    }
  } catch(e) { console.warn("Sync Quiz Turso:", e); }
}

async function sauvegarderQuizDansTurso(q) {
  if (!turso) return null;
  try {
    await _tursoWithTimeout({
      sql: `INSERT INTO quiz_questions (classe,matiere,chapitre,question,choix,reponse,auteur,date,source) VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [q.classe, q.matiere, q.chapitre, q.q, JSON.stringify(q.c), q.r,
             localStorage.getItem("userPhone") || "modo",
             new Date().toLocaleDateString("fr-FR"),
             q.source || ""]
    }, 6000);
    const idRes = await _tursoWithTimeout({ sql: "SELECT last_insert_rowid() as id", args: [] }, 4000);
    return idRes.rows?.[0]?.id || null;
  } catch(e) { console.warn("Sauvegarde quiz Turso:", e); return null; }
}

// Suppression de toutes les questions d'un lot CSV importé (par source) — local + Turso
async function supprimerImportCSV(source) {
  if (!source) return;
  const toDelete = customQuizQuestions.filter(q => q.source === source);
  if (!toDelete.length) { showToast("❌ Aucune question trouvée pour ce lot", "error"); return; }
  if (!confirm(`Supprimer les ${toDelete.length} question(s) du fichier "${source}" ? Cette action est irréversible.`)) return;
  customQuizQuestions = customQuizQuestions.filter(q => q.source !== source);
  localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));
  // Suppression Turso en arrière-plan (par lots de 5 en parallèle pour rester rapide)
  const ids = toDelete.map(q => q.id).filter(id => typeof id === "number" || /^\d+$/.test(String(id)));
  if (turso && ids.length) {
    showToast(`🗑️ Suppression locale OK — synchronisation Turso en cours...`, "info");
    (async () => {
      for (let i = 0; i < ids.length; i += 5) {
        const batch = ids.slice(i, i+5);
        await Promise.allSettled(batch.map(id => supprimerQuizDeTurso(id)));
      }
      showToast(`✅ Lot "${source}" entièrement supprimé`, "success");
    })();
  } else {
    showToast(`🗑️ ${toDelete.length} question(s) supprimée(s)`, "success");
  }
  renderQuizAdminList();
}

async function supprimerQuizDeTurso(id) {
  if (!turso) return;
  try { await turso.execute({ sql: "DELETE FROM quiz_questions WHERE id=?", args: [id] }); }
  catch(e) { console.warn("Suppression quiz Turso:", e); }
}

// ========== TURSO — SIGNALEMENTS ==========
async function envoyerSignalement(contenuId, typeSignal, message) {
  if (!turso) return false;
  try {
    await turso.execute({
      sql: `INSERT INTO signalements (contenu_id,type_signal,message,auteur,date) VALUES (?,?,?,?,?)`,
      args: [contenuId, typeSignal, message,
             localStorage.getItem("userPhone") || "anonyme",
             new Date().toLocaleDateString("fr-FR")]
    });
    return true;
  } catch(e) { console.warn("Signalement Turso:", e); return false; }
}

// ========== TURSO — UTILISATEURS / PSEUDOS ==========
async function enregistrerUtilisateur(phone) {
  if (!turso || !phone) return;
  try {
    await turso.execute({
      sql: `INSERT OR IGNORE INTO utilisateurs (phone, date_inscription) VALUES (?,?)`,
      args: [phone, new Date().toLocaleDateString("fr-FR")]
    });
    // Charger le pseudo si existant
    const res = await turso.execute({ sql: "SELECT pseudo FROM utilisateurs WHERE phone=?", args: [phone] });
    if (res.rows?.[0]?.pseudo) {
      localStorage.setItem("userPseudo", res.rows[0].pseudo);
      const el = document.getElementById("profilNom");
      if (el) el.textContent = res.rows[0].pseudo;
    }
  } catch(e) { console.warn("Enregistrement user Turso:", e); }
}

async function sauvegarderPseudo(pseudo) {
  const phone = localStorage.getItem("userPhone");
  if (!phone) return false;
  if (!turso) { localStorage.setItem("userPseudo", pseudo); return true; }
  try {
    await turso.execute({ sql: "UPDATE utilisateurs SET pseudo=? WHERE phone=?", args: [pseudo, phone] });
    localStorage.setItem("userPseudo", pseudo);
    return true;
  } catch(e) { console.warn("Pseudo Turso:", e); return false; }
}
(async () => {
  await _initConfig();
  await initTurso();
  await _chargerSettingsTurso();
  verifierConfigAuDemarrage();
})();

// ========== TOAST AMÉLIORÉ ==========
function showToast(msg, type = "default") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show";
  if (type === "success") t.classList.add("toast-success");
  else if (type === "error") t.classList.add("toast-error");
  else if (type === "info") t.classList.add("toast-info");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = "", 4000);
}

// ========== NAVIGATION ==========
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function showTab(tab) {
  // Masquer tous les onglets
  ["accueil","saved","notifs","profil","quiz","forum"].forEach(t => {
    const el = document.getElementById("t-" + t);
    if (!el) return;
    if (t === tab) {
      el.style.display = (t === "quiz" || t === "forum") ? "flex" : "block";
    } else {
      el.style.display = "none";
    }
  });

  // Mettre à jour la barre de navigation
  document.querySelectorAll(".nbtn").forEach(btn => {
    const lbl = btn.querySelector(".nlbl");
    const ico = btn.querySelector(".nico");
    const isActive = btn.getAttribute("data-tab") === tab;
    if (lbl) { lbl.classList.remove("on","off"); lbl.classList.add(isActive ? "on" : "off"); }
    if (ico) { ico.classList.remove("on"); if (isActive) ico.classList.add("on"); }
  });

  // Remonter en haut du scroll à chaque changement d'onglet
  const scroll = document.querySelector(".scroll");
  if (scroll) scroll.scrollTop = 0;

  // Actions spécifiques par onglet
  if (tab === "saved") renderSavedList();
  if (tab === "forum") renderForum();
  if (tab === "notifs") renderNotifications();
  if (tab === "quiz") { renderQuizHistory(); initQuizSelects(); }
  if (tab === "profil") {
    updateStorageUI();
    verifierAdmin();
    chargerContributionsEnAttente();
    updateProfilStatus();
    afficherPseudoSection();
    chargerProgDataTurso();
  }
}

// ========== PAGINATION (Fix 27) ==========

function paginateItems(items, page, size) {
  size = size || PAGE_SIZE; page = page || 1;
  const start = (page - 1) * size;
  return {
    items: items.slice(start, start + size),
    page, total: items.length,
    totalPages: Math.ceil(items.length / size),
    hasNext: start + size < items.length,
    hasPrev: page > 1,
  };
}

function renderPaginationBar(pag, onPageFn) {
  if (pag.totalPages <= 1) return "";
  return `<div style="display:flex;justify-content:center;align-items:center;gap:10px;padding:14px 0">
    <button onclick="${onPageFn}(${pag.page-1})" ${pag.hasPrev?"":"disabled"} style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 16px;font-weight:700;font-size:12px;cursor:pointer;color:${pag.hasPrev?"var(--p)":"var(--t3)"}">← Préc</button>
    <span style="font-size:12px;font-weight:700;color:var(--t2)">Page ${pag.page}/${pag.totalPages}</span>
    <button onclick="${onPageFn}(${pag.page+1})" ${pag.hasNext?"":"disabled"} style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 16px;font-weight:700;font-size:12px;cursor:pointer;color:${pag.hasNext?"var(--p)":"var(--t3)"}">Suiv →</button>
  </div>`;
}

function goExamenPage(p) { examenPage = p; renderExamens(); }

// Filtre interne de l'onglet fusionné "Examens & Séquentielles" : tout | officiel | sequentielle
let examenFiltreType = "officiel";
// Pagination Précédent/Suivant PAR MATIÈRE (pas de page globale) — chaque
// section matière (comme pour les Séquentielles/Cours) tourne ses pages
// indépendamment des autres.
let examenPageParMat = {};

function setExamenFiltre(t) {
  examenFiltreType = t;
  renderExamens();
}

async function renderExamens() {
  examenPageParMat = {}; // reset pagination de chaque section matière au changement de classe
  const container = document.getElementById("mainContent");
  if (!container) return;

  // ── Bandeau de diagnostic, visible UNIQUEMENT pour les modérateurs/admin ──
  // (récupéré de l'ancien correctif qui écrasait renderContent — voir note
  // dans 01-turso-securite.js). Montre pour chaque examen ET séquentielle si
  // la classe correspond à la classe active, pour repérer vite un souci de
  // classe mal formatée.
  let diagHtml = "";
  const phoneActuel = localStorage.getItem("userPhone") || "";
  const estModoOuAdmin = (await isAdminPhone(phoneActuel)) || (typeof isModeratorPhone === "function" && await isModeratorPhone(phoneActuel));
  if (estModoOuAdmin) {
    const tousBruts = getContenuPublie().filter(c => c.typeFichier === "examen_officiel" || c.type === "examen" || c.typeFichier === "sequencielle");
    diagHtml = `<div style="background:#fff3cd;border:2px solid #f0ad4e;border-radius:10px;padding:10px;margin:10px 14px 0;font-size:9px;font-family:monospace;color:#333">
      <div style="font-weight:800;margin-bottom:4px">🔍 DIAG Examens &amp; Séquentielles (modérateur/admin) — classe="${esc(activeClasse)}"</div>
      ${tousBruts.map(c => {
        const lyceeNorm = String(c.lycee || "principal").trim().toLowerCase();
        const match = !c.classe || _classeMatch(c.classe, activeClasse);
        const exclu = lyceeNorm === "autres";
        const cat = c.typeFichier === "sequencielle" ? "SÉQ" : "EXAMEN";
        return `${exclu ? '🔴' : (match ? '🟢' : '⚪')} [${cat}] ${esc((c.titre||"").slice(0,35))} | lycee="${esc(String(c.lycee))}" | classe="${esc(String(c.classe))}" | ${exclu?'EXCLU (autre lycée)':(match?'AFFICHÉ':'classe différente')}`;
      }).join("<br>")}
    </div>`;
  }

  const filtreBar = `<div style="display:flex;gap:8px;padding:12px 14px;background:var(--bg2,rgba(0,0,0,0.03));border-bottom:1px solid var(--border);position:sticky;top:0;z-index:5">
    <button class="ttab ${examenFiltreType==='officiel'?'on':''}" style="flex:1;font-size:13px;font-weight:900;padding:10px 8px;border-radius:12px" onclick="setExamenFiltre('officiel')">🏆 Examens</button>
    <button class="ttab ${examenFiltreType==='sequentielle'?'on':''}" style="flex:1;font-size:13px;font-weight:900;padding:10px 8px;border-radius:12px" onclick="setExamenFiltre('sequentielle')">📋 Séquentielles</button>
  </div>`;

  let html = diagHtml + filtreBar;
  if (examenFiltreType === "tout" || examenFiltreType === "officiel") {
    html += _renderSectionExamensOfficiels();
  }
  if (examenFiltreType === "tout" || examenFiltreType === "sequentielle") {
    html += _renderSectionSequentielles();
  }
  container.innerHTML = html;
}

// ── Section Examens officiels — regroupée par MATIÈRE (comme Cours/
// Séquentielles/Trav. Dirigés) avec pagination Précédent/Suivant PAR MATIÈRE
// au lieu d'une seule longue liste "complète" toutes matières mélangées. ──
function _renderSectionExamensOfficiels() {
  // Relit toujours fraîchement depuis localStorage (jamais de variable mise en cache)
  const publies = getContenuPublie();
  const examensBrut = publies.filter(c => {
    const estExamen = (c.typeFichier === "examen_officiel" || c.type === "examen");
    if (!estExamen) return false;
    if (_estVideoContenu(c)) return false; // déjà dans l'onglet 🎬 Vidéos
    // Normalise la comparaison (espaces parasites, casse) pour éviter tout
    // faux négatif/positif lié à des données mal formatées.
    const lyceeNorm = String(c.lycee || "principal").trim().toLowerCase();
    if (lyceeNorm === "autres") return false;
    return _classeMatch(c.classe, activeClasse);
  });
  // Gratuits en premier, puis par date décroissante — ordre global conservé
  // (sert aussi à calculer le quota d'examens gratuits ci-dessous)
  examensBrut.sort((a, b) => {
    const ap = a.premium ? 1 : 0, bp = b.premium ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return (b.date || 0) - (a.date || 0);
  });

  if (!examensBrut.length) {
    return `<div style="padding:28px 16px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🏆</div>
      <div style="font-weight:800;font-size:15px;margin-bottom:8px">Épreuves & Examens</div>
      <div style="color:var(--t3);font-size:12px;margin-bottom:20px">BAC · BEPC · Probatoire</div>
      <button onclick="ouvrirContribModal()" style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:14px 24px;font-weight:800;font-size:13px;cursor:pointer">📤 Soumettre une épreuve</button>
    </div>`;
  }

  const totalExamens = examensBrut.length;
  // Statut premium/gratuit calculé sur l'ordre global (avant regroupement par matière)
  examensBrut.forEach((ch, idx) => {
    const freeLimit = !checkPremium() && idx >= FREE_LIMITS.EXAMENS_MAX;
    ch._lock = (ch.premium && !isPremium) || freeLimit;
    ch._freeLimit = freeLimit;
  });

  const mats = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
  const parMat = {};
  for (const m of mats) parMat[m] = [];
  for (const c of examensBrut) { if (parMat[c.mat] !== undefined) parMat[c.mat].push(c); }

  let html = `<div style="padding:10px 14px 6px">
    <div style="font-weight:800;font-size:13px;color:var(--p)">🏆 Examens officiels — ${esc(activeClasse)} <span style="color:var(--t3);font-size:10px;font-weight:500">(${totalExamens})</span></div>
    ${!checkPremium() && totalExamens > FREE_LIMITS.EXAMENS_MAX ? `<div style="background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1A1530;font-size:10px;font-weight:800;padding:6px 10px;border-radius:10px;margin-top:6px">⭐ ${totalExamens - FREE_LIMITS.EXAMENS_MAX} examens supplémentaires disponibles en Premium</div>` : ""}
  </div>`;

  for (const mat of mats) {
    const tousExamensMat = parMat[mat] || [];
    if (tousExamensMat.length === 0) continue; // pas de section vide pour les examens (contrairement aux Séquentielles)
    const emo = EMOJIS[mat] || "📘";
    const col = COLORS[mat] || "var(--p)";
    const matCap = NOMS_MATIERES[mat] || mat.replace(/_/g," ");

    const pagePourMat = examenPageParMat[mat] || 1;
    const pag = paginateItems(tousExamensMat, pagePourMat);

    html += `<div class="msec fade-in">
      <div class="mhead" style="border-left:4px solid ${col}"><div class="mico" style="background:${col}20">${emo}</div><div class="mnom" style="color:${col}">${matCap}</div><div class="mcnt">${tousExamensMat.length} examen${tousExamensMat.length>1?"s":""}</div></div>
      <div class="chapitre-list">`;

    pag.items.forEach(ch => {
      const examBadge = (ch.premium || ch._freeLimit)
        ? `<span style="font-size:9px;background:var(--gold2);color:white;padding:1px 6px;border-radius:6px;white-space:nowrap">⭐ Premium</span>`
        : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
      html += `<div class="resource-item" onclick="${ch._lock ? `openPremiumGate('examens')` : `viewContenuPublie('${String(ch.id)}')`}">
        <div style="font-size:22px">${emo}</div>
        <div style="flex:1;padding:0 10px">
          <div class="chapitre-titre">${esc(ch.titre)}</div>
          <div style="font-size:10px;color:var(--t3);display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px">${esc(ch.classe||"")} ${ch._lock?"🔒":""} ${examBadge}</div>
        </div>
        <button class="res-share" onclick="event.stopPropagation();shareResource('${esc(ch.titre||"").replace(/'/g,"\\'")}',window.location.href)">📤</button>
      </div>`;
    });

    html += `</div>${renderPaginationBar(pag, `goExamenPageMat_${mat}`)}</div>`;
  }

  html += `<div style="padding:0 14px 14px">
    <button onclick="ouvrirContribModal()" style="width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer">📤 Soumettre une épreuve</button>
  </div>`;
  return html;
}

// Une fonction goExamenPageMat_<matiere> par matière (générée dynamiquement)
// pour que chaque bouton Précédent/Suivant ne fasse tourner QUE sa propre
// section, sans toucher aux autres matières.
function _initGoExamenPageMatFns() {
  for (const m of MATIERES) {
    window[`goExamenPageMat_${m}`] = function(p) {
      examenPageParMat[m] = p;
      renderExamens();
    };
  }
}
_initGoExamenPageMatFns();

// ── Section Séquentielles (logique portée telle quelle depuis l'ancien onglet dédié) ──
function _renderSectionSequentielles() {
  const publies = getContenuPublie();
  const seqClasse = publies.filter(c => {
    if (c.typeFichier !== "sequencielle") return false;
    if (_estVideoContenu(c)) return false; // déjà dans l'onglet 🎬 Vidéos
    const lyceeNorm = String(c.lycee || "principal").trim().toLowerCase();
    if (lyceeNorm === "autres") return false;
    return _classeMatch(c.classe, activeClasse);
  });
  const mats = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
  const parMat = {};
  for (const m of mats) parMat[m] = [];
  for (const c of seqClasse) { if (parMat[c.mat] !== undefined) parMat[c.mat].push(c); }
  for (const m of mats) parMat[m].sort((a,b) => {
    const ap = a.premium ? 1 : 0, bp = b.premium ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return (a.numero||0)-(b.numero||0);
  });

  let html = `<div style="padding:14px 14px 4px 14px">
    <div style="font-weight:800;font-size:13px;color:var(--p)">📋 Séquentielles — ${esc(activeClasse)}</div>
  </div>`;
  for (const mat of mats) {
    const lecons = parMat[mat] || [];
    const emo = EMOJIS[mat] || "📘";
    const col = COLORS[mat] || "var(--p)";
    const matCap = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
    html += `<div class="msec fade-in">
      <div class="mhead" style="border-left:4px solid ${col}"><div class="mico" style="background:${col}20">${emo}</div><div class="mnom" style="color:${col}">${matCap}</div><div class="mcnt">${lecons.length} séq.</div></div>
      <div class="chapitre-list">`;
    if (lecons.length === 0) {
      html += `<div class="resource-item" style="opacity:0.5;pointer-events:none"><div class="chapitre-num" style="color:${col}">—</div><div class="chapitre-titre" style="color:var(--t3);font-style:italic">Aucune séquentielle publiée</div></div>`;
    } else {
      for (const ch of lecons) {
        const lock = ch.premium && !isPremium;
        const seqLabel = ch.numero ? `Séq. ${ch.numero}` : "—";
        const seqBadge = ch.premium
          ? `<span style="font-size:9px;background:var(--gold2);color:white;padding:1px 6px;border-radius:6px;white-space:nowrap">⭐ Premium</span>`
          : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
        html += `<div class="resource-item" onclick="${lock ? "openPremiumGate('sequentielle')" : `viewContenuPublie('${String(ch.id)}')`}">
          <div style="min-width:44px;display:flex;flex-direction:column;align-items:center;gap:1px">
            <div class="chapitre-num" style="color:${col};font-size:11px;font-weight:900">${seqLabel}</div>
          </div>
          <div style="flex:1">
            <div class="chapitre-titre">${ch.titre}</div>
            <div style="font-size:9px;color:var(--t3);margin-top:1px;display:flex;align-items:center;gap:4px">Séq. · ${matCap} ${seqBadge}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span>${lock?"🔒":"✅"}</span>
            <button class="res-share" onclick="event.stopPropagation();shareResource('${(ch.titre||"").replace(/'/g,"\\'")}',window.location.href)" title="Partager">📤</button>
          </div>
        </div>`;
      }
    }
    html += `</div></div>`;
  }
  return html;
}

// ── Répare les entrées publiées AVANT le correctif du mapping type/typeFichier ──
// Ancien bug (panel modérateur "publierContenu") : toute Séquentielle / Fiche
// La Zone / Exercice Compétence publiée manuellement recevait type="cours" au
// lieu de son vrai type, alors que typeFichier restait correct. Conséquence :
// ce contenu se mélangeait dans l'onglet Cours au lieu d'apparaître dans
// Séquentielles ou Travaux Dirigés. On corrige le champ "type" à la volée en
// le redérivant de typeFichier, qui lui n'a jamais été faux.
const _TYPEFICHIER_VERS_TYPE_APP = {
  sequencielle: "sequencielle", examen_officiel: "examen",
  la_zone: "la_zone", competences: "competences", cours: "cours", video: "video"
};
function _reparerTypeContenu(c) {
  const bonType = _TYPEFICHIER_VERS_TYPE_APP[c.typeFichier];
  if (bonType && c.type === "cours" && bonType !== "cours") {
    return { ...c, type: bonType };
  }
  return c;
}

// Détecte si un contenu publié est une vidéo (a déjà sa place dédiée dans
// l'onglet 🎬 Vidéos — donc à exclure des onglets Cours/Séquentielles/
// Examens/Travaux Dirigés pour éviter les doublons/mélanges).
function _estVideoContenu(c) {
  return !!(c.videoUrl || (c.contenu && String(c.contenu).startsWith("[VIDEO:")));
}

// ========== STOCKAGE UNIFIÉ (Fix 28) ==========
function getContenuPublie() {
  try {
    const items = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
    // Normaliser le champ premium : "1", 1, true → true ; "0", 0, false, null → false
    return items.map(c => _reparerTypeContenu({ ...c, premium: c.premium === true || c.premium === 1 || c.premium === "1" }));
  } catch(e) { return []; }
}

// ========== PROGRESSION & PLANNING SYNC TURSO (Fix 15) ==========

async function chargerProgDataTurso() {
  if (!turso) return;
  const phone = localStorage.getItem("userPhone");
  if (!phone) return;
  try {
    const res = await turso.execute({ sql:"SELECT progression,planning FROM utilisateurs WHERE phone=?", args:[phone] });
    const r = res.rows?.[0];
    if (r?.progression && r.progression !== "{}") {
      progData = JSON.parse(r.progression);
      localStorage.setItem("progData", r.progression);
    }
    if (r?.planning && r.planning !== "[]") {
      planningData = JSON.parse(r.planning);
      localStorage.setItem("planningData", r.planning);
    }
  } catch(e) { console.warn("chargerProgData:", e); }
}

// ========== SÉCURITÉ — UTILITAIRES ==========

// Fix 1 : Échappement HTML pour prévenir XSS
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}




// ── Corriger automatiquement toutes les URLs image/upload → raw/upload dans Turso ──
async function corrigerUrlsCloudinary() {
  if (!confirm("Corriger automatiquement toutes les URLs PDF dans Turso ?\n\nimage/upload → raw/upload\n\nContinuer ?")) return;

  showToast("⏳ Scan en cours...", "info");

  if (!turso) {
    showToast("❌ Turso non disponible", "error");
    return;
  }

  try {
    // Récupérer TOUS les fichiers PDF pour tout remettre proprement
    const res = await _tursoWithTimeout({
      sql: "SELECT id, fichier_url FROM contenu WHERE fichier_url LIKE '%.pdf'",
      args: []
    }, 8000);

    if (!res.rows || res.rows.length === 0) {
      showToast("✅ Aucun fichier PDF trouvé", "info");
      return;
    }

    const total = res.rows.length;
    let corriges = 0;
    let erreurs = 0;

    showToast(`🔧 ${total} URL(s) à corriger...`, "info");

    for (const row of res.rows) {
      const id = row.id || row[0];
      let oldUrl = row.fichier_url || row[1];
      // 1. Supprimer toute transformation existante (raw/upload, fl_attachment, etc.)
      let newUrl = oldUrl
        .replace('/raw/upload/fl_attachment/', '/image/upload/')
        .replace('/raw/upload/', '/image/upload/')
        .replace('/image/upload/fl_attachment/', '/image/upload/')
        .replace('/upload/fl_attachment/', '/upload/');
      // 2. Ne PAS ajouter fl_attachment — garder l'URL originale propre

      try {
        await _tursoWithTimeout({
          sql: "UPDATE contenu SET fichier_url=?, contenu=REPLACE(contenu, ?, ?) WHERE id=?",
          args: [newUrl, oldUrl, newUrl, id]
        }, 5000);
        corriges++;

        // Mettre à jour aussi le localStorage
        const publies = getContenuPublie();
        const idx = publies.findIndex(p => String(p.id) === String(id));
        if (idx >= 0) {
          publies[idx].fichierUrl = newUrl;
          if (publies[idx].contenu) publies[idx].contenu = publies[idx].contenu.replace(oldUrl, newUrl);
        }
        localStorage.setItem("contenu_publie", JSON.stringify(publies));

      } catch(e) {
        erreurs++;
        console.warn("Erreur correction URL id=" + id, e);
      }
    }

    if (erreurs === 0) {
      showToast(`✅ ${corriges} URL(s) corrigée(s) avec succès !`, "success");
    } else {
      showToast(`⚠️ ${corriges} corrigée(s), ${erreurs} erreur(s)`, "info");
    }

    // Resynchroniser le contenu local
    await syncContenuDepuisTurso();
    showToast("🔄 Contenu resynchronisé !", "success");

  } catch(e) {
    showToast("❌ Erreur : " + e.message, "error");
  }
}

// ── Voir les URLs Cloudinary + détecter 404 + republier ──
async function voirUrlsFichiers() {
  showToast("⏳ Chargement des fichiers...", "info");
  let fichiers = [];

  if (turso) {
    try {
      const res = await _tursoWithTimeout({
        sql: "SELECT id, titre, classe, mat, fichier_url, fichier_type FROM contenu ORDER BY date DESC",
        args: []
      }, 6000);
      if (res.rows) {
        fichiers = res.rows.map(r => ({
          id: r.id || r[0],
          titre: r.titre || r[1] || "Sans titre",
          classe: r.classe || r[2] || "",
          mat: r.mat || r[3] || "",
          url: _fixCloudinaryUrl(r.fichier_url || r[4] || ""),
          type: r.fichier_type || r[5] || ""
        }));
      }
    } catch(e) {
      showToast("❌ Erreur Turso : " + e.message, "error");
      return;
    }
  }

  if (!fichiers.length) {
    showToast("Aucun fichier trouvé", "info");
    return;
  }

  // Créer le modal d'abord
  const modal = document.createElement("div");
  modal.className = "ovl show";
  modal.style.cssText = "z-index:9999";
  modal.id = "urlsModal";
  modal.innerHTML = `
    <div class="modal" style="max-height:85vh;overflow-y:auto" id="urlsModalContent">
      <button onclick="document.getElementById('urlsModal').remove()"
        style="position:sticky;top:0;float:right;background:var(--card);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;z-index:1;margin-bottom:8px">✕</button>
      <div style="font-weight:900;font-size:15px;margin-bottom:4px">🔗 URLs Cloudinary</div>
      <div id="urls-stats" style="font-size:11px;color:var(--t2);margin-bottom:10px">${fichiers.length} fichiers trouvés — vérification en cours...</div>
      <div id="urls-liste"></div>
    </div>`;
  document.body.appendChild(modal);

  // Vérifier accessibilité de chaque URL
  const sansUrl = fichiers.filter(f => !f.url);
  const avecUrl = fichiers.filter(f => f.url);
  const inaccessibles = [];

  showToast(`🔍 Vérification de ${avecUrl.length} fichier(s)...`, "info");

  for (const f of avecUrl) {
    try {
      const res = await Promise.race([
        fetch(f.url, { method: "HEAD" }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000))
      ]);
      f.statut = res.ok ? "ok" : "erreur_" + res.status;
      if (!res.ok) inaccessibles.push(f);
    } catch(e) {
      // CORS bloqué = probablement accessible quand même
      f.statut = "inconnu";
    }
  }

  // Mettre à jour l'affichage
  const statsEl = document.getElementById("urls-stats");
  const listeEl = document.getElementById("urls-liste");
  if (!statsEl || !listeEl) return;

  statsEl.innerHTML = `✅ ${avecUrl.filter(f=>f.statut==="ok").length} accessibles · ❌ ${inaccessibles.length} inaccessibles · ⚠️ ${sansUrl.length} sans URL`;

  let html = "";

  // Fichiers inaccessibles (404)
  if (inaccessibles.length) {
    html += `<div style="font-weight:800;font-size:12px;color:var(--red);margin-bottom:8px">❌ Fichiers inaccessibles (${inaccessibles.length})</div>`;
    html += inaccessibles.map(f => `
      <div style="background:#fff3f3;border:1.5px solid #ffcdd2;border-radius:10px;padding:10px;margin-bottom:8px">
        <div style="font-weight:700;font-size:12px">${esc(f.titre)}</div>
        <div style="font-size:10px;color:var(--t2);margin-bottom:8px">${esc(f.classe)} · ${esc(f.mat)} · ${f.statut}</div>
        <div style="font-size:9px;color:#c00;margin-bottom:8px;word-break:break-all">${f.url}</div>
        <label style="display:flex;align-items:center;gap:8px;background:white;border:1.5px solid #e0e0e0;border-radius:8px;padding:8px;cursor:pointer">
          <input type="file" accept=".pdf,.doc,.docx" id="reupload-${f.id}" style="display:none" onchange="_reuploadFichier('${f.id}', this)">
          <span style="font-size:11px;font-weight:800;color:var(--p)">📤 Sélectionner le fichier à republier</span>
        </label>
        <div id="reupload-status-${f.id}" style="font-size:10px;margin-top:6px;display:none"></div>
      </div>`).join("");
  }

  // Fichiers sans URL
  if (sansUrl.length) {
    html += `<div style="font-weight:800;font-size:12px;color:orange;margin:10px 0 8px">⚠️ Sans URL (${sansUrl.length})</div>`;
    html += sansUrl.map(f => `
      <div style="background:#fffbf0;border:1px solid #ffe082;border-radius:10px;padding:10px;margin-bottom:6px">
        <div style="font-weight:700;font-size:12px">${esc(f.titre)}</div>
        <div style="font-size:10px;color:var(--t2);margin-bottom:8px">${esc(f.classe)} · ${esc(f.mat)}</div>
        <label style="display:flex;align-items:center;gap:8px;background:white;border:1.5px solid #e0e0e0;border-radius:8px;padding:8px;cursor:pointer">
          <input type="file" accept=".pdf,.doc,.docx" id="reupload-${f.id}" style="display:none" onchange="_reuploadFichier('${f.id}', this)">
          <span style="font-size:11px;font-weight:800;color:var(--p)">📤 Uploader le fichier manquant</span>
        </label>
        <div id="reupload-status-${f.id}" style="font-size:10px;margin-top:6px;display:none"></div>
      </div>`).join("");
  }

  // Fichiers OK
  const ok = avecUrl.filter(f => f.statut === "ok" || f.statut === "inconnu");
  if (ok.length) {
    html += `<div style="font-weight:800;font-size:12px;color:#059669;margin:10px 0 8px">✅ Accessibles (${ok.length})</div>`;
    html += ok.map(f => `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:6px">
        <div style="font-weight:700;font-size:12px">${esc(f.titre)}</div>
        <div style="font-size:10px;color:var(--t2);margin-bottom:6px">${esc(f.classe)} · ${esc(f.mat)}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="font-size:9px;color:var(--t2);background:var(--bg);border-radius:6px;padding:4px 6px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.url}</div>
          <button onclick="_copierTexte('${f.url}')" style="background:var(--p);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;flex-shrink:0">📋</button>
          <a href="${f.url}" target="_blank" style="background:var(--p2);color:white;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:800;text-decoration:none;flex-shrink:0">🔗</a>
        </div>
      </div>`).join("");
  }

  listeEl.innerHTML = html;
}

// ── Réuploader un fichier manquant ou inaccessible ──
async function _reuploadFichier(id, input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById("reupload-status-" + id);
  if (statusEl) { statusEl.style.display = "block"; statusEl.innerHTML = "⏳ Upload en cours..."; statusEl.style.color = "var(--t2)"; }

  const newUrl = await uploadToCloudinary(file, id);
  if (!newUrl) {
    if (statusEl) { statusEl.innerHTML = "❌ Upload échoué — réessaie"; statusEl.style.color = "red"; }
    return;
  }

  // Mettre à jour Turso
  try {
    await _tursoWithTimeout({
      sql: "UPDATE contenu SET fichier_url=?, contenu=? WHERE id=?",
      args: [newUrl, "[CLOUD: " + newUrl + "]", String(id)]
    }, 5000);
    // Mettre à jour localStorage
    const publies = getContenuPublie();
    const idx = publies.findIndex(p => String(p.id) === String(id));
    if (idx >= 0) { publies[idx].fichierUrl = newUrl; publies[idx].contenu = "[CLOUD: " + newUrl + "]"; }
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    if (statusEl) { statusEl.innerHTML = "✅ Fichier republié avec succès !"; statusEl.style.color = "green"; }
    showToast("✅ Fichier republié !", "success");
    setTimeout(() => voirUrlsFichiers(), 1500);
  } catch(e) {
    if (statusEl) { statusEl.innerHTML = "❌ Erreur Turso : " + e.message; statusEl.style.color = "red"; }
  }
}


// ── Anti-copie d'URL : les liens Cloudinary ne sont jamais écrits dans le HTML ──
// (pas de href visible/copiable au clic long) — on ouvre l'URL directement en JS,
// donc aucune perte de vitesse par rapport à un lien classique.
window._cldFiles = window._cldFiles || {};

function _regFichier(url) {
  const key = "f" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  window._cldFiles[key] = url;
  return key;
}

function _ouvrirFichierProtege(key, nom, btnId) {
  const url = window._cldFiles[key];
  if (!url) { showToast("❌ Fichier introuvable", "error"); return; }
  window.open(url, "_blank", "noopener,noreferrer");
}

// ── Nettoyer URL Cloudinary (supprimer transformations parasites) ──
function _fixCloudinaryUrl(url) {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    // Détecter si c'est un PDF (raw) — ne pas toucher au type de ressource
    const isPdfUrl = url.includes('/raw/upload/') ||
                     url.toLowerCase().includes('.pdf');
    if (isPdfUrl) {
      // Pour les PDFs : garder /raw/upload/, juste retirer fl_attachment parasite
      url = url.replace('/raw/upload/fl_attachment/', '/raw/upload/');
    } else {
      // Pour les images : nettoyer les transformations parasites
      url = url
        .replace('/image/upload/fl_attachment/', '/image/upload/')
        .replace('/upload/fl_attachment/', '/upload/');
    }
  }
  return url;
}

// ── Copier texte compatible mobile ──
function _copierTexte(texte) {
  // Méthode 1 : clipboard API moderne
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texte)
      .then(() => showToast("✅ URL copiée !", "success"))
      .catch(() => _copierFallback(texte));
  } else {
    _copierFallback(texte);
  }
}
function _copierFallback(texte) {
  // Méthode 2 : textarea temporaire (compatible tous navigateurs)
  const ta = document.createElement("textarea");
  ta.value = texte;
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    showToast("✅ URL copiée !", "success");
  } catch(e) {
    showToast("❌ Impossible de copier automatiquement", "error");
  }
  document.body.removeChild(ta);
}

// ── Ouvrir le fichier directement dans le navigateur (téléchargement natif) ──
function _ouvrirPdfNatif(url, nom, btnId) {
  const btn = document.getElementById(btnId);

  // Construire l'URL fl_attachment pour forcer le téléchargement côté Cloudinary
  let dlUrl = url;
  if (url && url.includes('cloudinary.com')) {
    if (url.includes('/raw/upload/') && !url.includes('fl_attachment')) {
      dlUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    } else if (url.includes('/image/upload/') && !url.includes('fl_attachment')) {
      dlUrl = url.replace('/image/upload/', '/image/upload/fl_attachment/');
    } else if (url.includes('/upload/') && !url.includes('fl_attachment')) {
      dlUrl = url.replace('/upload/', '/upload/fl_attachment/');
    }
  }

  if (btn) {
    btn.innerHTML = '📥 Ouverture...';
  }

  // Ouvrir directement le lien dans le navigateur — le téléphone gère le téléchargement nativement
  window.open(dlUrl, '_blank', 'noopener,noreferrer');

  if (btn) {
    setTimeout(() => { btn.innerHTML = '📥 Ouvrir le fichier'; }, 1500);
  }
  showToast("📥 Ouverture du fichier...", "info");
}

// ========== PDF.js — RENDU PDF UNIVERSEL ==========
function renderPdfJs(url, containerId, nom) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const _k = _regFichier(url);
  if (typeof pdfjsLib === "undefined") {
    container.innerHTML = `<div style="text-align:center;padding:24px"><div style="font-size:40px;margin-bottom:10px">📄</div><div style="font-weight:800;font-size:13px;margin-bottom:14px">${nom}</div><button onclick="_ouvrirFichierProtege('${_k}','${nom}',null)" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:14px 24px;font-weight:800;font-size:14px;cursor:pointer">🔗 Ouvrir le PDF</button></div>`;
    return;
  }
  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:20px;color:var(--t2);font-weight:700;font-size:13px"><div style="width:20px;height:20px;border:3px solid var(--p);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>Chargement...</div>`;
  pdfjsLib.getDocument({url:url,withCredentials:false}).promise.then(function(pdf){
    const total = pdf.numPages;
    container.innerHTML = `<div style="font-size:11px;color:var(--t2);text-align:center;margin-bottom:8px;font-weight:700">📄 ${total} page${total>1?"s":""}</div>`;
    for(let pg=1;pg<=Math.min(total,20);pg++){
      const wrap=document.createElement("div");
      wrap.style.cssText="margin-bottom:4px;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)";
      const cv=document.createElement("canvas");
      wrap.appendChild(cv);container.appendChild(wrap);
      pdf.getPage(pg).then(function(page){
        const vp=page.getViewport({scale:window.devicePixelRatio>1?1.8:1.5});
        cv.width=vp.width;cv.height=vp.height;cv.style.width="100%";cv.style.display="block";
        page.render({canvasContext:cv.getContext("2d"),viewport:vp});
      });
    }
    if(total>20){const m=document.createElement("div");m.style.cssText="text-align:center;font-size:11px;color:var(--t2);padding:10px;font-weight:700";m.textContent="... et "+(total-20)+" pages supplémentaires";container.appendChild(m);}
  }).catch(function(){
    container.innerHTML=`<div style="text-align:center;padding:24px"><div style="font-size:40px;margin-bottom:10px">📄</div><div style="font-size:12px;color:var(--t2);margin-bottom:14px">Aperçu non disponible</div><button onclick="_ouvrirFichierProtege('${_k}','${nom}',null)" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:14px 24px;font-weight:800;font-size:14px;cursor:pointer">🔗 Ouvrir le PDF</button></div>`;
  });
}

// Fix 4 : Génération cryptographique de codes premium
function genererCodeCrypto() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  const part1 = Array.from(arr.slice(0,4)).map(b => chars[b % chars.length]).join("");
  const part2 = Array.from(arr.slice(4,8)).map(b => chars[b % chars.length]).join("");
  return "LU-" + part1 + "-" + part2;
}

// Fix 13 : Protection brute force connexion
const _loginAttempts = { count: 0, blockedUntil: 0 };
function checkBruteForce() {
  const now = Date.now();
  const stored = JSON.parse(localStorage.getItem("_loginAttempts") || '{"count":0,"blockedUntil":0}');
  if (now < stored.blockedUntil) {
    const secs = Math.ceil((stored.blockedUntil - now) / 1000);
    showToast(`🔒 Trop de tentatives — attends ${secs}s`, "error");
    return false;
  }
  return true;
}
function recordLoginAttempt(success) {
  const now = Date.now();
  const stored = JSON.parse(localStorage.getItem("_loginAttempts") || '{"count":0,"blockedUntil":0}');
  if (success) {
    localStorage.setItem("_loginAttempts", JSON.stringify({ count: 0, blockedUntil: 0 }));
    return;
  }
  stored.count++;
  if (stored.count >= 5) {
    stored.blockedUntil = now + 5 * 60 * 1000; // 5 min
    stored.count = 0;
    showToast("🔒 Compte bloqué 5 minutes après trop de tentatives", "error");
  }
  localStorage.setItem("_loginAttempts", JSON.stringify(stored));
}

// Fix 12 : Timeout de session admin (30 min d'inactivité)
let _sessionTimer = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
function resetSessionTimer() {
  clearTimeout(_sessionTimer);
  const role = localStorage.getItem("userRole");
  if (role === "admin" || role === "moderator") {
    _sessionTimer = setTimeout(() => {
      localStorage.removeItem("userRole");
      showToast("⏱️ Session expirée — reconnecte-toi", "info");
      updateProfilStatus();
    }, SESSION_TIMEOUT_MS);
  }
}
["click","touchstart","keydown"].forEach(ev =>
  document.addEventListener(ev, resetSessionTimer, { passive: true })
);


function initDarkMode() {
  const dark = localStorage.getItem("darkMode") === "true";
  if (dark) {
    document.body.classList.add("dark");
    document.getElementById("darkModeToggle").textContent = "☀️";
    document.getElementById("darkStatus").textContent = "ON";
  }
  document.getElementById("darkModeToggle").onclick = toggleDarkMode;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("darkModeToggle").textContent = isDark ? "☀️" : "🌙";
  document.getElementById("darkStatus").textContent = isDark ? "ON" : "OFF";
  // Mettre à jour la meta theme-color
  document.getElementById("themeColor").setAttribute("content", isDark ? "#15101F" : "#2E1065");
  showToast(isDark ? "🌙 Mode sombre activé" : "☀️ Mode clair activé");
}

// ========== SYNC SESSION DEPUIS TURSO (tous les téléphones) ==========
async function syncSessionDepuisTurso(phone) {
  if (!turso || !phone) return null;
  try {
    const res = await turso.execute({ sql: "SELECT role, is_premium, premium_until FROM users WHERE phone=?", args: [phone] });
    if (res.rows[0]) {
      const role = res.rows[0].role || "user";
      let isPrem = res.rows[0].is_premium === 1 || res.rows[0].is_premium === "1";
      const premiumUntil = Number(res.rows[0].premium_until) || 0;
      // Expiration : si une date limite est définie (>0) et dépassée, le Premium
      // accordé manuellement ou via "Premium pour tous" est désactivé (source de vérité = Turso).
      if (isPrem && premiumUntil > 0 && Date.now() > premiumUntil) {
        isPrem = false;
        try { await turso.execute({ sql: "UPDATE users SET is_premium = 0 WHERE phone=?", args: [phone] }); } catch(e) {}
      }
      localStorage.setItem("userRole", role);
      if (isPrem) {
        isPremium = true;
        localStorage.setItem("isPremium", "true");
      } else if (premiumUntil > 0 && Date.now() > premiumUntil) {
        // Expiration confirmée par Turso : on écrase le cache local même s'il disait "true"
        isPremium = false;
        localStorage.setItem("isPremium", "false");
      } else {
        // Comportement d'origine : ne pas écraser un cache local "premium" si Turso
        // dit simplement "non" sans date d'expiration dépassée (tolérance hors-ligne).
        if (localStorage.getItem("isPremium") !== "true") {
          isPremium = false;
          localStorage.setItem("isPremium", "false");
        }
      }
      if (role === "moderator" && !MODERATORS_PHONES.includes(phone)) MODERATORS_PHONES.push(phone);
      return role;
    }
  } catch(e) { console.warn("syncSession:", e); }
  return null;
}

// ========== PROFIL & CONNEXION ==========
async function loginUser() {
  if (!checkBruteForce()) return;
  const phone = document.getElementById("loginPhone").value.trim();
  if (!phone || !/^[0-9]{9}$/.test(phone)) {
    showToast("❌ Numéro invalide (9 chiffres)", "error");
    recordLoginAttempt(false);
    return;
  }

  // Générer le fingerprint unique de cet appareil
  const deviceId = _getDeviceKey();
  const deviceLabel = `${navigator.platform || "Mobile"} — ${new Date().toLocaleDateString("fr-FR")}`;
  const now = Date.now();

  // ── Vérification device binding via Turso ──
  if (turso) {
    try {
      // ── Admin : bypass total de la vérification appareil ──
      const isAdminLogin = await isAdminPhone(phone);
      if (isAdminLogin) {
        // Admin → mettre à jour device_id sans bloquer
        await turso.execute({
          sql: "UPDATE users SET device_id=?, last_seen=? WHERE phone=?",
          args: [deviceId, now, phone]
        }).catch(()=>{});
        await turso.execute({
          sql: `INSERT OR REPLACE INTO device_sessions (phone, device_id, device_label, trusted, last_seen, created_at) VALUES (?,?,?,1,?,?)`,
          args: [phone, deviceId, deviceLabel, now, now]
        }).catch(()=>{});
        // Continuer sans blocage
      } else {
      // Vérifier si ce numéro est déjà lié à un autre appareil
      const userRes = await turso.execute({
        sql: "SELECT device_id, sms_sent, first_login FROM users WHERE phone=?",
        args: [phone]
      });

      if (userRes.rows.length > 0) {
        const row = userRes.rows[0];
        const storedDevice = row.device_id || "";

        // Ce numéro est déjà lié à un autre appareil
        if (storedDevice && storedDevice !== deviceId) {
          // Vérifier si cet appareil est dans les sessions autorisées
          const sessionRes = await turso.execute({
            sql: "SELECT trusted FROM device_sessions WHERE phone=? AND device_id=?",
            args: [phone, deviceId]
          });

          if (sessionRes.rows.length === 0) {
            // Appareil non autorisé → bloquer
            recordLoginAttempt(false);
            showToast("🔒 Accès refusé — ce compte est lié à un autre appareil", "error");
            _afficherBlocageAppareil(phone);
            return;
          }
          // Appareil dans les sessions autorisées → laisser passer
        }

        // Mettre à jour le device_id si vide
        if (!storedDevice) {
          await turso.execute({
            sql: "UPDATE users SET device_id=?, first_login=? WHERE phone=?",
            args: [deviceId, now, phone]
          });
        }

        // Enregistrer cette session d'appareil
        await turso.execute({
          sql: `INSERT OR REPLACE INTO device_sessions
                (phone, device_id, device_label, trusted, last_seen, created_at)
                VALUES (?,?,?,1,?,?)`,
          args: [phone, deviceId, deviceLabel, now, now]
        });

        // Envoyer notification WhatsApp si pas encore envoyée
        if (!row.sms_sent) {
          await _envoyerNotifWhatsApp(phone, "premiere_connexion");
          await turso.execute({
            sql: "UPDATE users SET sms_sent=1 WHERE phone=?",
            args: [phone]
          });
        } else {
          // Notifier à chaque connexion (sécurité)
          await _envoyerNotifWhatsApp(phone, "connexion");
        }

      } else {
        // Nouveau compte — créer avec device_id
        await turso.execute({
          sql: `INSERT OR IGNORE INTO users
                (phone, nom, role, device_id, sms_sent, first_login, created_at)
                VALUES (?,?,?,?,0,?,?)`,
          args: [phone, phone, "user", deviceId, now, now]
        });
        // Enregistrer la session
        await turso.execute({
          sql: `INSERT OR REPLACE INTO device_sessions
                (phone, device_id, device_label, trusted, last_seen, created_at)
                VALUES (?,?,?,1,?,?)`,
          args: [phone, deviceId, deviceLabel, now, now]
        });
        // Envoyer notification de bienvenue
        await _envoyerNotifWhatsApp(phone, "bienvenue");
        await turso.execute({
          sql: "UPDATE users SET sms_sent=1 WHERE phone=?",
          args: [phone]
        });
      }
      } // fin else (non-admin)
    } catch(e) {
      console.warn("Device binding:", e);
    }
  }

  // ── Fix : purger le cache Premium hérité si on se connecte avec un AUTRE
  // numéro que la session précédente sur cet appareil. Sans ça, un nouvel
  // inscrit récupérait le "isPremium=true" laissé en localStorage par le
  // compte précédemment connecté sur ce même navigateur (ex: un admin/testeur),
  // car syncSessionDepuisTurso() ne l'écrase pas volontairement en mode
  // tolérance hors-ligne.
  const previousPhone = localStorage.getItem("userPhone");
  if (previousPhone && previousPhone !== phone) {
    isPremium = false;
    localStorage.removeItem("isPremium");
  }

  // Sauvegarder localement
  localStorage.setItem("userPhone", phone);
  localStorage.setItem("_lu_fp", deviceId);

  let role = "user";
  if (turso) {
    try {
      const syncedRole = await syncSessionDepuisTurso(phone);
      if (syncedRole) role = syncedRole;
    } catch(e) {}
  }
  localStorage.setItem("userRole", role);
  if (role === "moderator" && !MODERATORS_PHONES.includes(phone)) MODERATORS_PHONES.push(phone);

  recordLoginAttempt(true);
  resetSessionTimer();
  chargerProgDataTurso();

  const roleText = role === "admin" ? "⭐ ADMINISTRATEUR"
    : role === "moderator" ? "🛡️ MODÉRATEUR"
    : isPremium ? "⭐ PREMIUM" : "👩‍🎓 ÉLÈVE";
  document.getElementById("roleDisplay").textContent = roleText;
  document.getElementById("roleDisplayWrapper").style.display = "flex";
  document.getElementById("profilNom").textContent = localStorage.getItem("userPseudo") || phone;
  verifierAdmin();
  chargerContributionsEnAttente();
  updateProfilStatus();
  enregistrerUtilisateur(phone);
  syncPlanningDepuisTurso();
  syncProgressionDepuisTurso();
  addNotification("🎉 Connexion réussie", `Bienvenue ! Rôle : ${roleText}`, "success");
  showToast(`✅ Connecté — ${roleText}`, "success");
}

// ── Déconnexion : efface la session locale (le compte reste sur Turso) ──
function deconnexionUser() {
  if (!confirm("Se déconnecter de ce compte ?")) return;
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userPseudo");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isPremium");
  isPremium = false;
  const loginPhone = document.getElementById("loginPhone");
  if (loginPhone) loginPhone.value = "";
  const roleWrap = document.getElementById("roleDisplayWrapper");
  if (roleWrap) roleWrap.style.display = "none";
  const nom = document.getElementById("profilNom");
  if (nom) nom.textContent = "Non connecté";
  updateProfilStatus();
  showToast("👋 Déconnecté", "info");
}

// ── Afficher modal de blocage appareil non autorisé ──
function _afficherBlocageAppareil(phone) {
  const mask = phone.replace(/(\d{3})\d{3}(\d{3})/, "$1***$2");
  const existing = document.getElementById("deviceBlockModal");
  if (existing) existing.remove();
  const modal = document.createElement("div");
  modal.id = "deviceBlockModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px";
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:20px;padding:28px 20px;max-width:350px;width:100%;text-align:center;border:2px solid var(--red)">
      <div style="font-size:56px;margin-bottom:12px">🔒</div>
      <div style="font-weight:900;font-size:18px;color:var(--red);margin-bottom:8px">Accès refusé</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.7;margin-bottom:20px">
        Le compte <strong>${mask}</strong> est lié à un autre appareil.<br>
        Pour des raisons de sécurité, un compte ne peut être utilisé que sur l'appareil enregistré.<br><br>
        Si tu as changé de téléphone, contacte l'admin pour transférer ton compte.
      </div>
      <button onclick="contacterAdminTransfert('${phone}')"
        style="width:100%;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;border-radius:14px;padding:14px;font-weight:900;font-size:14px;cursor:pointer;margin-bottom:8px">
        📲 Contacter l'admin WhatsApp
      </button>
      <button onclick="document.getElementById('deviceBlockModal').remove()"
        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:12px;font-weight:700;font-size:13px;cursor:pointer;color:var(--t2)">
        Fermer
      </button>
    </div>`;
  document.body.appendChild(modal);
}

function contacterAdminTransfert(phone) {
  const msg = encodeURIComponent(`Bonjour, je voudrais transférer mon compte LearnUpr (${phone}) vers mon nouveau téléphone. Merci.`);
  const adminNum = ADMIN_PHONES[0] || "237674106410";
  const waNum = adminNum.startsWith("237") ? adminNum : "237" + adminNum;
  window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank");
}

// ── Notification WhatsApp via lien (simule un SMS sécurisé) ──
async function _envoyerNotifWhatsApp(phone, type) {
  // Construire le message selon le type
  const msgs = {
    bienvenue: `🎓 *LearnUpr — Bienvenue !*\n\nTon compte a été créé avec succès sur LearnUpr, l'application née au Lycée du Manengouba et ouverte aux élèves d'autres lycées.\n\n📱 *Ton numéro :* ${phone}\n🔒 *Cet appareil est maintenant lié à ton compte.*\n\nSi tu n'es pas à l'origine de cette action, contacte immédiatement l'administrateur.`,
    premiere_connexion: `🔐 *LearnUpr — Première connexion*\n\nUne connexion a été effectuée sur ton compte LearnUpr.\n\n📱 Numéro : ${phone}\n📅 Date : ${new Date().toLocaleString("fr-FR")}\n\nSi ce n'est pas toi, contacte l'administrateur immédiatement.`,
    connexion: `🔔 *LearnUpr — Connexion détectée*\n\nUne connexion a été effectuée sur ton compte.\n\n📱 ${phone} · ${new Date().toLocaleString("fr-FR")}\n\nSi ce n'est pas toi, contacte l'admin.`
  };
  const msg = msgs[type] || msgs.connexion;
  // Stocker le message dans Turso pour l'historique
  if (turso) {
    try {
      await turso.execute({
        sql: "INSERT OR IGNORE INTO signalements (contenu_id, type_signal, message, auteur, date) VALUES (?,?,?,?,?)",
        args: [-1, "notif_whatsapp", `[${type}] ${phone}`, phone, new Date().toLocaleDateString("fr-FR")]
      });
    } catch(e) {}
  }
  // Ouvrir WhatsApp avec le message pré-rempli (l'utilisateur doit l'envoyer)
  // Note: automatiser l'envoi nécessite un backend (Twilio, etc.)
  // Ici on utilise l'API WhatsApp Web qui s'ouvre en arrière-plan
  const waNum = "237" + phone;
  const url = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(msg)}`;
  // Tentative silencieuse via image (ne fonctionne pas toujours mais ne bloque pas l'UI)
  try {
    const img = new Image();
    img.src = url;
  } catch(e) {}
}

// ========== PREM HINT (flèche jaune vers le bouton Premium) ==========
const PREM_HINT_FLAG = "lu_prem_hint_ferme";
function dismissPremHint() {
  try { localStorage.setItem(PREM_HINT_FLAG, "1"); } catch(e) {}
  const b = document.getElementById("premHintBubble");
  if (b) b.style.display = "none";
}
function positionPremHint() {
  const b = document.getElementById("premHintBubble");
  const btn = document.getElementById("premBtn");
  const hdr = document.querySelector(".hdr");
  if (!b || !btn || !hdr) return;
  const btnRect = btn.getBoundingClientRect();
  const hdrRect = hdr.getBoundingClientRect();
  const centerX = (btnRect.left - hdrRect.left) + (btnRect.width / 2);
  b.style.left = centerX + "px";
}
function updatePremHint(isPremium) {
  const b = document.getElementById("premHintBubble");
  if (!b) return;
  let ferme = false;
  try { ferme = !!localStorage.getItem(PREM_HINT_FLAG); } catch(e) {}
  const doitAfficher = !isPremium && !ferme;
  b.style.display = doitAfficher ? "flex" : "none";
  if (doitAfficher) positionPremHint();
}
window.addEventListener("resize", positionPremHint);

function updateProfilStatus() {
  const st = document.getElementById("pstatus");
  const aboBtn = document.getElementById("paboBtn");
  const premBtn = document.getElementById("premBtn");
  const premBanner = document.getElementById("premBanner");
  if (!st) return;

  const phone = localStorage.getItem("userPhone");
  const logoutBtn = document.getElementById("logoutBtn");
  if (phone) {
    const pseudo = localStorage.getItem("userPseudo") || phone;
    document.getElementById("profilNom").textContent = pseudo;
    document.getElementById("loginPhone").value = phone;
    document.getElementById("roleDisplayWrapper").style.display = "flex";
    const cachedRole = localStorage.getItem("userRole") || "user";
    const isMod = MODERATORS_PHONES.includes(phone) || cachedRole === "moderator";
    const roleText = cachedRole === "admin" ? "⭐ ADMINISTRATEUR" : (isMod ? "🛡️ MODÉRATEUR" : (isPremium ? "⭐ PREMIUM" : "👩‍🎓 ÉLÈVE"));
    document.getElementById("roleDisplay").textContent = roleText;
    if (logoutBtn) logoutBtn.style.display = "block";
  } else if (logoutBtn) {
    logoutBtn.style.display = "none";
  }

  if (isPremium) {
    st.textContent = "⭐ Compte Premium";
    st.style.color = "var(--yellow)";
    if (aboBtn) aboBtn.style.display = "none";
    if (premBtn) { premBtn.textContent = "⭐ Premium"; premBtn.className = "btn-prem paid"; }
    if (premBanner) premBanner.style.display = "none";
  } else {
    st.textContent = "Compte Gratuit";
    st.style.color = "rgba(255,255,255,0.6)";
    if (aboBtn) aboBtn.style.display = "block";
    if (premBtn) { premBtn.textContent = "⭐ Free"; premBtn.className = "btn-prem free"; }
    if (premBanner) premBanner.style.display = "flex";
  }
  updatePremHint(isPremium);
}

// ========== ADMIN — Vérification via Turso uniquement (aucun numéro en dur) ==========
// ========== CONFIG SÉCURISÉE — FONCTIONS ==========
async function ouvrirConfigSecurisee() {
  // Pré-remplir avec les valeurs déchiffrées actuelles (masquées)
  const cfg = await loadSecureConfig() || {};
  // Si Turso est déjà connecté, ses valeurs priment pour le numéro de
  // paiement et les clés Gemini — c'est la source la plus à jour, contrairement
  // à la balise embarquée qui se réinitialise au rechargement du fichier original.
  if (typeof turso !== "undefined" && turso) {
    try {
      const res = await turso.execute({ sql: "SELECT key, value FROM app_settings", args: [] });
      if (res.rows) {
        res.rows.forEach(r => {
          if (r.key === "whatsapp_paiement" && r.value) cfg.whatsappPaiement = r.value;
          if (r.key === "gemini_zip" && r.value)         cfg.geminiKeyZip     = r.value;
          if (r.key === "gemini_doublon" && r.value)     cfg.geminiKeyDoublon = r.value;
          if (r.key === "gemini_contrib" && r.value)     cfg.geminiKeyContrib = r.value;
          if (r.key === "deepseek_key" && r.value)       cfg.deepseekKey      = r.value;
        });
      }
    } catch(e) { console.warn("[ouvrirConfigSecurisee] Turso:", e.message); }
  }
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  set("cfg-tursoUrl",       cfg.tursoUrl || "");
  set("cfg-tursoToken",     cfg.tursoToken || "");
  set("cfg-cloudinaryUrl",  cfg.cloudinaryUrl || "");
  set("cfg-cloudinaryPreset", cfg.cloudinaryPreset || "");
  set("cfg-whatsappLink",   cfg.whatsappLink || "");
  set("cfg-whatsappPaiement", cfg.whatsappPaiement || "");
  // Les 3 clés Gemini — si elles n'ont jamais été différenciées, on retombe
  // sur l'ancienne clé unique pour ne rien faire perdre à l'admin.
  const ancienneCleUnique = cfg.geminiApiKey || "";
  set("cfg-geminiKeyZip",     cfg.geminiKeyZip     || ancienneCleUnique);
  set("cfg-geminiKeyDoublon", cfg.geminiKeyDoublon || ancienneCleUnique);
  set("cfg-geminiKeyContrib", cfg.geminiKeyContrib || ancienneCleUnique);
  set("cfg-deepseekKey",      cfg.deepseekKey || "");
  set("cfg-adminPhone",     localStorage.getItem("userPhone") || "");
  // Ne pas pré-remplir le mot de passe (sécurité), juste indiquer s'il est déjà défini
  const pwdInput = document.getElementById("cfg-adminPassword");
  if (pwdInput) pwdInput.placeholder = localStorage.getItem("adminPwdHash") ? "••••• (déjà défini)" : "Ton mot de passe admin";
  const s = document.getElementById("cfg-status");
  if (s) s.style.display = "none";
  const gtest = document.getElementById("gemini-test-result");
  if (gtest) gtest.style.display = "none";
  document.getElementById("secureConfigModal").classList.add("show");
}

function toggleCfgVisibility(inputId, btn) {
  const el = document.getElementById(inputId);
  if (!el) return;
  if (el.type === "password") { el.type = "text"; btn.textContent = "🙈"; }
  else { el.type = "password"; btn.textContent = "👁️"; }
}

async function sauvegarderConfigSecurisee() {
  const get = id => (document.getElementById(id)?.value || "").trim();
  const cfg = {
    tursoUrl:         get("cfg-tursoUrl"),
    tursoToken:       get("cfg-tursoToken"),
    cloudinaryUrl:    get("cfg-cloudinaryUrl"),
    cloudinaryPreset: get("cfg-cloudinaryPreset"),
    whatsappLink:     get("cfg-whatsappLink"),
    whatsappPaiement: get("cfg-whatsappPaiement"),
    geminiKeyZip:     get("cfg-geminiKeyZip"),
    geminiKeyDoublon: get("cfg-geminiKeyDoublon"),
    geminiKeyContrib: get("cfg-geminiKeyContrib"),
    deepseekKey:      get("cfg-deepseekKey"),
  };
  const adminPhone = get("cfg-adminPhone");
  const adminPassword = get("cfg-adminPassword");
  if (!cfg.tursoUrl || !cfg.tursoToken) {
    const s = document.getElementById("cfg-status");
    s.style.display = "block"; s.style.background = "#ffebee"; s.style.color = "#c62828";
    s.textContent = "❌ URL Turso et Token sont obligatoires"; return;
  }
  // Sauvegarde locale + génère le HTML à redéployer pour tous les utilisateurs
  await saveSecureConfig(cfg);
  // Recharger TOUTES les variables globales immédiatement
  CLOUDINARY_URL    = cfg.cloudinaryUrl    || "";
  CLOUDINARY_PRESET = cfg.cloudinaryPreset || "";
  TURSO_URL         = cfg.tursoUrl         || "";
  TURSO_TOKEN       = cfg.tursoToken       || "";
  WHATSAPP_GROUP_LINK = cfg.whatsappLink   || "";
  WHATSAPP_PAIEMENT_NUM = cfg.whatsappPaiement || "";
  // Sauvegarder le numéro de paiement + les clés Gemini dans Turso pour
  // qu'ils soient disponibles sur tous les appareils sans redéployer le HTML
  // (la balise embarquée se réinitialise au rechargement du fichier original)
  if (typeof turso !== "undefined" && turso) {
    try {
      await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '')", args: [] });
      const _settingsToSave = [
        ["whatsapp_paiement", cfg.whatsappPaiement],
        ["gemini_zip",     cfg.geminiKeyZip],
        ["gemini_doublon", cfg.geminiKeyDoublon],
        ["gemini_contrib", cfg.geminiKeyContrib],
        ["deepseek_key",   cfg.deepseekKey],
      ];
      for (const [key, value] of _settingsToSave) {
        if (value) {
          await turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", args: [key, value] });
        }
      }
    } catch(e) { console.warn("[saveSettings] Turso:", e.message); }
  }
  GEMINI_KEYS_ZIP      = _parseGeminiKeys(cfg.geminiKeyZip);
  GEMINI_KEYS_DOUBLON  = _parseGeminiKeys(cfg.geminiKeyDoublon);
  GEMINI_KEYS_CONTRIB  = _parseGeminiKeys(cfg.geminiKeyContrib);
  GEMINI_API_KEY       = GEMINI_KEYS_ZIP[0] || "";
  DEEPSEEK_API_KEY      = cfg.deepseekKey || "";
  // Mettre à jour _embeddedCfg en mémoire pour éviter rechargement
  _embeddedCfg = cfg;
  // ── Double persistance : localStorage (cache immédiat) + Turso (source de vérité) ──
  // Cloudinary
  localStorage.setItem("_cld_url",    cfg.cloudinaryUrl    || "");
  localStorage.setItem("_cld_preset", cfg.cloudinaryPreset || "");
  // Clés Gemini — disponibles immédiatement même si Turso répond lentement
  if (cfg.geminiKeyZip)     localStorage.setItem("_lu_gemini_zip",     cfg.geminiKeyZip);
  if (cfg.geminiKeyDoublon) localStorage.setItem("_lu_gemini_doublon", cfg.geminiKeyDoublon);
  if (cfg.geminiKeyContrib) localStorage.setItem("_lu_gemini_contrib", cfg.geminiKeyContrib);
  if (cfg.deepseekKey)      localStorage.setItem("_lu_deepseek_key",   cfg.deepseekKey);
  // Réinitialiser Turso avec les nouveaux tokens
  if (cfg.tursoUrl && cfg.tursoToken) {
    try { turso = createClient({ url: cfg.tursoUrl, authToken: cfg.tursoToken }); } catch(e) {}
  }
  // Numéro admin
  if (adminPhone && /^[0-9]{9}$/.test(adminPhone)) {
    localStorage.setItem("userPhone", adminPhone);
    // Sauvegarder aussi dans Turso pour retrouver sur tout appareil
    if (typeof turso !== "undefined" && turso) {
      turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", args: ["admin_phone", adminPhone] }).catch(() => {});
    }
  }
  // Mot de passe admin — double persistance localStorage + Turso
  if (adminPassword) {
    const pwdHash = _encode(adminPassword);
    localStorage.setItem("adminPwdHash", pwdHash);
    if (typeof turso !== "undefined" && turso) {
      turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", args: ["admin_pwd_hash", pwdHash] }).catch(() => {});
    }
  }
  const s = document.getElementById("cfg-status");
  if (s) {
    s.style.display = "block"; s.style.background = "#F3EEFF"; s.style.color = "#059669";
    s.textContent = "✅ Config sauvegardée ! Télécharge le fichier mis à jour et redéploie sur Cloudflare.";
  }
  showToast("🔐 Config sauvegardée !", "success");
  setTimeout(() => {
    document.getElementById("secureConfigModal").classList.remove("show");
    verifierAdmin();
    updateProfilStatus();
  }, 800);
}

function effacerConfigSecurisee() {
  if (!confirm("⚠️ Effacer toute la config ? Turso et Cloudinary ne seront plus connectés.")) return;
  localStorage.removeItem(_CFG_KEY);
  localStorage.removeItem("_lu_fp");
  showToast("🗑️ Config effacée", "error");
  document.getElementById("secureConfigModal").classList.remove("show");
}

// ========== CLASSES MASQUÉES (Admin) ==========
// Permet à l'admin de cacher une ou plusieurs classes aux élèves (ex: classe
// pas encore prête, contenu insuffisant). Les panels admin/modérateur
// continuent d'afficher TOUTES les classes pour permettre d'y publier du
// contenu en coulisses avant de la révéler aux élèves.
function ouvrirClassesMasquees() {
  const role = localStorage.getItem("userRole");
  if (role !== "admin") { showToast("❌ Accès admin uniquement", "error"); return; }
  const modal = document.getElementById("classesMasqueesModal");
  if (!modal) return;
  const list = document.getElementById("classesMasqueesList");
  list.innerHTML = CLASSES.map(c => `
    <label style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:6px;font-size:13px;font-weight:700;cursor:pointer">
      <span>${c.replace(/_/g," ")}</span>
      <input type="checkbox" class="cm-cb" value="${c}" ${CLASSES_MASQUEES.includes(c) ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--p);cursor:pointer">
    </label>`).join("");
  modal.classList.add("show");
}

function fermerClassesMasquees() {
  document.getElementById("classesMasqueesModal")?.classList.remove("show");
}

async function sauvegarderClassesMasquees() {
  const cochees = [...document.querySelectorAll(".cm-cb:checked")].map(cb => cb.value);
  CLASSES_MASQUEES = cochees;
  localStorage.setItem("_lu_classes_masquees", JSON.stringify(cochees));
  // Rafraîchir immédiatement tout ce qui est déjà affiché à l'écran
  if (typeof renderClasses === "function") renderClasses();
  if (typeof initForumClasseTabs === "function") initForumClasseTabs();
  if (typeof renderContent === "function") renderContent();
  if (typeof turso !== "undefined" && turso) {
    try {
      await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '')", args: [] });
      await turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", args: ["classes_masquees", JSON.stringify(cochees)] });
      showToast("✅ Classes masquées mises à jour", "success");
    } catch(e) {
      console.warn("[sauvegarderClassesMasquees] Turso:", e.message);
      showToast("⚠️ Sauvegardé localement, mais pas synchronisé (Turso indisponible)", "error");
    }
  } else {
    showToast("⚠️ Sauvegardé localement uniquement (Turso non connecté)", "error");
  }
  fermerClassesMasquees();
}

// ========== ALERTE AU DÉMARRAGE si aucune config ==========
async function verifierConfigAuDemarrage() {
  // Recharger la config depuis le DOM avant de vérifier
  await _loadEmbeddedConfig();
  if (!hasSecureConfig()) {
    // Afficher une bannière discrète (uniquement si aucune config embarquée ET aucune locale)
    const banner = document.createElement("div");
    banner.id = "cfgBanner";
    banner.innerHTML = `⚠️ Aucune config — connecte-toi en admin et configure les clés, puis redéploie sur Cloudflare.`;
    banner.style.cssText = "background:#FFF3CD;color:#856404;padding:8px 14px;font-size:11px;font-weight:700;text-align:center;border-bottom:1px solid #ffc107;cursor:pointer;";
    banner.onclick = () => { banner.style.display = "none"; };
    document.body.prepend(banner);
  }
}

async function isAdminPhone(phone) {
  if (!phone) return false;
  if (turso) {
    try {
      const res = await turso.execute({ sql: "SELECT role FROM users WHERE phone = ?", args: [phone] });
      if (res.rows[0]) {
        const role = res.rows[0].role;
        localStorage.setItem("userRole", role);
        return role === "admin";
      }
      return false;
    } catch(e) { return false; }
  }
  // Sans Turso : se fier uniquement au cache local (moins sûr mais acceptable hors ligne)
  return localStorage.getItem("userRole") === "admin";
}

async function isModeratorPhone(phone) {
  if (MODERATORS_PHONES.includes(phone)) return true;
  if (!turso) return false;
  try {
    const res = await turso.execute({ sql: "SELECT role FROM users WHERE phone = ?", args: [phone] });
    return ["moderator","admin"].includes(res.rows[0]?.role);
  } catch(e) { return false; }
}


async function chargerModerateursTurso() {
  if (!turso) return;
  try {
    const res = await turso.execute({ sql: "SELECT phone FROM users WHERE role IN ('moderator','admin')", args: [] });
    MODERATORS_PHONES = (res.rows || []).map(r => r.phone).filter(Boolean);
    localStorage.setItem("moderators", JSON.stringify(MODERATORS_PHONES));
  } catch(e) {}
}

async function verifierAdmin() {
  const phone = localStorage.getItem("userPhone") || "";
  const cachedRole = localStorage.getItem("userRole") || "";

  // Accès immédiat si le cache local dit admin
  if (cachedRole === "admin" && phone) {
    document.getElementById("adminDashboard").style.display = "block";
    document.getElementById("profilNom").textContent = localStorage.getItem("userPseudo") || phone;
    const loginPhoneEl = document.getElementById("loginPhone");
    if (loginPhoneEl) loginPhoneEl.value = phone;
    const roleDisplay = document.getElementById("roleDisplay");
    const roleWrapper = document.getElementById("roleDisplayWrapper");
    if (roleDisplay) roleDisplay.textContent = "⭐ ADMINISTRATEUR";
    if (roleWrapper) roleWrapper.style.display = "flex";
    // Admin seulement → demander mot de passe
    const dejaAuth = sessionStorage.getItem("adminAuth") === "true";
    document.getElementById("adminPasswordScreen").style.display = dejaAuth ? "none" : "block";
    document.getElementById("adminRealDashboard").style.display = dejaAuth ? "block" : "none";
    if (dejaAuth) loadAdminStats();
    return;
  }

  await chargerModerateursTurso();
  await _chargerSettingsTurso();
  const admin = await isAdminPhone(phone);
  const mod = await isModeratorPhone(phone);

  if (admin || mod) {
    document.getElementById("adminDashboard").style.display = "block";
    if (phone) {
      document.getElementById("profilNom").textContent = localStorage.getItem("userPseudo") || phone;
      const loginPhoneEl = document.getElementById("loginPhone");
      if (loginPhoneEl) loginPhoneEl.value = phone;
      const roleText = admin ? "⭐ ADMINISTRATEUR" : "🛡️ MODÉRATEUR";
      const roleDisplay = document.getElementById("roleDisplay");
      const roleWrapper = document.getElementById("roleDisplayWrapper");
      if (roleDisplay) roleDisplay.textContent = roleText;
      if (roleWrapper) roleWrapper.style.display = "flex";
    }

    if (mod && !admin) {
      // ✅ MODÉRATEUR → accès direct, ZÉRO mot de passe
      document.getElementById("adminPasswordScreen").style.display = "none";
      document.getElementById("adminRealDashboard").style.display = "block";
      sessionStorage.setItem("adminAuth", "true");
      // Cacher les boutons admin-only dans le dashboard
      document.querySelectorAll(".admin-only-btn").forEach(b => b.style.display = "none");
    } else {
      // 🔐 ADMIN → mot de passe requis
      const dejaAuth = sessionStorage.getItem("adminAuth") === "true";
      document.getElementById("adminPasswordScreen").style.display = dejaAuth ? "none" : "block";
      document.getElementById("adminRealDashboard").style.display = dejaAuth ? "block" : "none";
      if (dejaAuth) loadAdminStats();
    }
  } else {
    document.getElementById("adminDashboard").style.display = "none";
  }
}

// ========== MOT DE PASSE ADMIN — Stocké dans Turso ==========
// ⚠️ Mot de passe maître encodé — NE PAS MODIFIER
const _ADMIN_PWD_ENC = "ODpGLikiIjRALjE/";
const _ADMIN_PWD_KEY = "LU-ADM";
function _decodeMasterPwd() {
  try {
    const s = atob(_ADMIN_PWD_ENC);
    let r = "";
    for (let i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ _ADMIN_PWD_KEY.charCodeAt(i % _ADMIN_PWD_KEY.length));
    return r;
  } catch(e) { return null; }
}
async function verifierMotDePasseAdmin() {
  const input = document.getElementById("adminPasswordInput");
  const errEl = document.getElementById("adminPasswordError");
  const mdp = input.value.trim();
  if (!mdp) { errEl.style.display = "block"; return; }
  errEl.style.display = "none";

  const phone = localStorage.getItem("userPhone") || "";
  let ok = false;

  // ── Vérification mot de passe maître (numéro admin sur n'importe quel appareil) ──
  const masterPwd = _decodeMasterPwd();
  if (masterPwd && mdp === masterPwd) {
    // Autoriser si le numéro connecté est dans ADMIN_PHONES OU si aucun numéro (accès direct)
    if (ADMIN_PHONES.includes(phone) || phone === "674106410" || phone === "237674106410" || !phone) {
      ok = true;
    }
  }

  if (!ok && turso) {
    try {
      const res = await turso.execute({
        sql: "SELECT password_hash FROM users WHERE phone=? AND role IN ('admin','moderator')",
        args: [phone]
      });
      if (res.rows[0] && res.rows[0].password_hash === mdp) {
        ok = true;
      }
    } catch(e) {
      // Turso erreur → fallback local
    }
  }
  // Fallback : vérifier le mot de passe stocké localement (si Turso absent ou échec)
  if (!ok) {
    const localHash = localStorage.getItem("adminPwdHash");
    const cachedRole = localStorage.getItem("userRole") || "";
    if (localHash && cachedRole === "admin") {
      // Tester les deux formats : _encode (ancien) et btoa (nouveau)
      try {
        if (_decode(localHash) === mdp || atob(localHash) === mdp) ok = true;
      } catch(e) {
        if (atob(localHash) === mdp) ok = true;
      }
    }
  }
  if (!ok && !turso && !localStorage.getItem("adminPwdHash") && !_decodeMasterPwd()) {
    showToast("⚠️ Turso non connecté et aucun mot de passe local — configure d'abord tes clés", "error");
    return;
  }

  if (ok) {
    sessionStorage.setItem("adminAuth", "true");
    input.value = "";
    document.getElementById("adminPasswordScreen").style.display = "none";
    document.getElementById("adminRealDashboard").style.display = "block";
    showToast("✅ Accès admin accordé", "success");
    loadAdminStats();
  } else {
    errEl.style.display = "block";
    input.value = "";
    input.focus();
    showToast("❌ Mot de passe incorrect", "error");
  }
}

function verrouillerAdmin() {
  sessionStorage.removeItem("adminAuth");
  document.getElementById("adminPasswordScreen").style.display = "block";
  document.getElementById("adminRealDashboard").style.display = "none";
  document.getElementById("adminPasswordInput").value = "";
  showToast("🔒 Dashboard verrouillé", "info");
}

// ========== DIAGNOSTIC ADMIN : Tester Cloudinary & Turso ==========
async function testerConnexions() {
  showToast("🔌 Test des connexions en cours...", "info");
  const rapport = { cloudinary: null, turso: null };

  // ── Test Cloudinary : envoyer un PNG 1×1 pixel factice ──
  try {
    if (!CLOUDINARY_URL || !CLOUDINARY_PRESET) {
      rapport.cloudinary = { ok: false, msg: "Clés Cloudinary non configurées (URL ou preset manquant)" };
    } else {
      // Créer un PNG 1×1 pixel en base64
      const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const testFile = new File([arr], "test_learnupr_diag.png", { type: "image/png" });
      const fd = new FormData();
      fd.append("file", testFile);
      fd.append("upload_preset", CLOUDINARY_PRESET);
      fd.append("folder", "learnupr_diag");
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      let data;
      try { data = await res.json(); } catch(e) { data = {}; }
      if (data.secure_url) {
        rapport.cloudinary = { ok: true, msg: "Connexion OK", url: data.secure_url };
      } else {
        const reason = data.error?.message || data.message || ("HTTP " + res.status);
        rapport.cloudinary = { ok: false, msg: reason };
      }
    }
  } catch(e) {
    rapport.cloudinary = { ok: false, msg: "Erreur réseau : " + e.message };
  }

  // ── Test Turso : SELECT 1 ──
  try {
    if (!turso) {
      rapport.turso = { ok: false, msg: "Turso non initialisé (URL ou token manquant)" };
    } else {
      const res = await turso.execute({ sql: "SELECT 1 as test", args: [] });
      const val = res.rows?.[0]?.test ?? res.rows?.[0]?.[0];
      if (val == 1 || val === "1") {
        rapport.turso = { ok: true, msg: "Connexion OK — base de données accessible" };
      } else {
        rapport.turso = { ok: false, msg: "Réponse inattendue : " + JSON.stringify(res.rows) };
      }
    }
  } catch(e) {
    rapport.turso = { ok: false, msg: "Erreur : " + e.message };
  }

  // ── Afficher le rapport ──
  const allOk = rapport.cloudinary?.ok && rapport.turso?.ok;
  const cIcon = rapport.cloudinary?.ok ? "✅" : "❌";
  const tIcon = rapport.turso?.ok ? "✅" : "❌";
  const cloudUrl = rapport.cloudinary?.url ? `\nExemple URL : ${rapport.cloudinary.url.substring(0,55)}...` : "";

  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px";
  modal.innerHTML = `
    <div style="background:var(--card,#2E1065);border-radius:22px;padding:24px;max-width:380px;width:100%;border:2px solid ${allOk ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}">
      <div style="text-align:center;font-size:36px;margin-bottom:10px">${allOk ? "✅" : "⚠️"}</div>
      <div style="font-weight:900;font-size:16px;text-align:center;color:${allOk ? "#10B981" : "#F59E0B"};margin-bottom:18px">
        ${allOk ? "Tous les services fonctionnent" : "Certains services sont défaillants"}
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:14px;margin-bottom:12px">
        <div style="font-weight:800;font-size:13px;margin-bottom:6px">${cIcon} Cloudinary</div>
        <div style="font-size:11px;color:var(--t2,rgba(255,255,255,0.6));line-height:1.7">${rapport.cloudinary?.msg || "—"}${rapport.cloudinary?.url ? '<br><span style="color:#10B981;font-size:10px;word-break:break-all">' + rapport.cloudinary.url.substring(0,60) + '...</span>' : ""}</div>
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:14px;margin-bottom:18px">
        <div style="font-weight:800;font-size:13px;margin-bottom:6px">${tIcon} Turso (base de données)</div>
        <div style="font-size:11px;color:var(--t2,rgba(255,255,255,0.6));line-height:1.7">${rapport.turso?.msg || "—"}</div>
      </div>
      <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%;background:linear-gradient(135deg,#6D28D9,#5B21B6);color:white;border:none;border-radius:14px;padding:14px;font-weight:900;font-size:14px;cursor:pointer">
        ✕ Fermer
      </button>
    </div>`;
  document.body.appendChild(modal);
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
}

async function loadAdminStats() {
  const contribs = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const pending = contribs.filter(c => c.statut === "en_attente").length;
  document.getElementById("adminStatContrib").textContent = contribs.length;
  document.getElementById("adminStatPending").textContent = pending;
  document.getElementById("adminStatUsers").textContent = "—";
  document.getElementById("adminStatPremium").textContent = isPremium ? "✅" : "—";

  if (!turso) return;
  try {
    const users = await turso.execute({ sql: "SELECT COUNT(*) as n FROM users", args: [] });
    document.getElementById("adminStatUsers").textContent = users.rows[0]?.n || 0;
    const pend = await turso.execute({ sql: "SELECT COUNT(*) as n FROM contributions WHERE statut='en_attente'", args: [] });
    document.getElementById("adminStatPending").textContent = pend.rows[0]?.n || 0;
    const contribTotal = await turso.execute({ sql: "SELECT COUNT(*) as n FROM contributions", args: [] });
    document.getElementById("adminStatContrib").textContent = contribTotal.rows[0]?.n || 0;
  } catch(e) {}
}

async function ajouterModerateur() {
  const caller = localStorage.getItem("userPhone") || "";
  const admin = await isAdminPhone(caller);
  if (!admin) { showToast("⛔ Accès réservé à l'administrateur", "error"); return; }
  const tel = prompt("📞 Numéro WhatsApp du nouveau modérateur (9 chiffres) :");
  if (!tel) return;
  if (!/^[0-9]{9}$/.test(tel)) { showToast("❌ Numéro invalide", "error"); return; }
  
  // Anti-doublon : vérifier si déjà modérateur
  if (MODERATORS_PHONES.includes(tel)) { showToast("⚠️ Ce numéro est déjà modérateur", "error"); return; }

  if (!turso) {
    MODERATORS_PHONES.push(tel);
    localStorage.setItem("moderators", JSON.stringify(MODERATORS_PHONES));
    showToast(`✅ (Local) ${tel} marqué modérateur`, "success");
    return;
  }
  try {
    const existant = await turso.execute({ sql: "SELECT phone FROM users WHERE phone = ?", args: [tel] });
    if (existant.rows.length > 0) {
      await turso.execute({ sql: "UPDATE users SET role = 'moderator' WHERE phone = ?", args: [tel] });
    } else {
      await turso.execute({ sql: "INSERT INTO users (phone, role, nom) VALUES (?, 'moderator', ?)", args: [tel, "Modérateur"] });
    }
    MODERATORS_PHONES.push(tel);
    localStorage.setItem("moderators", JSON.stringify(MODERATORS_PHONES));
    showToast(`✅ ${tel} est maintenant modérateur`, "success");
    addNotification("🛡️ Nouveau modérateur", `${tel} a été ajouté comme modérateur`, "info");
  } catch(e) { showToast("❌ Erreur Turso : " + e.message, "error"); }
}

async function retirerModerateur() {
  const caller = localStorage.getItem("userPhone") || "";
  const admin = await isAdminPhone(caller);
  if (!admin) { showToast("⛔ Accès réservé à l'administrateur", "error"); return; }
  const tel = prompt("📞 Numéro du modérateur à retirer :");
  if (!tel) return;
  if (!turso) {
    MODERATORS_PHONES = MODERATORS_PHONES.filter(p => p !== tel);
    localStorage.setItem("moderators", JSON.stringify(MODERATORS_PHONES));
    showToast(`🗑️ ${tel} retiré des modérateurs`, "success");
    return;
  }
  try {
    await turso.execute({ sql: "UPDATE users SET role = 'user' WHERE phone = ?", args: [tel] });
    MODERATORS_PHONES = MODERATORS_PHONES.filter(p => p !== tel);
    localStorage.setItem("moderators", JSON.stringify(MODERATORS_PHONES));
    showToast(`🗑️ ${tel} retiré des modérateurs`, "success");
  } catch(e) { showToast("❌ Erreur : " + e.message, "error"); }
}

async function genererCodePremium() {
  const caller = localStorage.getItem("userPhone") || "";
  const isAdmin = await isAdminPhone(caller);
  if (!isAdmin) { showToast("Acces reserve a l administrateur", "error"); return; }

  const code = genererCodeCrypto();

  if (turso) {
    try {
      await turso.execute({ sql: "INSERT INTO premium_codes (code, utilise) VALUES (?, 0)", args: [code] });
    } catch(e) { showToast("Erreur Turso : " + e.message, "error"); return; }
  }

  const existing = document.getElementById("codeGenModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "codeGenModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px";

  const div = document.createElement("div");
  div.style.cssText = "background:white;border-radius:20px;padding:24px;width:100%;max-width:380px;text-align:center";
  div.innerHTML = '<div style="font-size:36px;margin-bottom:10px">\uD83C\uDF9F\uFE0F</div>'
    + '<div style="font-weight:900;font-size:16px;color:#059669;margin-bottom:6px">Code Premium genere !</div>'
    + '<div style="font-size:11px;color:#999;margin-bottom:16px">Copie ce code et envoie-le a l eleve</div>'
    + '<div style="background:#f0f7f0;border:2px dashed #059669;border-radius:14px;padding:18px;margin-bottom:16px">'
    + '<div id="codeGenValue" class="admin-copyable" style="font-family:monospace;font-size:22px;font-weight:900;color:#059669;letter-spacing:3px;user-select:all;-webkit-user-select:all">' + code + '</div>'
    + '</div>';

  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:10px";

  const btnCopy = document.createElement("button");
  btnCopy.textContent = "Copier";
  btnCopy.style.cssText = "flex:1;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:12px;padding:13px;font-weight:800;16px;cursor:pointer";
  btnCopy.onclick = function() {
    const el = document.getElementById("codeGenValue");
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try { document.execCommand("copy"); showToast("Code copie !", "success"); } catch(e) {}
    window.getSelection().removeAllRanges();
  };

  const btnClose = document.createElement("button");
  btnClose.textContent = "Fermer";
  btnClose.style.cssText = "flex:1;background:#f0f0f0;border:none;border-radius:12px;padding:13px;font-weight:700;font-size:13px;cursor:pointer;color:#333";
  btnClose.onclick = function() { modal.remove(); };

  btnRow.appendChild(btnCopy);
  btnRow.appendChild(btnClose);
  div.appendChild(btnRow);

  const note = document.createElement("div");
  note.style.cssText = "margin-top:12px;font-size:10px;color:#aaa";
  note.textContent = "Code valide pour 1 activation - usage unique";
  div.appendChild(note);

  modal.appendChild(div);
  document.body.appendChild(modal);
  addNotification("Code Premium genere", code, "success");
}


async function voirCodesPremium() {
  const caller = localStorage.getItem("userPhone") || "";
  const isAdmin = await isAdminPhone(caller);
  if (!isAdmin) { showToast("Acces reserve a l administrateur", "error"); return; }

  let rows = [];
  if (turso) {
    try {
      const res = await turso.execute({ sql: "SELECT code, utilise FROM premium_codes ORDER BY id DESC LIMIT 50", args: [] });
      rows = res.rows || [];
    } catch(e) { showToast("Erreur Turso", "error"); return; }
  }

  const existing = document.getElementById("codesListModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "codesListModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:flex-end;justify-content:center";

  const sheet = document.createElement("div");
  sheet.style.cssText = "background:white;border-radius:20px 20px 0 0;width:100%;max-width:430px;max-height:80vh;display:flex;flex-direction:column";

  // Header
  const header = document.createElement("div");
  header.style.cssText = "padding:20px 20px 12px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between";
  const title = document.createElement("div");
  title.style.cssText = "font-weight:900;font-size:16px;color:#059669";
  title.textContent = "Codes Premium (" + rows.length + ")";
  const btnX = document.createElement("button");
  btnX.textContent = "X";
  btnX.style.cssText = "background:#f0f0f0;border:none;border-radius:50%;width:32px;height:32px;font-size:14px;cursor:pointer;font-weight:900";
  btnX.onclick = function() { modal.remove(); };
  header.appendChild(title);
  header.appendChild(btnX);
  sheet.appendChild(header);

  // Liste
  const liste = document.createElement("div");
  liste.style.cssText = "overflow-y:auto;flex:1";
  if (rows.length === 0) {
    liste.innerHTML = '<div style="text-align:center;color:#999;padding:20px;font-size:13px">Aucun code genere pour l instant</div>';
  } else {
    rows.forEach(function(r) {
      const item = document.createElement("div");
      item.className = "admin-copyable";
      item.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f0f0f0;cursor:pointer";
      item.title = "Toucher pour copier";
      const codeEl = document.createElement("div");
      codeEl.className = "admin-copyable";
      codeEl.style.cssText = "font-family:monospace;font-weight:800;font-size:14px;letter-spacing:2px;user-select:all;-webkit-user-select:all;color:" + (r.utilise==1?"#aaa":"#059669");
      codeEl.textContent = r.code;
      const badge = document.createElement("span");
      badge.style.cssText = "font-size:10px;font-weight:700;padding:4px 10px;border-radius:10px;background:" + (r.utilise==1?"#ffebee":"#F3EEFF") + ";color:" + (r.utilise==1?"#c62828":"#059669");
      badge.textContent = r.utilise==1 ? "Utilise" : "Disponible";
      item.appendChild(codeEl);
      item.appendChild(badge);
      item.onclick = function() {
        window._adminClipboardAllowed = true;
        navigator.clipboard.writeText(r.code).then(function() {
          showToast("📋 Code " + r.code + " copié !", "success");
        }).catch(function() {});
        window._adminClipboardAllowed = false;
      };
      liste.appendChild(item);
    });
  }
  sheet.appendChild(liste);

  // Footer
  const footer = document.createElement("div");
  footer.style.cssText = "padding:14px";
  const btnGen = document.createElement("button");
  btnGen.textContent = "Generer un nouveau code";
  btnGen.style.cssText = "width:100%;background:linear-gradient(135deg,#10B981,#059669);color:white;border:none;border-radius:14px;padding:14px;font-weight:900;font-size:14px;cursor:pointer";
  btnGen.onclick = function() { modal.remove(); genererCodePremium(); };
  footer.appendChild(btnGen);
  sheet.appendChild(footer);

  modal.appendChild(sheet);
  document.body.appendChild(modal);
}

// ========== ACTIVATION PREMIUM MANUELLE (SANS CODE) ==========
// Permet à l'admin de rendre un élève premium directement, pour une durée
// choisie, sans passer par le système de codes.
async function ouvrirActivationPremiumManuelle() {
  const caller = localStorage.getItem("userPhone") || "";
  const isAdmin = await isAdminPhone(caller);
  if (!isAdmin) { showToast("Acces reserve a l administrateur", "error"); return; }

  if (!turso) { showToast("⚠️ Base non connectée", "error"); return; }

  // Charger la liste des élèves (phone + pseudo si disponible) pour le sélecteur
  let eleves = [];
  try {
    const resUsers = await turso.execute({ sql: "SELECT phone, nom, is_premium, premium_until FROM users WHERE phone IS NOT NULL AND phone != '' ORDER BY id DESC LIMIT 500", args: [] });
    const pseudos = {};
    try {
      const resPseudo = await turso.execute({ sql: "SELECT phone, pseudo FROM utilisateurs WHERE pseudo IS NOT NULL AND pseudo != ''", args: [] });
      (resPseudo.rows || []).forEach(r => { pseudos[r.phone] = r.pseudo; });
    } catch(e) {}
    eleves = (resUsers.rows || []).map(r => ({
      phone: r.phone,
      pseudo: pseudos[r.phone] || r.nom || "",
      isPremium: Number(r.is_premium) === 1,
      premiumUntil: Number(r.premium_until) || 0
    }));
  } catch(e) { showToast("Erreur de chargement des élèves", "error"); return; }

  const existing = document.getElementById("premiumManuelModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "premiumManuelModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:flex-end;justify-content:center";

  const sheet = document.createElement("div");
  sheet.style.cssText = "background:white;border-radius:20px 20px 0 0;width:100%;max-width:430px;max-height:88vh;display:flex;flex-direction:column";

  const header = document.createElement("div");
  header.style.cssText = "padding:20px 20px 12px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between";
  header.innerHTML = '<div style="font-weight:900;font-size:16px;color:#6D28D9">⭐ Activer Premium manuellement</div>';
  const btnX = document.createElement("button");
  btnX.textContent = "✕";
  btnX.style.cssText = "background:#f0f0f0;border:none;border-radius:50%;width:32px;height:32px;font-size:14px;cursor:pointer;font-weight:900";
  btnX.onclick = function() { modal.remove(); };
  header.appendChild(btnX);
  sheet.appendChild(header);

  const body = document.createElement("div");
  body.style.cssText = "padding:16px 20px;overflow-y:auto;flex:1";

  body.innerHTML = `
    <div style="font-size:11px;color:#666;margin-bottom:10px">Choisis un élève dans la liste (ou tape directement son numéro), puis la durée du Premium.</div>
    <div style="font-size:10px;font-weight:700;color:#888;margin-bottom:4px">ÉLÈVE</div>
    <select id="pm-eleve-select" style="width:100%;padding:11px;border:1.5px solid #e5e0f5;border-radius:10px;margin-bottom:10px;font-size:13px">
      <option value="">— Sélectionner un élève (${eleves.length}) —</option>
      ${eleves.map(e => `<option value="${esc(e.phone)}">${esc(e.pseudo ? (e.pseudo + " — " + e.phone) : e.phone)}${e.isPremium ? " ⭐" : ""}</option>`).join("")}
    </select>
    <div style="font-size:10px;font-weight:700;color:#888;margin-bottom:4px">OU NUMÉRO MANUEL</div>
    <input id="pm-eleve-manuel" type="text" placeholder="Ex: 6XXXXXXXX" style="width:100%;padding:11px;border:1.5px solid #e5e0f5;border-radius:10px;margin-bottom:14px;font-size:13px;box-sizing:border-box">

    <div style="font-size:10px;font-weight:700;color:#888;margin-bottom:6px">DURÉE DU PREMIUM</div>
    <div id="pm-duree-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
      ${[["7","7 jours"],["30","30 jours"],["90","90 jours"],["365","1 an"],["0","Illimité"]].map(([v,l]) => `
        <button type="button" class="pm-duree-btn" data-v="${v}" onclick="_pmSelectDuree(this)" style="padding:11px;border:2px solid #e5e0f5;border-radius:10px;background:#fafaff;font-weight:700;font-size:12px;cursor:pointer;color:#444">${l}</button>
      `).join("")}
    </div>
    <div id="pm-result" style="font-size:12px;font-weight:700;margin-bottom:10px"></div>
  `;
  sheet.appendChild(body);

  const footer = document.createElement("div");
  footer.style.cssText = "padding:14px;border-top:1px solid #f0f0f0";
  const btnConfirm = document.createElement("button");
  btnConfirm.textContent = "✅ Activer le Premium";
  btnConfirm.style.cssText = "width:100%;background:linear-gradient(135deg,#6D28D9,#5B21B6);color:white;border:none;border-radius:14px;padding:14px;font-weight:900;font-size:14px;cursor:pointer";
  btnConfirm.onclick = () => _confirmerActivationPremiumManuelle(modal);
  footer.appendChild(btnConfirm);
  sheet.appendChild(footer);

  modal.appendChild(sheet);
  document.body.appendChild(modal);
  window._pmDureeChoisie = "30"; // valeur par défaut
  setTimeout(() => {
    const btn30 = modal.querySelector('.pm-duree-btn[data-v="30"]');
    if (btn30) _pmSelectDuree(btn30);
  }, 0);
}

function _pmSelectDuree(btn) {
  document.querySelectorAll(".pm-duree-btn").forEach(b => { b.style.background = "#fafaff"; b.style.borderColor = "#e5e0f5"; b.style.color = "#444"; });
  btn.style.background = "#6D28D9"; btn.style.borderColor = "#6D28D9"; btn.style.color = "white";
  window._pmDureeChoisie = btn.dataset.v;
}

// Accorde le Premium à un numéro de téléphone donné — factorisée à partir de
// _confirmerActivationPremiumManuelle pour être réutilisée par la validation
// des preuves de paiement (validerPreuvePaiement) sans dupliquer la logique
// Turso. Retourne {ok: true} ou {ok: false, message} (l'élève doit déjà
// exister dans la table "users" — créé automatiquement à sa première
// connexion, donc ne peut échouer que s'il n'a jamais ouvert l'app).
async function _accorderPremiumParTelephone(phone, dureeJours) {
  if (!phone) return { ok: false, message: "Numéro manquant" };
  if (!turso) return { ok: false, message: "Base non connectée" };
  const until = dureeJours > 0 ? (Date.now() + dureeJours * 86400000) : 0;
  try {
    const res = await turso.execute({ sql: "SELECT phone FROM users WHERE phone = ?", args: [phone] });
    if (!res.rows.length) return { ok: false, message: "Cet élève n'existe pas encore dans la base (jamais connecté à l'app)" };
    await turso.execute({ sql: "UPDATE users SET is_premium = 1, premium_until = ? WHERE phone = ?", args: [until, phone] });
    return { ok: true };
  } catch(e) {
    return { ok: false, message: e.message };
  }
}

async function _confirmerActivationPremiumManuelle(modal) {
  const select = document.getElementById("pm-eleve-select");
  const manuel = document.getElementById("pm-eleve-manuel");
  const phone = (manuel?.value || "").trim() || select?.value || "";
  const resultEl = document.getElementById("pm-result");
  if (!phone) { if (resultEl) { resultEl.textContent = "❌ Choisis ou indique un élève."; resultEl.style.color = "#c62828"; } return; }
  if (!turso) { showToast("⚠️ Base non connectée", "error"); return; }

  const dureeJours = parseInt(window._pmDureeChoisie || "30", 10);
  const resultat = await _accorderPremiumParTelephone(phone, dureeJours);
  if (!resultat.ok) {
    if (resultEl) { resultEl.textContent = "❌ " + resultat.message; resultEl.style.color = "#c62828"; }
    return;
  }
  if (resultEl) {
    resultEl.textContent = `✅ Premium activé pour ${phone}${dureeJours > 0 ? " pendant " + dureeJours + " jour(s)" : " (illimité)"}.`;
    resultEl.style.color = "#059669";
  }
  showToast("⭐ Premium activé pour " + phone, "success");
  addNotification("⭐ Premium activé manuellement", phone + (dureeJours > 0 ? " — " + dureeJours + " jours" : " — illimité"), "success");
  setTimeout(() => { if (modal) modal.remove(); }, 1200);
}

// ========== PREMIUM POUR TOUS (1 MOIS) ==========
async function activerPremiumPourTous() {
  const caller = localStorage.getItem("userPhone") || "";
  const isAdmin = await isAdminPhone(caller);
  if (!isAdmin) { showToast("Acces reserve a l administrateur", "error"); return; }
  if (!turso) { showToast("⚠️ Base non connectée", "error"); return; }

  const ok = window.confirm("⚠️ Cette action va rendre TOUS les utilisateurs Premium pendant 1 mois (30 jours).\n\nConfirmer ?");
  if (!ok) return;

  try {
    const until = Date.now() + 30 * 86400000;
    await turso.execute({ sql: "UPDATE users SET is_premium = 1, premium_until = ?", args: [until] });
    showToast("⭐ Tous les utilisateurs sont Premium pour 30 jours !", "success");
    addNotification("⭐ Premium collectif activé", "Tous les utilisateurs sont Premium pour 30 jours", "success");
  } catch(e) {
    showToast("❌ Erreur : " + e.message, "error");
  }
}


async function showModeratorPanel() {
  const phone = localStorage.getItem("userPhone") || "";
  await chargerModerateursTurso();
  const admin = await isAdminPhone(phone);
  const mod = await isModeratorPhone(phone);
  if (!admin && !mod) { showToast("⛔ Accès réservé aux modérateurs", "error"); return; }
  document.getElementById("modoPanelModal").classList.add("show");
  initModoSelects();
  chargerContribsModo();
  _majBadgeDoublonsTab(getFileVerificationDoublons().length);
  _majBadgePaiementsTab(getPreuvesPaiement().filter(p => p.statut === "en_attente").length);
  // Onglet Paiements réservé à l'admin uniquement
  const tabPaiements = document.getElementById("modoTabPaiementsBtn");
  if (tabPaiements) tabPaiements.style.display = admin ? "" : "none";
}

// ========== VALIDATION CODE PREMIUM ==========
async function validateCode() {
  const code = document.getElementById("codeInput").value.trim().toUpperCase();
  if (!code) { showToast("Entre un code", "error"); return; }
  if (!turso) {
    showToast("⚠️ Base non connectée — vérifie ta connexion internet", "info");
    return;
  }
  const res = await turso.execute({ sql: "SELECT * FROM premium_codes WHERE code = ? AND utilise = 0", args: [code] });
  if (res.rows.length === 0) { document.getElementById("codeErr").style.display = "block"; return; }
  await turso.execute({ sql: "UPDATE premium_codes SET utilise = 1 WHERE code = ?", args: [code] });
  isPremium = true; localStorage.setItem("isPremium", "true");
  // Sauvegarder le statut premium dans Turso (synchronisé sur tous les téléphones)
  const phoneUser = localStorage.getItem("userPhone") || "";
  if (phoneUser) {
    try { await turso.execute({ sql: "UPDATE users SET is_premium=1 WHERE phone=?", args: [phoneUser] }); } catch(e) {}
  }
  document.getElementById("codeOk").style.display = "block";
  showToast("✅ Premium activé !", "success");
  addNotification("⭐ Premium activé !", "Tu as maintenant accès à tout le contenu", "success");
  setTimeout(() => { showPage("main"); renderContent(); updateProfilStatus(); }, 1500);
}

// ========== RECHERCHE AVANCÉE ==========
let searchTimeout = null;
document.getElementById("sInput").addEventListener("input", function() {
  const val = this.value.trim();
  document.getElementById("sClr").className = val ? "sclr show" : "sclr";
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => rechercherAvancee(val), 200);
});
document.getElementById("sInput").addEventListener("focus", function() {
  if (this.value) rechercherAvancee(this.value);
});
document.addEventListener("click", function(e) {
  if (!e.target || !e.target.closest) return;
  if (!e.target.closest(".swrap")) {
    document.getElementById("sResults").style.display = "none";
  }
});

function clearSearch() {
  document.getElementById("sInput").value = "";
  document.getElementById("sClr").className = "sclr";
  document.getElementById("sResults").style.display = "none";
  document.getElementById("sResults").classList.remove("show");
}

function setSearchFilter(filter, btn) {
  searchFilter = filter;
  document.querySelectorAll(".search-filter-chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  const query = document.getElementById("sInput").value.trim();
  if (query) rechercherAvancee(query);
}

function setSearchFiltreClasse(classe) {
  searchFiltreClasse = classe || "";
  const query = document.getElementById("sInput").value.trim();
  if (query) rechercherAvancee(query);
}

function setSearchFiltreDate(periode) {
  searchFiltreDate = periode || "";
  const query = document.getElementById("sInput").value.trim();
  if (query) rechercherAvancee(query);
}

// Remplit le sélecteur de classe du filtre de recherche avancée
function _initSearchFiltreClasseSelect() {
  const sel = document.getElementById("sFiltreClasse");
  if (!sel || sel.dataset.filled === "1" || typeof CLASSES === "undefined") return;
  classesVisibles().forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
  sel.dataset.filled = "1";
}
document.addEventListener("DOMContentLoaded", _initSearchFiltreClasseSelect);
document.addEventListener("DOMContentLoaded", () => { _appliquerVisibiliteTD(); _majLabelBoutonTD(); });

function rechercherAvancee(query) {
  const results = document.getElementById("sResults");
  if (!query || query.length < 2) { results.style.display = "none"; return; }

  let items = [];
  // Classe à utiliser pour le filtrage : le filtre avancé "classe" choisi dans
  // la barre de recherche prime sur la classe active de l'onglet contenu.
  const classeRecherche = searchFiltreClasse || activeClasse;

  // Fenêtre de dates pour le filtre "par date" (sur les examens publiés, qui
  // ont un vrai champ date — les chapitres génériques n'en ont pas).
  const maintenant = Date.now();
  const fenetresMs = { "7j": 7*86400000, "30j": 30*86400000, "annee": 365*86400000 };

  // Bug 7: Chercher aussi dans les examens publiés
  const publies = getContenuPublie();
  for (const c of publies) {
    if (!c.titre) continue;
    if (searchFiltreClasse && c.classe && c.classe !== searchFiltreClasse) continue;
    if (!searchFiltreClasse && c.classe && c.classe !== activeClasse) continue;
    if (searchFiltreDate && fenetresMs[searchFiltreDate]) {
      const dateContenu = Number(c.date) || 0;
      if (!dateContenu || (maintenant - dateContenu) > fenetresMs[searchFiltreDate]) continue;
    }
    if (c.titre.toLowerCase().includes(query.toLowerCase()) ||
        (c.mat||"").toLowerCase().includes(query.toLowerCase())) {
      items.push({
        titre: c.titre, mat: c.mat || "general",
        id: c.id, premium: c.premium || false, isExamen: true, classe: c.classe || ""
      });
      if (items.length >= 5) break;
    }
  }

  // Chercher dans les chapitres (génériques par matière — pas de date propre ;
  // si un filtre de date est actif, on les exclut puisqu'ils n'ont pas de date réelle)
  if (!searchFiltreDate) {
    for (const mat of MATIERES) {
      for (let i = 1; i <= 12; i++) {
        const titre = `Chapitre ${i} : ${mat.replace(/_/g, " ")}`;
        const isPremiumChap = i > 2;
        if (searchFilter === "cours" && activeType !== "cours") continue;
        if (searchFilter === "premium" && !isPremiumChap) continue;
        if (searchFilter === "free" && isPremiumChap) continue;
        if (titre.toLowerCase().includes(query.toLowerCase()) ||
            mat.toLowerCase().includes(query.toLowerCase())) {
          items.push({ titre, mat, id: i, premium: isPremiumChap, isExamen: false, classe: classeRecherche });
          if (items.length >= 8) break;
        }
      }
      if (items.length >= 8) break;
    }
  }

  if (items.length === 0) {
    results.innerHTML = `<div style="padding:16px;text-align:center;color:var(--t3);font-size:12px">🔍 Aucun résultat pour "${esc(query)}"</div>`;
  } else {
    results.innerHTML = items.map(item => `
      <div class="sres-item" onclick="clearSearch();${item.isExamen ? `viewContenuPublie('${String(item.id)}')` : `setClasse('${esc(item.classe||activeClasse)}');viewChapter(${Number(item.id)},'${esc(item.mat)}',${!!(item.premium && !isPremium)})`}">
        <div class="sres-ico">${item.isExamen ? "🏆" : (EMOJIS[item.mat] || "📘")}</div>
        <div style="flex:1">
          <div class="sres-title">${esc(item.titre)}</div>
          <div class="sres-sub">${esc((item.mat||"").replace(/_/g," "))} · ${item.isExamen ? "📋 Examen" : esc(item.classe||activeClasse)}</div>
        </div>
        <span class="sres-badge ${item.premium ? 'lock' : ''}">${item.premium ? "🔒 Premium" : "🆓 Gratuit"}</span>
      </div>`).join("");
  }
  results.style.display = "block";
}

// ========== CONTENU & CLASSES ==========
function renderClasses() {
  const tabs = document.getElementById("ctabs");
  tabs.innerHTML = classesVisibles().map(c => `<button class="ctab ${c === activeClasse ? "on" : ""}" onclick="setClasse('${c}')">${c}</button>`).join("");
}
function setClasse(c) { activeClasse = c; renderClasses(); renderContent(); }
function setType(t, btn) {
  activeType = t;
  document.querySelectorAll(".ttab").forEach(b => b.className = "ttab");
  btn.className = "ttab on";
  const icons = {cours:"📚",sequencielle:"📋",examen:"🏆",autres_lycees:"🏫",la_zone:"🔥",competences:"🎯",video:"🎬",travaux_diriges:"📝"};
  const helpIcon = document.getElementById("typeHelpIcon");
  const helpText = document.getElementById("typeHelpText");
  if (helpIcon) helpIcon.textContent = icons[t] || "📘";
  if (helpText) helpText.textContent = DESC_TYPES[t] || "";
  renderContent();
}

async function renderContent() {
  const container = document.getElementById("mainContent");
  if (!container) return;
  showSkeleton("mainContent", 4);

  if (activeType === "cours") {
    // ── Synchroniser depuis Turso avant affichage ──
    if (turso) await syncContenuDepuisTurso();

    // Lire tout le contenu publié par les modérateurs
    const publies = getContenuPublie();
    // Filtrer : type "cours" ET classe active
    const coursClasse = publies.filter(c => {
      if (c.type !== "cours") return false;
      if (_estVideoContenu(c)) return false; // déjà dans l'onglet 🎬 Vidéos
      const lyceeNorm = String(c.lycee || "principal").trim().toLowerCase();
      if (lyceeNorm === "autres") return false;
      return _classeMatch(c.classe, activeClasse);
    });

    // Matières exactes pour cette classe (selon la structure du ZIP)
    const matieresDeLaClasse = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;

    // Regrouper par matière
    const parMat = {};
    for (const mat of matieresDeLaClasse) parMat[mat] = [];
    for (const c of coursClasse) {
      if (parMat[c.mat] !== undefined) parMat[c.mat].push(c);
      // contenu dans une matière hors-liste pour cette classe → on l'ajoute quand même
      else { parMat[c.mat] = parMat[c.mat] || []; parMat[c.mat].push(c); }
    }
    // Trier chaque matière par numéro, puis gratuit avant premium
    for (const mat of matieresDeLaClasse) {
      parMat[mat].sort((a, b) => {
        // Gratuit en premier (premium=false avant premium=true)
        const aPrem = a.premium ? 1 : 0;
        const bPrem = b.premium ? 1 : 0;
        if (aPrem !== bPrem) return aPrem - bPrem;
        return (a.numero || 0) - (b.numero || 0);
      });
    }

    // Toujours afficher TOUTES les matières de la classe (structure ZIP = structure app)
    const matsAvecContenu = matieresDeLaClasse.filter(m => parMat[m] && parMat[m].length > 0);
    const matsAffichees = matieresDeLaClasse; // TOUJOURS afficher toutes les matières de la classe

    let html = "";
    let totalChapitres = 0;

    for (const mat of matsAffichees) {
      const lecons = parMat[mat];
      const emo = EMOJIS[mat] || "📘";
      const col = COLORS[mat] || "var(--p)";
      const matLabel = mat.replace(/_/g, " ");
      const matCap = NOMS_MATIERES[mat] || matLabel.charAt(0).toUpperCase() + matLabel.slice(1);

      if (lecons.length === 0) {
        // Matière sans contenu : afficher un placeholder
        html += `<div class="msec fade-in">
          <div class="mhead" style="border-left:4px solid ${col}">
            <div class="mico" style="background:${col}20">${emo}</div>
            <div class="mnom" style="color:${col}">${matCap}</div>
            <div class="mcnt">0 cours</div>
          </div>
          <div class="chapitre-list">
            <div class="resource-item" style="opacity:0.55;pointer-events:none">
              <div class="chapitre-num" style="color:${col}">—</div>
              <div class="chapitre-titre" style="color:var(--t3);font-style:italic">Aucun cours publié pour l'instant</div>
            </div>
          </div>
        </div>`;
        continue;
      }

      totalChapitres += lecons.length;
      html += `<div class="msec fade-in">
        <div class="mhead" style="border-left:4px solid ${col}">
          <div class="mico" style="background:${col}20">${emo}</div>
          <div class="mnom" style="color:${col}">${matCap}</div>
          <div class="mcnt">${lecons.length} cours</div>
        </div>
        <div class="chapitre-list">`;

      for (let chapIdx = 0; chapIdx < lecons.length; chapIdx++) {
        const ch = lecons[chapIdx];
        // Limite gratuit : 2 premiers chapitres seulement
        const freeLimit = !checkPremium() && chapIdx >= FREE_LIMITS.COURS_MAX_CHAPITRES;
        const lock = (ch.premium && !isPremium) || freeLimit;
        const lockReason = freeLimit ? "cours" : "";
        const safeTitle = (ch.titre || "").replace(/'/g, "\\'");
        const typeLabel = ch.typeFichier === "sequencielle" ? "📋 Séq." : ch.typeFichier === "cours" ? "📚 Cours" : ch.typeFichier === "la_zone" ? "🔥 La Zone" : ch.typeFichier === "competences" ? "🎯 Compét." : "🏆 Officiel";
        const premBadge = (ch.premium || freeLimit)
          ? `<span style="font-size:9px;background:var(--gold2);color:white;padding:1px 6px;border-radius:6px;margin-left:4px;white-space:nowrap">⭐ Premium</span>`
          : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;margin-left:4px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
        html += `<div class="resource-item" onclick="${lock ? `openPremiumGate('${lockReason || "cours"}')` : `viewContenuPublie('${String(ch.id)}')`}">
          <div class="chapitre-num" style="color:${col}">${ch.numero || "—"}</div>
          <div style="flex:1">
            <div class="chapitre-titre">${ch.titre}</div>
            <div style="font-size:9px;color:var(--t3);margin-top:2px;display:flex;align-items:center;flex-wrap:wrap;gap:2px">${typeLabel}${premBadge}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span>${lock ? "🔒" : "✅"}</span>
            <button class="res-share" onclick="event.stopPropagation();shareResource('${safeTitle}',window.location.href)" title="Partager">📤</button>
          </div>
        </div>`;
      }
      html += `</div></div>`;
    }

    if (matsAvecContenu.length === 0) {
      // Aucun contenu du tout pour cette classe : afficher message clair
      html = `<div style="padding:32px 16px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">📭</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:6px">Aucun cours pour ${activeClasse}</div>
        <div style="color:var(--t3);font-size:12px;margin-bottom:20px">Les modérateurs n'ont pas encore publié de cours pour cette classe.</div>
        <button onclick="ouvrirContribModal()" style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:12px 22px;font-weight:800;font-size:12px;cursor:pointer">📤 Contribuer</button>
      </div>`;
    }

    container.innerHTML = html;
    // Mettre à jour les stats avec les vrais chiffres
    updateStats(matsAvecContenu.length, totalChapitres);

  } else if (activeType === "video") {
    // ── Vidéos : tout contenu publié avec un lien vidéo (YouTube), pour la classe active ──
    if (turso) await syncContenuDepuisTurso();
    const publies = getContenuPublie();
    const videosClasse = publies.filter(c =>
      _classeMatch(c.classe, activeClasse) && (c.videoUrl || (c.contenu && c.contenu.startsWith("[VIDEO:")))
    );
    const matieresDeLaClasse = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
    const parMat = {};
    for (const mat of matieresDeLaClasse) parMat[mat] = [];
    for (const c of videosClasse) {
      if (parMat[c.mat] !== undefined) parMat[c.mat].push(c);
      else { parMat[c.mat] = parMat[c.mat] || []; parMat[c.mat].push(c); }
    }
    for (const mat of matieresDeLaClasse) parMat[mat].sort((a,b) => {
      const ap = a.premium ? 1 : 0, bp = b.premium ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return (a.numero||0)-(b.numero||0);
    });
    const matsAvecVideos = matieresDeLaClasse.filter(m => parMat[m] && parMat[m].length > 0);

    let html = "";
    for (const mat of matsAvecVideos) {
      const videos = parMat[mat];
      const emo = EMOJIS[mat] || "🎬";
      const col = COLORS[mat] || "var(--p)";
      const matLabel = mat.replace(/_/g, " ");
      const matCap = NOMS_MATIERES[mat] || matLabel.charAt(0).toUpperCase() + matLabel.slice(1);
      html += `<div class="msec fade-in">
        <div class="mhead" style="border-left:4px solid ${col}">
          <div class="mico" style="background:${col}20">${emo}</div>
          <div class="mnom" style="color:${col}">${matCap}</div>
          <div class="mcnt">${videos.length} vidéo(s)</div>
        </div>
        <div class="chapitre-list">`;
      for (const v of videos) {
        const lock = v.premium && !isPremium;
        const safeTitle = (v.titre || "").replace(/'/g, "\\'");
        const vBadge = v.premium
          ? `<span style="font-size:9px;background:var(--gold2);color:white;padding:1px 6px;border-radius:6px;white-space:nowrap">⭐ Premium</span>`
          : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
        html += `<div class="resource-item" onclick="${lock ? `openPremiumGate('video')` : `viewContenuPublie('${String(v.id)}')`}">
          <div class="chapitre-num" style="color:${col}">🎬</div>
          <div style="flex:1">
            <div class="chapitre-titre">${v.titre}</div>
            <div style="font-size:9px;color:var(--t3);margin-top:2px;display:flex;align-items:center;gap:4px">▶️ Vidéo ${vBadge}</div>
            ${v.description ? `<div style="font-size:10px;color:var(--t2);margin-top:3px;line-height:1.4">${v.description}</div>` : ""}
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span>${lock ? "🔒" : "▶️"}</span>
            <button class="res-share" onclick="event.stopPropagation();shareResource('${safeTitle}',window.location.href)" title="Partager">📤</button>
          </div>
        </div>`;
      }
      html += `</div></div>`;
    }

    if (matsAvecVideos.length === 0) {
      html = `<div style="padding:32px 16px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🎬</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:6px">Aucune vidéo pour ${activeClasse}</div>
        <div style="color:var(--t3);font-size:12px">Les modérateurs n'ont pas encore publié de vidéo pour cette classe.</div>
      </div>`;
    }

    container.innerHTML = html;

  } else if (activeType === "examen") {
    // ── Onglet fusionné : Examens officiels + Séquentielles, avec 2 mini-onglets
    //    bien visibles en dessous pour basculer entre les deux (voir renderExamens) ──
    if (turso) await syncContenuDepuisTurso();
    examenPageParMat = {};
    renderExamens();

  } else if (activeType === "autres_lycees") {
    // ── Autres lycées : même structure ZIP (autres_lycees/COURS/ et autres_lycees/sequencielles/) ──
    if (turso) await syncContenuDepuisTurso();
    const publies = getContenuPublie();
    const extClasse = publies.filter(c => c.lycee === "autres" && !_estVideoContenu(c) && _classeMatch(c.classe, activeClasse));
    const mats = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
    const parMat = {};
    for (const m of mats) parMat[m] = [];
    for (const c of extClasse) { if (parMat[c.mat] !== undefined) parMat[c.mat].push(c); }
    // Trier : gratuit en premier
    for (const m of mats) parMat[m].sort((a,b) => {
      const ap = a.premium ? 1 : 0, bp = b.premium ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return (a.numero||0)-(b.numero||0);
    });
    if (extClasse.length === 0) {
      container.innerHTML = `<div style="padding:28px 16px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🏫</div>
        <div style="font-weight:800;font-size:15px;margin-bottom:8px">Autres Lycées — ${activeClasse}</div>
        <div style="color:var(--t3);font-size:12px;margin-bottom:20px">Aucune ressource publiée pour l'instant.<br>Les modérateurs peuvent en ajouter via le panel.</div>
      </div>`;
      return;
    }
    let html = `<div style="padding:10px 14px 6px 14px">
      <div style="font-weight:800;font-size:13px;color:#2196F3;margin-bottom:2px">🏫 Autres Lycées — ${activeClasse}</div>
      <div style="font-size:10px;color:var(--t3)">Ressources partagées par d'autres établissements du Cameroun</div>
    </div>`;
    for (const mat of mats) {
      const lecons = parMat[mat] || [];
      if (lecons.length === 0) continue;
      const emo = EMOJIS[mat] || "📘";
      const col = COLORS[mat] || "var(--p)";
      const matCap = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
      html += `<div class="msec fade-in">
        <div class="mhead" style="border-left:4px solid ${col}"><div class="mico" style="background:${col}20">${emo}</div><div class="mnom" style="color:${col}">${matCap}</div><div class="mcnt">${lecons.length}</div></div>
        <div class="chapitre-list">`;
      for (const ch of lecons) {
        const lock = ch.premium && !isPremium;
        const accessBadge = lock
          ? `<span style="background:rgba(244,162,97,0.15);color:var(--gold2);font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;white-space:nowrap">⭐ Premium</span>`
          : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
        html += `<div class="resource-item" onclick="${lock ? "openPremiumGate('autres_lycees')" : `viewContenuPublie('${String(ch.id)}')`}" style="align-items:flex-start;padding:12px 14px">
          <div style="min-width:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding-top:2px">
            <div style="background:rgba(33,150,243,0.1);border-radius:8px;padding:4px 7px;text-align:center">
              <div style="font-size:9px;font-weight:800;color:#2196F3;letter-spacing:0.3px">N°</div>
              <div style="font-size:15px;font-weight:900;color:#2196F3;line-height:1">${ch.numero||"—"}</div>
            </div>
          </div>
          <div style="flex:1;padding-left:10px">
            <div class="chapitre-titre" style="font-weight:700;font-size:12px;line-height:1.4">${ch.titre}</div>
            <div style="font-size:9px;color:var(--t3);margin-top:3px;display:flex;align-items:center;gap:6px">🏫 Autre établissement <span style="opacity:0.5">·</span> ${matCap}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding-left:6px">
            ${accessBadge}
          </div>
        </div>`;
      }
      html += `</div></div>`;
    }
    container.innerHTML = html;

  } else if (activeType === "travaux_diriges") {
    // ── TRAVAUX DIRIGÉS : fusion La Zone (fiches) + Compétences (exercices) ──
    // Les données restent stockées avec leur type d'origine (la_zone / competences) —
    // seule la vue étudiante est unifiée. ZIP import, modération, admin : inchangés.
    if (turso) await syncContenuDepuisTurso();
    const publies = getContenuPublie();
    const tdClasse = publies.filter(c => {
      if (c.typeFichier !== "la_zone" && c.typeFichier !== "competences") return false;
      if (_estVideoContenu(c)) return false; // déjà dans l'onglet 🎬 Vidéos
      const lyceeNorm = String(c.lycee || "principal").trim().toLowerCase();
      if (lyceeNorm === "autres") return false;
      return _classeMatch(c.classe, activeClasse);
    });
    const mats = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
    const parMat = {};
    for (const m of mats) parMat[m] = [];
    for (const c of tdClasse) { if (parMat[c.mat] !== undefined) parMat[c.mat].push(c); }
    for (const m of mats) parMat[m].sort((a,b) => {
      const ap = a.premium ? 1 : 0, bp = b.premium ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return (a.numero||0)-(b.numero||0);
    });

    if (tdClasse.length === 0) {
      container.innerHTML = `<div style="padding:28px 16px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">📝</div>
        <div style="font-weight:800;font-size:15px;margin-bottom:8px">Travaux Dirigés — ${activeClasse}</div>
        <div style="color:var(--t3);font-size:12px;margin-bottom:20px">Fiches de révision &amp; exercices par compétence.<br>Les modérateurs n'ont pas encore publié de contenu.</div>
        <button onclick="ouvrirContribModal()" style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:12px 22px;font-weight:800;font-size:12px;cursor:pointer">📤 Contribuer</button>
      </div>`;
      return;
    }

    let html = `<div style="padding:10px 14px 6px 14px">
      <div style="font-weight:800;font-size:13px;color:#E76F51;margin-bottom:2px">📝 Travaux Dirigés — ${activeClasse}</div>
      <div style="font-size:10px;color:var(--t3)">Fiches de révision express &amp; exercices ciblés par compétence</div>
    </div>`;
    for (const mat of mats) {
      const lecons = parMat[mat] || [];
      if (lecons.length === 0) continue;
      const emo = EMOJIS[mat] || "📘";
      const col = COLORS[mat] || "var(--p)";
      const matCap = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
      html += `<div class="msec fade-in">
        <div class="mhead" style="border-left:4px solid ${col}"><div class="mico" style="background:${col}20">${emo}</div><div class="mnom" style="color:${col}">${matCap}</div><div class="mcnt">${lecons.length} ressource(s)</div></div>
        <div class="chapitre-list">`;
      for (const ch of lecons) {
        const lock = ch.premium && !isPremium;
        const estZone = ch.typeFichier === "la_zone";
        const typeBadge = estZone
          ? `<span style="font-size:9px;background:rgba(231,111,81,0.15);color:#E76F51;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(231,111,81,0.3)">🔥 Fiche</span>`
          : `<span style="font-size:9px;background:rgba(92,107,192,0.15);color:#5C6BC0;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(92,107,192,0.3)">🎯 Compétence</span>`;
        const premBadge = ch.premium
          ? `<span style="font-size:9px;background:var(--gold2);color:white;padding:1px 6px;border-radius:6px;white-space:nowrap">⭐ Premium</span>`
          : `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 6px;border-radius:6px;white-space:nowrap;border:1px solid rgba(34,197,94,0.3)">🆓 Gratuit</span>`;
        html += `<div class="resource-item" onclick="${lock ? `openPremiumGate('${estZone?"la_zone":"competences"}')` : `viewContenuPublie('${String(ch.id)}')`}">
          <div class="chapitre-num" style="color:${col}">${ch.numero||"—"}</div>
          <div style="flex:1">
            <div class="chapitre-titre">${ch.titre}</div>
            <div style="margin-top:2px;display:flex;gap:4px;flex-wrap:wrap">${typeBadge}${premBadge}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span>${lock?"🔒":"✅"}</span>
            <button class="res-share" onclick="event.stopPropagation();shareResource('${(ch.titre||"").replace(/'/g,"\\'")}',window.location.href)" title="Partager">📤</button>
          </div>
        </div>`;
      }
      html += `</div></div>`;
    }
    container.innerHTML = html;

  } else {
    container.innerHTML = `<div style="padding:28px 16px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🏫</div>
      <div style="font-weight:800;font-size:15px;margin-bottom:8px">Autres Lycées</div>
      <div style="color:var(--t3);font-size:12px">Ressources d'autres établissements</div>
    </div>`;
  }
}

// ========== VIEWER DE CONTENU PUBLIÉ (cours) ==========
// ══════════════════════════════════════════════════════
// SYSTÈME D'OUVERTURE DE FICHIERS — REFAIT COMPLÈTEMENT
// ══════════════════════════════════════════════════════

function viewContenuPublie(id) {
  // Wrapper synchrone pour onclick
  _openContenu(String(id));
}

async function _openContenu(id) {
  // ── ÉTAPE -1 : Vérification Premium côté fonction (pas que côté affichage) ──
  // AVANT ce correctif, le verrou 🔒 n'existait que dans la liste (le bouton
  // appelait soit viewContenuPublie(), soit openPremiumGate() selon l'écran).
  // Mais un élève pouvait appeler viewContenuPublie('123') directement depuis
  // la console du navigateur avec l'ID d'un contenu Premium, et le fichier
  // s'ouvrait quand même — la fonction elle-même ne vérifiait jamais rien.
  const _publiesVerif = getContenuPublie();
  let _cVerif = _publiesVerif.find(p => String(p.id).trim() === String(id).trim());
  if (!_cVerif) _cVerif = _publiesVerif.find(p => String(p.id).includes(String(id)) || String(id).includes(String(p.id)));
  if (_cVerif && _cVerif.premium && !checkPremium()) {
    showToast("🔒 Ce contenu est réservé aux membres Premium", "error");
    openPremiumGate("cours");
    return;
  }

  // ── ÉTAPE 0 : Si c'est une vidéo → ouvrir directement YouTube (pas d'iframe, plus rapide) ──
  const _publiesImmediat = getContenuPublie();
  let _cImmediat = _publiesImmediat.find(p => String(p.id).trim() === String(id).trim());
  if (!_cImmediat) _cImmediat = _publiesImmediat.find(p => String(p.id).includes(String(id)) || String(id).includes(String(p.id)));

  if (_cImmediat && (_cImmediat.videoUrl || (_cImmediat.contenu && _cImmediat.contenu.startsWith("[VIDEO:")))) {
    const rawVideoUrl = _cImmediat.videoUrl || _cImmediat.contenu.replace("[VIDEO:", "").replace("]", "");
    const watchUrl = youtubeWatchUrl(rawVideoUrl.trim());
    if (watchUrl) {
      window.open(watchUrl, '_blank', 'noopener,noreferrer');
      showToast("🎬 Ouverture sur YouTube...", "info");
      return;
    }
  }

  // ── ÉTAPE 1 : Chercher l'URL en local AVANT tout affichage ──

  // Extraire l'URL depuis contenu si fichierUrl vide (patterns Cloudinary)
  let _urlImmediat = _cImmediat?.fichierUrl || null;
  if (!_urlImmediat && _cImmediat?.contenu) {
    const m = _cImmediat.contenu.match(/\[CLOUD:\s*(https?:\/\/[^\]]+)\]/);
    if (m) _urlImmediat = m[1].trim();
    if (!_urlImmediat) {
      const m2 = _cImmediat.contenu.match(/https?:\/\/res\.cloudinary\.com\/[^\s\]"']+/);
      if (m2) _urlImmediat = m2[0].trim();
    }
  }

  // ✅ URL trouvée en local → ouvrir Chrome directement, sans page d'attente
  if (_urlImmediat) {
    let dlUrl = _urlImmediat;
    if (_urlImmediat.includes('cloudinary.com') && !_urlImmediat.includes('fl_attachment')) {
      dlUrl = _urlImmediat.replace('/upload/', '/upload/fl_attachment/');
    }
    window.open(dlUrl, '_blank', 'noopener,noreferrer');
    showToast("📥 Ouverture dans le navigateur...", "info");
    return;
  }

  // ── ÉTAPE 2 : URL absente en local → informer l'utilisateur et chercher sur Turso ──
  showToast("🔍 URL absente en local, recherche sur Turso...", "info");
  showPage("detail");
  const dcontenu = document.getElementById("dcontenu");
  if (dcontenu) dcontenu.innerHTML = `
    <div style="padding:50px 20px;text-align:center;color:var(--t2)">
      <div style="font-size:36px;margin-bottom:14px;animation:pulse 1s infinite">⏳</div>
      <div style="font-weight:700;font-size:14px">Chargement du fichier...</div>
    </div>`;

  // Timeout de sécurité : 5s max puis diagnostic
  const safetyTimer = setTimeout(async () => {
    if (!dcontenu || !dcontenu.innerHTML.includes("Chargement du fichier")) return;
    const publies = getContenuPublie();
    const found = publies.find(p => String(p.id).trim() === String(id).trim());
    if (found) {
      dcontenu.innerHTML = `
        <div style="background:var(--card);border-radius:16px;padding:16px;border:2px solid var(--red);margin-bottom:12px">
          <div style="font-weight:900;font-size:13px;color:var(--red);margin-bottom:10px">⚠️ Lien du fichier manquant</div>
          <div style="font-size:11px;color:var(--t2);line-height:1.8;margin-bottom:12px">
            <b>Titre :</b> ${found.titre||"?"}<br>
            <b>fichierUrl :</b> ${found.fichierUrl||"vide"}<br>
            <b>contenu :</b> ${(found.contenu||"").substring(0,120)||"vide"}
          </div>
          <button onclick="_forceSyncContenu('${id}')"
            style="width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:13px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:8px">
            🔄 Forcer la resynchronisation
          </button>
          <button onclick="_openContenu('${id}')"
            style="width:100%;background:var(--card);color:var(--text);border:1.5px solid var(--border);border-radius:12px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">
            🔁 Réessayer
          </button>
        </div>`;
    } else {
      dcontenu.innerHTML = `
        <div style="padding:40px 20px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <div style="font-weight:800;font-size:14px;color:var(--text);margin-bottom:8px">Chargement trop long</div>
          <div style="font-size:12px;color:var(--t2);margin-bottom:20px">Connexion Turso lente ou indisponible.</div>
          <button onclick="_openContenu('${id}')"
            style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:12px 20px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:10px;display:block;width:100%">
            🔄 Réessayer
          </button>
          <button onclick="syncContenuDepuisTurso().then(()=>renderContent()).then(()=>showTab('accueil'))"
            style="background:var(--card);color:var(--text);border:1.5px solid var(--border);border-radius:12px;padding:12px 20px;font-weight:700;font-size:13px;cursor:pointer;display:block;width:100%">
            🔁 Resynchroniser
          </button>
        </div>`;
    }
  }, 5000);

  // 2. Chercher le contenu (local → Turso)
  console.log("[LearnUpr] _openContenu id=", id);
  const _allPublies = getContenuPublie();
  console.log("[LearnUpr] contenu_publie ids=", _allPublies.map(p => String(p.id)));
  let c = await _getContenuById(id);
  clearTimeout(safetyTimer);
  console.log("[LearnUpr] contenu trouvé=", c ? c.titre : "NULL", "fichierUrl=", c?.fichierUrl);

  if (!c) {
    if (dcontenu) dcontenu.innerHTML = `
      <div style="padding:40px 20px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">❌</div>
        <div style="font-weight:800;font-size:14px;color:var(--text);margin-bottom:8px">Fichier introuvable</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:20px">Vérifie ta connexion et tire vers le bas pour resynchroniser</div>
        <button onclick="syncContenuDepuisTurso().then(()=>renderContent()).then(()=>showTab('accueil'))"
          style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:12px 20px;font-weight:800;font-size:13px;cursor:pointer">
          🔄 Resynchroniser
        </button>
      </div>`;
    return;
  }

  // 3. Remplir l'en-tête
  _remplirEntete(c);

  // 4. Construire le contenu selon le type de fichier
  // DEBUG : si fichierUrl vide, afficher les infos brutes pour diagnostic
  if (!c.fichierUrl && !c.fichierData && !(c.contenu && !c.contenu.startsWith("["))) {
    if (dcontenu) dcontenu.innerHTML = `
      <div style="background:var(--card);border-radius:16px;padding:16px;border:2px solid var(--red);margin-bottom:12px">
        <div style="font-weight:900;font-size:13px;color:var(--red);margin-bottom:10px">⚠️ URL du fichier manquante</div>
        <div style="font-size:11px;color:var(--t2);line-height:1.8;margin-bottom:12px">
          <b>ID :</b> ${c.id}<br>
          <b>Titre :</b> ${c.titre}<br>
          <b>fichierUrl :</b> ${c.fichierUrl || "vide"}<br>
          <b>fichierType :</b> ${c.fichierType || "vide"}<br>
          <b>contenu :</b> ${(c.contenu||"").substring(0,100)||"vide"}
        </div>
        <button onclick="_forceSyncContenu('${c.id}')"
          style="width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:13px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:8px">
          🔄 Forcer la resynchronisation
        </button>
        <button onclick="_openContenu('${c.id}')"
          style="width:100%;background:var(--card);color:var(--text);border:1.5px solid var(--border);border-radius:12px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">
          🔁 Réessayer
        </button>
      </div>`;
  } else {
    if (dcontenu) dcontenu.innerHTML = _buildContenuHtml(c);
  }

  // 5. Boutons d'action
  currentContenuId = c.id || null;
  currentChapterId = "cp_" + id;
  const btn1 = document.getElementById("dbtn1");
  if (btn1) {
    btn1.textContent = "📤 Partager";
    btn1.style.background = "linear-gradient(135deg,#25D366,#128C7E)";
    btn1.onclick = () => shareResource(c.titre, window.location.href);
  }
  const btnSave = document.getElementById("dbtnSave");
  if (btnSave) btnSave.onclick = saveCurrentOffline;

  addNotification("📖 Fichier ouvert", `${c.titre} · ${c.classe}`, "info");
}
